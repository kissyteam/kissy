/**
 * translate ast to js function code
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add(function (S, require) {
    require('util');
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
        source.push('function(scope, buffer) {\n');
        for (var i = 0, len = statements.length; i < len; i++) {
            pushToArray(source, xtplAstToJs[statements[i].type](statements[i]).source);
        }
        source.push('\n return buffer; }');
        return source;
    }

    function genTopFunction(xtplAstToJs, statements) {
        var source = [];
        source.push(
                'var engine = this,' +
                'nativeCommands = engine.nativeCommands,' +
                'utils = engine.utils;'
        );
        if (xtplAstToJs.isModule) {
            source.push('if("' + S.version + '" !== S.version){' +
                'throw new Error("current xtemplate file("+engine.name+")(v' + S.version + ') ' +
                'need to be recompiled using current kissy(v"+ S.version+")!");' +
                '}');
        }
        source.push('var ' + nativeCode + ';');
        for (var i = 0, len = statements.length; i < len; i++) {
            pushToArray(source, xtplAstToJs[statements[i].type](statements[i]).source);
        }
        source.push('return buffer;');
        return {
            params: ['scope', 'buffer', 'payload', 'undefined'],
            source: source
        };
    }

    function genOptionFromCommand(command, escape) {
        var source = [],
            optionName,
            params,
            hash;

        params = command.params;
        hash = command.hash;

        optionName = guid('option');
        source.push('var ' + optionName + ' = {' + (escape ? 'escape:1' : '') + '};');

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

    function generateCommand(xtplAstToJs, command, escape, block) {
        var source = [],
            commandConfigCode,
            optionName,
            id = command.id,
            idName,
            idString = id.string,
            inverseFn;

        commandConfigCode = genOptionFromCommand(command, escape);
        optionName = commandConfigCode.exp;
        pushToArray(source, commandConfigCode.source);

        if (block) {
            var programNode = block.program;
            source.push(optionName + '.fn=' + genFunction(programNode.statements).join('\n') + ';');
            if (programNode.inverse) {
                inverseFn = genFunction(programNode.inverse).join('\n');
                source.push(optionName + '.inverse=' + inverseFn + ';');
            }
        }

        if (xtplAstToJs.isModule) {
            // require include/extend modules
            if (idString === 'include' || idString === 'extend') {
                // prevent require parse...
                source.push('re' + 'quire("' + command.params[0].value + '");' +
                    optionName + '.params[0] = module.resolve(' + optionName + '.params[0]);');
            }
        }

        if (!block) {
            idName = guid('commandRet');
        }

        if (idString in nativeCommands) {
            if (block) {
                source.push('buffer = ' + idString + 'Command.call(engine, scope, ' + optionName + ', buffer, ' + id.lineNumber + ', payload);');
            } else {
                source.push('var ' + idName + ' = ' + idString + 'Command.call(engine, scope, ' + optionName + ', buffer, ' + id.lineNumber + ', payload);');
            }
        } else if (block) {
            source.push('buffer = callCommandUtil(engine, scope, ' + optionName +
                ', buffer, ' + '"' + idString + '", ' + id.lineNumber + ');');
        } else {
            source.push('var ' + idName + ' = callCommandUtil(engine, scope, ' + optionName +
                ', buffer, ' + '"' + idString + '", ' + id.lineNumber + ');');
        }

        if (idName) {
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
                exp: "'" + escapeString(e.value, true) + "'",
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

        command: function (command, escape) {
            return generateCommand(this, command, escape);
        },

        blockStatement: function (block) {
            return generateCommand(this, block.command, block.escape, block);
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

            source.push('buffer.write(' + expressionOrVariable + ',' + !!escape + ');');

            return {
                exp: '',
                source: source
            };
        },

        contentStatement: function (contentStatement) {
            /*jshint quotmark:false*/
            return {
                exp: '',
                source: ["buffer.write('" + escapeString(contentStatement.value, 0) + "');"]
            };
        }
    };

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
        parse: S.bind(parser.parse, parser),
        /**
         * get template function string
         * @param {String} tplContent
         * @param {String} [name] xtemplate name
         * @param {Boolean} [isModule] whether generated function is used in module
         * @return {String}
         */
        compileToStr: function (tplContent, name, isModule) {
            var func = compiler.compile(tplContent, name, isModule);
            return 'function(' + func.params.join(',') + '){\n' +
                func.source.join('\n') +
                '}';
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
            variableId = 0;
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
            if (!name) {
                name = 'xtemplate' + (xtemplateId++);
            }
            var code = compiler.compile(tplContent, name);
            var sourceURL = 'sourceURL=' + name + '.js';
            // eval is not ok for eval("(function(){})") ie
            return Function.apply(null, [].concat(code.params)
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