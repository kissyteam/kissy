/**
 * translate ast to js function code
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add(function (S, require) {
    var XTemplateRuntime = require('xtemplate/runtime');
    var parser = require('./compiler/parser');
    parser.yy = require('./compiler/ast');
    var nativeCode = '';
    var t;
    var keywords = ['if', 'with', 'debugger'];
    var nativeCommands = XTemplateRuntime.nativeCommands;
    var nativeUtils = XTemplateRuntime.utils;

    for (t in nativeUtils) {
        nativeCode += t + 'Util = utils.' + t + ',';
    }

    for (t in nativeCommands) {
        nativeCode += t + (S.indexOf(t, keywords) > -1 ?
            ('Command = nativeCommands["' + t + '"]') :
            ('Command = nativeCommands.' + t)) + ',';
    }

    nativeCode = nativeCode.slice(0, -1);

    var doubleReg = /\\*"/g,
        singleReg = /\\*'/g,
        arrayPush = [].push,
        variableId = 0,
        xtemplateId = 0;

    function guid(str) {
        return str + (variableId++);
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
        code1Source = code1.source;
        code2Source = code2.source;
        pushToArray(source, code1Source);
        if (type === '&&' || type === '||') {
            source.push('if(' + (type === '&&' ? '' : '!') + '(' + exp1 + ')){');
            pushToArray(source, code2Source);
            source.push('}');
        } else {
            pushToArray(source, code2Source);
        }
        return {
            exp: '(' + exp1 + ')' + type + '(' + exp2 + ')',
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
                    ret.push('"' + idPart + '"');
                }
            }
            return ret;
        } else {
            return null;
        }
    }

    function genFunction(statements) {
        var source = [];
        source.push('function(buffer,scope) {\n');
        if (statements) {
            for (var i = 0, len = statements.length; i < len; i++) {
                pushToArray(source, xtplAstToJs[statements[i].type](statements[i]).source);
            }
        }
        source.push('\n return buffer; }');
        return source;
    }

    function genTopFunction(statements) {
        var source = [];
        source.push(
            'var engine = this,' +
                'moduleWrap,' +
                'buffer = payload.buffer,' +
                'nativeCommands = engine.nativeCommands,' +
                'utils = engine.utils;'
        );
        source.push('if("' + S.version + '" !== S.version){' +
            'throw new Error("current xtemplate file("+engine.name+")(v' + S.version + ') ' +
            'need to be recompiled using current kissy(v"+ S.version+")!");' +
            '}');
        source.push('if (typeof module !== "undefined" && module.kissy) {' +
            'moduleWrap = module;' +
            '}');
        source.push('var ' + nativeCode + ';');
        if (statements) {
            for (var i = 0, len = statements.length; i < len; i++) {
                pushToArray(source, xtplAstToJs[statements[i].type](statements[i]).source);
            }
        }
        source.push('payload.buffer = buffer;');
        return {
            params: ['scope', 'S', 'payload', 'undefined'],
            source: source
        };
    }

    function genOptionFromCommand(command) {
        var source = [],
            optionName,
            params,
            hash;

        params = command.params;
        hash = command.hash;

        if (params || hash) {
            optionName = guid('option');
            source.push('var ' + optionName + ' = {};');
        } else {
            return null;
        }

        if (params) {
            var paramsName = guid('params');
            source.push('var ' + paramsName + ' = [];');
            S.each(params, function (param) {
                var nextIdNameCode = xtplAstToJs[param.type](param);
                pushToArray(source, nextIdNameCode.source);
                source.push(paramsName + '.push(' + nextIdNameCode.exp + ');');
            });
            source.push(optionName + '.params=' + paramsName + ';');
        }

        if (hash) {
            var hashName = guid('hash');
            source.push('var ' + hashName + ' = {};');
            S.each(hash.value, function (v, key) {
                var nextIdNameCode = xtplAstToJs[v.type](v);
                pushToArray(source, nextIdNameCode.source);
                source.push(hashName + '["' + key + '"] = ' + nextIdNameCode.exp + ';');
            });
            source.push(optionName + '.hash=' + hashName + ';');
        }

        return {
            exp: optionName,
            source: source
        };
    }

    function generateCommand(command, escape, block) {
        var source = [],
            commandConfigCode,
            optionName,
            id = command.id,
            idName,
            idString = id.string,
            inverseFn;

        commandConfigCode = genOptionFromCommand(command);

        if (commandConfigCode) {
            optionName = commandConfigCode.exp;
            pushToArray(source, commandConfigCode.source);
        } else {
            optionName = guid('option');
            source.push('var ' + optionName + ' = {};');
        }

        source.push(optionName + '.escape = ' + !!escape + ';');

        if (block) {
            var programNode = block.program;
            source.push(optionName + '.fn=' + genFunction(programNode.statements).join('\n') + ';');
            if (programNode.inverse) {
                inverseFn = genFunction(programNode.inverse).join('\n');
                source.push(optionName + '.inverse=' + inverseFn + ';');
            }
        }

        // require include/extend modules
        if (idString === 'include' || idString === 'extend') {
            // prevent require parse...
            source.push('if(moduleWrap) {re' + 'quire("' + command.params[0].value + '");' +
                optionName + '.params[0] = moduleWrap.resolveByName(' + optionName + '.params[0]);' +
                '}');
        }

        if (idString in nativeCommands) {
            source.push('buffer = ' + idString + 'Command.call(engine, buffer, scope, ' + optionName + ', payload);');
        } else if (block) {
            source.push('buffer = callCommandUtil(engine, buffer, scope, ' + optionName +
                ', ' + '"' + idString + '", ' + idString.lineNumber + ');');
        } else {
            // command must be x.y not x[u]
            // idString = getIdStringFromIdParts(source, id.parts);
            idName = guid('commandRet');
            source.push('var ' + idName + ' = callCommandUtil(engine, buffer, scope, ' + optionName +
                ', ' + '"' + idString + '", ' + idString.lineNumber + ');');
            source.push('if(' + idName + ' && ' + idName + '.isBuffer){' +
                'buffer = ' + idName + ';' +
                idName + ' = undefined;' +
                '}');
        }
        return {
            exp: idName,
            source: source
        };
    }

    var xtplAstToJs = {
        'conditionalOrExpression': opExpression,

        'conditionalAndExpression': opExpression,

        'relationalExpression': opExpression,

        'equalityExpression': opExpression,

        'additiveExpression': opExpression,

        'multiplicativeExpression': opExpression,

        'unaryExpression': function (e) {
            var code = xtplAstToJs[e.value.type](e.value);
            return {
                exp: e.unaryType + '(' + code.exp + ')',
                source: code.source
            };
        },

        'string': function (e) {
            // same as contentNode.value
            /*jshint quotmark:false*/
            return {
                exp: "'" + escapeString(e.value, true) + "'",
                source: []
            };
        },

        'number': function (e) {
            return {
                exp: e.value,
                source: []
            };
        },

        'boolean': function (e) {
            return {
                exp: e.value,
                source: []
            };
        },

        'id': function (idNode) {
            var source = [],
                depth = idNode.depth,
                idParts = idNode.parts,
                idName = guid('id');
            // variable {{variable[subVariable]}}
            var newParts = getIdStringFromIdParts(source, idParts);
            var depthParam = depth ? (',' + depth) : '';
            // optimize for x.y.z
            if (newParts) {
                source.push('var ' + idName + ' = scope.resolve([' + newParts.join(',') + ']' + depthParam + ');');
            } else {
                source.push('var ' + idName + ' = scope.resolve(["' + idParts.join('","') + '"]' + depthParam + ');');
            }
            return {
                exp: idName,
                source: source
            };
        },

        'command': generateCommand,

        'blockStatement': function (block) {
            return generateCommand(block.command, false, block);
        },

        'expressionStatement': function (expressionStatement) {
            var source = [],
                escape = expressionStatement.escape,
                code,
                expression = expressionStatement.value,
                type = expression.type,
                expressionOrVariable;

            code = xtplAstToJs[type](expression, escape);

            pushToArray(source, code.source);
            expressionOrVariable = code.exp;

            if (expressionOrVariable) {
                source.push('buffer.write(' + expressionOrVariable + ',' + !!escape + ');');
            }

            return {
                exp: '',
                source: source
            };
        },

        'contentStatement': function (contentStatement) {
            /*jshint quotmark:false*/
            return {
                exp: '',
                source: ["buffer.write('" + escapeString(contentStatement.value, 0) + "');"]
            };
        }
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
         * @param {String} tpl
         * @return {Object}
         */
        parse: function (tpl, name) {
            return parser.parse(name, tpl);
        },
        /**
         * get template function string
         * @param {String} tpl
         * @param {String} [name] xtemplate name
         * @return {String}
         */
        compileToStr: function (tpl, name) {
            var func = compiler.compile(tpl, name);
            return 'function(' + func.params.join(',') + '){\n' +
                func.source.join('\n') +
                '}';
        },
        /**
         * get template function json format
         * @param {String} [name] xtemplate name
         * @param {String} tpl
         * @return {Object}
         */
        compile: function (tpl, name) {
            var root = compiler.parse(name, tpl);
            variableId = 0;
            return genTopFunction(root.statements);
        },
        /**
         * get template function
         * @param {String} tpl
         * @param {String} name template file name
         * @return {Function}
         */
        compileToFn: function (tpl, name) {
            name = name || ('xtemplate' + (xtemplateId++));
            var code = compiler.compile(tpl, name);
            var sourceURL = 'sourceURL=' + name + '.js';
            // eval is not ok for eval("(function(){})") ie
            return Function.apply(null, []
                .concat(code.params)
                .concat(code.source.join('\n') +
                    // old chrome
                    '\n//@ ' + sourceURL +
                    // modern browser
                    '\n//# ' + sourceURL));
        }
    };

    return compiler;
});

/*
 todo:
 need oop, new Source().xtplAstToJs()
 */