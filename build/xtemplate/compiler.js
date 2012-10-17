/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Oct 17 17:30
*/
/**
 * Ast node class for xtemplate
 * @author yiminghe@gmail.com
 */
KISSY.add("xtemplate/compiler/ast", function (S) {

    var ast = {};

    ast.ProgramNode = function (lineNumber, statements, inverse) {
        var self = this;
        self.lineNumber = lineNumber;
        self.statements = statements;
        self.inverse = inverse;
    };

    ast.ProgramNode.prototype.type = 'program';

    ast.BlockNode = function (lineNumber, tpl, program, close) {
        var closeParts = close['parts'], self = this;
        // 开始没有结束
        if (!S.equals(tpl.path['parts'], closeParts)) {
            throw new Error("parse error at line " +
                lineNumber +
                ":\n" + "expect {{/" +
                tpl.path['parts'] +
                "}} not {{/" +
                closeParts + "}}");
        }
        self.lineNumber = lineNumber;
        self.tpl = tpl;
        self.program = program;
    };

    ast.BlockNode.prototype.type = 'block';

    ast.TplNode = function (lineNumber, path, params, hash) {
        var self = this;
        self.lineNumber = lineNumber;
        self.path = path;
        self.params = params;
        self.hash = hash;
        self.escaped = true;
    };

    ast.TplNode.prototype.type = 'tpl';


    ast.TplExpressionNode = function (lineNumber, expression) {
        var self = this;
        self.lineNumber = lineNumber;
        self.expression = expression;
        self.escaped = true;
    };

    ast.TplExpressionNode.prototype.type = 'tplExpression';

    ast.ContentNode = function (lineNumber, value) {
        var self = this;
        self.lineNumber = lineNumber;
        self.value = value;
    };

    ast.ContentNode.prototype.type = 'content';

    ast.UnaryExpression = function (v) {
        this.value = v;
    };

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
    };

    ast.ConditionalAndExpression.prototype.type = 'conditionalAndExpression';

    ast.ConditionalOrExpression = function (op1, op2) {
        var self = this;
        self.op1 = op1;
        self.op2 = op2;
    };

    ast.ConditionalOrExpression.prototype.type = 'conditionalOrExpression';

    ast.StringNode = function (lineNumber, value) {
        var self = this;
        self.lineNumber = lineNumber;
        self.value = value;
    };

    ast.StringNode.prototype.type = 'string';

    ast.NumberNode = function (lineNumber, value) {
        var self = this;
        self.lineNumber = lineNumber;
        self.value = value;
    };

    ast.NumberNode.prototype.type = 'number';

    ast.BooleanNode = function (lineNumber, value) {
        var self = this;
        self.lineNumber = lineNumber;
        self.value = value;
    };

    ast.BooleanNode.prototype.type = 'boolean';

    ast.HashNode = function (lineNumber, raw) {
        var self = this, value = {};
        self.lineNumber = lineNumber;
        S.each(raw, function (r) {
            value[r[0]] = r[1];
        });
        self.value = value;
    };

    ast.HashNode.prototype.type = 'hash';

    ast.IdNode = function (lineNumber, raw) {
        var self = this, parts = [], depth = 0;
        self.lineNumber = lineNumber;
        S.each(raw, function (p) {
            if (p == "..") {
                depth++;
            } else {
                parts.push(p);
            }
        });
        self.parts = parts;
        self.string = parts.join('.');
        self.depth = depth;
    };

    ast.IdNode.prototype.type = 'id';

    return ast;
});/**
 * translate ast to js function code
 * @author yiminghe@gmail.com
 */
KISSY.add("xtemplate/compiler", function (S, parser, ast) {

    parser.yy = ast;

    // native commands should be same with runtime/commands
    var commands = {'each': 1, 'with': 1, 'if': 1, 'set': 1, 'include': 1};
    var utils = {'getProperty': 1};
    var doubleReg = /"/g, single = /'/g, escapeString;
    var arrayPush = [].push;

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
        return str.replace(/\\/g, '\\\\')
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
            source.push('var buffer = ""' + (global ? ',' : ';'));
            if (global) {
                source.push('S = KISSY,' +
                    'escapeHTML = S.escapeHTML,' +
                    'log = S.log,' +
                    'error = S.error,');

                var natives = '', c;

                for (c in commands) {
                    natives += c + 'Command = commands["' + c + '"],';
                }

                for (c in utils) {
                    natives += c + ' = utils["' + c + '"],';
                }

                source.push('commands = option.commands,' +
                    'utils = option.utils,' +
                    'cache=option.cache,' +
                    natives +
                    'subTpls = option.subTpls;');
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
                    params: ['scopes', 'option'],
                    source: source
                };
            }
        },

        genId: function (idNode, tplNode) {
            var source = [],
                depth = idNode.depth,
                scope = 'scopes[' + depth + ']',
                idString = idNode.string;

            var idName = S.guid('id'),
                self = this,
                escapePropertyResolve = 0,
                tmpNameCommand;


            source.push('var ' + idName + ';');

            if (tplNode && depth == 0) {
                var optionNameCode = self.genOption(tplNode);
                pushToArray(source, optionNameCode[1]);
                if (!commands[idString]) {
                    tmpNameCommand = S.guid('command');
                    source.push('var ' + tmpNameCommand + ';');
                    source.push(tmpNameCommand + ' = commands["' + idString + '"];');
                    source.push('if( ' + tmpNameCommand + ' ){');
                } else {
                    tmpNameCommand = idString + 'Command';
                    escapePropertyResolve = 1;
                }
                source.push('try{');
                source.push(idName + ' = ' + tmpNameCommand +
                    '(scopes,' + optionNameCode[0] + ');');
                source.push('}catch(e){');
                source.push('error(e.message+": \'' +
                    idString + '\' at line ' + idNode.lineNumber + '");');
                source.push('}');
                if (!commands[idString]) {
                    source.push('}');
                }
            }

            if (!escapePropertyResolve) {
                if (tplNode && depth == 0) {
                    source.push('else {');
                }

                var tmp = S.guid('tmp');

                source.push('var ' + tmp + '=getProperty("' + idString + '",' + scope + ');');

                source.push('if(' + tmp + '===false){');
                source.push('log("can not find property: \'' +
                    idString + '\' at line ' + idNode.lineNumber + '", "warn");');
                source.push(idName + ' = "";');
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
                optionName = S.guid('option'),
                self = this;

            source.push('var ' + optionName + ' = {' +
                'commands: commands,' +
                'utils: utils,' +
                'cache: cache,' +
                'subTpls: subTpls' +
                '};');

            if (tplNode) {

                var params, hash;
                if (params = tplNode.params) {
                    var paramsName = S.guid('params');
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
                    var hashName = S.guid('hash');
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
                string = tplNode.path.string;

            pushToArray(source, optionNameCode[1]);


            source.push(optionName + '.fn=' + this.genFunction(programNode.statements).join('\n') + ';');

            if (programNode.inverse) {
                var inverseFn = this.genFunction(programNode.inverse).join('\n');
                source.push(optionName + '.inverse=' + inverseFn + ';');
            }

            if (!commands[string]) {
                tmpNameCommand = S.guid('command');
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
                var tmp = S.guid('tmp');
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
            source.push('buffer+=' +
                (escaped ? 'escapeHTML(' : '') +
                genIdCode[0] + '+""' +
                (escaped ? ')' : '') +
                ';');
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
            source.push('buffer+=' +
                (escaped ? 'escapeHTML(' : '') +
                expressionOrVariable +
                (escaped ? ')' : '') +
                ';');
            return source;
        }

    };

    return {
        parse: function (tpl) {
            return parser.parse(tpl);
        },
        compileToStr: function (tpl) {
            var func = this.compile(tpl);
            return 'function(' + func.params.join(',') + '){\n' +
                func.source.join('\n') +
                '}';
        },
        compile: function (tpl) {
            var root = this.parse(tpl);
            return gen.genFunction(root.statements, true);
        }
    };

}, {
    requires: ['./compiler/parser', './compiler/ast']
});/*
  Generated by kissy-kison.*/
KISSY.add("xtemplate/compiler/parser", function () {
    /* Generated by kison from KISSY */
    var parser = {}, S = KISSY,
        GrammarConst = {
            'SHIFT_TYPE': 1,
            'REDUCE_TYPE': 2,
            'ACCEPT_TYPE': 0,
            'TYPE_INDEX': 0,
            'PRODUCTION_INDEX': 1,
            'TO_INDEX': 2
        };
    var Lexer = function (cfg) {

        var self = this;

        /**
         * lex rules.
         * @type {Object[]}
         * @example
         * [
         *  {
         *   regexp:'\\w+',
         *   state:'xx',
         *   token:'c',
         *   // this => lex
         *   action:function(){}
         *  }
         * ]
         */
        self.rules = [];

        S.mix(self, cfg);

        for (var i = 0, l = self.rules.length; i < l; i++) {
            var r = self.rules[i];
            if (!S.isArray(r) && !('state' in r)) {
                r.state = Lexer.STATIC.INIT;
            }
        }

        /**
         * Input languages
         * @type {String}
         */

        self.resetInput(self.input);

    };
    Lexer.prototype = {
        'resetInput': function (input) {
            var self = this;
            self.input = input;
            S.mix(self, {
                matched: "",
                stateStack: [Lexer.STATIC.INIT],
                match: "",
                text: "",
                firstLine: 1,
                lineNumber: 1,
                lastLine: 1,
                firstColumn: 1,
                lastColumn: 1
            });
        },
        'getCurrentRules': function () {
            var self = this,
                stateMap = self.stateMap || {},
                currentState = self.stateStack[self.stateStack.length - 1],
                rules = [];
            currentState = stateMap[currentState] || currentState;
            S.each(self.rules, function (r) {
                var state = r.state || r[3];
                if (state == currentState) {
                    rules.push(r);
                }
            });
            return rules;
        },
        'pushState': function (state) {
            this.stateStack.push(state);
        },
        'popState': function () {
            this.stateStack.pop();
        },
        'showDebugInfo': function () {
            var self = this,
                DEBUG_CONTEXT_LIMIT = Lexer.STATIC.DEBUG_CONTEXT_LIMIT,
                matched = self.matched,
                match = self.match,
                input = self.input;
            matched = matched.slice(0, matched.length - match.length);
            var past = (matched.length > DEBUG_CONTEXT_LIMIT ? "..." : "") + matched.slice(-DEBUG_CONTEXT_LIMIT).replace(/\n/, " "),
                next = match + input;
            next = next.slice(0, DEBUG_CONTEXT_LIMIT) + (next.length > DEBUG_CONTEXT_LIMIT ? "..." : "");
            return past + next + "\n" + new Array(past.length + 1).join("-") + "^";
        },
        'lex': function () {
            var self = this,
                tokenMap = self.tokenMap || {},
                input = self.input,
                i,
                rule,
                m,
                END_TAG = Lexer.STATIC.END_TAG,
                ret,
                lines,
                rules = self.getCurrentRules();

            self.match = self.text = "";

            if (!S.trim(input)) {
                return tokenMap[END_TAG] || END_TAG;
            }

            for (i = 0; i < rules.length; i++) {
                rule = rules[i];
                var regexp = rule.regexp || rule[1],
                    token = rule.token || rule[0],
                    action = rule.action || rule[2] || undefined;
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
                    var match;
                    // for error report
                    match = self.match = m[0];

                    // all matches
                    self.matches = m;
                    // may change by user
                    self.text = match;
                    // matched content utils now
                    self.matched += match;
                    ret = action && action.call(self);
                    if (ret == undefined) {
                        ret = token;
                    } else {
                        ret = tokenMap[ret] || ret;
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

            S.error("lex error at line " + self.lineNumber + ":\n" + self.showDebugInfo());
        }
    };
    Lexer.STATIC = {
        'INIT': 'ks13503112577192',
        'DEBUG_CONTEXT_LIMIT': 20,
        'END_TAG': '$EOF'
    };
    var lexer = new Lexer({
        'rules': [
            [0, /^[\s\S]*?(?={{)/, function () {
                if (this.text.slice(-1) !== '\\') {
                    this.pushState('t');
                } else {
                    this.text = this.text.slice(0, - 1);
                    this.pushState('et');
                }
                // only return when has content
                if (this.text) {
                    return 'CONTENT';
                }
            },
            1],
            [2, /^[\s\S]+/, 0, 1],
            [2, /^[\s\S]{2,}?(?:(?={{)|$)/, function () {
                this.popState();
            },
            2],
            [3, /^{{#/, 0, 3],
            [4, /^{{\//, 0, 3],
            [5, /^{{\s*else/, 0, 3],
            [6, /^{{{/, 0, 3],
            [0, /^{{![\s\S]*?}}/, function () {
                // return to content mode
                this.popState();
            },
            3],
            [7, /^{{/, 0, 3],
            [0, /^\s+/, 0, 3],
            [8, /^}}}/, function () {
                this.popState();
            },
            3],
            [8, /^}}/, function () {
                this.popState();
            },
            3],
            [9, /^\(/, 0, 3],
            [10, /^\)/, 0, 3],
            [11, /^\|\|/, 0, 3],
            [12, /^&&/, 0, 3],
            [13, /^===/, 0, 3],
            [14, /^!==/, 0, 3],
            [15, /^>/, 0, 3],
            [16, /^>=/, 0, 3],
            [17, /^</, 0, 3],
            [18, /^<=/, 0, 3],
            [19, /^\+/, 0, 3],
            [20, /^-/, 0, 3],
            [21, /^\*/, 0, 3],
            [22, /^\//, 0, 3],
            [23, /^%/, 0, 3],
            [24, /^!/, 0, 3],
            [25, /^"(\\"|[^"])*"/, function () {
                this.text = this.text.slice(1, - 1).replace(/\\"/g, '"');
            },
            3],
            [25, /^'(\\'|[^'])*'/, function () {
                this.text = this.text.slice(1, - 1).replace(/\\'/g, "'");
            },
            3],
            [26, /^true/, 0, 3],
            [26, /^false/, 0, 3],
            [27, /^\d+(?:\.\d+)?(?:e-?\d+)?/i, 0, 3],
            [28, /^=/, 0, 3],
            [29, /^\.\./, function () {
                // wait for '/'
                this.pushState('ws');
            },
            3],
            [30, /^\./, 0, 3],
            [30, /^\//, function () {
                this.popState();
            },
            4],
            [29, /^[a-zA-Z0-9_$-]+/, 0, 3],
            [31, /^./, 0, 3]
        ]
    });
    lexer.tokenMap = {
        '$EOF': 1,
        'CONTENT': 2,
        'OPEN_BLOCK': 3,
        'OPEN_END_BLOCK': 4,
        'OPEN_INVERSE': 5,
        'OPEN_UN_ESCAPED': 6,
        'OPEN': 7,
        'CLOSE': 8,
        'LPAREN': 9,
        'RPAREN': 10,
        'OR': 11,
        'AND': 12,
        'LOGIC_EQUALS': 13,
        'LOGIC_NOT_EQUALS': 14,
        'GT': 15,
        'GE': 16,
        'LT': 17,
        'LE': 18,
        'PLUS': 19,
        'MINUS': 20,
        'MULTIPLY': 21,
        'DIVIDE': 22,
        'MODULUS': 23,
        'NOT': 24,
        'STRING': 25,
        'BOOLEAN': 26,
        'NUMBER': 27,
        'EQUALS': 28,
        'ID': 29,
        'SEP': 30,
        'INVALID': 31
    };
    lexer.stateMap = {
        'ks13503112577192': 1,
        'et': 2,
        't': 3,
        'ws': 4
    };
    parser.lexer = lexer;
    parser.productions = [
        [33, [34], 0],
        [34, [35, 36, 35], function () {
            return new this.yy.ProgramNode(this.lexer.lineNumber, this.$1, this.$3);
        }],
        [34, [35], function () {
            return new this.yy.ProgramNode(this.lexer.lineNumber, this.$1);
        }],
        [35, [37], function () {
            return [this.$1];
        }],
        [35, [35, 37], function () {
            this.$1.push(this.$2);
        }],
        [37, [38, 34, 39], function () {
            return new this.yy.BlockNode(this.lexer.lineNumber, this.$1, this.$2, this.$3);
        }],
        [37, [40], 0],
        [37, [2], function () {
            return new this.yy.ContentNode(this.lexer.lineNumber, this.$1);
        }],
        [38, [3, 41, 8], function () {
            return this.$2;
        }],
        [39, [4, 42, 8], function () {
            return this.$2;
        }],
        [40, [7, 41, 8], function () {
            return this.$2;
        }],
        [40, [6, 41, 8], function () {
            this.$2.escaped = false;
            return this.$2;
        }],
        [40, [7, 43, 8], function () {
            return new this.yy.TplExpressionNode(this.lexer.lineNumber,
            this.$2);
        }],
        [40, [6, 43, 8], function () {
            var tpl = new this.yy.TplExpressionNode(this.lexer.lineNumber,
            this.$2);
            tpl.escaped = false;
            return tpl;
        }],
        [36, [5, 8], 0],
        [41, [42, 44, 45], function () {
            return new this.yy.TplNode(this.lexer.lineNumber, this.$1, this.$2, this.$3);
        }],
        [41, [42, 44], function () {
            return new this.yy.TplNode(this.lexer.lineNumber, this.$1, this.$2);
        }],
        [41, [42, 45], function () {
            return new this.yy.TplNode(this.lexer.lineNumber, this.$1, null, this.$2);
        }],
        [41, [42], function () {
            return new this.yy.TplNode(this.lexer.lineNumber, this.$1);
        }],
        [44, [44, 46], function () {
            this.$1.push(this.$2);
        }],
        [44, [46], function () {
            return [this.$1];
        }],
        [46, [43], 0],
        [43, [47], 0],
        [47, [48], 0],
        [47, [47, 11, 48], function () {
            return new this.yy.ConditionalOrExpression(this.$1, this.$3);
        }],
        [48, [49], 0],
        [48, [48, 12, 49], function () {
            return new this.yy.ConditionalAndExpression(this.$1, this.$3);
        }],
        [49, [50], 0],
        [49, [49, 13, 50], function () {
            return new this.yy.EqualityExpression(this.$1, '===', this.$3);
        }],
        [49, [49, 14, 50], function () {
            return new this.yy.EqualityExpression(this.$1, '!==', this.$3);
        }],
        [50, [51], 0],
        [50, [50, 17, 51], function () {
            return new this.yy.RelationalExpression(this.$1, '<=', this.$3);
        }],
        [50, [50, 15, 51], function () {
            return new this.yy.RelationalExpression(this.$1, '>', this.$3);
        }],
        [50, [50, 18, 51], function () {
            return new this.yy.RelationalExpression(this.$1, '<=', this.$3);
        }],
        [50, [50, 16, 51], function () {
            return new this.yy.RelationalExpression(this.$1, '>=', this.$3);
        }],
        [51, [52], 0],
        [51, [51, 19, 52], function () {
            return new this.yy.AdditiveExpression(this.$1, '+', this.$3);
        }],
        [51, [51, 20, 52], function () {
            return new this.yy.AdditiveExpression(this.$1, '-', this.$3);
        }],
        [52, [53], 0],
        [52, [52, 21, 53], function () {
            return new this.yy.MultiplicativeExpression(this.$1, '*', this.$3);
        }],
        [52, [52, 22, 53], function () {
            return new this.yy.MultiplicativeExpression(this.$1, '/', this.$3);
        }],
        [52, [52, 23, 53], function () {
            return new this.yy.MultiplicativeExpression(this.$1, '%', this.$3);
        }],
        [53, [24, 53], function () {
            return new this.yy.UnaryExpression(this.$1);
        }],
        [53, [54], 0],
        [54, [25], function () {
            return new this.yy.StringNode(this.lexer.lineNumber, this.$1);
        }],
        [54, [27], function () {
            return new this.yy.NumberNode(this.lexer.lineNumber, this.$1);
        }],
        [54, [26], function () {
            return new this.yy.BooleanNode(this.lexer.lineNumber, this.$1);
        }],
        [54, [42], 0],
        [54, [9, 43, 10], function () {
            return this.$2;
        }],
        [45, [55], function () {
            return new this.yy.HashNode(this.lexer.lineNumber, this.$1);
        }],
        [55, [55, 56], function () {
            this.$1.push(this.$2);
        }],
        [55, [56], function () {
            return [this.$1];
        }],
        [56, [29, 28, 43], function () {
            return [this.$1, this.$3];
        }],
        [42, [57], function () {
            return new this.yy.IdNode(this.lexer.lineNumber, this.$1);
        }],
        [57, [57, 30, 29], function () {
            this.$1.push(this.$3);
        }],
        [57, [57, 30, 27], function () {
            this.$1.push(this.$3);
        }],
        [57, [29], function () {
            return [this.$1];
        }]
    ];
    parser.table = {
        'gotos': {
            '0': {
                '34': 5,
                '35': 6,
                '37': 7,
                '38': 8,
                '40': 9
            },
            '2': {
                '41': 11,
                '42': 12,
                '57': 13
            },
            '3': {
                '41': 19,
                '42': 20,
                '43': 21,
                '47': 22,
                '48': 23,
                '49': 24,
                '50': 25,
                '51': 26,
                '52': 27,
                '53': 28,
                '54': 29,
                '57': 13
            },
            '4': {
                '41': 30,
                '42': 20,
                '43': 31,
                '47': 22,
                '48': 23,
                '49': 24,
                '50': 25,
                '51': 26,
                '52': 27,
                '53': 28,
                '54': 29,
                '57': 13
            },
            '6': {
                '36': 33,
                '37': 34,
                '38': 8,
                '40': 9
            },
            '8': {
                '34': 35,
                '35': 6,
                '37': 7,
                '38': 8,
                '40': 9
            },
            '12': {
                '42': 38,
                '43': 39,
                '44': 40,
                '45': 41,
                '46': 42,
                '47': 22,
                '48': 23,
                '49': 24,
                '50': 25,
                '51': 26,
                '52': 27,
                '53': 28,
                '54': 29,
                '55': 43,
                '56': 44,
                '57': 13
            },
            '14': {
                '42': 38,
                '43': 46,
                '47': 22,
                '48': 23,
                '49': 24,
                '50': 25,
                '51': 26,
                '52': 27,
                '53': 28,
                '54': 29,
                '57': 13
            },
            '15': {
                '42': 38,
                '53': 47,
                '54': 29,
                '57': 13
            },
            '20': {
                '42': 38,
                '43': 39,
                '44': 40,
                '45': 41,
                '46': 42,
                '47': 22,
                '48': 23,
                '49': 24,
                '50': 25,
                '51': 26,
                '52': 27,
                '53': 28,
                '54': 29,
                '55': 43,
                '56': 44,
                '57': 13
            },
            '33': {
                '35': 66,
                '37': 7,
                '38': 8,
                '40': 9
            },
            '35': {
                '39': 68
            },
            '40': {
                '42': 38,
                '43': 39,
                '45': 70,
                '46': 71,
                '47': 22,
                '48': 23,
                '49': 24,
                '50': 25,
                '51': 26,
                '52': 27,
                '53': 28,
                '54': 29,
                '55': 43,
                '56': 44,
                '57': 13
            },
            '43': {
                '56': 73
            },
            '50': {
                '42': 38,
                '48': 77,
                '49': 24,
                '50': 25,
                '51': 26,
                '52': 27,
                '53': 28,
                '54': 29,
                '57': 13
            },
            '51': {
                '42': 38,
                '49': 78,
                '50': 25,
                '51': 26,
                '52': 27,
                '53': 28,
                '54': 29,
                '57': 13
            },
            '52': {
                '42': 38,
                '50': 79,
                '51': 26,
                '52': 27,
                '53': 28,
                '54': 29,
                '57': 13
            },
            '53': {
                '42': 38,
                '50': 80,
                '51': 26,
                '52': 27,
                '53': 28,
                '54': 29,
                '57': 13
            },
            '54': {
                '42': 38,
                '51': 81,
                '52': 27,
                '53': 28,
                '54': 29,
                '57': 13
            },
            '55': {
                '42': 38,
                '51': 82,
                '52': 27,
                '53': 28,
                '54': 29,
                '57': 13
            },
            '56': {
                '42': 38,
                '51': 83,
                '52': 27,
                '53': 28,
                '54': 29,
                '57': 13
            },
            '57': {
                '42': 38,
                '51': 84,
                '52': 27,
                '53': 28,
                '54': 29,
                '57': 13
            },
            '58': {
                '42': 38,
                '52': 85,
                '53': 28,
                '54': 29,
                '57': 13
            },
            '59': {
                '42': 38,
                '52': 86,
                '53': 28,
                '54': 29,
                '57': 13
            },
            '60': {
                '42': 38,
                '53': 87,
                '54': 29,
                '57': 13
            },
            '61': {
                '42': 38,
                '53': 88,
                '54': 29,
                '57': 13
            },
            '62': {
                '42': 38,
                '53': 89,
                '54': 29,
                '57': 13
            },
            '66': {
                '37': 34,
                '38': 8,
                '40': 9
            },
            '67': {
                '42': 90,
                '57': 13
            },
            '69': {
                '42': 38,
                '43': 91,
                '47': 22,
                '48': 23,
                '49': 24,
                '50': 25,
                '51': 26,
                '52': 27,
                '53': 28,
                '54': 29,
                '57': 13
            }
        },
        'action': {
            '0': {
                '2': [1, 0, 1],
                '3': [1, 0, 2],
                '6': [1, 0, 3],
                '7': [1, 0, 4]
            },
            '1': {
                '1': [2, 7, 0],
                '2': [2, 7, 0],
                '3': [2, 7, 0],
                '4': [2, 7, 0],
                '5': [2, 7, 0],
                '6': [2, 7, 0],
                '7': [2, 7, 0]
            },
            '2': {
                '29': [1, 0, 10]
            },
            '3': {
                '9': [1, 0, 14],
                '24': [1, 0, 15],
                '25': [1, 0, 16],
                '26': [1, 0, 17],
                '27': [1, 0, 18],
                '29': [1, 0, 10]
            },
            '4': {
                '9': [1, 0, 14],
                '24': [1, 0, 15],
                '25': [1, 0, 16],
                '26': [1, 0, 17],
                '27': [1, 0, 18],
                '29': [1, 0, 10]
            },
            '5': {
                '1': [0, 0, 0]
            },
            '6': {
                '1': [2, 2, 0],
                '2': [1, 0, 1],
                '3': [1, 0, 2],
                '4': [2, 2, 0],
                '5': [1, 0, 32],
                '6': [1, 0, 3],
                '7': [1, 0, 4]
            },
            '7': {
                '1': [2, 3, 0],
                '2': [2, 3, 0],
                '3': [2, 3, 0],
                '4': [2, 3, 0],
                '5': [2, 3, 0],
                '6': [2, 3, 0],
                '7': [2, 3, 0]
            },
            '8': {
                '2': [1, 0, 1],
                '3': [1, 0, 2],
                '6': [1, 0, 3],
                '7': [1, 0, 4]
            },
            '9': {
                '1': [2, 6, 0],
                '2': [2, 6, 0],
                '3': [2, 6, 0],
                '4': [2, 6, 0],
                '5': [2, 6, 0],
                '6': [2, 6, 0],
                '7': [2, 6, 0]
            },
            '10': {
                '8': [2, 56, 0],
                '9': [2, 56, 0],
                '10': [2, 56, 0],
                '11': [2, 56, 0],
                '12': [2, 56, 0],
                '13': [2, 56, 0],
                '14': [2, 56, 0],
                '15': [2, 56, 0],
                '16': [2, 56, 0],
                '17': [2, 56, 0],
                '18': [2, 56, 0],
                '19': [2, 56, 0],
                '20': [2, 56, 0],
                '21': [2, 56, 0],
                '22': [2, 56, 0],
                '23': [2, 56, 0],
                '24': [2, 56, 0],
                '25': [2, 56, 0],
                '26': [2, 56, 0],
                '27': [2, 56, 0],
                '29': [2, 56, 0],
                '30': [2, 56, 0]
            },
            '11': {
                '8': [1, 0, 36]
            },
            '12': {
                '8': [2, 18, 0],
                '9': [1, 0, 14],
                '24': [1, 0, 15],
                '25': [1, 0, 16],
                '26': [1, 0, 17],
                '27': [1, 0, 18],
                '29': [1, 0, 37]
            },
            '13': {
                '8': [2, 53, 0],
                '9': [2, 53, 0],
                '10': [2, 53, 0],
                '11': [2, 53, 0],
                '12': [2, 53, 0],
                '13': [2, 53, 0],
                '14': [2, 53, 0],
                '15': [2, 53, 0],
                '16': [2, 53, 0],
                '17': [2, 53, 0],
                '18': [2, 53, 0],
                '19': [2, 53, 0],
                '20': [2, 53, 0],
                '21': [2, 53, 0],
                '22': [2, 53, 0],
                '23': [2, 53, 0],
                '24': [2, 53, 0],
                '25': [2, 53, 0],
                '26': [2, 53, 0],
                '27': [2, 53, 0],
                '29': [2, 53, 0],
                '30': [1, 0, 45]
            },
            '14': {
                '9': [1, 0, 14],
                '24': [1, 0, 15],
                '25': [1, 0, 16],
                '26': [1, 0, 17],
                '27': [1, 0, 18],
                '29': [1, 0, 10]
            },
            '15': {
                '9': [1, 0, 14],
                '24': [1, 0, 15],
                '25': [1, 0, 16],
                '26': [1, 0, 17],
                '27': [1, 0, 18],
                '29': [1, 0, 10]
            },
            '16': {
                '8': [2, 44, 0],
                '9': [2, 44, 0],
                '10': [2, 44, 0],
                '11': [2, 44, 0],
                '12': [2, 44, 0],
                '13': [2, 44, 0],
                '14': [2, 44, 0],
                '15': [2, 44, 0],
                '16': [2, 44, 0],
                '17': [2, 44, 0],
                '18': [2, 44, 0],
                '19': [2, 44, 0],
                '20': [2, 44, 0],
                '21': [2, 44, 0],
                '22': [2, 44, 0],
                '23': [2, 44, 0],
                '24': [2, 44, 0],
                '25': [2, 44, 0],
                '26': [2, 44, 0],
                '27': [2, 44, 0],
                '29': [2, 44, 0]
            },
            '17': {
                '8': [2, 46, 0],
                '9': [2, 46, 0],
                '10': [2, 46, 0],
                '11': [2, 46, 0],
                '12': [2, 46, 0],
                '13': [2, 46, 0],
                '14': [2, 46, 0],
                '15': [2, 46, 0],
                '16': [2, 46, 0],
                '17': [2, 46, 0],
                '18': [2, 46, 0],
                '19': [2, 46, 0],
                '20': [2, 46, 0],
                '21': [2, 46, 0],
                '22': [2, 46, 0],
                '23': [2, 46, 0],
                '24': [2, 46, 0],
                '25': [2, 46, 0],
                '26': [2, 46, 0],
                '27': [2, 46, 0],
                '29': [2, 46, 0]
            },
            '18': {
                '8': [2, 45, 0],
                '9': [2, 45, 0],
                '10': [2, 45, 0],
                '11': [2, 45, 0],
                '12': [2, 45, 0],
                '13': [2, 45, 0],
                '14': [2, 45, 0],
                '15': [2, 45, 0],
                '16': [2, 45, 0],
                '17': [2, 45, 0],
                '18': [2, 45, 0],
                '19': [2, 45, 0],
                '20': [2, 45, 0],
                '21': [2, 45, 0],
                '22': [2, 45, 0],
                '23': [2, 45, 0],
                '24': [2, 45, 0],
                '25': [2, 45, 0],
                '26': [2, 45, 0],
                '27': [2, 45, 0],
                '29': [2, 45, 0]
            },
            '19': {
                '8': [1, 0, 48]
            },
            '20': {
                '8': [2, 47, 0],
                '9': [1, 0, 14],
                '11': [2, 47, 0],
                '12': [2, 47, 0],
                '13': [2, 47, 0],
                '14': [2, 47, 0],
                '15': [2, 47, 0],
                '16': [2, 47, 0],
                '17': [2, 47, 0],
                '18': [2, 47, 0],
                '19': [2, 47, 0],
                '20': [2, 47, 0],
                '21': [2, 47, 0],
                '22': [2, 47, 0],
                '23': [2, 47, 0],
                '24': [1, 0, 15],
                '25': [1, 0, 16],
                '26': [1, 0, 17],
                '27': [1, 0, 18],
                '29': [1, 0, 37]
            },
            '21': {
                '8': [1, 0, 49]
            },
            '22': {
                '8': [2, 22, 0],
                '9': [2, 22, 0],
                '10': [2, 22, 0],
                '11': [1, 0, 50],
                '24': [2, 22, 0],
                '25': [2, 22, 0],
                '26': [2, 22, 0],
                '27': [2, 22, 0],
                '29': [2, 22, 0]
            },
            '23': {
                '8': [2, 23, 0],
                '9': [2, 23, 0],
                '10': [2, 23, 0],
                '11': [2, 23, 0],
                '12': [1, 0, 51],
                '24': [2, 23, 0],
                '25': [2, 23, 0],
                '26': [2, 23, 0],
                '27': [2, 23, 0],
                '29': [2, 23, 0]
            },
            '24': {
                '8': [2, 25, 0],
                '9': [2, 25, 0],
                '10': [2, 25, 0],
                '11': [2, 25, 0],
                '12': [2, 25, 0],
                '13': [1, 0, 52],
                '14': [1, 0, 53],
                '24': [2, 25, 0],
                '25': [2, 25, 0],
                '26': [2, 25, 0],
                '27': [2, 25, 0],
                '29': [2, 25, 0]
            },
            '25': {
                '8': [2, 27, 0],
                '9': [2, 27, 0],
                '10': [2, 27, 0],
                '11': [2, 27, 0],
                '12': [2, 27, 0],
                '13': [2, 27, 0],
                '14': [2, 27, 0],
                '15': [1, 0, 54],
                '16': [1, 0, 55],
                '17': [1, 0, 56],
                '18': [1, 0, 57],
                '24': [2, 27, 0],
                '25': [2, 27, 0],
                '26': [2, 27, 0],
                '27': [2, 27, 0],
                '29': [2, 27, 0]
            },
            '26': {
                '8': [2, 30, 0],
                '9': [2, 30, 0],
                '10': [2, 30, 0],
                '11': [2, 30, 0],
                '12': [2, 30, 0],
                '13': [2, 30, 0],
                '14': [2, 30, 0],
                '15': [2, 30, 0],
                '16': [2, 30, 0],
                '17': [2, 30, 0],
                '18': [2, 30, 0],
                '19': [1, 0, 58],
                '20': [1, 0, 59],
                '24': [2, 30, 0],
                '25': [2, 30, 0],
                '26': [2, 30, 0],
                '27': [2, 30, 0],
                '29': [2, 30, 0]
            },
            '27': {
                '8': [2, 35, 0],
                '9': [2, 35, 0],
                '10': [2, 35, 0],
                '11': [2, 35, 0],
                '12': [2, 35, 0],
                '13': [2, 35, 0],
                '14': [2, 35, 0],
                '15': [2, 35, 0],
                '16': [2, 35, 0],
                '17': [2, 35, 0],
                '18': [2, 35, 0],
                '19': [2, 35, 0],
                '20': [2, 35, 0],
                '21': [1, 0, 60],
                '22': [1, 0, 61],
                '23': [1, 0, 62],
                '24': [2, 35, 0],
                '25': [2, 35, 0],
                '26': [2, 35, 0],
                '27': [2, 35, 0],
                '29': [2, 35, 0]
            },
            '28': {
                '8': [2, 38, 0],
                '9': [2, 38, 0],
                '10': [2, 38, 0],
                '11': [2, 38, 0],
                '12': [2, 38, 0],
                '13': [2, 38, 0],
                '14': [2, 38, 0],
                '15': [2, 38, 0],
                '16': [2, 38, 0],
                '17': [2, 38, 0],
                '18': [2, 38, 0],
                '19': [2, 38, 0],
                '20': [2, 38, 0],
                '21': [2, 38, 0],
                '22': [2, 38, 0],
                '23': [2, 38, 0],
                '24': [2, 38, 0],
                '25': [2, 38, 0],
                '26': [2, 38, 0],
                '27': [2, 38, 0],
                '29': [2, 38, 0]
            },
            '29': {
                '8': [2, 43, 0],
                '9': [2, 43, 0],
                '10': [2, 43, 0],
                '11': [2, 43, 0],
                '12': [2, 43, 0],
                '13': [2, 43, 0],
                '14': [2, 43, 0],
                '15': [2, 43, 0],
                '16': [2, 43, 0],
                '17': [2, 43, 0],
                '18': [2, 43, 0],
                '19': [2, 43, 0],
                '20': [2, 43, 0],
                '21': [2, 43, 0],
                '22': [2, 43, 0],
                '23': [2, 43, 0],
                '24': [2, 43, 0],
                '25': [2, 43, 0],
                '26': [2, 43, 0],
                '27': [2, 43, 0],
                '29': [2, 43, 0]
            },
            '30': {
                '8': [1, 0, 63]
            },
            '31': {
                '8': [1, 0, 64]
            },
            '32': {
                '8': [1, 0, 65]
            },
            '33': {
                '2': [1, 0, 1],
                '3': [1, 0, 2],
                '6': [1, 0, 3],
                '7': [1, 0, 4]
            },
            '34': {
                '1': [2, 4, 0],
                '2': [2, 4, 0],
                '3': [2, 4, 0],
                '4': [2, 4, 0],
                '5': [2, 4, 0],
                '6': [2, 4, 0],
                '7': [2, 4, 0]
            },
            '35': {
                '4': [1, 0, 67]
            },
            '36': {
                '2': [2, 8, 0],
                '3': [2, 8, 0],
                '6': [2, 8, 0],
                '7': [2, 8, 0]
            },
            '37': {
                '8': [2, 56, 0],
                '9': [2, 56, 0],
                '11': [2, 56, 0],
                '12': [2, 56, 0],
                '13': [2, 56, 0],
                '14': [2, 56, 0],
                '15': [2, 56, 0],
                '16': [2, 56, 0],
                '17': [2, 56, 0],
                '18': [2, 56, 0],
                '19': [2, 56, 0],
                '20': [2, 56, 0],
                '21': [2, 56, 0],
                '22': [2, 56, 0],
                '23': [2, 56, 0],
                '24': [2, 56, 0],
                '25': [2, 56, 0],
                '26': [2, 56, 0],
                '27': [2, 56, 0],
                '28': [1, 0, 69],
                '29': [2, 56, 0],
                '30': [2, 56, 0]
            },
            '38': {
                '8': [2, 47, 0],
                '9': [2, 47, 0],
                '10': [2, 47, 0],
                '11': [2, 47, 0],
                '12': [2, 47, 0],
                '13': [2, 47, 0],
                '14': [2, 47, 0],
                '15': [2, 47, 0],
                '16': [2, 47, 0],
                '17': [2, 47, 0],
                '18': [2, 47, 0],
                '19': [2, 47, 0],
                '20': [2, 47, 0],
                '21': [2, 47, 0],
                '22': [2, 47, 0],
                '23': [2, 47, 0],
                '24': [2, 47, 0],
                '25': [2, 47, 0],
                '26': [2, 47, 0],
                '27': [2, 47, 0],
                '29': [2, 47, 0]
            },
            '39': {
                '8': [2, 21, 0],
                '9': [2, 21, 0],
                '24': [2, 21, 0],
                '25': [2, 21, 0],
                '26': [2, 21, 0],
                '27': [2, 21, 0],
                '29': [2, 21, 0]
            },
            '40': {
                '8': [2, 16, 0],
                '9': [1, 0, 14],
                '24': [1, 0, 15],
                '25': [1, 0, 16],
                '26': [1, 0, 17],
                '27': [1, 0, 18],
                '29': [1, 0, 37]
            },
            '41': {
                '8': [2, 17, 0]
            },
            '42': {
                '8': [2, 20, 0],
                '9': [2, 20, 0],
                '24': [2, 20, 0],
                '25': [2, 20, 0],
                '26': [2, 20, 0],
                '27': [2, 20, 0],
                '29': [2, 20, 0]
            },
            '43': {
                '8': [2, 49, 0],
                '29': [1, 0, 72]
            },
            '44': {
                '8': [2, 51, 0],
                '29': [2, 51, 0]
            },
            '45': {
                '27': [1, 0, 74],
                '29': [1, 0, 75]
            },
            '46': {
                '10': [1, 0, 76]
            },
            '47': {
                '8': [2, 42, 0],
                '9': [2, 42, 0],
                '10': [2, 42, 0],
                '11': [2, 42, 0],
                '12': [2, 42, 0],
                '13': [2, 42, 0],
                '14': [2, 42, 0],
                '15': [2, 42, 0],
                '16': [2, 42, 0],
                '17': [2, 42, 0],
                '18': [2, 42, 0],
                '19': [2, 42, 0],
                '20': [2, 42, 0],
                '21': [2, 42, 0],
                '22': [2, 42, 0],
                '23': [2, 42, 0],
                '24': [2, 42, 0],
                '25': [2, 42, 0],
                '26': [2, 42, 0],
                '27': [2, 42, 0],
                '29': [2, 42, 0]
            },
            '48': {
                '1': [2, 11, 0],
                '2': [2, 11, 0],
                '3': [2, 11, 0],
                '4': [2, 11, 0],
                '5': [2, 11, 0],
                '6': [2, 11, 0],
                '7': [2, 11, 0]
            },
            '49': {
                '1': [2, 13, 0],
                '2': [2, 13, 0],
                '3': [2, 13, 0],
                '4': [2, 13, 0],
                '5': [2, 13, 0],
                '6': [2, 13, 0],
                '7': [2, 13, 0]
            },
            '50': {
                '9': [1, 0, 14],
                '24': [1, 0, 15],
                '25': [1, 0, 16],
                '26': [1, 0, 17],
                '27': [1, 0, 18],
                '29': [1, 0, 10]
            },
            '51': {
                '9': [1, 0, 14],
                '24': [1, 0, 15],
                '25': [1, 0, 16],
                '26': [1, 0, 17],
                '27': [1, 0, 18],
                '29': [1, 0, 10]
            },
            '52': {
                '9': [1, 0, 14],
                '24': [1, 0, 15],
                '25': [1, 0, 16],
                '26': [1, 0, 17],
                '27': [1, 0, 18],
                '29': [1, 0, 10]
            },
            '53': {
                '9': [1, 0, 14],
                '24': [1, 0, 15],
                '25': [1, 0, 16],
                '26': [1, 0, 17],
                '27': [1, 0, 18],
                '29': [1, 0, 10]
            },
            '54': {
                '9': [1, 0, 14],
                '24': [1, 0, 15],
                '25': [1, 0, 16],
                '26': [1, 0, 17],
                '27': [1, 0, 18],
                '29': [1, 0, 10]
            },
            '55': {
                '9': [1, 0, 14],
                '24': [1, 0, 15],
                '25': [1, 0, 16],
                '26': [1, 0, 17],
                '27': [1, 0, 18],
                '29': [1, 0, 10]
            },
            '56': {
                '9': [1, 0, 14],
                '24': [1, 0, 15],
                '25': [1, 0, 16],
                '26': [1, 0, 17],
                '27': [1, 0, 18],
                '29': [1, 0, 10]
            },
            '57': {
                '9': [1, 0, 14],
                '24': [1, 0, 15],
                '25': [1, 0, 16],
                '26': [1, 0, 17],
                '27': [1, 0, 18],
                '29': [1, 0, 10]
            },
            '58': {
                '9': [1, 0, 14],
                '24': [1, 0, 15],
                '25': [1, 0, 16],
                '26': [1, 0, 17],
                '27': [1, 0, 18],
                '29': [1, 0, 10]
            },
            '59': {
                '9': [1, 0, 14],
                '24': [1, 0, 15],
                '25': [1, 0, 16],
                '26': [1, 0, 17],
                '27': [1, 0, 18],
                '29': [1, 0, 10]
            },
            '60': {
                '9': [1, 0, 14],
                '24': [1, 0, 15],
                '25': [1, 0, 16],
                '26': [1, 0, 17],
                '27': [1, 0, 18],
                '29': [1, 0, 10]
            },
            '61': {
                '9': [1, 0, 14],
                '24': [1, 0, 15],
                '25': [1, 0, 16],
                '26': [1, 0, 17],
                '27': [1, 0, 18],
                '29': [1, 0, 10]
            },
            '62': {
                '9': [1, 0, 14],
                '24': [1, 0, 15],
                '25': [1, 0, 16],
                '26': [1, 0, 17],
                '27': [1, 0, 18],
                '29': [1, 0, 10]
            },
            '63': {
                '1': [2, 10, 0],
                '2': [2, 10, 0],
                '3': [2, 10, 0],
                '4': [2, 10, 0],
                '5': [2, 10, 0],
                '6': [2, 10, 0],
                '7': [2, 10, 0]
            },
            '64': {
                '1': [2, 12, 0],
                '2': [2, 12, 0],
                '3': [2, 12, 0],
                '4': [2, 12, 0],
                '5': [2, 12, 0],
                '6': [2, 12, 0],
                '7': [2, 12, 0]
            },
            '65': {
                '2': [2, 14, 0],
                '3': [2, 14, 0],
                '6': [2, 14, 0],
                '7': [2, 14, 0]
            },
            '66': {
                '1': [2, 1, 0],
                '2': [1, 0, 1],
                '3': [1, 0, 2],
                '4': [2, 1, 0],
                '6': [1, 0, 3],
                '7': [1, 0, 4]
            },
            '67': {
                '29': [1, 0, 10]
            },
            '68': {
                '1': [2, 5, 0],
                '2': [2, 5, 0],
                '3': [2, 5, 0],
                '4': [2, 5, 0],
                '5': [2, 5, 0],
                '6': [2, 5, 0],
                '7': [2, 5, 0]
            },
            '69': {
                '9': [1, 0, 14],
                '24': [1, 0, 15],
                '25': [1, 0, 16],
                '26': [1, 0, 17],
                '27': [1, 0, 18],
                '29': [1, 0, 10]
            },
            '70': {
                '8': [2, 15, 0]
            },
            '71': {
                '8': [2, 19, 0],
                '9': [2, 19, 0],
                '24': [2, 19, 0],
                '25': [2, 19, 0],
                '26': [2, 19, 0],
                '27': [2, 19, 0],
                '29': [2, 19, 0]
            },
            '72': {
                '28': [1, 0, 69]
            },
            '73': {
                '8': [2, 50, 0],
                '29': [2, 50, 0]
            },
            '74': {
                '8': [2, 55, 0],
                '9': [2, 55, 0],
                '10': [2, 55, 0],
                '11': [2, 55, 0],
                '12': [2, 55, 0],
                '13': [2, 55, 0],
                '14': [2, 55, 0],
                '15': [2, 55, 0],
                '16': [2, 55, 0],
                '17': [2, 55, 0],
                '18': [2, 55, 0],
                '19': [2, 55, 0],
                '20': [2, 55, 0],
                '21': [2, 55, 0],
                '22': [2, 55, 0],
                '23': [2, 55, 0],
                '24': [2, 55, 0],
                '25': [2, 55, 0],
                '26': [2, 55, 0],
                '27': [2, 55, 0],
                '29': [2, 55, 0],
                '30': [2, 55, 0]
            },
            '75': {
                '8': [2, 54, 0],
                '9': [2, 54, 0],
                '10': [2, 54, 0],
                '11': [2, 54, 0],
                '12': [2, 54, 0],
                '13': [2, 54, 0],
                '14': [2, 54, 0],
                '15': [2, 54, 0],
                '16': [2, 54, 0],
                '17': [2, 54, 0],
                '18': [2, 54, 0],
                '19': [2, 54, 0],
                '20': [2, 54, 0],
                '21': [2, 54, 0],
                '22': [2, 54, 0],
                '23': [2, 54, 0],
                '24': [2, 54, 0],
                '25': [2, 54, 0],
                '26': [2, 54, 0],
                '27': [2, 54, 0],
                '29': [2, 54, 0],
                '30': [2, 54, 0]
            },
            '76': {
                '8': [2, 48, 0],
                '9': [2, 48, 0],
                '10': [2, 48, 0],
                '11': [2, 48, 0],
                '12': [2, 48, 0],
                '13': [2, 48, 0],
                '14': [2, 48, 0],
                '15': [2, 48, 0],
                '16': [2, 48, 0],
                '17': [2, 48, 0],
                '18': [2, 48, 0],
                '19': [2, 48, 0],
                '20': [2, 48, 0],
                '21': [2, 48, 0],
                '22': [2, 48, 0],
                '23': [2, 48, 0],
                '24': [2, 48, 0],
                '25': [2, 48, 0],
                '26': [2, 48, 0],
                '27': [2, 48, 0],
                '29': [2, 48, 0]
            },
            '77': {
                '8': [2, 24, 0],
                '9': [2, 24, 0],
                '10': [2, 24, 0],
                '11': [2, 24, 0],
                '12': [1, 0, 51],
                '24': [2, 24, 0],
                '25': [2, 24, 0],
                '26': [2, 24, 0],
                '27': [2, 24, 0],
                '29': [2, 24, 0]
            },
            '78': {
                '8': [2, 26, 0],
                '9': [2, 26, 0],
                '10': [2, 26, 0],
                '11': [2, 26, 0],
                '12': [2, 26, 0],
                '13': [1, 0, 52],
                '14': [1, 0, 53],
                '24': [2, 26, 0],
                '25': [2, 26, 0],
                '26': [2, 26, 0],
                '27': [2, 26, 0],
                '29': [2, 26, 0]
            },
            '79': {
                '8': [2, 28, 0],
                '9': [2, 28, 0],
                '10': [2, 28, 0],
                '11': [2, 28, 0],
                '12': [2, 28, 0],
                '13': [2, 28, 0],
                '14': [2, 28, 0],
                '15': [1, 0, 54],
                '16': [1, 0, 55],
                '17': [1, 0, 56],
                '18': [1, 0, 57],
                '24': [2, 28, 0],
                '25': [2, 28, 0],
                '26': [2, 28, 0],
                '27': [2, 28, 0],
                '29': [2, 28, 0]
            },
            '80': {
                '8': [2, 29, 0],
                '9': [2, 29, 0],
                '10': [2, 29, 0],
                '11': [2, 29, 0],
                '12': [2, 29, 0],
                '13': [2, 29, 0],
                '14': [2, 29, 0],
                '15': [1, 0, 54],
                '16': [1, 0, 55],
                '17': [1, 0, 56],
                '18': [1, 0, 57],
                '24': [2, 29, 0],
                '25': [2, 29, 0],
                '26': [2, 29, 0],
                '27': [2, 29, 0],
                '29': [2, 29, 0]
            },
            '81': {
                '8': [2, 32, 0],
                '9': [2, 32, 0],
                '10': [2, 32, 0],
                '11': [2, 32, 0],
                '12': [2, 32, 0],
                '13': [2, 32, 0],
                '14': [2, 32, 0],
                '15': [2, 32, 0],
                '16': [2, 32, 0],
                '17': [2, 32, 0],
                '18': [2, 32, 0],
                '19': [1, 0, 58],
                '20': [1, 0, 59],
                '24': [2, 32, 0],
                '25': [2, 32, 0],
                '26': [2, 32, 0],
                '27': [2, 32, 0],
                '29': [2, 32, 0]
            },
            '82': {
                '8': [2, 34, 0],
                '9': [2, 34, 0],
                '10': [2, 34, 0],
                '11': [2, 34, 0],
                '12': [2, 34, 0],
                '13': [2, 34, 0],
                '14': [2, 34, 0],
                '15': [2, 34, 0],
                '16': [2, 34, 0],
                '17': [2, 34, 0],
                '18': [2, 34, 0],
                '19': [1, 0, 58],
                '20': [1, 0, 59],
                '24': [2, 34, 0],
                '25': [2, 34, 0],
                '26': [2, 34, 0],
                '27': [2, 34, 0],
                '29': [2, 34, 0]
            },
            '83': {
                '8': [2, 31, 0],
                '9': [2, 31, 0],
                '10': [2, 31, 0],
                '11': [2, 31, 0],
                '12': [2, 31, 0],
                '13': [2, 31, 0],
                '14': [2, 31, 0],
                '15': [2, 31, 0],
                '16': [2, 31, 0],
                '17': [2, 31, 0],
                '18': [2, 31, 0],
                '19': [1, 0, 58],
                '20': [1, 0, 59],
                '24': [2, 31, 0],
                '25': [2, 31, 0],
                '26': [2, 31, 0],
                '27': [2, 31, 0],
                '29': [2, 31, 0]
            },
            '84': {
                '8': [2, 33, 0],
                '9': [2, 33, 0],
                '10': [2, 33, 0],
                '11': [2, 33, 0],
                '12': [2, 33, 0],
                '13': [2, 33, 0],
                '14': [2, 33, 0],
                '15': [2, 33, 0],
                '16': [2, 33, 0],
                '17': [2, 33, 0],
                '18': [2, 33, 0],
                '19': [1, 0, 58],
                '20': [1, 0, 59],
                '24': [2, 33, 0],
                '25': [2, 33, 0],
                '26': [2, 33, 0],
                '27': [2, 33, 0],
                '29': [2, 33, 0]
            },
            '85': {
                '8': [2, 36, 0],
                '9': [2, 36, 0],
                '10': [2, 36, 0],
                '11': [2, 36, 0],
                '12': [2, 36, 0],
                '13': [2, 36, 0],
                '14': [2, 36, 0],
                '15': [2, 36, 0],
                '16': [2, 36, 0],
                '17': [2, 36, 0],
                '18': [2, 36, 0],
                '19': [2, 36, 0],
                '20': [2, 36, 0],
                '21': [1, 0, 60],
                '22': [1, 0, 61],
                '23': [1, 0, 62],
                '24': [2, 36, 0],
                '25': [2, 36, 0],
                '26': [2, 36, 0],
                '27': [2, 36, 0],
                '29': [2, 36, 0]
            },
            '86': {
                '8': [2, 37, 0],
                '9': [2, 37, 0],
                '10': [2, 37, 0],
                '11': [2, 37, 0],
                '12': [2, 37, 0],
                '13': [2, 37, 0],
                '14': [2, 37, 0],
                '15': [2, 37, 0],
                '16': [2, 37, 0],
                '17': [2, 37, 0],
                '18': [2, 37, 0],
                '19': [2, 37, 0],
                '20': [2, 37, 0],
                '21': [1, 0, 60],
                '22': [1, 0, 61],
                '23': [1, 0, 62],
                '24': [2, 37, 0],
                '25': [2, 37, 0],
                '26': [2, 37, 0],
                '27': [2, 37, 0],
                '29': [2, 37, 0]
            },
            '87': {
                '8': [2, 39, 0],
                '9': [2, 39, 0],
                '10': [2, 39, 0],
                '11': [2, 39, 0],
                '12': [2, 39, 0],
                '13': [2, 39, 0],
                '14': [2, 39, 0],
                '15': [2, 39, 0],
                '16': [2, 39, 0],
                '17': [2, 39, 0],
                '18': [2, 39, 0],
                '19': [2, 39, 0],
                '20': [2, 39, 0],
                '21': [2, 39, 0],
                '22': [2, 39, 0],
                '23': [2, 39, 0],
                '24': [2, 39, 0],
                '25': [2, 39, 0],
                '26': [2, 39, 0],
                '27': [2, 39, 0],
                '29': [2, 39, 0]
            },
            '88': {
                '8': [2, 40, 0],
                '9': [2, 40, 0],
                '10': [2, 40, 0],
                '11': [2, 40, 0],
                '12': [2, 40, 0],
                '13': [2, 40, 0],
                '14': [2, 40, 0],
                '15': [2, 40, 0],
                '16': [2, 40, 0],
                '17': [2, 40, 0],
                '18': [2, 40, 0],
                '19': [2, 40, 0],
                '20': [2, 40, 0],
                '21': [2, 40, 0],
                '22': [2, 40, 0],
                '23': [2, 40, 0],
                '24': [2, 40, 0],
                '25': [2, 40, 0],
                '26': [2, 40, 0],
                '27': [2, 40, 0],
                '29': [2, 40, 0]
            },
            '89': {
                '8': [2, 41, 0],
                '9': [2, 41, 0],
                '10': [2, 41, 0],
                '11': [2, 41, 0],
                '12': [2, 41, 0],
                '13': [2, 41, 0],
                '14': [2, 41, 0],
                '15': [2, 41, 0],
                '16': [2, 41, 0],
                '17': [2, 41, 0],
                '18': [2, 41, 0],
                '19': [2, 41, 0],
                '20': [2, 41, 0],
                '21': [2, 41, 0],
                '22': [2, 41, 0],
                '23': [2, 41, 0],
                '24': [2, 41, 0],
                '25': [2, 41, 0],
                '26': [2, 41, 0],
                '27': [2, 41, 0],
                '29': [2, 41, 0]
            },
            '90': {
                '8': [1, 0, 92]
            },
            '91': {
                '8': [2, 52, 0],
                '29': [2, 52, 0]
            },
            '92': {
                '1': [2, 9, 0],
                '2': [2, 9, 0],
                '3': [2, 9, 0],
                '4': [2, 9, 0],
                '5': [2, 9, 0],
                '6': [2, 9, 0],
                '7': [2, 9, 0]
            }
        }
    };
    parser.parse = function parse(input) {

        var self = this,
            lexer = self.lexer,
            state,
            symbol,
            action,
            table = self.table,
            gotos = table.gotos,
            tableAction = table.action,
            productions = self.productions,
            valueStack = [null],
            stack = [0];

        lexer.resetInput(input);

        while (1) {
            // retrieve state number from top of stack
            state = stack[stack.length - 1];

            if (!symbol) {
                symbol = lexer.lex();
            }

            if (!symbol) {
                S.log("it is not a valid input : " + input, "error");
                return false;
            }

            // read action for current state and first input
            action = tableAction[state] && tableAction[state][symbol];

            if (!action) {
                var expected = [];
                if (tableAction[state]) {
                    S.each(tableAction[state], function (_, symbol) {
                        expected.push(symbol);
                    });
                }
                S.error("parse error at line " + lexer.lineNumber + ":\n" + lexer.showDebugInfo() + "\n" + "expect " + expected.join(", "));
                return false;
            }

            switch (action[GrammarConst.TYPE_INDEX]) {

            case GrammarConst.SHIFT_TYPE:

                stack.push(symbol);

                valueStack.push(lexer.text);

                // push state
                stack.push(action[GrammarConst.TO_INDEX]);

                // allow to read more
                symbol = null;

                break;

            case GrammarConst.REDUCE_TYPE:

                var production = productions[action[GrammarConst.PRODUCTION_INDEX]],
                    reducedSymbol = production.symbol || production[0],
                    reducedAction = production.action || production[2],
                    reducedRhs = production.rhs || production[1];

                var len = reducedRhs.length;

                var $$ = valueStack[valueStack.length - len]; // default to $$ = $1

                self.$$ = $$;

                for (var i = 0; i < len; i++) {
                    self["$" + (len - i)] = valueStack[valueStack.length - 1 - i];
                }

                var ret;

                if (reducedAction) {
                    ret = reducedAction.call(self);
                }

                if (ret !== undefined) {
                    $$ = ret;
                } else {
                    $$ = self.$$;
                }

                if (len) {
                    stack = stack.slice(0, - 1 * len * 2);
                    valueStack = valueStack.slice(0, - 1 * len);
                }

                stack.push(reducedSymbol);

                valueStack.push($$);

                var newState = gotos[stack[stack.length - 2]][stack[stack.length - 1]];

                stack.push(newState);

                break;

            case GrammarConst.ACCEPT_TYPE:

                return $$;
            }

        }

        return undefined;

    };
    return parser;;
});
