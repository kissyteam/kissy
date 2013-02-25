/**
 * translate ast to js function code
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add("xtemplate/compiler", function (S, parser, ast, XTemplateRuntime) {

    parser.yy = ast;

    var utils = {
            'getProperty': 1
        },
        doubleReg = /\\*"/g,
        singleReg = /\\*'/g,
        arrayPush = [].push,
        variableId = 0,
        xtemplateId = 0;

    function guid(str) {
        return str + (variableId++);
    }

    // consider str compiler
    XTemplateRuntime.includeCommand.invokeEngine = function (tpl, scopes, option) {
        if (typeof tpl == 'string') {
            tpl = compiler.compileToFn(/**
             @type String
             @ignore
             */tpl, option);
        }
        return new XTemplateRuntime(tpl, S.merge(option)).render(scopes);
    };

    /**
     * @ignore
     */
    function escapeString(str, isDouble) {
        return escapeSingleQuoteInCodeString(str//.replace(/\\/g, '\\\\')
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n')
            .replace(/\t/g, '\\t'), isDouble);
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

        // ------------ helper generation function start

        genFunction: function (statements, global) {
            var source = [];
            if (!global) {
                source.push('function(scopes) {');
            }
            source.push('var buffer = ""' + (global ? ',' : ';'));
            if (global) {
                source.push('S = KISSY,' +
                    'escapeHTML = S.escapeHTML,' +
                    'isArray = S.isArray,' +
                    'isObject = S.isObject,' +
                    'log = S.log,' +
                    'commands = option.commands,' +
                    'utils = option.utils,' +
                    'error = S.error;');

                var natives = '',
                    c,
                // shortcut for global commands
                    commands = XTemplateRuntime.commands;

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
                idString = idNode.string,
                idName = guid('id'),
                self = this,
                foundNativeRuntimeCommand = 0,
                tmpNameCommand,
                commands = XTemplateRuntime.commands;

            source.push('var ' + idName + ';');

            // {{#each variable}} {{variable}}
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

                source.push('var ' + tmp + '=getProperty("' + idString + '",scopes);');

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

        genOption: function (tplNode) {
            var source = [],
                optionName = guid('option'),
                params, hash,
                self = this;

            source.push('var ' + optionName + ' = S.merge(option);');

            if (tplNode) {
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
            var source = [],
                name,
                code = this[e.value.type](e.value);
            arrayPush.apply(source, code[1]);
            if (name = code[0]) {
                source.push(name + '=!' + name + ';');
            } else {
                source[source.length - 1] = '!' + lastOfArray(source);
            }
            return [name, source];
        },

        'string': function (e) {
            // same as contentNode.value
            return ['', ["'" + escapeString(e.value) + "'"]];
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
                self = this,
                tmpNameCommand,
                tplNode = block.tpl,
                optionNameCode = self.genOption(tplNode),
                optionName = optionNameCode[0],
                commands = XTemplateRuntime.commands,
                string = tplNode.path.string,
                inverseFn,
                existsNativeCommand,
                variableName;

            pushToArray(source, optionNameCode[1]);

            source.push(optionName + '.fn=' +
                self.genFunction(programNode.statements).join('\n') + ';');

            if (programNode.inverse) {
                inverseFn = self.genFunction(programNode.inverse).join('\n');
                source.push(optionName + '.inverse=' + inverseFn + ';');
            }

            // support {{^
            // exchange fn with inverse
            if (tplNode.isInversed) {
                var tmp = guid('inverse');
                source.push('var ' + tmp + '=' + optionName + '.fn;');
                source.push(optionName + '.fn = ' + optionName + '.inverse;');
                source.push(optionName + '.inverse = ' + tmp + ';');
            }

            // reduce generated code size
            if (existsNativeCommand = commands[string]) {
                tmpNameCommand = string + 'Command';
            } else {
                tmpNameCommand = guid('command');
                source.push('var ' + tmpNameCommand +
                    ' = commands["' + string + '"];');
                // {{#xx}}1{#xx} => xx is not command =>
                // if xx => array => {{#each xx}}1{/each}}
                // if xx => object => {{#with xx}}1{/with}}
                // else => {{#if xx}}1{/if}}
                if (!tplNode.hash && !tplNode.params) {
                    source.push('if(!' + tmpNameCommand + '){');
                    var propertyValueHolder = guid('propertyValueHolder');
                    source.push('var ' + propertyValueHolder + ' = getProperty("' + string + '",scopes);');
                    variableName = guid('variableName');
                    source.push('var ' + variableName + '=' + propertyValueHolder + '&&' + propertyValueHolder + '[0];');
                    source.push(optionName + '.params=[' + variableName + '];');
                    source.push('if(isArray(' + variableName + ')){');
                    source.push(tmpNameCommand + '=commands["each"];');
                    source.push('}');
                    source.push('else if(isObject(' + variableName + ')){');
                    source.push(tmpNameCommand + '=commands["with"];');
                    source.push('}');
                    source.push('else {');
                    source.push(tmpNameCommand + '=commands["if"];');
                    source.push('}');
                    source.push('}');
                }
                source.push('if( ' + tmpNameCommand + ' ){');
            }

            source.push('try{');
            source.push('buffer += ' + tmpNameCommand + '(scopes,' + optionName + ');');
            source.push('}catch(e){');
            source.push('error(e.message+": \'' + string +
                '\' at line ' + tplNode.path.lineNumber + '");');
            source.push('}');

            if (!existsNativeCommand) {
                source.push('}');
                source.push('if('+propertyValueHolder+'===false) {');
                source.push('S[option.silent?"log":"error"]("can not find command: \'' +
                    string + '\' at line ' + tplNode.path.lineNumber + '","warn");');
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
        source.push('buffer+=' + (escaped ? 'escapeHTML(' : '') +
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