/**
 * translate ast to js function code
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add(function (S, require) {
    require('util');

    // codeTemplates --------------------------- start
    var CALL_NATIVE_COMMAND = '{lhs} = {name}Command.call(engine, scope, {option}, buffer, {lineNumber}, payload);';

    var CALL_CUSTOM_COMMAND = 'buffer = callCommandUtil(engine, scope, {option}, buffer, [{idParts}], {lineNumber});';

    var CALL_FUNCTION = '{lhs} = callFnUtil(engine, scope, {option}, buffer, [{idParts}], {depth},{lineNumber});';

    var SCOPE_RESOLVE = 'var {lhs} = scope.resolve([{idParts}],{depth});';

    var REQUIRE_MODULE = 're' + 'quire("{name}");';

    var CHECK_BUFFER = ['if({name} && {name}.isBuffer){',
        'buffer = {name};',
        '{name} = undefined;',
        '}'].join('\n');

    var CHECK_VERSION = ['if("{version}" !== S.version){',
            'throw new Error("current xtemplate file(" + engine.name + ")(v{version}) ' +
            'need to be recompiled using current kissy(v"+ S.version+")!");',
        '}'].join('\n');

    var FUNC = ['function({params}){',
        '{body}',
        '}'].join('\n');

    var SOURCE_URL = [
        '',
        '//# sourceURL = {name}.js'
    ].join('\n');

    var DECLARE_NATIVE_COMMANDS = '{name}Command = nativeCommands["{name}"]';

    var DECLARE_UTILS = '{name}Util = utils["{name}"]';

    var BUFFER_WRITE = 'buffer.write({value},{escape});';
    // codeTemplates ---------------------------- end

    var XTemplateRuntime = require('./runtime');
    var parser = require('./compiler/parser');
    parser.yy = require('./compiler/ast');
    var nativeCode = [];
    var substitute = S.substitute;
    var nativeCommands = XTemplateRuntime.nativeCommands;
    var nativeUtils = XTemplateRuntime.utils;

    var t;

    for (t in nativeUtils) {
        nativeCode.push(substitute(DECLARE_UTILS, {
            name: t
        }));
    }

    for (t in nativeCommands) {
        nativeCode.push(substitute(DECLARE_NATIVE_COMMANDS, {
            name: t
        }));
    }

    nativeCode = 'var ' + nativeCode.join(',\n') + ';';

    var doubleReg = /\\*"/g,
        singleReg = /\\*'/g,
        arrayPush = [].push,
        uuid = 0;

    function guid(str) {
        return str + (uuid++);
    }

    function wrapByDoubleQuote(str) {
        return '"' + str + '"';
    }

    function wrapBySingleQuote(str) {
        return '\'' + str + '\'';
    }

    function joinArrayOfString(arr) {
        return wrapByDoubleQuote(arr.join('","'));
    }

    function escapeSingleQuoteInCodeString(str, isDouble) {
        return str.replace(isDouble ? doubleReg : singleReg, function (m) {
            // \ 's number ，用户显式转过 "\'" , "\\\'" 就不处理了，否则手动对 ` 加 \ 转义
            if (m.length % 2) {
                m = '\\' + m;
            }
            return m;
        });
    }

    function escapeString(str, isCode) {
        if (isCode) {
            str = escapeSingleQuoteInCodeString(str, 0);
        } else {
            /*jshint quotmark:false*/
            str = str.replace(/\\/g, '\\\\')
                .replace(/'/g, "\\'");
        }
        str = str.replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n')
            .replace(/\t/g, '\\t');
        return str;
    }

    function pushToArray(to, from) {
        arrayPush.apply(to, from);
    }

    function opExpression(e) {
        var source = [],
            type = e.opType,
            exp1,
            exp2,
            code1Source,
            code2Source,
            code1 = xtplAstToJs[e.op1.type](e.op1),
            code2 = xtplAstToJs[e.op2.type](e.op2);
        exp1 = code1.exp;
        exp2 = code2.exp;
        var exp = guid('exp');
        code1Source = code1.source;
        code2Source = code2.source;
        pushToArray(source, code1Source);
        source.push('var ' + exp + ' = ' + exp1 + ';');
        if (type === '&&' || type === '||') {
            source.push('if(' + (type === '&&' ? '' : '!') + '(' + exp1 + ')){');
            pushToArray(source, code2Source);
            source.push(exp + ' = ' + exp2 + ';');
            source.push('}');
        } else {
            pushToArray(source, code2Source);
            source.push(exp + ' = ' + '(' + exp1 + ')' + type + '(' + exp2 + ');');
        }
        return {
            exp: exp,
            source: source
        };
    }

    // consider x[d]
    function getIdStringFromIdParts(source, idParts) {
        if (idParts.length === 1) {
            return null;
        }
        var i, l, idPart, idPartType,
            check = 0,
            nextIdNameCode;
        for (i = 0, l = idParts.length; i < l; i++) {
            if (idParts[i].type) {
                check = 1;
                break;
            }
        }
        if (check) {
            var ret = [];
            for (i = 0, l = idParts.length; i < l; i++) {
                idPart = idParts[i];
                idPartType = idPart.type;
                if (idPartType) {
                    nextIdNameCode = xtplAstToJs[idPartType](idPart);
                    pushToArray(source, nextIdNameCode.source);
                    ret.push(nextIdNameCode.exp);
                } else {
                    // literal a.x
                    ret.push(wrapByDoubleQuote(idPart));
                }
            }
            return ret;
        } else {
            return null;
        }
    }

    function genFunction(statements) {
        var source = ['function(scope, buffer) {'];
        for (var i = 0, len = statements.length; i < len; i++) {
            pushToArray(source, xtplAstToJs[statements[i].type](statements[i]).source);
        }
        source.push('return buffer; }');
        return source;
    }

    function genTopFunction(xtplAstToJs, statements) {
        var source = [
            'var engine = this,',
            'nativeCommands = engine.nativeCommands,',
            'utils = engine.utils;',
            nativeCode
        ];
        if (xtplAstToJs.isModule) {
            source.push(substitute(CHECK_VERSION, {
                version: S.version
            }));
        }
        for (var i = 0, len = statements.length; i < len; i++) {
            pushToArray(source, xtplAstToJs[statements[i].type](statements[i]).source);
        }
        source.push('return buffer;');
        return {
            params: ['scope', 'buffer', 'payload', 'undefined'],
            source: source.join('\n')
        };
    }

    function genOptionFromFunction(func, escape) {
        var optionName = guid('option');

        var source = ['var ' + optionName + ' = {' + (escape ? 'escape: 1' : '') + '};'],
            params = func.params,
            hash = func.hash;

        if (params) {
            var paramsName = guid('params');
            source.push('var ' + paramsName + ' = [];');
            S.each(params, function (param) {
                var nextIdNameCode = xtplAstToJs[param.type](param);
                pushToArray(source, nextIdNameCode.source);
                source.push(paramsName + '.push(' + nextIdNameCode.exp + ');');
            });
            source.push(optionName + '.params = ' + paramsName + ';');
        }

        if (hash) {
            var hashName = guid('hash');
            source.push('var ' + hashName + ' = {};');
            S.each(hash.value, function (v, key) {
                var nextIdNameCode = xtplAstToJs[v.type](v);
                pushToArray(source, nextIdNameCode.source);
                source.push(hashName + '[' + wrapByDoubleQuote(key) + '] = ' + nextIdNameCode.exp + ';');
            });
            source.push(optionName + '.hash = ' + hashName + ';');
        }

        return {
            exp: optionName,
            source: source
        };
    }

    function generateFunction(xtplAstToJs, func, escape, block) {
        var source = [],
            functionConfigCode,
            optionName,
            id = func.id,
            idName,
            idString = id.string,
            idParts = id.parts,
            lineNumber = id.lineNumber;

        functionConfigCode = genOptionFromFunction(func, escape);
        optionName = functionConfigCode.exp;
        pushToArray(source, functionConfigCode.source);

        if (block) {
            var programNode = block.program;
            source.push(optionName + '.fn = ' + genFunction(programNode.statements).join('\n') + ';');
            if (programNode.inverse) {
                source.push(optionName + '.inverse = ' + genFunction(programNode.inverse).join('\n') + ';');
            }
        }

        if (xtplAstToJs.isModule) {
            // require include/extend modules
            if (idString === 'include' || idString === 'extend') {
                // prevent require parse...
                source.push(substitute(REQUIRE_MODULE, {
                    name: func.params[0].value
                }));
            }
        }

        if (!block) {
            idName = guid('callRet');
            source.push('var ' + idName);
        }

        if (idString in nativeCommands) {
            source.push(substitute(CALL_NATIVE_COMMAND, {
                lhs: block ? 'buffer' : idName,
                name: idString,
                option: optionName,
                lineNumber: lineNumber
            }));
        } else if (block) {
            source.push(substitute(CALL_CUSTOM_COMMAND, {
                option: optionName,
                idParts: joinArrayOfString(idParts),
                lineNumber: lineNumber
            }));
        } else {
            // x.y(1,2)
            // {x:{y:function(a,b){}}}
            var newParts = getIdStringFromIdParts(source, idParts);
            source.push(substitute(CALL_FUNCTION, {
                lhs: idName,
                option: optionName,
                idParts: (newParts ? newParts.join(',') : joinArrayOfString(idParts)),
                depth: id.depth,
                lineNumber: lineNumber
            }));
        }

        if (idName) {
            source.push(substitute(CHECK_BUFFER, {
                name: idName
            }));
        }

        return {
            exp: idName,
            source: source
        };
    }

    var xtplAstToJs = {
        conditionalOrExpression: opExpression,

        conditionalAndExpression: opExpression,

        relationalExpression: opExpression,

        equalityExpression: opExpression,

        additiveExpression: opExpression,

        multiplicativeExpression: opExpression,

        unaryExpression: function (e) {
            var code = xtplAstToJs[e.value.type](e.value);
            return {
                exp: e.unaryType + '(' + code.exp + ')',
                source: code.source
            };
        },

        string: function (e) {
            // same as contentNode.value
            /*jshint quotmark:false*/
            return {
                exp: wrapBySingleQuote(escapeString(e.value, 1)),
                source: []
            };
        },

        number: function (e) {
            return {
                exp: e.value,
                source: []
            };
        },

        id: function (idNode) {
            var source = [],
                depth = idNode.depth,
                idParts = idNode.parts,
                idName = guid('id');
            // variable {{variable[subVariable]}}
            var newParts = getIdStringFromIdParts(source, idParts);
            // optimize for x.y.z
            source.push(substitute(SCOPE_RESOLVE, {
                lhs: idName,
                idParts: newParts ? newParts.join(',') : joinArrayOfString(idParts),
                depth: depth
            }));
            return {
                exp: idName,
                source: source
            };
        },

        'function': function (func, escape) {
            return generateFunction(this, func, escape);
        },

        blockStatement: function (block) {
            return generateFunction(this, block.func, block.escape, block);
        },

        expressionStatement: function (expressionStatement) {
            var source = [],
                escape = expressionStatement.escape,
                code,
                expression = expressionStatement.value,
                type = expression.type,
                expressionOrVariable;

            code = xtplAstToJs[type](expression, escape);

            pushToArray(source, code.source);
            expressionOrVariable = code.exp;

            source.push(substitute(BUFFER_WRITE, {
                value: expressionOrVariable,
                escape: !!escape
            }));

            return {
                exp: '',
                source: source
            };
        },

        contentStatement: function (contentStatement) {
            /*jshint quotmark:false*/
            return {
                exp: '',
                source: [
                    substitute(BUFFER_WRITE, {
                        value: wrapBySingleQuote(escapeString(contentStatement.value, 0)),
                        escape: 0
                    })
                ]
            };
        }
    };

    // prevent jscs error
    xtplAstToJs['boolean'] = function (e) {
        return {
            exp: e.value,
            source: []
        };
    };

    var compiler;

    /**
     * compiler for xtemplate
     * @class KISSY.XTemplate.compiler
     * @singleton
     */
    compiler = {
        /**
         * get ast of template
         * @param {String} [name] xtemplate name
         * @param {String} tplContent
         * @return {Object}
         */
        parse: function (tplContent, name) {
            return parser.parse(tplContent, name);
        },
        /**
         * get template function string
         * @param {String} tplContent
         * @param {String} [name] xtemplate name
         * @param {Boolean} [isModule] whether generated function is used in module
         * @return {String}
         */
        compileToStr: function (tplContent, name, isModule) {
            var func = compiler.compile(tplContent, name, isModule);
            return substitute(FUNC, {
                params: func.params.join(','),
                body: func.source
            });
        },
        /**
         * get template function json format
         * @param {String} [name] xtemplate name
         * @param {String} tplContent
         * @param {Boolean} [isModule] whether generated function is used in module
         * @return {Object}
         */
        compile: function (tplContent, name, isModule) {
            var root = compiler.parse(tplContent, name);
            uuid = 0;
            xtplAstToJs.isModule = isModule;
            return genTopFunction(xtplAstToJs, root.statements);
        },
        /**
         * get template function
         * @param {String} tplContent
         * @param {String} name template file name
         * @return {Function}
         */
        compileToFn: function (tplContent, name) {
            var code = compiler.compile(tplContent, name || guid('xtemplate'));
            // eval is not ok for eval("(function(){})") ie
            return Function.apply(null, code.params
                .concat(code.source + substitute(SOURCE_URL, {
                    name: name
                })));
        }
    };

    return compiler;
});

/*
 todo:
 need oop, new Source().xtplAstToJs()
 */