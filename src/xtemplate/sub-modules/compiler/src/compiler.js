/**
 * translate ast to js function code
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add(function (S, require) {
    var XTemplateRuntime = require('xtemplate/runtime');
    var nativeCode = '',
        t;

    var nativeCommands = XTemplateRuntime.nativeCommands,
        nativeUtils = XTemplateRuntime.utils;

    for (t in nativeUtils) {
        nativeCode += t + 'Util = utils.' + t + ',';
    }

    for (t in nativeCommands) {
        nativeCode += t + ((t === 'with' || t === 'if') ?
            ('Command = nativeCommands["' + t + '"]') :
            ('Command = nativeCommands.' + t)) + ',';
    }

    nativeCode = nativeCode.slice(0, -1);

    var parser = require('./compiler/parser');

    parser.yy = require('./compiler/ast');

    var doubleReg = /\\*"/g,
        singleReg = /\\*'/g,
        arrayPush = [].push,
        variableId = 0,
        xtemplateId = 0;

    function guid(str) {
        return str + (variableId++);
    }

    function escapeString(str, isCode) {
        if (isCode) {
            str = escapeSingleQuoteInCodeString(str, false);
        } else {
            /*jshint quotmark:false*/
            str = str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        }
        str = str.replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n').replace(/\t/g, '\\t');
        return str;
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

    function pushToArray(to, from) {
        arrayPush.apply(to, from);
    }

    function lastOfArray(arr) {
        return arr[arr.length - 1];
    }

    var gen = {
        // consider x[d]
        getIdStringFromIdParts: function (source, idParts) {
            var idString = '',
                self = this,
                i, l,
                idPart,
                idPartType,
                nextIdNameCode,
                first = true;
            for (i = 0, l = idParts.length; i < l; i++) {
                idPart = idParts[i];
                idPartType = idPart.type;
                if (!first) {
                    idString += '.';
                }
                if (idPartType) {
                    nextIdNameCode = self[idPartType](idPart);
                    if (nextIdNameCode[0]) {
                        pushToArray(source, nextIdNameCode[1]);
                        idString += '"+' + nextIdNameCode[0] + '+"';
                        first = true;
                    } else {
                        // number
                        idString += nextIdNameCode[1][0];
                    }
                } else {
                    // string
                    idString += idPart;
                    first = false;
                }
            }
            return idString;
        },

        // ------------ helper generation function start
        genFunction: function (statements, global) {
            var source = [];
            if (!global) {
                source.push('function(scope) {');
            }
            source.push('var buffer = ""' + (global ? ',' : ';'));
            if (global) {
                source.push(
                    // current xtemplate engine
                    'engine = this,' +
                        'moduleWrap,' +
                        'escapeHtml = S.escapeHtml,' +
                        'nativeCommands = engine.nativeCommands,' +
                        'utils = engine.utils;'
                );

                source.push('if (typeof module !== "undefined" && module.kissy) {' +
                    'moduleWrap = module;' +
                    '}');

                source.push('var ' + nativeCode + ';');
            }
            if (statements) {
                for (var i = 0, len = statements.length; i < len; i++) {
                    pushToArray(source, this[statements[i].type](statements[i]));
                }
            }
            source.push('return buffer;');
            if (!global) {
                source.push('}');
                return source;
            } else {
                return {
                    params: ['scope', 'S', 'payload', 'undefined'],
                    source: source
                };
            }
        },

        genOpExpression: function (e, type) {
            var source = [],
                name1,
                name2,
                code1 = this[e.op1.type](e.op1),
                code2 = this[e.op2.type](e.op2);

            name1 = code1[0];
            name2 = code2[0];

            if (name1 && name2) {
                pushToArray(source, code1[1]);
                pushToArray(source, code2[1]);
                source.push(name1 + type + name2);
                return ['', source];
            }

            if (!name1 && !name2) {
                pushToArray(source, code1[1].slice(0, -1));
                pushToArray(source, code2[1].slice(0, -1));
                source.push('(' +
                    lastOfArray(code1[1]) +
                    ')' +
                    type +
                    '(' + lastOfArray(code2[1]) + ')');
                return ['', source];
            }

            if (name1 && !name2) {
                pushToArray(source, code1[1]);
                pushToArray(source, code2[1].slice(0, -1));
                source.push(name1 + type +
                    '(' +
                    lastOfArray(code2[1]) +
                    ')');
                return ['', source];
            }

            if (!name1 && name2) {
                pushToArray(source, code1[1].slice(0, -1));
                pushToArray(source, code2[1]);
                source.push('(' +
                    lastOfArray(code1[1]) +
                    ')' +
                    type + name2);
                return ['', source];
            }

            return undefined;
        },

        genOptionFromCommand: function (command) {
            var source = [],
                optionName,
                params,
                hash,
                self = this;

            params = command.params;
            hash = command.hash;

            if (params || hash) {
                optionName = guid('option');
                source.push('var ' + optionName + ' = {};');
            }

            if (params) {
                var paramsName = guid('params');
                source.push('var ' + paramsName + ' = [];');
                S.each(params, function (param) {
                    var nextIdNameCode = self[param.type](param);
                    if (nextIdNameCode[0]) {
                        pushToArray(source, nextIdNameCode[1]);
                        source.push(paramsName + '.push(' + nextIdNameCode[0] + ');');
                    } else {
                        pushToArray(source, nextIdNameCode[1].slice(0, -1));
                        source.push(paramsName + '.push(' + lastOfArray(nextIdNameCode[1]) + ');');
                    }
                });
                source.push(optionName + '.params=' + paramsName + ';');
            }

            if (hash) {
                var hashName = guid('hash');
                source.push('var ' + hashName + ' = {};');
                S.each(hash.value, function (v, key) {
                    var nextIdNameCode = self[v.type](v);
                    if (nextIdNameCode[0]) {
                        pushToArray(source, nextIdNameCode[1]);
                        source.push(hashName + '["' + key + '"] = ' + nextIdNameCode[0] + ';');
                    } else {
                        pushToArray(source, nextIdNameCode[1].slice(0, -1));
                        source.push(hashName + '["' + key + '"] = ' + lastOfArray(nextIdNameCode[1]) + ';');
                    }
                });
                source.push(optionName + '.hash=' + hashName + ';');
            }

            return [optionName, source];
        },

        'conditionalOrExpression': function (e) {
            return this.genOpExpression(e, '||');
        },

        'conditionalAndExpression': function (e) {
            return this.genOpExpression(e, '&&');
        },

        'relationalExpression': function (e) {
            return this.genOpExpression(e, e.opType);
        },

        'equalityExpression': function (e) {
            return this.genOpExpression(e, e.opType);
        },

        'additiveExpression': function (e) {
            return this.genOpExpression(e, e.opType);
        },

        'multiplicativeExpression': function (e) {
            return this.genOpExpression(e, e.opType);
        },

        'unaryExpression': function (e) {
            var source = [],
                name,
                unaryType = e.unaryType,
                code = this[e.value.type](e.value);
            arrayPush.apply(source, code[1]);
            if ((name = code[0])) {
                source.push(name + '=' + unaryType + name + ';');
            } else {
                source[source.length - 1] = '' + unaryType + lastOfArray(source);
            }
            return [name, source];
        },

        'string': function (e) {
            // same as contentNode.value
            /*jshint quotmark:false*/
            return ['', ["'" + escapeString(e.value, true) + "'"]];
        },

        'number': function (e) {
            return ['', [e.value]];
        },

        'boolean': function (e) {
            return ['', [e.value]];
        },

        'id': function (idNode) {
            var source = [],
                depth = idNode.depth,
                idParts = idNode.parts,
                originalIdString = idNode.string,
                idName = guid('id'),
                self = this;
            // variable {{variable.subVariable}}
            var idString = self.getIdStringFromIdParts(source, idParts);
            var depthParam = depth ? (',' + depth) : '';
            if (originalIdString === idString) {
                source.push('var ' + idName + ' = scope.resolve(["' + idParts.join('","') + '"]' + depthParam + ');');
            } else {
                source.push('var ' + idName + ' = scope.resolve("' + idString + '"' + depthParam + ');');
            }
            return [idName, source];
        },

        'command': function (command) {
            var source = [],
                idNode = command.id,
                optionName,
                idParts = idNode.parts,
                idName = guid('id'),
                self = this;

            var commandConfigCode = self.genOptionFromCommand(command);

            if (commandConfigCode) {
                optionName = commandConfigCode[0];
                pushToArray(source, commandConfigCode[1]);
            }

            var idString = self.getIdStringFromIdParts(source, idParts);

            // require include modules
            if (idString === 'include') {
                // prevent require parse...
                source.push('if(moduleWrap) {re' + 'quire("' + command.params[0].value + '");' +
                    optionName + '.params[0] = moduleWrap.resolveByName(' + optionName + '.params[0]);' +
                    '}');
            }
            if (idString in nativeCommands) {
                source.push('var ' + idName + ' = ' + idString +
                    'Command.call(engine,scope,' + optionName + ',payload);');
            } else {
                source.push('var ' + idName +
                    ' = callCommandUtil(engine,scope,' +
                    optionName + ',"' + idString + '",' +
                    idNode.lineNumber + ');');
            }

            return [idName, source];
        },


        'blockStatement': function (block) {
            var programNode = block.program,
                source = [],
                self = this,
                command = block.command,
                commandConfigCode = self.genOptionFromCommand(command),
                optionName = commandConfigCode[0],
                id = command.id,
                idString = id.string,
                inverseFn;

            pushToArray(source, commandConfigCode[1]);

            if (!optionName) {
                optionName = S.guid('option');
                source.push('var ' + optionName + ' = {};');
            }

            source.push(optionName + '.fn=' +
                self.genFunction(programNode.statements).join('\n') + ';');

            if (programNode.inverse) {
                inverseFn = self.genFunction(programNode.inverse).join('\n');
                source.push(optionName + '.inverse=' + inverseFn + ';');
            }

            var parts = id.parts;
            for (var i = 0, l = parts.length; i < l; i++) {
                // {{x[d]}}
                if (typeof parts[i] !== 'string') {
                    idString = self.getIdStringFromIdParts(source, parts);
                    break;
                }
            }

            if (idString in nativeCommands) {
                source.push('buffer += ' + idString + 'Command.call(engine, scope, ' + optionName + ',payload);');
            } else {
                source.push('buffer += callCommandUtil(engine, scope, ' +
                    optionName + ', ' +
                    '"' + idString + '", ' +
                    id.lineNumber + ');');
            }
            return source;
        },

        'expressionStatement': function (expressionStatement) {
            var source = [],
                escape = expressionStatement.escape,
                code,
                expression = expressionStatement.value,
                type = expression.type,
                expressionOrVariable;

            code = this[type](expression);

            if (code[0]) {
                pushToArray(source, code[1]);
                expressionOrVariable = code[0];
            } else {
                pushToArray(source, code[1].slice(0, -1));
                expressionOrVariable = lastOfArray(code[1]);
            }

            if (escape) {
                source.push('buffer += escapeHtml(' + expressionOrVariable + ');');
            } else {
                source.push('if(' + expressionOrVariable + ' || ' + expressionOrVariable + ' === 0) { ' +
                    'buffer += ' + expressionOrVariable + ';' +
                    ' }');
            }

            return source;
        },

        'contentStatement': function (contentStatement) {
            return ['buffer += \'' + escapeString(contentStatement.value, false) + '\';'];
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
            return gen.genFunction(root.statements, true);
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
 need oop, new Source().gen()
 */