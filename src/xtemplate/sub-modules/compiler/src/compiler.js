/**
 * translate ast to js function code
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add("xtemplate/compiler", function (S, parser, ast, XTemplateRuntime) {

    'use strict';

    parser.yy = ast;

    var utils = {'getProperty': 1};
    var doubleReg = /"/g, single = /'/g, escapeString;
    var arrayPush = [].push;
    var variableId = 0;
    var xtemplateId = 0;

    function guid(str) {
        return str + (variableId++);
    }

    // consider str compiler
    XTemplateRuntime.includeCommand.invokeEngine = function (tpl, scopes, option) {
        if (typeof tpl == 'string') {
            tpl = compiler.compileToFn(tpl, option);
        }
        return new XTemplateRuntime(tpl, S.merge(option)).render(scopes);
    };

    /**
     * @ignore
     * @param str
     * @param [quote]
     * @return {*}
     */
    escapeString = function (str, quote) {
        var regexp = single;
        if (quote == '"') {
            regexp = doubleReg;
        } else {
            quote = "'";
        }
        return str//.replace(/\\/g, '\\\\')
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n')
            .replace(/\t/g, '\\t')
            .replace(regexp, '\\' + quote);
    };

    function pushToArray(to, from) {
        arrayPush.apply(to, from);
    }

    function lastOfArray(arr) {
        return arr[arr.length - 1];
    }

    var gen = {

        // ------------ helper generation function start

        genFunction: function (statements, global) {
            var source = [];
            if (!global) {
                source.push('function(scopes) {');
            }
            source.push('"use strict";');
            source.push('var buffer = ""' + (global ? ',' : ';'));
            if (global) {
                source.push('S = KISSY,' +
                    'escapeHTML = S.escapeHTML,' +
                    'log = S.log,' +
                    'commands = option.commands,' +
                    'utils = option.utils,' +
                    'error = S.error;');

                var natives = '', c;

                // shortcut for global commands
                var commands = XTemplateRuntime.commands;
                for (c in commands) {
                    natives += c + 'Command = commands["' + c + '"],';
                }

                for (c in utils) {
                    natives += c + ' = utils["' + c + '"],';
                }

                if (natives) {
                    source.push('var ' + natives.slice(0, natives.length - 1));
                }
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
                    params: ['scopes', 'option', 'undefined'],
                    source: source
                };
            }
        },

        genId: function (idNode, tplNode) {
            var source = [],
                depth = idNode.depth,
                scope = 'scopes[' + depth + ']',
                idString = idNode.string,
                idName = guid('id'),
                self = this,
                foundNativeRuntimeCommand = 0,
                tmpNameCommand,
                commands = XTemplateRuntime.commands;

            source.push('var ' + idName + ';');

            // {{each variable}} {{variable}}
            if (tplNode && depth == 0) {
                var optionNameCode = self.genOption(tplNode);
                pushToArray(source, optionNameCode[1]);
                // skip if for global commands before current template's render
                if (foundNativeRuntimeCommand = commands[idString]) {
                    tmpNameCommand = idString + 'Command';
                } else {
                    tmpNameCommand = guid('command');
                    source.push('var ' + tmpNameCommand + ';');
                    source.push(tmpNameCommand + ' = commands["' + idString + '"];');
                    source.push('if( ' + tmpNameCommand + ' ){');
                }
                source.push('try{');
                source.push(idName + ' = ' + tmpNameCommand +
                    '(scopes,' + optionNameCode[0] + ');');
                source.push('}catch(e){');
                source.push('error(e.message+": \'' +
                    idString + '\' at line ' + idNode.lineNumber + '");');
                source.push('}');

                if (!foundNativeRuntimeCommand) {
                    source.push('}');
                    source.push('else {');
                }
            }

            // variable {{variable.subVariable}}
            if (!foundNativeRuntimeCommand) {

                var tmp = guid('tmp');

                source.push('var ' + tmp + '=getProperty("' + idString + '",' + scope + ');');

                source.push('if(' + tmp + '===false){');
                source.push('S[option.silent?"log":"error"]("can not find property: \'' +
                    idString + '\' at line ' + idNode.lineNumber + '", "warn");');
                // only normalize when render
                // source.push(idName + ' = "";');
                source.push('} else {');
                source.push(idName + ' = ' + tmp + '[0];');
                source.push('}');

                if (tplNode && depth == 0) {
                    source.push('}');
                }
            }

            return [idName, source];
        },

        genOpExpression: function (e, type) {
            var source = [];
            var name1;
            var name2;
            var code1 = this[e.op1.type](e.op1);
            var code2 = this[e.op2.type](e.op2);
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
        },

        genOption: function (tplNode) {
            var source = [],
                optionName = guid('option'),
                self = this;

            source.push('var ' + optionName + ' = S.merge(option);');

            if (tplNode) {

                var params, hash;
                if (params = tplNode.params) {
                    var paramsName = guid('params');
                    source.push('var ' + paramsName + ' = [];');

                    S.each(params, function (param) {
                        var nextIdNameCode = self[param.type](param);
                        if (nextIdNameCode[0]) {
                            pushToArray(source, nextIdNameCode[1]);
                            source.push(paramsName + '.push(' + nextIdNameCode[0] + ');')
                        } else {
                            pushToArray(source, nextIdNameCode[1].slice(0, -1));
                            source.push(paramsName + '.push(' + lastOfArray(nextIdNameCode[1]) + ');')
                        }
                    });

                    source.push(optionName + '.params=' + paramsName + ';');
                }

                if (hash = tplNode.hash) {
                    var hashName = guid('hash');
                    source.push('var ' + hashName + ' = {};');

                    S.each(hash.value, function (v, key) {
                        var nextIdNameCode = self[v.type](v);
                        if (nextIdNameCode[0]) {
                            pushToArray(source, nextIdNameCode[1]);
                            source.push(hashName + '["' + key + '"] = ' + nextIdNameCode[0] + ';')
                        } else {
                            pushToArray(source, nextIdNameCode[1].slice(0, -1));
                            source.push(hashName + '["' + key + '"] = ' + lastOfArray(nextIdNameCode[1]) + ';')
                        }
                    });

                    source.push(optionName + '.hash=' + hashName + ';');
                }

            }

            return [optionName, source];
        },

        // ------------ helper generation function end

        conditionalOrExpression: function (e) {
            return this.genOpExpression(e, '||');
        },

        conditionalAndExpression: function (e) {
            return this.genOpExpression(e, '&&');
        },

        relationalExpression: function (e) {
            return this.genOpExpression(e, e.opType);
        },

        equalityExpression: function (e) {
            return this.genOpExpression(e, e.opType);
        },

        additiveExpression: function (e) {
            return this.genOpExpression(e, e.opType);
        },

        multiplicativeExpression: function (e) {
            return this.genOpExpression(e, e.opType);
        },

        unaryExpression: function (e) {
            var source = [];
            var name;
            var code = this[e.value.type](e.value);
            arrayPush.apply(source, code[1]);
            if (name = code[0]) {
                source.push(name + '=!' + name + ';');
            } else {
                source[source.length - 1] = '!' + lastOfArray(source);
            }
            return [name, source];
        },

        'string': function (e) {
            // no need to escape \ or \n
            // it is code in template too,
            // just escape ' in case user use " for string in template code
            // but here we use ' for string in template code
            return ['', ["'" + e.value.replace(/'/g, "\\'") + "'"]];
        },

        'number': function (e) {
            return ['', [e.value]];
        },

        'boolean': function (e) {
            return ['', [e.value]];
        },

        'id': function (e) {
            return this.genId(e);
        },

        'block': function (block) {
            var programNode = block.program,
                source = [],
                tmpNameCommand,
                tplNode = block.tpl,
                optionNameCode = this.genOption(tplNode),
                optionName = optionNameCode[0],
                commands = XTemplateRuntime.commands,
                string = tplNode.path.string;

            pushToArray(source, optionNameCode[1]);


            source.push(optionName + '.fn=' + this.genFunction(programNode.statements).join('\n') + ';');

            if (programNode.inverse) {
                var inverseFn = this.genFunction(programNode.inverse).join('\n');
                source.push(optionName + '.inverse=' + inverseFn + ';');
            }

            if (!commands[string]) {
                tmpNameCommand = guid('command');
                source.push('var ' + tmpNameCommand +
                    ' = commands["' + string + '"];');
                source.push('if( ' + tmpNameCommand + ' ){');
            } else {
                tmpNameCommand = string + 'Command';
            }
            source.push('try{');
            source.push('buffer += ' + tmpNameCommand + '(scopes,' + optionName + ');');
            source.push('}catch(e){');
            source.push('error(e.message+": \'' +
                string + '\' at line ' + tplNode.path.lineNumber + '");');
            source.push('}');
            if (!commands[string]) {
                source.push('}');
                var tmp = guid('tmp');
                source.push('else {');
                source.push('var ' + tmp + ';');
                source.push(tmp + ' = getProperty("' + string + '",scopes[0]);');
                source.push('if(' + tmp + '!==false&&S.isArray(' + tmp + '[0])) {');
                source.push('try{');
                source.push(optionName + '.params=' + tmp + ';');
                source.push('buffer += eachCommand(scopes,' + optionName + ');');
                source.push('}catch(e){');
                source.push('error(e.message+": \' each ' +
                    string + '\' at line ' + tplNode.path.lineNumber + '");');
                source.push('}');
                source.push('}');
                source.push('else if(' + tmp + '!==false&&S.isObject(' + tmp + '[0])) {');
                source.push('try{');
                source.push(optionName + '.params=' + tmp + ';');
                source.push('buffer += withCommand(scopes,' + optionName + ');');
                source.push('}catch(e){');
                source.push('error(e.message+": \' with ' +
                    string + '\' at line ' + tplNode.path.lineNumber + '");');
                source.push('}');
                source.push('}');
                source.push('else {');
                source.push('error("can not find command: \'' +
                    string + '\' at line ' + tplNode.path.lineNumber + '");');
                source.push('}');
                source.push('}');
            }
            return source;
        },

        'content': function (contentNode) {
            return ['buffer += \'' + escapeString(contentNode.value) + '\';'];
        },

        'tpl': function (tplNode) {
            var source = [],
                escaped = tplNode.escaped,
                genIdCode = this.genId(tplNode.path, tplNode);
            pushToArray(source, genIdCode[1]);

            outputVariable(genIdCode[0], escaped, source);

            return source;
        },

        tplExpression: function (e) {
            var source = [],
                escaped = e.escaped,
                expressionOrVariable,
                code = this[e.expression.type](e.expression);
            if (code[0]) {
                pushToArray(source, code[1]);
                expressionOrVariable = code[0];
            } else {
                pushToArray(source, code[1].slice(0, -1));
                expressionOrVariable = lastOfArray(code[1]);
            }

            outputVariable(expressionOrVariable, escaped, source);

            return source;
        }

    };

    function outputVariable(expressionOrVariable, escaped, source) {
        var tmp = guid('tmp');
        // in case it is expression, avoid duplicate computation
        source.push('var ' + tmp + ' = ' + expressionOrVariable + ';');
        source.push('buffer+=' +
            (escaped ? 'escapeHTML(' : '') +
            // when render undefined => ''
            '(' + tmp + '===undefined?"":' + tmp + ')' + '+""' +
            (escaped ? ')' : '') +
            ';');
    }

    var compiler;

    /**
     * compiler for xtemplate
     * @class KISSY.XTemplate.compiler
     * @singleton
     */
    return compiler = {
        /**
         * get ast of template
         * @param {String} tpl
         * @return {Object}
         */
        parse: function (tpl) {
            return parser.parse(tpl);
        },
        /**
         * get template function string
         * @param {String} tpl
         * @return {String}
         */
        compileToStr: function (tpl) {
            var func = this.compile(tpl);
            return 'function(' + func.params.join(',') + '){\n' +
                func.source.join('\n') +
                '}';
        },
        /**
         * get template function json format
         * @param {String} tpl
         * @return {Object}
         */
        compile: function (tpl) {
            var root = this.parse(tpl);
            variableId = 0;
            return gen.genFunction(root.statements, true);
        },
        /**
         * get template function
         * @param {String} tpl
         * @param {Object} option
         * @param {String} option.name template file name
         * @return {Function}
         */
        compileToFn: function (tpl, option) {
            var code = compiler.compile(tpl);
            option = option || {};
            // eval is not ok for eval("(function(){})") ie
            return (Function.apply(null, []
                .concat(code.params)
                .concat(code.source.join('\n') + '//@ sourceURL=' +
                (option.name ? option.name : ('xtemplate' + (xtemplateId++))) + '.js')));
        }
    };

}, {
    requires: ['./compiler/parser', './compiler/ast', 'xtemplate/runtime']
});