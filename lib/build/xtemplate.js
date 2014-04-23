/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 23 18:37
*/
/*
combined modules:
xtemplate
xtemplate/compiler
xtemplate/compiler/parser
xtemplate/compiler/ast
*/
/**
 * @ignore
 * simple facade for runtime and compiler
 * @author yiminghe@gmail.com
 */
KISSY.add('xtemplate', [
    'util',
    'xtemplate/runtime',
    'xtemplate/compiler'
], function (S, require) {
    require('util');
    var XTemplateRuntime = require('xtemplate/runtime');
    var Compiler = require('xtemplate/compiler');
    var cache = XTemplate.cache = {};
    function compile(tpl, config) {
        var fn;
        var cacheable = !config || config.cache !== false;
        if (cacheable && (fn = cache[tpl])) {
            return fn;
        }
        fn = Compiler.compileToFn(tpl, config && config.name);
        if (cacheable) {
            cache[tpl] = fn;
        }
        return fn;
    }    /*
     *whether cache template string
     * @member KISSY.XTemplate
     * @cfg {Boolean} cache.
     * Defaults to true.
     */
         /**
     * xtemplate engine for KISSY.
     *
     *
     *      @example
     *      KISSY.use('xtemplate',function(S, XTemplate){
     *          document.writeln(new XTemplate('{{title}}').render({title:2}));
     *      });
     *
     *
     * @class KISSY.XTemplate
     * @extends KISSY.XTemplate.Runtime
     */
    /*
     *whether cache template string
     * @member KISSY.XTemplate
     * @cfg {Boolean} cache.
     * Defaults to true.
     */
    /**
     * xtemplate engine for KISSY.
     *
     *
     *      @example
     *      KISSY.use('xtemplate',function(S, XTemplate){
     *          document.writeln(new XTemplate('{{title}}').render({title:2}));
     *      });
     *
     *
     * @class KISSY.XTemplate
     * @extends KISSY.XTemplate.Runtime
     */
    function XTemplate(tpl, config) {
        if (typeof tpl === 'string') {
            tpl = compile(tpl, config);
        }
        XTemplate.superclass.constructor.call(this, tpl, config);
    }
    S.extend(XTemplate, XTemplateRuntime, {}, {
        Compiler: Compiler,
        Scope: XTemplateRuntime.Scope,
        RunTime: XTemplateRuntime,
        /**
         * add command to all template
         * @method
         * @static
         * @param {String} commandName
         * @param {Function} fn
         */
        addCommand: XTemplateRuntime.addCommand,
        /**
         * remove command from all template by name
         * @method
         * @static
         * @param {String} commandName
         */
        removeCommand: XTemplateRuntime.removeCommand
    });
    return XTemplate;
});    /*
 It consists three modules:

 -   xtemplate - Both compiler and runtime functionality.
 -   xtemplate/compiler - Compiler string template to module functions.
 -   xtemplate/runtime -  Runtime for string template( with xtemplate/compiler loaded)
 or template functions.

 xtemplate/compiler depends on xtemplate/runtime,
 because compiler needs to know about runtime to generate corresponding codes.
 */


/**
 * translate ast to js function code
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add('xtemplate/compiler', [
    'util',
    'xtemplate/runtime',
    './compiler/parser',
    './compiler/ast'
], function (S, require) {
    require('util');
    var XTemplateRuntime = require('xtemplate/runtime');
    var parser = require('./compiler/parser');
    parser.yy = require('./compiler/ast');
    var nativeCode = '';
    var t;
    var keywords = [
            'if',
            'with',
            'debugger'
        ];
    var nativeCommands = XTemplateRuntime.nativeCommands;
    var nativeUtils = XTemplateRuntime.utils;
    for (t in nativeUtils) {
        nativeCode += t + 'Util = utils.' + t + ',';
    }
    for (t in nativeCommands) {
        nativeCode += t + (S.indexOf(t, keywords) > -1 ? 'Command = nativeCommands["' + t + '"]' : 'Command = nativeCommands.' + t) + ',';
    }
    nativeCode = nativeCode.slice(0, -1);
    var doubleReg = /\\*"/g, singleReg = /\\*'/g, arrayPush = [].push, variableId = 0, xtemplateId = 0;
    function guid(str) {
        return str + variableId++;
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
            str = str.replace(/\\/g, '\\\\').replace(/'/g, '\\\'');
        }
        str = str.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
        return str;
    }
    function pushToArray(to, from) {
        arrayPush.apply(to, from);
    }
    function opExpression(e) {
        var source = [], type = e.opType, exp1, exp2, code1Source, code2Source, code1 = xtplAstToJs[e.op1.type](e.op1), code2 = xtplAstToJs[e.op2.type](e.op2);
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
    }    // consider x[d]
    // consider x[d]
    function getIdStringFromIdParts(source, idParts) {
        if (idParts.length === 1) {
            return null;
        }
        var i, l, idPart, idPartType, check = 0, nextIdNameCode;
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
        source.push('var engine = this,' + 'nativeCommands = engine.nativeCommands,' + 'utils = engine.utils;');
        if (xtplAstToJs.isModule) {
            source.push('if("' + S.version + '" !== S.version){' + 'throw new Error("current xtemplate file("+engine.name+")(v' + S.version + ') ' + 'need to be recompiled using current kissy(v"+ S.version+")!");' + '}');
        }
        source.push('var ' + nativeCode + ';');
        for (var i = 0, len = statements.length; i < len; i++) {
            pushToArray(source, xtplAstToJs[statements[i].type](statements[i]).source);
        }
        source.push('return buffer;');
        return {
            params: [
                'scope',
                'buffer',
                'payload',
                'undefined'
            ],
            source: source
        };
    }
    function genOptionFromCommand(command, escape) {
        var source = [], optionName, params, hash;
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
        var source = [], commandConfigCode, optionName, id = command.id, idName, idString = id.string, inverseFn;
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
                source.push('re' + 'quire("' + command.params[0].value + '");' + optionName + '.params[0] = module.resolve(' + optionName + '.params[0]);');
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
            source.push('buffer = callCommandUtil(engine, scope, ' + optionName + ', buffer, ' + '"' + idString + '", ' + id.lineNumber + ');');
        } else {
            source.push('var ' + idName + ' = callCommandUtil(engine, scope, ' + optionName + ', buffer, ' + '"' + idString + '", ' + id.lineNumber + ');');
        }
        if (idName) {
            source.push('if(' + idName + ' && ' + idName + '.isBuffer){' + 'buffer = ' + idName + ';' + idName + ' = undefined;' + '}');
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
                    exp: '\'' + escapeString(e.value, true) + '\'',
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
                var source = [], depth = idNode.depth, idParts = idNode.parts, idName = guid('id');    // variable {{variable[subVariable]}}
                // variable {{variable[subVariable]}}
                var newParts = getIdStringFromIdParts(source, idParts);
                var depthParam = depth ? ',' + depth : '';    // optimize for x.y.z
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
                var source = [], escape = expressionStatement.escape, code, expression = expressionStatement.value, type = expression.type, expressionOrVariable;
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
                    source: ['buffer.write(\'' + escapeString(contentStatement.value, 0) + '\');']
                };
            }
        };
    xtplAstToJs['boolean'] = function (e) {
        return {
            exp: e.value,
            source: []
        };
    };
    var compiler;    /**
     * compiler for xtemplate
     * @class KISSY.XTemplate.compiler
     * @singleton
     */
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
            return 'function(' + func.params.join(',') + '){\n' + func.source.join('\n') + '}';
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
                name = 'xtemplate' + xtemplateId++;
            }
            var code = compiler.compile(tplContent, name);
            var sourceURL = 'sourceURL=' + name + '.js';    // eval is not ok for eval("(function(){})") ie
            // eval is not ok for eval("(function(){})") ie
            return Function.apply(null, [].concat(code.params).concat(code.source.join('\n') + // old chrome
            '\n//@ ' + sourceURL + // modern browser
            '\n//# ' + sourceURL));
        }
    };
    return compiler;
});    /*
 todo:
 need oop, new Source().xtplAstToJs()
 */
/*
  Generated by kissy-kison.*/
KISSY.add('xtemplate/compiler/parser', [], function (_, undefined) {
    /*jshint quotmark:false, loopfunc:true, indent:false, unused:false, asi:true, boss:true*/
    /* Generated by kison from KISSY */
    var parser = {}, S = KISSY, GrammarConst = {
            'SHIFT_TYPE': 1,
            'REDUCE_TYPE': 2,
            'ACCEPT_TYPE': 0,
            'TYPE_INDEX': 0,
            'PRODUCTION_INDEX': 1,
            'TO_INDEX': 2
        };    /*jslint quotmark: false*/
    /*jslint quotmark: false*/
    var Lexer = function (cfg) {
        var self = this;    /*
             lex rules.
             @type {Object[]}
             @example
             [
             {
             regexp:'\\w+',
             state:['xx'],
             token:'c',
             // this => lex
             action:function(){}
             }
             ]
             */
                            /*
             lex rules.
             @type {Object[]}
             @example
             [
             {
             regexp:'\\w+',
             state:['xx'],
             token:'c',
             // this => lex
             action:function(){}
             }
             ]
             */
        /*
             lex rules.
             @type {Object[]}
             @example
             [
             {
             regexp:'\\w+',
             state:['xx'],
             token:'c',
             // this => lex
             action:function(){}
             }
             ]
             */
        /*
             lex rules.
             @type {Object[]}
             @example
             [
             {
             regexp:'\\w+',
             state:['xx'],
             token:'c',
             // this => lex
             action:function(){}
             }
             ]
             */
        self.rules = [];
        S.mix(self, cfg);    /*
             Input languages
             @type {String}
             */
                             /*
             Input languages
             @type {String}
             */
        /*
             Input languages
             @type {String}
             */
        /*
             Input languages
             @type {String}
             */
        self.resetInput(self.input);
    };
    Lexer.prototype = {
        'resetInput': function (input) {
            S.mix(this, {
                input: input,
                matched: '',
                stateStack: [Lexer.STATIC.INITIAL],
                match: '',
                text: '',
                firstLine: 1,
                lineNumber: 1,
                lastLine: 1,
                firstColumn: 1,
                lastColumn: 1
            });
        },
        'getCurrentRules': function () {
            var self = this, currentState = self.stateStack[self.stateStack.length - 1], rules = [];    //#JSCOVERAGE_IF
                                                                                                        //#JSCOVERAGE_IF
            //#JSCOVERAGE_IF
            //#JSCOVERAGE_IF
            if (self.mapState) {
                currentState = self.mapState(currentState);
            }
            S.each(self.rules, function (r) {
                var state = r.state || r[3];
                if (!state) {
                    if (currentState === Lexer.STATIC.INITIAL) {
                        rules.push(r);
                    }
                } else if (S.inArray(currentState, state)) {
                    rules.push(r);
                }
            });
            return rules;
        },
        'pushState': function (state) {
            this.stateStack.push(state);
        },
        'popState': function (num) {
            num = num || 1;
            var ret;
            while (num--) {
                ret = this.stateStack.pop();
            }
            return ret;
        },
        'showDebugInfo': function () {
            var self = this, DEBUG_CONTEXT_LIMIT = Lexer.STATIC.DEBUG_CONTEXT_LIMIT, matched = self.matched, match = self.match, input = self.input;
            matched = matched.slice(0, matched.length - match.length);    //#JSCOVERAGE_IF 0
                                                                          //#JSCOVERAGE_IF 0
            //#JSCOVERAGE_IF 0
            //#JSCOVERAGE_IF 0
            var past = (matched.length > DEBUG_CONTEXT_LIMIT ? '...' : '') + matched.slice(0 - DEBUG_CONTEXT_LIMIT).replace(/\n/, ' '), next = match + input;    //#JSCOVERAGE_ENDIF
                                                                                                                                                                 //#JSCOVERAGE_ENDIF
            //#JSCOVERAGE_ENDIF
            //#JSCOVERAGE_ENDIF
            next = next.slice(0, DEBUG_CONTEXT_LIMIT) + (next.length > DEBUG_CONTEXT_LIMIT ? '...' : '');
            return past + next + '\n' + new Array(past.length + 1).join('-') + '^';
        },
        'mapSymbol': function mapSymbolForCodeGen(t) {
            return this.symbolMap[t];
        },
        'mapReverseSymbol': function (rs) {
            var self = this, symbolMap = self.symbolMap, i, reverseSymbolMap = self.reverseSymbolMap;
            if (!reverseSymbolMap && symbolMap) {
                reverseSymbolMap = self.reverseSymbolMap = {};
                for (i in symbolMap) {
                    reverseSymbolMap[symbolMap[i]] = i;
                }
            }    //#JSCOVERAGE_IF
                 //#JSCOVERAGE_IF
            //#JSCOVERAGE_IF
            //#JSCOVERAGE_IF
            if (reverseSymbolMap) {
                return reverseSymbolMap[rs];
            } else {
                return rs;
            }
        },
        'lex': function () {
            var self = this, input = self.input, i, rule, m, ret, lines, rules = self.getCurrentRules();
            self.match = self.text = '';
            if (!input) {
                return self.mapSymbol(Lexer.STATIC.END_TAG);
            }
            for (i = 0; i < rules.length; i++) {
                rule = rules[i];    //#JSCOVERAGE_IF 0
                                    //#JSCOVERAGE_IF 0
                //#JSCOVERAGE_IF 0
                //#JSCOVERAGE_IF 0
                var regexp = rule.regexp || rule[1], token = rule.token || rule[0], action = rule.action || rule[2] || undefined;    //#JSCOVERAGE_ENDIF
                                                                                                                                     //#JSCOVERAGE_ENDIF
                //#JSCOVERAGE_ENDIF
                //#JSCOVERAGE_ENDIF
                if (m = input.match(regexp)) {
                    lines = m[0].match(/\n.*/g);
                    if (lines) {
                        self.lineNumber += lines.length;
                    }
                    S.mix(self, {
                        firstLine: self.lastLine,
                        lastLine: self.lineNumber + 1,
                        firstColumn: self.lastColumn,
                        lastColumn: lines ? lines[lines.length - 1].length - 1 : self.lastColumn + m[0].length
                    });
                    var match;    // for error report
                                  // for error report
                    // for error report
                    // for error report
                    match = self.match = m[0];    // all matches
                                                  // all matches
                    // all matches
                    // all matches
                    self.matches = m;    // may change by user
                                         // may change by user
                    // may change by user
                    // may change by user
                    self.text = match;    // matched content utils now
                                          // matched content utils now
                    // matched content utils now
                    // matched content utils now
                    self.matched += match;
                    ret = action && action.call(self);
                    if (ret === undefined) {
                        ret = token;
                    } else {
                        ret = self.mapSymbol(ret);
                    }
                    input = input.slice(match.length);
                    self.input = input;
                    if (ret) {
                        return ret;
                    } else {
                        // ignore
                        return self.lex();
                    }
                }
            }
        }
    };
    Lexer.STATIC = {
        'INITIAL': 'I',
        'DEBUG_CONTEXT_LIMIT': 20,
        'END_TAG': '$EOF'
    };
    var lexer = new Lexer({
            'rules': [
                [
                    0,
                    /^[\s\S]*?(?={{)/,
                    function () {
                        var self = this, text = self.text, m, n = 0;
                        if (m = text.match(/\\+$/)) {
                            n = m[0].length;
                        }
                        if (n % 2) {
                            self.pushState('et');
                            text = text.slice(0, -1);
                        } else {
                            self.pushState('t');
                        }
                        if (n) {
                            text = text.replace(/\\+$/g, function (m) {
                                return new Array(m.length / 2 + 1).join('\\');
                            });
                        }    // https://github.com/kissyteam/kissy/issues/330
                             // return even empty
                        // https://github.com/kissyteam/kissy/issues/330
                        // return even empty
                        self.text = text;
                        return 'CONTENT';
                    }
                ],
                [
                    'b',
                    /^[\s\S]+/,
                    0
                ],
                [
                    'b',
                    /^[\s\S]{2,}?(?:(?={{)|$)/,
                    function popState() {
                        this.popState();
                    },
                    ['et']
                ],
                [
                    'c',
                    /^{{{?(?:#|@)/,
                    function () {
                        var self = this, text = self.text;
                        if (text.length === 4) {
                            self.pushState('p');
                        } else {
                            self.pushState('e');
                        }
                    },
                    ['t']
                ],
                [
                    'd',
                    /^{{{?\//,
                    function () {
                        var self = this, text = self.text;
                        if (text.length === 4) {
                            self.pushState('p');
                        } else {
                            self.pushState('e');
                        }
                    },
                    ['t']
                ],
                [
                    'e',
                    /^{{\s*else\s*}}/,
                    function popState() {
                        this.popState();
                    },
                    ['t']
                ],
                [
                    0,
                    /^{{![\s\S]*?}}/,
                    function popState() {
                        this.popState();
                    },
                    ['t']
                ],
                [
                    'b',
                    /^{{%([\s\S]*?)%}}/,
                    function () {
                        // return to content mode
                        this.text = this.matches[1] || '';
                        this.popState();
                    },
                    ['t']
                ],
                [
                    'f',
                    /^{{{?/,
                    function () {
                        var self = this, text = self.text;
                        if (text.length === 3) {
                            self.pushState('p');
                        } else {
                            self.pushState('e');
                        }
                    },
                    ['t']
                ],
                [
                    0,
                    /^\s+/,
                    0,
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    'g',
                    /^,/,
                    0,
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    'h',
                    /^}}}/,
                    function () {
                        this.popState(2);
                    },
                    ['p']
                ],
                [
                    'h',
                    /^}}/,
                    function () {
                        this.popState(2);
                    },
                    ['e']
                ],
                [
                    'i',
                    /^\(/,
                    0,
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    'j',
                    /^\)/,
                    0,
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    'k',
                    /^\|\|/,
                    0,
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    'l',
                    /^&&/,
                    0,
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    'm',
                    /^===/,
                    0,
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    'n',
                    /^!==/,
                    0,
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    'o',
                    /^>=/,
                    0,
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    'p',
                    /^<=/,
                    0,
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    'q',
                    /^>/,
                    0,
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    'r',
                    /^</,
                    0,
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    's',
                    /^\+/,
                    0,
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    't',
                    /^-/,
                    0,
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    'u',
                    /^\*/,
                    0,
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    'v',
                    /^\//,
                    0,
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    'w',
                    /^%/,
                    0,
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    'x',
                    /^!/,
                    0,
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    'y',
                    /^"(\\[\s\S]|[^\\"])*"/,
                    function () {
                        this.text = this.text.slice(1, -1).replace(/\\"/g, '"');
                    },
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    'y',
                    /^'(\\[\s\S]|[^\\'])*'/,
                    function () {
                        this.text = this.text.slice(1, -1).replace(/\\'/g, '\'');
                    },
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    'z',
                    /^true/,
                    0,
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    'z',
                    /^false/,
                    0,
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    'aa',
                    /^\d+(?:\.\d+)?(?:e-?\d+)?/i,
                    0,
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    'ab',
                    /^=/,
                    0,
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    'ac',
                    /^\.\./,
                    function () {
                        // wait for '/'
                        this.pushState('ws');
                    },
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    'ad',
                    /^\//,
                    function popState() {
                        this.popState();
                    },
                    ['ws']
                ],
                [
                    'ad',
                    /^\./,
                    0,
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    'ae',
                    /^\[/,
                    0,
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    'af',
                    /^\]/,
                    0,
                    [
                        'p',
                        'e'
                    ]
                ],
                [
                    'ac',
                    /^[a-zA-Z0-9_$]+/,
                    0,
                    [
                        'p',
                        'e'
                    ]
                ]
            ]
        });
    parser.lexer = lexer;
    lexer.symbolMap = {
        '$EOF': 'a',
        'CONTENT': 'b',
        'OPEN_BLOCK': 'c',
        'OPEN_CLOSE_BLOCK': 'd',
        'INVERSE': 'e',
        'OPEN_TPL': 'f',
        'COMMA': 'g',
        'CLOSE': 'h',
        'LPAREN': 'i',
        'RPAREN': 'j',
        'OR': 'k',
        'AND': 'l',
        'LOGIC_EQUALS': 'm',
        'LOGIC_NOT_EQUALS': 'n',
        'GE': 'o',
        'LE': 'p',
        'GT': 'q',
        'LT': 'r',
        'PLUS': 's',
        'MINUS': 't',
        'MULTIPLY': 'u',
        'DIVIDE': 'v',
        'MODULUS': 'w',
        'NOT': 'x',
        'STRING': 'y',
        'BOOLEAN': 'z',
        'NUMBER': 'aa',
        'EQUALS': 'ab',
        'ID': 'ac',
        'SEP': 'ad',
        'REF_START': 'ae',
        'REF_END': 'af',
        '$START': 'ag',
        'program': 'ah',
        'statements': 'ai',
        'statement': 'aj',
        'command': 'ak',
        'id': 'al',
        'expression': 'am',
        'params': 'an',
        'hash': 'ao',
        'param': 'ap',
        'ConditionalOrExpression': 'aq',
        'ConditionalAndExpression': 'ar',
        'EqualityExpression': 'as',
        'RelationalExpression': 'at',
        'AdditiveExpression': 'au',
        'MultiplicativeExpression': 'av',
        'UnaryExpression': 'aw',
        'PrimaryExpression': 'ax',
        'hashSegment': 'ay',
        'idSegments': 'az'
    };
    parser.productions = [
        [
            'ag',
            ['ah']
        ],
        [
            'ah',
            [
                'ai',
                'e',
                'ai'
            ],
            function () {
                return new this.yy.ProgramNode(this.lexer.lineNumber, this.$1, this.$3);
            }
        ],
        [
            'ah',
            ['ai'],
            function () {
                return new this.yy.ProgramNode(this.lexer.lineNumber, this.$1);
            }
        ],
        [
            'ai',
            ['aj'],
            function () {
                return [this.$1];
            }
        ],
        [
            'ai',
            [
                'ai',
                'aj'
            ],
            function () {
                this.$1.push(this.$2);
            }
        ],
        [
            'aj',
            [
                'c',
                'ak',
                'h',
                'ah',
                'd',
                'al',
                'h'
            ],
            function () {
                return new this.yy.BlockStatement(this.lexer.lineNumber, this.$2, this.$4, this.$6, this.$1.length !== 4);
            }
        ],
        [
            'aj',
            [
                'f',
                'am',
                'h'
            ],
            function () {
                return new this.yy.ExpressionStatement(this.lexer.lineNumber, this.$2, this.$1.length !== 3);
            }
        ],
        [
            'aj',
            ['b'],
            function () {
                return new this.yy.ContentStatement(this.lexer.lineNumber, this.$1);
            }
        ],
        [
            'ak',
            [
                'al',
                'i',
                'an',
                'g',
                'ao',
                'j'
            ],
            function () {
                return new this.yy.Command(this.lexer.lineNumber, this.$1, this.$3, this.$5);
            }
        ],
        [
            'ak',
            [
                'al',
                'i',
                'an',
                'j'
            ],
            function () {
                return new this.yy.Command(this.lexer.lineNumber, this.$1, this.$3);
            }
        ],
        [
            'ak',
            [
                'al',
                'i',
                'ao',
                'j'
            ],
            function () {
                return new this.yy.Command(this.lexer.lineNumber, this.$1, null, this.$3);
            }
        ],
        [
            'ak',
            [
                'al',
                'i',
                'j'
            ],
            function () {
                return new this.yy.Command(this.lexer.lineNumber, this.$1);
            }
        ],
        [
            'an',
            [
                'an',
                'g',
                'ap'
            ],
            function () {
                this.$1.push(this.$3);
            }
        ],
        [
            'an',
            ['ap'],
            function () {
                return [this.$1];
            }
        ],
        [
            'ap',
            ['am']
        ],
        [
            'am',
            ['aq']
        ],
        [
            'aq',
            ['ar']
        ],
        [
            'aq',
            [
                'aq',
                'k',
                'ar'
            ],
            function () {
                return new this.yy.ConditionalOrExpression(this.$1, this.$3);
            }
        ],
        [
            'ar',
            ['as']
        ],
        [
            'ar',
            [
                'ar',
                'l',
                'as'
            ],
            function () {
                return new this.yy.ConditionalAndExpression(this.$1, this.$3);
            }
        ],
        [
            'as',
            ['at']
        ],
        [
            'as',
            [
                'as',
                'm',
                'at'
            ],
            function () {
                return new this.yy.EqualityExpression(this.$1, '===', this.$3);
            }
        ],
        [
            'as',
            [
                'as',
                'n',
                'at'
            ],
            function () {
                return new this.yy.EqualityExpression(this.$1, '!==', this.$3);
            }
        ],
        [
            'at',
            ['au']
        ],
        [
            'at',
            [
                'at',
                'r',
                'au'
            ],
            function () {
                return new this.yy.RelationalExpression(this.$1, '<', this.$3);
            }
        ],
        [
            'at',
            [
                'at',
                'q',
                'au'
            ],
            function () {
                return new this.yy.RelationalExpression(this.$1, '>', this.$3);
            }
        ],
        [
            'at',
            [
                'at',
                'p',
                'au'
            ],
            function () {
                return new this.yy.RelationalExpression(this.$1, '<=', this.$3);
            }
        ],
        [
            'at',
            [
                'at',
                'o',
                'au'
            ],
            function () {
                return new this.yy.RelationalExpression(this.$1, '>=', this.$3);
            }
        ],
        [
            'au',
            ['av']
        ],
        [
            'au',
            [
                'au',
                's',
                'av'
            ],
            function () {
                return new this.yy.AdditiveExpression(this.$1, '+', this.$3);
            }
        ],
        [
            'au',
            [
                'au',
                't',
                'av'
            ],
            function () {
                return new this.yy.AdditiveExpression(this.$1, '-', this.$3);
            }
        ],
        [
            'av',
            ['aw']
        ],
        [
            'av',
            [
                'av',
                'u',
                'aw'
            ],
            function () {
                return new this.yy.MultiplicativeExpression(this.$1, '*', this.$3);
            }
        ],
        [
            'av',
            [
                'av',
                'v',
                'aw'
            ],
            function () {
                return new this.yy.MultiplicativeExpression(this.$1, '/', this.$3);
            }
        ],
        [
            'av',
            [
                'av',
                'w',
                'aw'
            ],
            function () {
                return new this.yy.MultiplicativeExpression(this.$1, '%', this.$3);
            }
        ],
        [
            'aw',
            [
                'x',
                'aw'
            ],
            function () {
                return new this.yy.UnaryExpression(this.$1, this.$2);
            }
        ],
        [
            'aw',
            [
                't',
                'aw'
            ],
            function () {
                return new this.yy.UnaryExpression(this.$1, this.$2);
            }
        ],
        [
            'aw',
            ['ax']
        ],
        [
            'ax',
            ['ak']
        ],
        [
            'ax',
            ['y'],
            function () {
                return new this.yy.String(this.lexer.lineNumber, this.$1);
            }
        ],
        [
            'ax',
            ['aa'],
            function () {
                return new this.yy.Number(this.lexer.lineNumber, this.$1);
            }
        ],
        [
            'ax',
            ['z'],
            function () {
                return new this.yy.Boolean(this.lexer.lineNumber, this.$1);
            }
        ],
        [
            'ax',
            ['al']
        ],
        [
            'ax',
            [
                'i',
                'am',
                'j'
            ],
            function () {
                return this.$2;
            }
        ],
        [
            'ao',
            [
                'ao',
                'g',
                'ay'
            ],
            function () {
                var hash = this.$1, seg = this.$3;
                hash.value[seg[0]] = seg[1];
            }
        ],
        [
            'ao',
            ['ay'],
            function () {
                var hash = new this.yy.Hash(this.lexer.lineNumber), $1 = this.$1;
                hash.value[$1[0]] = $1[1];
                return hash;
            }
        ],
        [
            'ay',
            [
                'ac',
                'ab',
                'am'
            ],
            function () {
                return [
                    this.$1,
                    this.$3
                ];
            }
        ],
        [
            'al',
            ['az'],
            function () {
                return new this.yy.Id(this.lexer.lineNumber, this.$1);
            }
        ],
        [
            'az',
            [
                'az',
                'ad',
                'ac'
            ],
            function () {
                this.$1.push(this.$3);
            }
        ],
        [
            'az',
            [
                'az',
                'ae',
                'am',
                'af'
            ],
            function () {
                this.$1.push(this.$3);
            }
        ],
        [
            'az',
            [
                'az',
                'ad',
                'aa'
            ],
            function () {
                this.$1.push(this.$3);
            }
        ],
        [
            'az',
            ['ac'],
            function () {
                return [this.$1];
            }
        ]
    ];
    parser.table = {
        'gotos': {
            '0': {
                'ah': 4,
                'ai': 5,
                'aj': 6
            },
            '2': {
                'ak': 8,
                'al': 9,
                'az': 10
            },
            '3': {
                'ak': 17,
                'am': 18,
                'aq': 19,
                'ar': 20,
                'as': 21,
                'at': 22,
                'au': 23,
                'av': 24,
                'aw': 25,
                'ax': 26,
                'al': 27,
                'az': 10
            },
            '5': { 'aj': 29 },
            '11': {
                'ak': 17,
                'am': 34,
                'aq': 19,
                'ar': 20,
                'as': 21,
                'at': 22,
                'au': 23,
                'av': 24,
                'aw': 25,
                'ax': 26,
                'al': 27,
                'az': 10
            },
            '12': {
                'ak': 17,
                'aw': 35,
                'ax': 26,
                'al': 27,
                'az': 10
            },
            '13': {
                'ak': 17,
                'aw': 36,
                'ax': 26,
                'al': 27,
                'az': 10
            },
            '28': {
                'ai': 51,
                'aj': 6
            },
            '30': {
                'ah': 52,
                'ai': 5,
                'aj': 6
            },
            '31': {
                'ak': 17,
                'an': 55,
                'ap': 56,
                'am': 57,
                'aq': 19,
                'ar': 20,
                'as': 21,
                'at': 22,
                'au': 23,
                'av': 24,
                'aw': 25,
                'ax': 26,
                'ao': 58,
                'ay': 59,
                'al': 27,
                'az': 10
            },
            '33': {
                'ak': 17,
                'am': 62,
                'aq': 19,
                'ar': 20,
                'as': 21,
                'at': 22,
                'au': 23,
                'av': 24,
                'aw': 25,
                'ax': 26,
                'al': 27,
                'az': 10
            },
            '38': {
                'ak': 17,
                'ar': 64,
                'as': 21,
                'at': 22,
                'au': 23,
                'av': 24,
                'aw': 25,
                'ax': 26,
                'al': 27,
                'az': 10
            },
            '39': {
                'ak': 17,
                'as': 65,
                'at': 22,
                'au': 23,
                'av': 24,
                'aw': 25,
                'ax': 26,
                'al': 27,
                'az': 10
            },
            '40': {
                'ak': 17,
                'at': 66,
                'au': 23,
                'av': 24,
                'aw': 25,
                'ax': 26,
                'al': 27,
                'az': 10
            },
            '41': {
                'ak': 17,
                'at': 67,
                'au': 23,
                'av': 24,
                'aw': 25,
                'ax': 26,
                'al': 27,
                'az': 10
            },
            '42': {
                'ak': 17,
                'au': 68,
                'av': 24,
                'aw': 25,
                'ax': 26,
                'al': 27,
                'az': 10
            },
            '43': {
                'ak': 17,
                'au': 69,
                'av': 24,
                'aw': 25,
                'ax': 26,
                'al': 27,
                'az': 10
            },
            '44': {
                'ak': 17,
                'au': 70,
                'av': 24,
                'aw': 25,
                'ax': 26,
                'al': 27,
                'az': 10
            },
            '45': {
                'ak': 17,
                'au': 71,
                'av': 24,
                'aw': 25,
                'ax': 26,
                'al': 27,
                'az': 10
            },
            '46': {
                'ak': 17,
                'av': 72,
                'aw': 25,
                'ax': 26,
                'al': 27,
                'az': 10
            },
            '47': {
                'ak': 17,
                'av': 73,
                'aw': 25,
                'ax': 26,
                'al': 27,
                'az': 10
            },
            '48': {
                'ak': 17,
                'aw': 74,
                'ax': 26,
                'al': 27,
                'az': 10
            },
            '49': {
                'ak': 17,
                'aw': 75,
                'ax': 26,
                'al': 27,
                'az': 10
            },
            '50': {
                'ak': 17,
                'aw': 76,
                'ax': 26,
                'al': 27,
                'az': 10
            },
            '51': { 'aj': 29 },
            '77': {
                'al': 84,
                'az': 10
            },
            '78': {
                'ak': 17,
                'am': 85,
                'aq': 19,
                'ar': 20,
                'as': 21,
                'at': 22,
                'au': 23,
                'av': 24,
                'aw': 25,
                'ax': 26,
                'al': 27,
                'az': 10
            },
            '79': {
                'ak': 17,
                'ap': 86,
                'am': 57,
                'aq': 19,
                'ar': 20,
                'as': 21,
                'at': 22,
                'au': 23,
                'av': 24,
                'aw': 25,
                'ax': 26,
                'ao': 87,
                'ay': 59,
                'al': 27,
                'az': 10
            },
            '81': { 'ay': 89 }
        },
        'action': {
            '0': {
                'b': [
                    1,
                    undefined,
                    1
                ],
                'c': [
                    1,
                    undefined,
                    2
                ],
                'f': [
                    1,
                    undefined,
                    3
                ]
            },
            '1': {
                'a': [
                    2,
                    7
                ],
                'e': [
                    2,
                    7
                ],
                'c': [
                    2,
                    7
                ],
                'f': [
                    2,
                    7
                ],
                'b': [
                    2,
                    7
                ],
                'd': [
                    2,
                    7
                ]
            },
            '2': {
                'ac': [
                    1,
                    undefined,
                    7
                ]
            },
            '3': {
                'i': [
                    1,
                    undefined,
                    11
                ],
                't': [
                    1,
                    undefined,
                    12
                ],
                'x': [
                    1,
                    undefined,
                    13
                ],
                'y': [
                    1,
                    undefined,
                    14
                ],
                'z': [
                    1,
                    undefined,
                    15
                ],
                'aa': [
                    1,
                    undefined,
                    16
                ],
                'ac': [
                    1,
                    undefined,
                    7
                ]
            },
            '4': { 'a': [0] },
            '5': {
                'a': [
                    2,
                    2
                ],
                'd': [
                    2,
                    2
                ],
                'b': [
                    1,
                    undefined,
                    1
                ],
                'c': [
                    1,
                    undefined,
                    2
                ],
                'e': [
                    1,
                    undefined,
                    28
                ],
                'f': [
                    1,
                    undefined,
                    3
                ]
            },
            '6': {
                'a': [
                    2,
                    3
                ],
                'e': [
                    2,
                    3
                ],
                'c': [
                    2,
                    3
                ],
                'f': [
                    2,
                    3
                ],
                'b': [
                    2,
                    3
                ],
                'd': [
                    2,
                    3
                ]
            },
            '7': {
                'i': [
                    2,
                    51
                ],
                'ad': [
                    2,
                    51
                ],
                'ae': [
                    2,
                    51
                ],
                'h': [
                    2,
                    51
                ],
                'k': [
                    2,
                    51
                ],
                'l': [
                    2,
                    51
                ],
                'm': [
                    2,
                    51
                ],
                'n': [
                    2,
                    51
                ],
                'o': [
                    2,
                    51
                ],
                'p': [
                    2,
                    51
                ],
                'q': [
                    2,
                    51
                ],
                'r': [
                    2,
                    51
                ],
                's': [
                    2,
                    51
                ],
                't': [
                    2,
                    51
                ],
                'u': [
                    2,
                    51
                ],
                'v': [
                    2,
                    51
                ],
                'w': [
                    2,
                    51
                ],
                'j': [
                    2,
                    51
                ],
                'af': [
                    2,
                    51
                ],
                'g': [
                    2,
                    51
                ]
            },
            '8': {
                'h': [
                    1,
                    undefined,
                    30
                ]
            },
            '9': {
                'i': [
                    1,
                    undefined,
                    31
                ]
            },
            '10': {
                'i': [
                    2,
                    47
                ],
                'h': [
                    2,
                    47
                ],
                'k': [
                    2,
                    47
                ],
                'l': [
                    2,
                    47
                ],
                'm': [
                    2,
                    47
                ],
                'n': [
                    2,
                    47
                ],
                'o': [
                    2,
                    47
                ],
                'p': [
                    2,
                    47
                ],
                'q': [
                    2,
                    47
                ],
                'r': [
                    2,
                    47
                ],
                's': [
                    2,
                    47
                ],
                't': [
                    2,
                    47
                ],
                'u': [
                    2,
                    47
                ],
                'v': [
                    2,
                    47
                ],
                'w': [
                    2,
                    47
                ],
                'j': [
                    2,
                    47
                ],
                'g': [
                    2,
                    47
                ],
                'af': [
                    2,
                    47
                ],
                'ad': [
                    1,
                    undefined,
                    32
                ],
                'ae': [
                    1,
                    undefined,
                    33
                ]
            },
            '11': {
                'i': [
                    1,
                    undefined,
                    11
                ],
                't': [
                    1,
                    undefined,
                    12
                ],
                'x': [
                    1,
                    undefined,
                    13
                ],
                'y': [
                    1,
                    undefined,
                    14
                ],
                'z': [
                    1,
                    undefined,
                    15
                ],
                'aa': [
                    1,
                    undefined,
                    16
                ],
                'ac': [
                    1,
                    undefined,
                    7
                ]
            },
            '12': {
                'i': [
                    1,
                    undefined,
                    11
                ],
                't': [
                    1,
                    undefined,
                    12
                ],
                'x': [
                    1,
                    undefined,
                    13
                ],
                'y': [
                    1,
                    undefined,
                    14
                ],
                'z': [
                    1,
                    undefined,
                    15
                ],
                'aa': [
                    1,
                    undefined,
                    16
                ],
                'ac': [
                    1,
                    undefined,
                    7
                ]
            },
            '13': {
                'i': [
                    1,
                    undefined,
                    11
                ],
                't': [
                    1,
                    undefined,
                    12
                ],
                'x': [
                    1,
                    undefined,
                    13
                ],
                'y': [
                    1,
                    undefined,
                    14
                ],
                'z': [
                    1,
                    undefined,
                    15
                ],
                'aa': [
                    1,
                    undefined,
                    16
                ],
                'ac': [
                    1,
                    undefined,
                    7
                ]
            },
            '14': {
                'h': [
                    2,
                    39
                ],
                'k': [
                    2,
                    39
                ],
                'l': [
                    2,
                    39
                ],
                'm': [
                    2,
                    39
                ],
                'n': [
                    2,
                    39
                ],
                'o': [
                    2,
                    39
                ],
                'p': [
                    2,
                    39
                ],
                'q': [
                    2,
                    39
                ],
                'r': [
                    2,
                    39
                ],
                's': [
                    2,
                    39
                ],
                't': [
                    2,
                    39
                ],
                'u': [
                    2,
                    39
                ],
                'v': [
                    2,
                    39
                ],
                'w': [
                    2,
                    39
                ],
                'j': [
                    2,
                    39
                ],
                'g': [
                    2,
                    39
                ],
                'af': [
                    2,
                    39
                ]
            },
            '15': {
                'h': [
                    2,
                    41
                ],
                'k': [
                    2,
                    41
                ],
                'l': [
                    2,
                    41
                ],
                'm': [
                    2,
                    41
                ],
                'n': [
                    2,
                    41
                ],
                'o': [
                    2,
                    41
                ],
                'p': [
                    2,
                    41
                ],
                'q': [
                    2,
                    41
                ],
                'r': [
                    2,
                    41
                ],
                's': [
                    2,
                    41
                ],
                't': [
                    2,
                    41
                ],
                'u': [
                    2,
                    41
                ],
                'v': [
                    2,
                    41
                ],
                'w': [
                    2,
                    41
                ],
                'j': [
                    2,
                    41
                ],
                'g': [
                    2,
                    41
                ],
                'af': [
                    2,
                    41
                ]
            },
            '16': {
                'h': [
                    2,
                    40
                ],
                'k': [
                    2,
                    40
                ],
                'l': [
                    2,
                    40
                ],
                'm': [
                    2,
                    40
                ],
                'n': [
                    2,
                    40
                ],
                'o': [
                    2,
                    40
                ],
                'p': [
                    2,
                    40
                ],
                'q': [
                    2,
                    40
                ],
                'r': [
                    2,
                    40
                ],
                's': [
                    2,
                    40
                ],
                't': [
                    2,
                    40
                ],
                'u': [
                    2,
                    40
                ],
                'v': [
                    2,
                    40
                ],
                'w': [
                    2,
                    40
                ],
                'j': [
                    2,
                    40
                ],
                'g': [
                    2,
                    40
                ],
                'af': [
                    2,
                    40
                ]
            },
            '17': {
                'h': [
                    2,
                    38
                ],
                'k': [
                    2,
                    38
                ],
                'l': [
                    2,
                    38
                ],
                'm': [
                    2,
                    38
                ],
                'n': [
                    2,
                    38
                ],
                'o': [
                    2,
                    38
                ],
                'p': [
                    2,
                    38
                ],
                'q': [
                    2,
                    38
                ],
                'r': [
                    2,
                    38
                ],
                's': [
                    2,
                    38
                ],
                't': [
                    2,
                    38
                ],
                'u': [
                    2,
                    38
                ],
                'v': [
                    2,
                    38
                ],
                'w': [
                    2,
                    38
                ],
                'j': [
                    2,
                    38
                ],
                'g': [
                    2,
                    38
                ],
                'af': [
                    2,
                    38
                ]
            },
            '18': {
                'h': [
                    1,
                    undefined,
                    37
                ]
            },
            '19': {
                'h': [
                    2,
                    15
                ],
                'j': [
                    2,
                    15
                ],
                'g': [
                    2,
                    15
                ],
                'af': [
                    2,
                    15
                ],
                'k': [
                    1,
                    undefined,
                    38
                ]
            },
            '20': {
                'h': [
                    2,
                    16
                ],
                'k': [
                    2,
                    16
                ],
                'j': [
                    2,
                    16
                ],
                'g': [
                    2,
                    16
                ],
                'af': [
                    2,
                    16
                ],
                'l': [
                    1,
                    undefined,
                    39
                ]
            },
            '21': {
                'h': [
                    2,
                    18
                ],
                'k': [
                    2,
                    18
                ],
                'l': [
                    2,
                    18
                ],
                'j': [
                    2,
                    18
                ],
                'g': [
                    2,
                    18
                ],
                'af': [
                    2,
                    18
                ],
                'm': [
                    1,
                    undefined,
                    40
                ],
                'n': [
                    1,
                    undefined,
                    41
                ]
            },
            '22': {
                'h': [
                    2,
                    20
                ],
                'k': [
                    2,
                    20
                ],
                'l': [
                    2,
                    20
                ],
                'm': [
                    2,
                    20
                ],
                'n': [
                    2,
                    20
                ],
                'j': [
                    2,
                    20
                ],
                'g': [
                    2,
                    20
                ],
                'af': [
                    2,
                    20
                ],
                'o': [
                    1,
                    undefined,
                    42
                ],
                'p': [
                    1,
                    undefined,
                    43
                ],
                'q': [
                    1,
                    undefined,
                    44
                ],
                'r': [
                    1,
                    undefined,
                    45
                ]
            },
            '23': {
                'h': [
                    2,
                    23
                ],
                'k': [
                    2,
                    23
                ],
                'l': [
                    2,
                    23
                ],
                'm': [
                    2,
                    23
                ],
                'n': [
                    2,
                    23
                ],
                'o': [
                    2,
                    23
                ],
                'p': [
                    2,
                    23
                ],
                'q': [
                    2,
                    23
                ],
                'r': [
                    2,
                    23
                ],
                'j': [
                    2,
                    23
                ],
                'g': [
                    2,
                    23
                ],
                'af': [
                    2,
                    23
                ],
                's': [
                    1,
                    undefined,
                    46
                ],
                't': [
                    1,
                    undefined,
                    47
                ]
            },
            '24': {
                'h': [
                    2,
                    28
                ],
                'k': [
                    2,
                    28
                ],
                'l': [
                    2,
                    28
                ],
                'm': [
                    2,
                    28
                ],
                'n': [
                    2,
                    28
                ],
                'o': [
                    2,
                    28
                ],
                'p': [
                    2,
                    28
                ],
                'q': [
                    2,
                    28
                ],
                'r': [
                    2,
                    28
                ],
                's': [
                    2,
                    28
                ],
                't': [
                    2,
                    28
                ],
                'j': [
                    2,
                    28
                ],
                'g': [
                    2,
                    28
                ],
                'af': [
                    2,
                    28
                ],
                'u': [
                    1,
                    undefined,
                    48
                ],
                'v': [
                    1,
                    undefined,
                    49
                ],
                'w': [
                    1,
                    undefined,
                    50
                ]
            },
            '25': {
                'h': [
                    2,
                    31
                ],
                'k': [
                    2,
                    31
                ],
                'l': [
                    2,
                    31
                ],
                'm': [
                    2,
                    31
                ],
                'n': [
                    2,
                    31
                ],
                'o': [
                    2,
                    31
                ],
                'p': [
                    2,
                    31
                ],
                'q': [
                    2,
                    31
                ],
                'r': [
                    2,
                    31
                ],
                's': [
                    2,
                    31
                ],
                't': [
                    2,
                    31
                ],
                'u': [
                    2,
                    31
                ],
                'v': [
                    2,
                    31
                ],
                'w': [
                    2,
                    31
                ],
                'j': [
                    2,
                    31
                ],
                'g': [
                    2,
                    31
                ],
                'af': [
                    2,
                    31
                ]
            },
            '26': {
                'h': [
                    2,
                    37
                ],
                'k': [
                    2,
                    37
                ],
                'l': [
                    2,
                    37
                ],
                'm': [
                    2,
                    37
                ],
                'n': [
                    2,
                    37
                ],
                'o': [
                    2,
                    37
                ],
                'p': [
                    2,
                    37
                ],
                'q': [
                    2,
                    37
                ],
                'r': [
                    2,
                    37
                ],
                's': [
                    2,
                    37
                ],
                't': [
                    2,
                    37
                ],
                'u': [
                    2,
                    37
                ],
                'v': [
                    2,
                    37
                ],
                'w': [
                    2,
                    37
                ],
                'j': [
                    2,
                    37
                ],
                'g': [
                    2,
                    37
                ],
                'af': [
                    2,
                    37
                ]
            },
            '27': {
                'h': [
                    2,
                    42
                ],
                'k': [
                    2,
                    42
                ],
                'l': [
                    2,
                    42
                ],
                'm': [
                    2,
                    42
                ],
                'n': [
                    2,
                    42
                ],
                'o': [
                    2,
                    42
                ],
                'p': [
                    2,
                    42
                ],
                'q': [
                    2,
                    42
                ],
                'r': [
                    2,
                    42
                ],
                's': [
                    2,
                    42
                ],
                't': [
                    2,
                    42
                ],
                'u': [
                    2,
                    42
                ],
                'v': [
                    2,
                    42
                ],
                'w': [
                    2,
                    42
                ],
                'j': [
                    2,
                    42
                ],
                'g': [
                    2,
                    42
                ],
                'af': [
                    2,
                    42
                ],
                'i': [
                    1,
                    undefined,
                    31
                ]
            },
            '28': {
                'b': [
                    1,
                    undefined,
                    1
                ],
                'c': [
                    1,
                    undefined,
                    2
                ],
                'f': [
                    1,
                    undefined,
                    3
                ]
            },
            '29': {
                'a': [
                    2,
                    4
                ],
                'e': [
                    2,
                    4
                ],
                'c': [
                    2,
                    4
                ],
                'f': [
                    2,
                    4
                ],
                'b': [
                    2,
                    4
                ],
                'd': [
                    2,
                    4
                ]
            },
            '30': {
                'b': [
                    1,
                    undefined,
                    1
                ],
                'c': [
                    1,
                    undefined,
                    2
                ],
                'f': [
                    1,
                    undefined,
                    3
                ]
            },
            '31': {
                'i': [
                    1,
                    undefined,
                    11
                ],
                'j': [
                    1,
                    undefined,
                    53
                ],
                't': [
                    1,
                    undefined,
                    12
                ],
                'x': [
                    1,
                    undefined,
                    13
                ],
                'y': [
                    1,
                    undefined,
                    14
                ],
                'z': [
                    1,
                    undefined,
                    15
                ],
                'aa': [
                    1,
                    undefined,
                    16
                ],
                'ac': [
                    1,
                    undefined,
                    54
                ]
            },
            '32': {
                'aa': [
                    1,
                    undefined,
                    60
                ],
                'ac': [
                    1,
                    undefined,
                    61
                ]
            },
            '33': {
                'i': [
                    1,
                    undefined,
                    11
                ],
                't': [
                    1,
                    undefined,
                    12
                ],
                'x': [
                    1,
                    undefined,
                    13
                ],
                'y': [
                    1,
                    undefined,
                    14
                ],
                'z': [
                    1,
                    undefined,
                    15
                ],
                'aa': [
                    1,
                    undefined,
                    16
                ],
                'ac': [
                    1,
                    undefined,
                    7
                ]
            },
            '34': {
                'j': [
                    1,
                    undefined,
                    63
                ]
            },
            '35': {
                'h': [
                    2,
                    36
                ],
                'k': [
                    2,
                    36
                ],
                'l': [
                    2,
                    36
                ],
                'm': [
                    2,
                    36
                ],
                'n': [
                    2,
                    36
                ],
                'o': [
                    2,
                    36
                ],
                'p': [
                    2,
                    36
                ],
                'q': [
                    2,
                    36
                ],
                'r': [
                    2,
                    36
                ],
                's': [
                    2,
                    36
                ],
                't': [
                    2,
                    36
                ],
                'u': [
                    2,
                    36
                ],
                'v': [
                    2,
                    36
                ],
                'w': [
                    2,
                    36
                ],
                'j': [
                    2,
                    36
                ],
                'g': [
                    2,
                    36
                ],
                'af': [
                    2,
                    36
                ]
            },
            '36': {
                'h': [
                    2,
                    35
                ],
                'k': [
                    2,
                    35
                ],
                'l': [
                    2,
                    35
                ],
                'm': [
                    2,
                    35
                ],
                'n': [
                    2,
                    35
                ],
                'o': [
                    2,
                    35
                ],
                'p': [
                    2,
                    35
                ],
                'q': [
                    2,
                    35
                ],
                'r': [
                    2,
                    35
                ],
                's': [
                    2,
                    35
                ],
                't': [
                    2,
                    35
                ],
                'u': [
                    2,
                    35
                ],
                'v': [
                    2,
                    35
                ],
                'w': [
                    2,
                    35
                ],
                'j': [
                    2,
                    35
                ],
                'g': [
                    2,
                    35
                ],
                'af': [
                    2,
                    35
                ]
            },
            '37': {
                'a': [
                    2,
                    6
                ],
                'e': [
                    2,
                    6
                ],
                'c': [
                    2,
                    6
                ],
                'f': [
                    2,
                    6
                ],
                'b': [
                    2,
                    6
                ],
                'd': [
                    2,
                    6
                ]
            },
            '38': {
                'i': [
                    1,
                    undefined,
                    11
                ],
                't': [
                    1,
                    undefined,
                    12
                ],
                'x': [
                    1,
                    undefined,
                    13
                ],
                'y': [
                    1,
                    undefined,
                    14
                ],
                'z': [
                    1,
                    undefined,
                    15
                ],
                'aa': [
                    1,
                    undefined,
                    16
                ],
                'ac': [
                    1,
                    undefined,
                    7
                ]
            },
            '39': {
                'i': [
                    1,
                    undefined,
                    11
                ],
                't': [
                    1,
                    undefined,
                    12
                ],
                'x': [
                    1,
                    undefined,
                    13
                ],
                'y': [
                    1,
                    undefined,
                    14
                ],
                'z': [
                    1,
                    undefined,
                    15
                ],
                'aa': [
                    1,
                    undefined,
                    16
                ],
                'ac': [
                    1,
                    undefined,
                    7
                ]
            },
            '40': {
                'i': [
                    1,
                    undefined,
                    11
                ],
                't': [
                    1,
                    undefined,
                    12
                ],
                'x': [
                    1,
                    undefined,
                    13
                ],
                'y': [
                    1,
                    undefined,
                    14
                ],
                'z': [
                    1,
                    undefined,
                    15
                ],
                'aa': [
                    1,
                    undefined,
                    16
                ],
                'ac': [
                    1,
                    undefined,
                    7
                ]
            },
            '41': {
                'i': [
                    1,
                    undefined,
                    11
                ],
                't': [
                    1,
                    undefined,
                    12
                ],
                'x': [
                    1,
                    undefined,
                    13
                ],
                'y': [
                    1,
                    undefined,
                    14
                ],
                'z': [
                    1,
                    undefined,
                    15
                ],
                'aa': [
                    1,
                    undefined,
                    16
                ],
                'ac': [
                    1,
                    undefined,
                    7
                ]
            },
            '42': {
                'i': [
                    1,
                    undefined,
                    11
                ],
                't': [
                    1,
                    undefined,
                    12
                ],
                'x': [
                    1,
                    undefined,
                    13
                ],
                'y': [
                    1,
                    undefined,
                    14
                ],
                'z': [
                    1,
                    undefined,
                    15
                ],
                'aa': [
                    1,
                    undefined,
                    16
                ],
                'ac': [
                    1,
                    undefined,
                    7
                ]
            },
            '43': {
                'i': [
                    1,
                    undefined,
                    11
                ],
                't': [
                    1,
                    undefined,
                    12
                ],
                'x': [
                    1,
                    undefined,
                    13
                ],
                'y': [
                    1,
                    undefined,
                    14
                ],
                'z': [
                    1,
                    undefined,
                    15
                ],
                'aa': [
                    1,
                    undefined,
                    16
                ],
                'ac': [
                    1,
                    undefined,
                    7
                ]
            },
            '44': {
                'i': [
                    1,
                    undefined,
                    11
                ],
                't': [
                    1,
                    undefined,
                    12
                ],
                'x': [
                    1,
                    undefined,
                    13
                ],
                'y': [
                    1,
                    undefined,
                    14
                ],
                'z': [
                    1,
                    undefined,
                    15
                ],
                'aa': [
                    1,
                    undefined,
                    16
                ],
                'ac': [
                    1,
                    undefined,
                    7
                ]
            },
            '45': {
                'i': [
                    1,
                    undefined,
                    11
                ],
                't': [
                    1,
                    undefined,
                    12
                ],
                'x': [
                    1,
                    undefined,
                    13
                ],
                'y': [
                    1,
                    undefined,
                    14
                ],
                'z': [
                    1,
                    undefined,
                    15
                ],
                'aa': [
                    1,
                    undefined,
                    16
                ],
                'ac': [
                    1,
                    undefined,
                    7
                ]
            },
            '46': {
                'i': [
                    1,
                    undefined,
                    11
                ],
                't': [
                    1,
                    undefined,
                    12
                ],
                'x': [
                    1,
                    undefined,
                    13
                ],
                'y': [
                    1,
                    undefined,
                    14
                ],
                'z': [
                    1,
                    undefined,
                    15
                ],
                'aa': [
                    1,
                    undefined,
                    16
                ],
                'ac': [
                    1,
                    undefined,
                    7
                ]
            },
            '47': {
                'i': [
                    1,
                    undefined,
                    11
                ],
                't': [
                    1,
                    undefined,
                    12
                ],
                'x': [
                    1,
                    undefined,
                    13
                ],
                'y': [
                    1,
                    undefined,
                    14
                ],
                'z': [
                    1,
                    undefined,
                    15
                ],
                'aa': [
                    1,
                    undefined,
                    16
                ],
                'ac': [
                    1,
                    undefined,
                    7
                ]
            },
            '48': {
                'i': [
                    1,
                    undefined,
                    11
                ],
                't': [
                    1,
                    undefined,
                    12
                ],
                'x': [
                    1,
                    undefined,
                    13
                ],
                'y': [
                    1,
                    undefined,
                    14
                ],
                'z': [
                    1,
                    undefined,
                    15
                ],
                'aa': [
                    1,
                    undefined,
                    16
                ],
                'ac': [
                    1,
                    undefined,
                    7
                ]
            },
            '49': {
                'i': [
                    1,
                    undefined,
                    11
                ],
                't': [
                    1,
                    undefined,
                    12
                ],
                'x': [
                    1,
                    undefined,
                    13
                ],
                'y': [
                    1,
                    undefined,
                    14
                ],
                'z': [
                    1,
                    undefined,
                    15
                ],
                'aa': [
                    1,
                    undefined,
                    16
                ],
                'ac': [
                    1,
                    undefined,
                    7
                ]
            },
            '50': {
                'i': [
                    1,
                    undefined,
                    11
                ],
                't': [
                    1,
                    undefined,
                    12
                ],
                'x': [
                    1,
                    undefined,
                    13
                ],
                'y': [
                    1,
                    undefined,
                    14
                ],
                'z': [
                    1,
                    undefined,
                    15
                ],
                'aa': [
                    1,
                    undefined,
                    16
                ],
                'ac': [
                    1,
                    undefined,
                    7
                ]
            },
            '51': {
                'a': [
                    2,
                    1
                ],
                'd': [
                    2,
                    1
                ],
                'b': [
                    1,
                    undefined,
                    1
                ],
                'c': [
                    1,
                    undefined,
                    2
                ],
                'f': [
                    1,
                    undefined,
                    3
                ]
            },
            '52': {
                'd': [
                    1,
                    undefined,
                    77
                ]
            },
            '53': {
                'h': [
                    2,
                    11
                ],
                'k': [
                    2,
                    11
                ],
                'l': [
                    2,
                    11
                ],
                'm': [
                    2,
                    11
                ],
                'n': [
                    2,
                    11
                ],
                'o': [
                    2,
                    11
                ],
                'p': [
                    2,
                    11
                ],
                'q': [
                    2,
                    11
                ],
                'r': [
                    2,
                    11
                ],
                's': [
                    2,
                    11
                ],
                't': [
                    2,
                    11
                ],
                'u': [
                    2,
                    11
                ],
                'v': [
                    2,
                    11
                ],
                'w': [
                    2,
                    11
                ],
                'j': [
                    2,
                    11
                ],
                'g': [
                    2,
                    11
                ],
                'af': [
                    2,
                    11
                ]
            },
            '54': {
                'g': [
                    2,
                    51
                ],
                'i': [
                    2,
                    51
                ],
                'j': [
                    2,
                    51
                ],
                'k': [
                    2,
                    51
                ],
                'l': [
                    2,
                    51
                ],
                'm': [
                    2,
                    51
                ],
                'n': [
                    2,
                    51
                ],
                'o': [
                    2,
                    51
                ],
                'p': [
                    2,
                    51
                ],
                'q': [
                    2,
                    51
                ],
                'r': [
                    2,
                    51
                ],
                's': [
                    2,
                    51
                ],
                't': [
                    2,
                    51
                ],
                'u': [
                    2,
                    51
                ],
                'v': [
                    2,
                    51
                ],
                'w': [
                    2,
                    51
                ],
                'ad': [
                    2,
                    51
                ],
                'ae': [
                    2,
                    51
                ],
                'ab': [
                    1,
                    undefined,
                    78
                ]
            },
            '55': {
                'g': [
                    1,
                    undefined,
                    79
                ],
                'j': [
                    1,
                    undefined,
                    80
                ]
            },
            '56': {
                'g': [
                    2,
                    13
                ],
                'j': [
                    2,
                    13
                ]
            },
            '57': {
                'g': [
                    2,
                    14
                ],
                'j': [
                    2,
                    14
                ]
            },
            '58': {
                'g': [
                    1,
                    undefined,
                    81
                ],
                'j': [
                    1,
                    undefined,
                    82
                ]
            },
            '59': {
                'j': [
                    2,
                    45
                ],
                'g': [
                    2,
                    45
                ]
            },
            '60': {
                'i': [
                    2,
                    50
                ],
                'ad': [
                    2,
                    50
                ],
                'ae': [
                    2,
                    50
                ],
                'h': [
                    2,
                    50
                ],
                'k': [
                    2,
                    50
                ],
                'l': [
                    2,
                    50
                ],
                'm': [
                    2,
                    50
                ],
                'n': [
                    2,
                    50
                ],
                'o': [
                    2,
                    50
                ],
                'p': [
                    2,
                    50
                ],
                'q': [
                    2,
                    50
                ],
                'r': [
                    2,
                    50
                ],
                's': [
                    2,
                    50
                ],
                't': [
                    2,
                    50
                ],
                'u': [
                    2,
                    50
                ],
                'v': [
                    2,
                    50
                ],
                'w': [
                    2,
                    50
                ],
                'j': [
                    2,
                    50
                ],
                'g': [
                    2,
                    50
                ],
                'af': [
                    2,
                    50
                ]
            },
            '61': {
                'i': [
                    2,
                    48
                ],
                'ad': [
                    2,
                    48
                ],
                'ae': [
                    2,
                    48
                ],
                'h': [
                    2,
                    48
                ],
                'k': [
                    2,
                    48
                ],
                'l': [
                    2,
                    48
                ],
                'm': [
                    2,
                    48
                ],
                'n': [
                    2,
                    48
                ],
                'o': [
                    2,
                    48
                ],
                'p': [
                    2,
                    48
                ],
                'q': [
                    2,
                    48
                ],
                'r': [
                    2,
                    48
                ],
                's': [
                    2,
                    48
                ],
                't': [
                    2,
                    48
                ],
                'u': [
                    2,
                    48
                ],
                'v': [
                    2,
                    48
                ],
                'w': [
                    2,
                    48
                ],
                'j': [
                    2,
                    48
                ],
                'g': [
                    2,
                    48
                ],
                'af': [
                    2,
                    48
                ]
            },
            '62': {
                'af': [
                    1,
                    undefined,
                    83
                ]
            },
            '63': {
                'h': [
                    2,
                    43
                ],
                'k': [
                    2,
                    43
                ],
                'l': [
                    2,
                    43
                ],
                'm': [
                    2,
                    43
                ],
                'n': [
                    2,
                    43
                ],
                'o': [
                    2,
                    43
                ],
                'p': [
                    2,
                    43
                ],
                'q': [
                    2,
                    43
                ],
                'r': [
                    2,
                    43
                ],
                's': [
                    2,
                    43
                ],
                't': [
                    2,
                    43
                ],
                'u': [
                    2,
                    43
                ],
                'v': [
                    2,
                    43
                ],
                'w': [
                    2,
                    43
                ],
                'j': [
                    2,
                    43
                ],
                'g': [
                    2,
                    43
                ],
                'af': [
                    2,
                    43
                ]
            },
            '64': {
                'h': [
                    2,
                    17
                ],
                'k': [
                    2,
                    17
                ],
                'j': [
                    2,
                    17
                ],
                'g': [
                    2,
                    17
                ],
                'af': [
                    2,
                    17
                ],
                'l': [
                    1,
                    undefined,
                    39
                ]
            },
            '65': {
                'h': [
                    2,
                    19
                ],
                'k': [
                    2,
                    19
                ],
                'l': [
                    2,
                    19
                ],
                'j': [
                    2,
                    19
                ],
                'g': [
                    2,
                    19
                ],
                'af': [
                    2,
                    19
                ],
                'm': [
                    1,
                    undefined,
                    40
                ],
                'n': [
                    1,
                    undefined,
                    41
                ]
            },
            '66': {
                'h': [
                    2,
                    21
                ],
                'k': [
                    2,
                    21
                ],
                'l': [
                    2,
                    21
                ],
                'm': [
                    2,
                    21
                ],
                'n': [
                    2,
                    21
                ],
                'j': [
                    2,
                    21
                ],
                'g': [
                    2,
                    21
                ],
                'af': [
                    2,
                    21
                ],
                'o': [
                    1,
                    undefined,
                    42
                ],
                'p': [
                    1,
                    undefined,
                    43
                ],
                'q': [
                    1,
                    undefined,
                    44
                ],
                'r': [
                    1,
                    undefined,
                    45
                ]
            },
            '67': {
                'h': [
                    2,
                    22
                ],
                'k': [
                    2,
                    22
                ],
                'l': [
                    2,
                    22
                ],
                'm': [
                    2,
                    22
                ],
                'n': [
                    2,
                    22
                ],
                'j': [
                    2,
                    22
                ],
                'g': [
                    2,
                    22
                ],
                'af': [
                    2,
                    22
                ],
                'o': [
                    1,
                    undefined,
                    42
                ],
                'p': [
                    1,
                    undefined,
                    43
                ],
                'q': [
                    1,
                    undefined,
                    44
                ],
                'r': [
                    1,
                    undefined,
                    45
                ]
            },
            '68': {
                'h': [
                    2,
                    27
                ],
                'k': [
                    2,
                    27
                ],
                'l': [
                    2,
                    27
                ],
                'm': [
                    2,
                    27
                ],
                'n': [
                    2,
                    27
                ],
                'o': [
                    2,
                    27
                ],
                'p': [
                    2,
                    27
                ],
                'q': [
                    2,
                    27
                ],
                'r': [
                    2,
                    27
                ],
                'j': [
                    2,
                    27
                ],
                'g': [
                    2,
                    27
                ],
                'af': [
                    2,
                    27
                ],
                's': [
                    1,
                    undefined,
                    46
                ],
                't': [
                    1,
                    undefined,
                    47
                ]
            },
            '69': {
                'h': [
                    2,
                    26
                ],
                'k': [
                    2,
                    26
                ],
                'l': [
                    2,
                    26
                ],
                'm': [
                    2,
                    26
                ],
                'n': [
                    2,
                    26
                ],
                'o': [
                    2,
                    26
                ],
                'p': [
                    2,
                    26
                ],
                'q': [
                    2,
                    26
                ],
                'r': [
                    2,
                    26
                ],
                'j': [
                    2,
                    26
                ],
                'g': [
                    2,
                    26
                ],
                'af': [
                    2,
                    26
                ],
                's': [
                    1,
                    undefined,
                    46
                ],
                't': [
                    1,
                    undefined,
                    47
                ]
            },
            '70': {
                'h': [
                    2,
                    25
                ],
                'k': [
                    2,
                    25
                ],
                'l': [
                    2,
                    25
                ],
                'm': [
                    2,
                    25
                ],
                'n': [
                    2,
                    25
                ],
                'o': [
                    2,
                    25
                ],
                'p': [
                    2,
                    25
                ],
                'q': [
                    2,
                    25
                ],
                'r': [
                    2,
                    25
                ],
                'j': [
                    2,
                    25
                ],
                'g': [
                    2,
                    25
                ],
                'af': [
                    2,
                    25
                ],
                's': [
                    1,
                    undefined,
                    46
                ],
                't': [
                    1,
                    undefined,
                    47
                ]
            },
            '71': {
                'h': [
                    2,
                    24
                ],
                'k': [
                    2,
                    24
                ],
                'l': [
                    2,
                    24
                ],
                'm': [
                    2,
                    24
                ],
                'n': [
                    2,
                    24
                ],
                'o': [
                    2,
                    24
                ],
                'p': [
                    2,
                    24
                ],
                'q': [
                    2,
                    24
                ],
                'r': [
                    2,
                    24
                ],
                'j': [
                    2,
                    24
                ],
                'g': [
                    2,
                    24
                ],
                'af': [
                    2,
                    24
                ],
                's': [
                    1,
                    undefined,
                    46
                ],
                't': [
                    1,
                    undefined,
                    47
                ]
            },
            '72': {
                'h': [
                    2,
                    29
                ],
                'k': [
                    2,
                    29
                ],
                'l': [
                    2,
                    29
                ],
                'm': [
                    2,
                    29
                ],
                'n': [
                    2,
                    29
                ],
                'o': [
                    2,
                    29
                ],
                'p': [
                    2,
                    29
                ],
                'q': [
                    2,
                    29
                ],
                'r': [
                    2,
                    29
                ],
                's': [
                    2,
                    29
                ],
                't': [
                    2,
                    29
                ],
                'j': [
                    2,
                    29
                ],
                'g': [
                    2,
                    29
                ],
                'af': [
                    2,
                    29
                ],
                'u': [
                    1,
                    undefined,
                    48
                ],
                'v': [
                    1,
                    undefined,
                    49
                ],
                'w': [
                    1,
                    undefined,
                    50
                ]
            },
            '73': {
                'h': [
                    2,
                    30
                ],
                'k': [
                    2,
                    30
                ],
                'l': [
                    2,
                    30
                ],
                'm': [
                    2,
                    30
                ],
                'n': [
                    2,
                    30
                ],
                'o': [
                    2,
                    30
                ],
                'p': [
                    2,
                    30
                ],
                'q': [
                    2,
                    30
                ],
                'r': [
                    2,
                    30
                ],
                's': [
                    2,
                    30
                ],
                't': [
                    2,
                    30
                ],
                'j': [
                    2,
                    30
                ],
                'g': [
                    2,
                    30
                ],
                'af': [
                    2,
                    30
                ],
                'u': [
                    1,
                    undefined,
                    48
                ],
                'v': [
                    1,
                    undefined,
                    49
                ],
                'w': [
                    1,
                    undefined,
                    50
                ]
            },
            '74': {
                'h': [
                    2,
                    32
                ],
                'k': [
                    2,
                    32
                ],
                'l': [
                    2,
                    32
                ],
                'm': [
                    2,
                    32
                ],
                'n': [
                    2,
                    32
                ],
                'o': [
                    2,
                    32
                ],
                'p': [
                    2,
                    32
                ],
                'q': [
                    2,
                    32
                ],
                'r': [
                    2,
                    32
                ],
                's': [
                    2,
                    32
                ],
                't': [
                    2,
                    32
                ],
                'u': [
                    2,
                    32
                ],
                'v': [
                    2,
                    32
                ],
                'w': [
                    2,
                    32
                ],
                'j': [
                    2,
                    32
                ],
                'g': [
                    2,
                    32
                ],
                'af': [
                    2,
                    32
                ]
            },
            '75': {
                'h': [
                    2,
                    33
                ],
                'k': [
                    2,
                    33
                ],
                'l': [
                    2,
                    33
                ],
                'm': [
                    2,
                    33
                ],
                'n': [
                    2,
                    33
                ],
                'o': [
                    2,
                    33
                ],
                'p': [
                    2,
                    33
                ],
                'q': [
                    2,
                    33
                ],
                'r': [
                    2,
                    33
                ],
                's': [
                    2,
                    33
                ],
                't': [
                    2,
                    33
                ],
                'u': [
                    2,
                    33
                ],
                'v': [
                    2,
                    33
                ],
                'w': [
                    2,
                    33
                ],
                'j': [
                    2,
                    33
                ],
                'g': [
                    2,
                    33
                ],
                'af': [
                    2,
                    33
                ]
            },
            '76': {
                'h': [
                    2,
                    34
                ],
                'k': [
                    2,
                    34
                ],
                'l': [
                    2,
                    34
                ],
                'm': [
                    2,
                    34
                ],
                'n': [
                    2,
                    34
                ],
                'o': [
                    2,
                    34
                ],
                'p': [
                    2,
                    34
                ],
                'q': [
                    2,
                    34
                ],
                'r': [
                    2,
                    34
                ],
                's': [
                    2,
                    34
                ],
                't': [
                    2,
                    34
                ],
                'u': [
                    2,
                    34
                ],
                'v': [
                    2,
                    34
                ],
                'w': [
                    2,
                    34
                ],
                'j': [
                    2,
                    34
                ],
                'g': [
                    2,
                    34
                ],
                'af': [
                    2,
                    34
                ]
            },
            '77': {
                'ac': [
                    1,
                    undefined,
                    7
                ]
            },
            '78': {
                'i': [
                    1,
                    undefined,
                    11
                ],
                't': [
                    1,
                    undefined,
                    12
                ],
                'x': [
                    1,
                    undefined,
                    13
                ],
                'y': [
                    1,
                    undefined,
                    14
                ],
                'z': [
                    1,
                    undefined,
                    15
                ],
                'aa': [
                    1,
                    undefined,
                    16
                ],
                'ac': [
                    1,
                    undefined,
                    7
                ]
            },
            '79': {
                'i': [
                    1,
                    undefined,
                    11
                ],
                't': [
                    1,
                    undefined,
                    12
                ],
                'x': [
                    1,
                    undefined,
                    13
                ],
                'y': [
                    1,
                    undefined,
                    14
                ],
                'z': [
                    1,
                    undefined,
                    15
                ],
                'aa': [
                    1,
                    undefined,
                    16
                ],
                'ac': [
                    1,
                    undefined,
                    54
                ]
            },
            '80': {
                'h': [
                    2,
                    9
                ],
                'k': [
                    2,
                    9
                ],
                'l': [
                    2,
                    9
                ],
                'm': [
                    2,
                    9
                ],
                'n': [
                    2,
                    9
                ],
                'o': [
                    2,
                    9
                ],
                'p': [
                    2,
                    9
                ],
                'q': [
                    2,
                    9
                ],
                'r': [
                    2,
                    9
                ],
                's': [
                    2,
                    9
                ],
                't': [
                    2,
                    9
                ],
                'u': [
                    2,
                    9
                ],
                'v': [
                    2,
                    9
                ],
                'w': [
                    2,
                    9
                ],
                'j': [
                    2,
                    9
                ],
                'g': [
                    2,
                    9
                ],
                'af': [
                    2,
                    9
                ]
            },
            '81': {
                'ac': [
                    1,
                    undefined,
                    88
                ]
            },
            '82': {
                'h': [
                    2,
                    10
                ],
                'k': [
                    2,
                    10
                ],
                'l': [
                    2,
                    10
                ],
                'm': [
                    2,
                    10
                ],
                'n': [
                    2,
                    10
                ],
                'o': [
                    2,
                    10
                ],
                'p': [
                    2,
                    10
                ],
                'q': [
                    2,
                    10
                ],
                'r': [
                    2,
                    10
                ],
                's': [
                    2,
                    10
                ],
                't': [
                    2,
                    10
                ],
                'u': [
                    2,
                    10
                ],
                'v': [
                    2,
                    10
                ],
                'w': [
                    2,
                    10
                ],
                'j': [
                    2,
                    10
                ],
                'g': [
                    2,
                    10
                ],
                'af': [
                    2,
                    10
                ]
            },
            '83': {
                'i': [
                    2,
                    49
                ],
                'ad': [
                    2,
                    49
                ],
                'ae': [
                    2,
                    49
                ],
                'h': [
                    2,
                    49
                ],
                'k': [
                    2,
                    49
                ],
                'l': [
                    2,
                    49
                ],
                'm': [
                    2,
                    49
                ],
                'n': [
                    2,
                    49
                ],
                'o': [
                    2,
                    49
                ],
                'p': [
                    2,
                    49
                ],
                'q': [
                    2,
                    49
                ],
                'r': [
                    2,
                    49
                ],
                's': [
                    2,
                    49
                ],
                't': [
                    2,
                    49
                ],
                'u': [
                    2,
                    49
                ],
                'v': [
                    2,
                    49
                ],
                'w': [
                    2,
                    49
                ],
                'j': [
                    2,
                    49
                ],
                'g': [
                    2,
                    49
                ],
                'af': [
                    2,
                    49
                ]
            },
            '84': {
                'h': [
                    1,
                    undefined,
                    90
                ]
            },
            '85': {
                'j': [
                    2,
                    46
                ],
                'g': [
                    2,
                    46
                ]
            },
            '86': {
                'g': [
                    2,
                    12
                ],
                'j': [
                    2,
                    12
                ]
            },
            '87': {
                'g': [
                    1,
                    undefined,
                    81
                ],
                'j': [
                    1,
                    undefined,
                    91
                ]
            },
            '88': {
                'ab': [
                    1,
                    undefined,
                    78
                ]
            },
            '89': {
                'j': [
                    2,
                    44
                ],
                'g': [
                    2,
                    44
                ]
            },
            '90': {
                'a': [
                    2,
                    5
                ],
                'e': [
                    2,
                    5
                ],
                'c': [
                    2,
                    5
                ],
                'f': [
                    2,
                    5
                ],
                'b': [
                    2,
                    5
                ],
                'd': [
                    2,
                    5
                ]
            },
            '91': {
                'h': [
                    2,
                    8
                ],
                'k': [
                    2,
                    8
                ],
                'l': [
                    2,
                    8
                ],
                'm': [
                    2,
                    8
                ],
                'n': [
                    2,
                    8
                ],
                'o': [
                    2,
                    8
                ],
                'p': [
                    2,
                    8
                ],
                'q': [
                    2,
                    8
                ],
                'r': [
                    2,
                    8
                ],
                's': [
                    2,
                    8
                ],
                't': [
                    2,
                    8
                ],
                'u': [
                    2,
                    8
                ],
                'v': [
                    2,
                    8
                ],
                'w': [
                    2,
                    8
                ],
                'j': [
                    2,
                    8
                ],
                'g': [
                    2,
                    8
                ],
                'af': [
                    2,
                    8
                ]
            }
        }
    };
    parser.parse = function parse(input, filename) {
        var self = this, lexer = self.lexer, state, symbol, action, table = self.table, gotos = table.gotos, tableAction = table.action, productions = self.productions, valueStack = [null],
            // for debug info
            prefix = filename ? 'in file: ' + filename + ' ' : '', stack = [0];
        lexer.resetInput(input);
        while (1) {
            // retrieve state number from top of stack
            state = stack[stack.length - 1];
            if (!symbol) {
                symbol = lexer.lex();
            }
            if (symbol) {
                // read action for current state and first input
                action = tableAction[state] && tableAction[state][symbol];
            } else {
                action = null;
            }
            if (!action) {
                var expected = [], error;    //#JSCOVERAGE_IF
                                             //#JSCOVERAGE_IF
                //#JSCOVERAGE_IF
                //#JSCOVERAGE_IF
                if (tableAction[state]) {
                    for (var symbolForState in tableAction[state]) {
                        expected.push(self.lexer.mapReverseSymbol(symbolForState));
                    }
                }
                error = prefix + 'syntax error at line ' + lexer.lineNumber + ':\n' + lexer.showDebugInfo() + '\n' + 'expect ' + expected.join(', ');
                return S.error(error);
            }
            switch (action[GrammarConst.TYPE_INDEX]) {
            case GrammarConst.SHIFT_TYPE:
                stack.push(symbol);
                valueStack.push(lexer.text);    // push state
                                                // push state
                // push state
                // push state
                stack.push(action[GrammarConst.TO_INDEX]);    // allow to read more
                                                              // allow to read more
                // allow to read more
                // allow to read more
                symbol = null;
                break;
            case GrammarConst.REDUCE_TYPE:
                var production = productions[action[GrammarConst.PRODUCTION_INDEX]], reducedSymbol = production.symbol || production[0], reducedAction = production.action || production[2], reducedRhs = production.rhs || production[1], len = reducedRhs.length, i = 0, ret, $$ = valueStack[valueStack.length - len];    // default to $$ = $1
                                                                                                                                                                                                                                                                                                                             // default to $$ = $1
                // default to $$ = $1
                // default to $$ = $1
                ret = undefined;
                self.$$ = $$;
                for (; i < len; i++) {
                    self['$' + (len - i)] = valueStack[valueStack.length - 1 - i];
                }
                if (reducedAction) {
                    ret = reducedAction.call(self);
                }
                if (ret !== undefined) {
                    $$ = ret;
                } else {
                    $$ = self.$$;
                }
                stack = stack.slice(0, -1 * len * 2);
                valueStack = valueStack.slice(0, -1 * len);
                stack.push(reducedSymbol);
                valueStack.push($$);
                var newState = gotos[stack[stack.length - 2]][stack[stack.length - 1]];
                stack.push(newState);
                break;
            case GrammarConst.ACCEPT_TYPE:
                return $$;
            }
        }
    };
    return parser;
});
/**
 * Ast node class for xtemplate
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add('xtemplate/compiler/ast', [], function (S) {
    var ast = {};
    function sameArray(a1, a2) {
        var l1 = a1.length, l2 = a2.length;
        if (l1 !== l2) {
            return 0;
        }
        for (var i = 0; i < l1; i++) {
            if (a1[i] !== a2[i]) {
                return 0;
            }
        }
        return 1;
    }    /**
     * @ignore
     * @param lineNumber
     * @param statements
     * @param [inverse]
     * @constructor
     */
    /**
     * @ignore
     * @param lineNumber
     * @param statements
     * @param [inverse]
     * @constructor
     */
    ast.ProgramNode = function (lineNumber, statements, inverse) {
        var self = this;
        self.lineNumber = lineNumber;
        self.statements = statements;
        self.inverse = inverse;
    };
    ast.ProgramNode.prototype.type = 'program';
    ast.BlockStatement = function (lineNumber, command, program, close, escape) {
        var closeParts = close.parts, self = this, e;    // no close tag
        // no close tag
        if (!sameArray(command.id.parts, closeParts)) {
            e = 'Syntax error at line ' + lineNumber + ':\n' + 'expect {{/' + command.id.parts + '}} not {{/' + closeParts + '}}';
            S.error(e);
        }
        self.escape = escape;
        self.lineNumber = lineNumber;
        self.command = command;
        self.program = program;
    };
    ast.BlockStatement.prototype.type = 'blockStatement';
    ast.ExpressionStatement = function (lineNumber, expression, escape) {
        var self = this;
        self.lineNumber = lineNumber;
        self.value = expression;
        self.escape = escape;
    };
    ast.ExpressionStatement.prototype.type = 'expressionStatement';
    ast.ContentStatement = function (lineNumber, value) {
        var self = this;
        self.lineNumber = lineNumber;
        self.value = value;
    };
    ast.ContentStatement.prototype.type = 'contentStatement';
    ast.UnaryExpression = function (unaryType, v) {
        this.value = v;
        this.unaryType = unaryType;
    };    /**
     * @ignore
     * @param lineNumber
     * @param id
     * @param [params]
     * @param [hash]
     * @constructor
     */
    /**
     * @ignore
     * @param lineNumber
     * @param id
     * @param [params]
     * @param [hash]
     * @constructor
     */
    ast.Command = function (lineNumber, id, params, hash) {
        var self = this;
        self.lineNumber = lineNumber;
        self.id = id;
        self.params = params;
        self.hash = hash;
    };
    ast.Command.prototype.type = 'command';
    ast.UnaryExpression.prototype.type = 'unaryExpression';
    ast.MultiplicativeExpression = function (op1, opType, op2) {
        var self = this;
        self.op1 = op1;
        self.opType = opType;
        self.op2 = op2;
    };
    ast.MultiplicativeExpression.prototype.type = 'multiplicativeExpression';
    ast.AdditiveExpression = function (op1, opType, op2) {
        var self = this;
        self.op1 = op1;
        self.opType = opType;
        self.op2 = op2;
    };
    ast.AdditiveExpression.prototype.type = 'additiveExpression';
    ast.RelationalExpression = function (op1, opType, op2) {
        var self = this;
        self.op1 = op1;
        self.opType = opType;
        self.op2 = op2;
    };
    ast.RelationalExpression.prototype.type = 'relationalExpression';
    ast.EqualityExpression = function (op1, opType, op2) {
        var self = this;
        self.op1 = op1;
        self.opType = opType;
        self.op2 = op2;
    };
    ast.EqualityExpression.prototype.type = 'equalityExpression';
    ast.ConditionalAndExpression = function (op1, op2) {
        var self = this;
        self.op1 = op1;
        self.op2 = op2;
        self.opType = '&&';
    };
    ast.ConditionalAndExpression.prototype.type = 'conditionalAndExpression';
    ast.ConditionalOrExpression = function (op1, op2) {
        var self = this;
        self.op1 = op1;
        self.op2 = op2;
        self.opType = '||';
    };
    ast.ConditionalOrExpression.prototype.type = 'conditionalOrExpression';
    ast.String = function (lineNumber, value) {
        var self = this;
        self.lineNumber = lineNumber;
        self.value = value;
    };
    ast.String.prototype.type = 'string';
    ast.Number = function (lineNumber, value) {
        var self = this;
        self.lineNumber = lineNumber;
        self.value = value;
    };
    ast.Number.prototype.type = 'number';
    ast.Boolean = function (lineNumber, value) {
        var self = this;
        self.lineNumber = lineNumber;
        self.value = value;
    };
    ast.Boolean.prototype.type = 'boolean';
    ast.Hash = function (lineNumber) {
        var self = this, value = {};
        self.lineNumber = lineNumber;
        self.value = value;
    };
    ast.Hash.prototype.type = 'hash';
    ast.Id = function (lineNumber, raw) {
        var self = this, parts = [], depth = 0;
        self.lineNumber = lineNumber;
        for (var i = 0, l = raw.length; i < l; i++) {
            var p = raw[i];
            if (p === '..') {
                depth++;
            } else {
                parts.push(p);
            }
        }
        self.parts = parts;
        self.string = parts.join('.');
        self.depth = depth;
    };
    ast.Id.prototype.type = 'id';
    return ast;
});
