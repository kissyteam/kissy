/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Sep 26 22:21
*/
/**
 * Ast node class for xtemplate
 * @author yiminghe@gmail.com
 */
KISSY.add("xtemplate/ast", function (S) {

    var ast = {};

    ast.ProgramNode = function (lineNumber, statements, inverse) {
        this.lineNumber = lineNumber;
        this.statements = statements;
        this.inverse = inverse;
    };

    ast.ProgramNode.prototype.type = 'program';

    ast.BlockNode = function (lineNumber, tpl, program, close) {
        var closeParts = close['parts'];
        // 开始没有结束
        if (!S.equals(tpl.path['parts'], closeParts)) {
            throw new Error("parse error at line " +
                lineNumber +
                ":\n" + "expect {{/" +
                tpl.path['parts'] +
                "}} not {{/" +
                closeParts + "}}");
        }
        this.lineNumber = lineNumber;
        this.tpl = tpl;
        this.program = program;
    };

    ast.BlockNode.prototype.type = 'block';

    ast.TplNode = function (lineNumber, path, params, hash) {
        this.lineNumber = lineNumber;
        this.path = path;
        this.params = params;
        this.hash = hash;
        this.escaped = true;
    };

    ast.TplNode.prototype.type = 'tpl';


    ast.TplExpressionNode = function (lineNumber, expression) {
        this.lineNumber = lineNumber;
        this.expression = expression;
        this.escaped = true;
    };

    ast.TplExpressionNode.prototype.type = 'tplExpression';

    ast.ContentNode = function (lineNumber, value) {
        this.lineNumber = lineNumber;
        this.value = value;
    };

    ast.ContentNode.prototype.type = 'content';

    ast.UnaryExpression = function (v) {
        this.value = v;
    };

    ast.UnaryExpression.prototype.type = 'unaryExpression';

    ast.MultiplicativeExpression = function (op1, opType, op2) {
        this.op1 = op1;
        this.opType = opType;
        this.op2 = op2;
    };

    ast.MultiplicativeExpression.prototype.type = 'multiplicativeExpression';

    ast.AdditiveExpression = function (op1, opType, op2) {
        this.op1 = op1;
        this.opType = opType;
        this.op2 = op2;
    };

    ast.AdditiveExpression.prototype.type = 'additiveExpression';

    ast.RelationalExpression = function (op1, opType, op2) {
        this.op1 = op1;
        this.opType = opType;
        this.op2 = op2;
    };

    ast.RelationalExpression.prototype.type = 'relationalExpression';

    ast.EqualityExpression = function (op1, opType, op2) {
        this.op1 = op1;
        this.opType = opType;
        this.op2 = op2;
    };

    ast.EqualityExpression.prototype.type = 'equalityExpression';

    ast.ConditionalAndExpression = function (op1, op2) {
        this.op1 = op1;
        this.op2 = op2;
    };

    ast.ConditionalAndExpression.prototype.type = 'conditionalAndExpression';

    ast.ConditionalOrExpression = function (op1, op2) {
        this.op1 = op1;
        this.op2 = op2;
    };

    ast.ConditionalOrExpression.prototype.type = 'conditionalOrExpression';

    ast.StringNode = function (lineNumber, value) {
        this.lineNumber = lineNumber;
        this.value = value;
    };

    ast.StringNode.prototype.type = 'string';

    ast.NumberNode = function (lineNumber, value) {
        this.lineNumber = lineNumber;
        this.value = value;
    };

    ast.NumberNode.prototype.type = 'number';

    ast.BooleanNode = function (lineNumber, value) {
        this.lineNumber = lineNumber;
        this.value = value;
    };

    ast.BooleanNode.prototype.type = 'boolean';

    ast.HashNode = function (lineNumber, raw) {
        this.lineNumber = lineNumber;
        var value = {};
        S.each(raw, function (r) {
            value[r[0]] = r[1];
        });
        this.value = value;
    };

    ast.HashNode.prototype.type = 'hash';

    ast.IdNode = function (lineNumber, raw) {
        this.lineNumber = lineNumber;
        var parts = [], depth = 0;
        S.each(raw, function (p) {
            if (p == "..") {
                depth++;
            } else {
                parts.push(p);
            }
        });
        this.parts = parts;
        this.string = parts.join('.');
        this.depth = depth;
    };

    ast.IdNode.prototype.type = 'id';

    return ast;
});/**
 * setup xtemplate constructor
 * @author yiminghe@gmail.com
 */
KISSY.add('xtemplate/base', function (S, compiler) {

    var guid = 0;

    var cache = {};

    function XTemplate(tpl, option) {
        var self = this;
        // prevent messing up with velocity
        if (S.isString(tpl)) {
            tpl = tpl.replace(/\{\{@/g, '{{#');
        }
        self.tpl = tpl;
        option = option || {};
        self.subTpls = S.merge(option.subTpls, XTemplate.subTpls);
        self.commands = S.merge(option.commands, XTemplate.commands);
        this.option = option;
    }

    XTemplate.prototype = {
        constructor: XTemplate,
        removeSubTpl: function (subTplName) {
            delete this.subTpls[subTplName];
        },
        removeCommand: function (commandName) {
            delete this.commands[commandName];
        },
        addSubTpl: function (subTplName, def) {
            this.subTpls[subTplName] = def;
        },
        addCommand: function (commandName, fn) {
            this.commands[commandName] = fn;
        },
        compile: function () {
            var self = this, tpl = self.tpl, option = this.option;
            if (!self.compiled) {
                if (S.isFunction(tpl)) {
                } else {
                    var code = compiler.compile(tpl);
                    // eval is not ok for eval("(function(){})") ie
                    self.tpl = cache[tpl] ||
                        (cache[tpl] = Function.apply(null, []
                            .concat(code.params)
                            .concat(code.source.join('\n') + '//@ sourceURL=' +
                            (option.name ? option.name : ('xtemplate' + (guid++))) + '.js')));
                }
                self.compiled = 1;
            }
            return self.tpl;
        },
        render: function (data) {
            var self = this;
            self.compile();
            if (!S.isArray(data)) {
                data = [data];
            }
            return self.tpl(data, {
                commands: self.commands,
                subTpls: self.subTpls
            });
        }
    };

    XTemplate.compiler = compiler;

    return XTemplate;
}, {
    requires: ['./compiler']
});/**
 * native commands for xtemplate.
 * @author yiminghe@gmail.com
 */
KISSY.add("xtemplate/commands", function (S, XTemplate) {

    var commands = {
        'each': function (scopes, option) {
            var params = option.params;
            if (!params || params.length != 1) {
                throw new Error('each must has one param');
            }
            var param0 = params[0];
            var buffer = '';
            var xcount;
            var single;
            var singleRet;
            if (S.isArray(param0)) {
                var opScopes = [0].concat(scopes);
                xcount = param0.length;
                for (var xindex = 0; xindex < xcount; xindex++) {
                    var holder = {};
                    single = param0[xindex];
                    holder['this'] = single;
                    holder.xcount = xcount;
                    holder.xindex = xindex;
                    if (S.isObject(single)) {
                        S.mix(holder, single);
                    }
                    opScopes[0] = holder;
                    buffer += option.fn(opScopes);
                }
            } else {
                S.log(param0, 'error');
                throw new Error('each can only apply to array');
            }
            return buffer;
        },

        'with': function (scopes, option) {
            var params = option.params;
            if (!params || params.length != 1) {
                throw new Error('with must has one param');
            }
            var param0 = params[0];
            var opScopes = [0].concat(scopes);
            var buffer = '';
            if (S.isObject(param0)) {
                opScopes[0] = param0;
                buffer = option.fn(opScopes);
            } else {
                S.log(param0, 'error');
                throw new Error('with can only apply to object');
            }
            return buffer;
        },

        'if': function (scopes, option) {
            var params = option.params;
            if (!params || params.length != 1) {
                throw new Error('if must has one param');
            }
            var param0 = params[0];
            var buffer = '';
            if (param0) {
                buffer = option.fn(scopes);
            } else if (option.inverse) {
                buffer = option.inverse(scopes);
            }
            return buffer;
        },

        'set': function (scopes, option) {
            S.mix(scopes[0], option.hash);
            return '';
        },

        'include': function (scopes, option) {
            var params = option.params;
            if (!params || params.length != 1) {
                throw new Error('include must has one param');
            }
            var param0 = params[0], tpl;
            var subTpls = option.subTpls;
            if (!(tpl = subTpls[param0])) {
                throw new Error('does not include sub template "' + param0 + '"');
            }
            var XTemplate = S.require('xtemplate');
            return new XTemplate(tpl, {
                commands: option.commands,
                subTpls: option.subTpls
            }).render(scopes);
        }
    };

    return commands;

});/**
 * translate ast to js function code
 * @author yiminghe@gmail.com
 */
KISSY.add("xtemplate/compiler", function (S, parser, ast, commands) {

    parser.yy = ast;

    var arrayPush = [].push;

    function escapeString(str) {
        return str.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
    }

    function pushToArray(to, from) {
        arrayPush.apply(to, from);
    }

    function lastOfArray(arr) {
        return arr[arr.length - 1];
    }

    var getProperty = function (parts, from) {
        if (!from) {
            return false;
        }
        parts = parts.split('.');
        var len = parts.length, i, v = from;
        for (i = 0; i < len; i++) {
            if (!(parts[i] in v)) {
                return false;
            }
            v = v[parts[i]];
        }
        return [v];
    };

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

                var nativeCommands = '';

                for (var c in commands) {
                    nativeCommands += c + 'Command = commands["' + c + '"],';
                }

                source.push('commands = option.commands,' +
                    nativeCommands +
                    'subTpls=option.subTpls;');
                source.push('var getProperty=' + getProperty.toString() + ';');
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
            return ['buffer += "' + escapeString(contentNode.value.replace(/"/g, "\\")) + '";'];
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
    requires: ['./parser', './ast', './commands']
});/**
* parser for xtemplate from kison.
* @author yiminghe@gmail.com
*/
KISSY.add('xtemplate/parser', function () {
/* Generated by kison from KISSY */
var parser = {},
    S = KISSY,
    REDUCE_TYPE = 2,
    SHIFT_TYPE = 1,
    ACCEPT_TYPE = 0;

function Lexer(cfg) {

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
    this.rules = [];

    S.mix(this, cfg);

    S.each(this.rules, function (r) {
        if (!r.state) {
            r.state = Lexer.STATIC.INIT;
        }
    });

    /**
     * Input languages
     * @type {String}
     */

    this.resetInput(this.input);

}
Lexer.prototype = {
    "resetInput": function (input) {
        this.input = input;
        S.mix(this, {
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
    "getCurrentRules": function () {
        var currentState = this.stateStack[this.stateStack.length - 1];
        var rules = [];
        S.each(this.rules, function (r) {
            if (r.state == currentState) {
                rules.push(r);
            }
        });
        return rules;
    },
    "pushState": function (state) {
        this.stateStack.push(state);
    },
    "popState": function () {
        this.stateStack.pop();
    },
    "showDebugInfo": function () {
        var DEBUG_CONTEXT_LIMIT = Lexer.STATIC.DEBUG_CONTEXT_LIMIT;
        var matched = this.matched,
            match = this.match,
            input = this.input;
        matched = matched.slice(0, matched.length - match.length);
        var past = (matched.length > DEBUG_CONTEXT_LIMIT ? "..." : "") + matched.slice(-DEBUG_CONTEXT_LIMIT).replace(/\n/, " ");
        var next = match + input;
        next = next.slice(0, DEBUG_CONTEXT_LIMIT) + (next.length > DEBUG_CONTEXT_LIMIT ? "..." : "");
        return past + next + "\n" + new Array(past.length + 1).join("-") + "^";
    },
    "lex": function () {
        var self = this,
            input = self.input,
            i, rule, m, ret, lines, rules = self.getCurrentRules();

        self.match = self.text = "";

        if (!S.trim(input)) {
            return Lexer.STATIC.END_TAG;
        }

        for (i = 0; i < rules.length; i++) {
            rule = rules[i];
            if (m = input.match(rule.regexp)) {
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
                ret = rule.action && rule.action.call(this);
                if (ret == undefined) {
                    ret = rule.token;
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

        S.error("lex error at line " + this.lineNumber + ":\n" + this.showDebugInfo());
    }
};
Lexer.STATIC = {
    "INIT": "init6",
    "DEBUG_CONTEXT_LIMIT": 20,
    "END_TAG": "$EOF"
};
var lexer = new Lexer({
    "rules": [{
        "regexp": /^[\s\S]*?(?={{)/,
        "action": function () {
            if (this.text.slice(-1) !== '\\') {
                this.pushState('t');
            } else {
                this.text = this.text.slice(0, -1);
                this.pushState('et');
            }
            // only return when has content
            if (this.text) {
                return 'CONTENT';
            }
        },
        "state": "init6"
    }, {
        "regexp": /^[\s\S]+/,
        "token": "CONTENT",
        "state": "init6"
    }, {
        "state": "et",
        "token": "CONTENT",
        "regexp": /^[\s\S]{2,}?(?:(?={{)|$)/,
        "action": function () {
            this.popState();
        }
    }, {
        "state": "t",
        "regexp": /^{{#/,
        "token": "OPEN_BLOCK"
    }, {
        "state": "t",
        "regexp": /^{{\//,
        "token": "OPEN_END_BLOCK"
    }, {
        "state": "t",
        "regexp": /^{{\s*else/,
        "token": "OPEN_INVERSE"
    }, {
        "state": "t",
        "regexp": /^{{{/,
        "token": "OPEN_UN_ESCAPED"
    }, {
        "state": "t",
        "regexp": /^{{![\s\S]*?}}/,
        "action": function () {
            // return to content mode
            this.popState();
        }
    }, {
        "state": "t",
        "regexp": /^{{/,
        "token": "OPEN"
    }, {
        "state": "t",
        "regexp": /^\s+/
    }, {
        "state": "t",
        "regexp": /^}}}/,
        "action": function () {
            this.popState();
        },
        "token": "CLOSE"
    }, {
        "state": "t",
        "regexp": /^}}/,
        "action": function () {
            this.popState();
        },
        "token": "CLOSE"
    }, {
        "state": "t",
        "regexp": /^\(/,
        "token": "LPAREN"
    }, {
        "state": "t",
        "regexp": /^\)/,
        "token": "RPAREN"
    }, {
        "state": "t",
        "regexp": /^\|\|/,
        "token": "OR"
    }, {
        "state": "t",
        "regexp": /^&&/,
        "token": "AND"
    }, {
        "state": "t",
        "regexp": /^===/,
        "token": "LOGIC_EQUALS"
    }, {
        "state": "t",
        "regexp": /^!==/,
        "token": "LOGIC_NOT_EQUALS"
    }, {
        "state": "t",
        "regexp": /^>/,
        "token": "GT"
    }, {
        "state": "t",
        "regexp": /^>=/,
        "token": "GE"
    }, {
        "state": "t",
        "regexp": /^</,
        "token": "LT"
    }, {
        "state": "t",
        "regexp": /^<=/,
        "token": "LE"
    }, {
        "state": "t",
        "regexp": /^\+/,
        "token": "PLUS"
    }, {
        "state": "t",
        "regexp": /^-/,
        "token": "MINUS"
    }, {
        "state": "t",
        "regexp": /^\*/,
        "token": "MULTIPLY"
    }, {
        "state": "t",
        "regexp": /^\//,
        "token": "DIVIDE"
    }, {
        "state": "t",
        "regexp": /^%/,
        "token": "MODULUS"
    }, {
        "state": "t",
        "regexp": /^!/,
        "token": "NOT"
    }, {
        "state": "t",
        "regexp": /^"(\\"|[^"])*"/,
        "action": function () {
            this.text = this.text.slice(1, -1).replace(/\\"/g, '"');
        },
        "token": "STRING"
    }, {
        "state": "t",
        "regexp": /^'(\\'|[^'])*'/,
        "action": function () {
            this.text = this.text.slice(1, -1).replace(/\\'/g, "'");
        },
        "token": "STRING"
    }, {
        "state": "t",
        "regexp": /^true/,
        "token": "BOOLEAN"
    }, {
        "state": "t",
        "regexp": /^false/,
        "token": "BOOLEAN"
    }, {
        "state": "t",
        "regexp": /^\d+(?:\.\d+)?(?:e-?\d+)?/i,
        "token": "NUMBER"
    }, {
        "state": "t",
        "regexp": /^=/,
        "token": "EQUALS"
    }, {
        "state": "t",
        "regexp": /^\.\./,
        "token": "ID",
        "action": function () {
            // wait for '/'
            this.pushState('ws');
        }
    }, {
        "state": "t",
        "regexp": /^\./,
        "token": "SEP"
    }, {
        "state": "ws",
        "regexp": /^\//,
        "token": "SEP",
        "action": function () {
            this.popState();
        }
    }, {
        "state": "t",
        "regexp": /^[a-zA-Z0-9_$-]+/,
        "token": "ID"
    }, {
        "state": "t",
        "regexp": /^./,
        "token": "INVALID"
    }]
});
parser.lexer = lexer;
parser.productions = [{
    "symbol": "$START",
    "rhs": ["program"],
    "action": undefined
}, {
    "symbol": "program",
    "rhs": ["statements", "inverse", "statements"],
    "action": function () {
        return new this.yy.ProgramNode(this.lexer.lineNumber, this.$1, this.$3);
    }
}, {
    "symbol": "program",
    "rhs": ["statements"],
    "action": function () {
        return new this.yy.ProgramNode(this.lexer.lineNumber, this.$1);
    }
}, {
    "symbol": "statements",
    "rhs": ["statement"],
    "action": function () {
        return [this.$1];
    }
}, {
    "symbol": "statements",
    "rhs": ["statements", "statement"],
    "action": function () {
        this.$1.push(this.$2);
    }
}, {
    "symbol": "statement",
    "rhs": ["openBlock", "program", "closeBlock"],
    "action": function () {
        return new this.yy.BlockNode(this.lexer.lineNumber, this.$1, this.$2, this.$3);
    }
}, {
    "symbol": "statement",
    "rhs": ["tpl"],
    "action": undefined
}, {
    "symbol": "statement",
    "rhs": ["CONTENT"],
    "action": function () {
        return new this.yy.ContentNode(this.lexer.lineNumber, this.$1);
    }
}, {
    "symbol": "openBlock",
    "rhs": ["OPEN_BLOCK", "inTpl", "CLOSE"],
    "action": function () {
        return this.$2;
    }
}, {
    "symbol": "closeBlock",
    "rhs": ["OPEN_END_BLOCK", "path", "CLOSE"],
    "action": function () {
        return this.$2;
    }
}, {
    "symbol": "tpl",
    "rhs": ["OPEN", "inTpl", "CLOSE"],
    "action": function () {
        return this.$2;
    }
}, {
    "symbol": "tpl",
    "rhs": ["OPEN_UN_ESCAPED", "inTpl", "CLOSE"],
    "action": function () {
        this.$2.escaped = false;
        return this.$2;
    }
}, {
    "symbol": "tpl",
    "rhs": ["OPEN", "Expression", "CLOSE"],
    "action": function () {
        return new this.yy.TplExpressionNode(this.lexer.lineNumber, this.$2);
    }
}, {
    "symbol": "tpl",
    "rhs": ["OPEN_UN_ESCAPED", "Expression", "CLOSE"],
    "action": function () {
        var tpl = new this.yy.TplExpressionNode(this.lexer.lineNumber, this.$2);
        tpl.escaped = false;
        return tpl;
    }
}, {
    "symbol": "inverse",
    "rhs": ["OPEN_INVERSE", "CLOSE"],
    "action": undefined
}, {
    "symbol": "inTpl",
    "rhs": ["path", "params", "hash"],
    "action": function () {
        return new this.yy.TplNode(this.lexer.lineNumber, this.$1, this.$2, this.$3);
    }
}, {
    "symbol": "inTpl",
    "rhs": ["path", "params"],
    "action": function () {
        return new this.yy.TplNode(this.lexer.lineNumber, this.$1, this.$2);
    }
}, {
    "symbol": "inTpl",
    "rhs": ["path", "hash"],
    "action": function () {
        return new this.yy.TplNode(this.lexer.lineNumber, this.$1, null, this.$2);
    }
}, {
    "symbol": "inTpl",
    "rhs": ["path"],
    "action": function () {
        return new this.yy.TplNode(this.lexer.lineNumber, this.$1);
    }
}, {
    "symbol": "params",
    "rhs": ["params", "param"],
    "action": function () {
        this.$1.push(this.$2);
    }
}, {
    "symbol": "params",
    "rhs": ["param"],
    "action": function () {
        return [this.$1];
    }
}, {
    "symbol": "param",
    "rhs": ["Expression"],
    "action": undefined
}, {
    "symbol": "Expression",
    "rhs": ["ConditionalOrExpression"],
    "action": undefined
}, {
    "symbol": "ConditionalOrExpression",
    "rhs": ["ConditionalAndExpression"],
    "action": undefined
}, {
    "symbol": "ConditionalOrExpression",
    "rhs": ["ConditionalOrExpression", "OR", "ConditionalAndExpression"],
    "action": function () {
        return new this.yy.ConditionalOrExpression(this.$1, this.$3);
    }
}, {
    "symbol": "ConditionalAndExpression",
    "rhs": ["EqualityExpression"],
    "action": undefined
}, {
    "symbol": "ConditionalAndExpression",
    "rhs": ["ConditionalAndExpression", "AND", "EqualityExpression"],
    "action": function () {
        return new this.yy.ConditionalAndExpression(this.$1, this.$3);
    }
}, {
    "symbol": "EqualityExpression",
    "rhs": ["RelationalExpression"],
    "action": undefined
}, {
    "symbol": "EqualityExpression",
    "rhs": ["EqualityExpression", "LOGIC_EQUALS", "RelationalExpression"],
    "action": function () {
        return new this.yy.EqualityExpression(this.$1, '===', this.$3);
    }
}, {
    "symbol": "EqualityExpression",
    "rhs": ["EqualityExpression", "LOGIC_NOT_EQUALS", "RelationalExpression"],
    "action": function () {
        return new this.yy.EqualityExpression(this.$1, '!==', this.$3);
    }
}, {
    "symbol": "RelationalExpression",
    "rhs": ["AdditiveExpression"],
    "action": undefined
}, {
    "symbol": "RelationalExpression",
    "rhs": ["RelationalExpression", "LT", "AdditiveExpression"],
    "action": function () {
        return new this.yy.RelationalExpression(this.$1, '<=', this.$3);
    }
}, {
    "symbol": "RelationalExpression",
    "rhs": ["RelationalExpression", "GT", "AdditiveExpression"],
    "action": function () {
        return new this.yy.RelationalExpression(this.$1, '>', this.$3);
    }
}, {
    "symbol": "RelationalExpression",
    "rhs": ["RelationalExpression", "LE", "AdditiveExpression"],
    "action": function () {
        return new this.yy.RelationalExpression(this.$1, '<=', this.$3);
    }
}, {
    "symbol": "RelationalExpression",
    "rhs": ["RelationalExpression", "GE", "AdditiveExpression"],
    "action": function () {
        return new this.yy.RelationalExpression(this.$1, '>=', this.$3);
    }
}, {
    "symbol": "AdditiveExpression",
    "rhs": ["MultiplicativeExpression"],
    "action": undefined
}, {
    "symbol": "AdditiveExpression",
    "rhs": ["AdditiveExpression", "PLUS", "MultiplicativeExpression"],
    "action": function () {
        return new this.yy.AdditiveExpression(this.$1, '+', this.$3);
    }
}, {
    "symbol": "AdditiveExpression",
    "rhs": ["AdditiveExpression", "MINUS", "MultiplicativeExpression"],
    "action": function () {
        return new this.yy.AdditiveExpression(this.$1, '-', this.$3);
    }
}, {
    "symbol": "MultiplicativeExpression",
    "rhs": ["UnaryExpression"],
    "action": undefined
}, {
    "symbol": "MultiplicativeExpression",
    "rhs": ["MultiplicativeExpression", "MULTIPLY", "UnaryExpression"],
    "action": function () {
        return new this.yy.MultiplicativeExpression(this.$1, '*', this.$3);
    }
}, {
    "symbol": "MultiplicativeExpression",
    "rhs": ["MultiplicativeExpression", "DIVIDE", "UnaryExpression"],
    "action": function () {
        return new this.yy.MultiplicativeExpression(this.$1, '/', this.$3);
    }
}, {
    "symbol": "MultiplicativeExpression",
    "rhs": ["MultiplicativeExpression", "MODULUS", "UnaryExpression"],
    "action": function () {
        return new this.yy.MultiplicativeExpression(this.$1, '%', this.$3);
    }
}, {
    "symbol": "UnaryExpression",
    "rhs": ["NOT", "UnaryExpression"],
    "action": function () {
        return new this.yy.UnaryExpression(this.$1);
    }
}, {
    "symbol": "UnaryExpression",
    "rhs": ["PrimaryExpression"],
    "action": undefined
}, {
    "symbol": "PrimaryExpression",
    "rhs": ["STRING"],
    "action": function () {
        return new this.yy.StringNode(this.lexer.lineNumber, this.$1);
    }
}, {
    "symbol": "PrimaryExpression",
    "rhs": ["NUMBER"],
    "action": function () {
        return new this.yy.NumberNode(this.lexer.lineNumber, this.$1);
    }
}, {
    "symbol": "PrimaryExpression",
    "rhs": ["BOOLEAN"],
    "action": function () {
        return new this.yy.BooleanNode(this.lexer.lineNumber, this.$1);
    }
}, {
    "symbol": "PrimaryExpression",
    "rhs": ["path"],
    "action": undefined
}, {
    "symbol": "PrimaryExpression",
    "rhs": ["LPAREN", "Expression", "RPAREN"],
    "action": function () {
        return this.$2;
    }
}, {
    "symbol": "hash",
    "rhs": ["hashSegments"],
    "action": function () {
        return new this.yy.HashNode(this.lexer.lineNumber, this.$1);
    }
}, {
    "symbol": "hashSegments",
    "rhs": ["hashSegments", "hashSegment"],
    "action": function () {
        this.$1.push(this.$2);
    }
}, {
    "symbol": "hashSegments",
    "rhs": ["hashSegment"],
    "action": function () {
        return [this.$1];
    }
}, {
    "symbol": "hashSegment",
    "rhs": ["ID", "EQUALS", "Expression"],
    "action": function () {
        return [this.$1, this.$3];
    }
}, {
    "symbol": "path",
    "rhs": ["pathSegments"],
    "action": function () {
        return new this.yy.IdNode(this.lexer.lineNumber, this.$1);
    }
}, {
    "symbol": "pathSegments",
    "rhs": ["pathSegments", "SEP", "ID"],
    "action": function () {
        this.$1.push(this.$3);
    }
}, {
    "symbol": "pathSegments",
    "rhs": ["pathSegments", "SEP", "NUMBER"],
    "action": function () {
        this.$1.push(this.$3);
    }
}, {
    "symbol": "pathSegments",
    "rhs": ["ID"],
    "action": function () {
        return [this.$1];
    }
}];
parser.table = {
    "gotos": {
        "0": {
            "program": 5,
            "statements": 6,
            "statement": 7,
            "openBlock": 8,
            "tpl": 9
        },
        "2": {
            "inTpl": 11,
            "path": 12,
            "pathSegments": 13
        },
        "3": {
            "inTpl": 19,
            "Expression": 20,
            "ConditionalOrExpression": 21,
            "ConditionalAndExpression": 22,
            "EqualityExpression": 23,
            "RelationalExpression": 24,
            "AdditiveExpression": 25,
            "MultiplicativeExpression": 26,
            "UnaryExpression": 27,
            "PrimaryExpression": 28,
            "path": 29,
            "pathSegments": 13
        },
        "4": {
            "inTpl": 30,
            "Expression": 31,
            "ConditionalOrExpression": 21,
            "ConditionalAndExpression": 22,
            "EqualityExpression": 23,
            "RelationalExpression": 24,
            "AdditiveExpression": 25,
            "MultiplicativeExpression": 26,
            "UnaryExpression": 27,
            "PrimaryExpression": 28,
            "path": 29,
            "pathSegments": 13
        },
        "6": {
            "statement": 33,
            "openBlock": 8,
            "tpl": 9,
            "inverse": 34
        },
        "8": {
            "program": 35,
            "statements": 6,
            "statement": 7,
            "openBlock": 8,
            "tpl": 9
        },
        "12": {
            "params": 38,
            "param": 39,
            "Expression": 40,
            "ConditionalOrExpression": 21,
            "ConditionalAndExpression": 22,
            "EqualityExpression": 23,
            "RelationalExpression": 24,
            "AdditiveExpression": 25,
            "MultiplicativeExpression": 26,
            "UnaryExpression": 27,
            "PrimaryExpression": 28,
            "hash": 41,
            "hashSegments": 42,
            "hashSegment": 43,
            "path": 44,
            "pathSegments": 13
        },
        "14": {
            "Expression": 46,
            "ConditionalOrExpression": 21,
            "ConditionalAndExpression": 22,
            "EqualityExpression": 23,
            "RelationalExpression": 24,
            "AdditiveExpression": 25,
            "MultiplicativeExpression": 26,
            "UnaryExpression": 27,
            "PrimaryExpression": 28,
            "path": 44,
            "pathSegments": 13
        },
        "15": {
            "UnaryExpression": 47,
            "PrimaryExpression": 28,
            "path": 44,
            "pathSegments": 13
        },
        "29": {
            "params": 38,
            "param": 39,
            "Expression": 40,
            "ConditionalOrExpression": 21,
            "ConditionalAndExpression": 22,
            "EqualityExpression": 23,
            "RelationalExpression": 24,
            "AdditiveExpression": 25,
            "MultiplicativeExpression": 26,
            "UnaryExpression": 27,
            "PrimaryExpression": 28,
            "hash": 41,
            "hashSegments": 42,
            "hashSegment": 43,
            "path": 44,
            "pathSegments": 13
        },
        "34": {
            "statements": 66,
            "statement": 7,
            "openBlock": 8,
            "tpl": 9
        },
        "35": {
            "closeBlock": 68
        },
        "38": {
            "param": 70,
            "Expression": 40,
            "ConditionalOrExpression": 21,
            "ConditionalAndExpression": 22,
            "EqualityExpression": 23,
            "RelationalExpression": 24,
            "AdditiveExpression": 25,
            "MultiplicativeExpression": 26,
            "UnaryExpression": 27,
            "PrimaryExpression": 28,
            "hash": 71,
            "hashSegments": 42,
            "hashSegment": 43,
            "path": 44,
            "pathSegments": 13
        },
        "42": {
            "hashSegment": 73
        },
        "50": {
            "ConditionalAndExpression": 77,
            "EqualityExpression": 23,
            "RelationalExpression": 24,
            "AdditiveExpression": 25,
            "MultiplicativeExpression": 26,
            "UnaryExpression": 27,
            "PrimaryExpression": 28,
            "path": 44,
            "pathSegments": 13
        },
        "51": {
            "EqualityExpression": 78,
            "RelationalExpression": 24,
            "AdditiveExpression": 25,
            "MultiplicativeExpression": 26,
            "UnaryExpression": 27,
            "PrimaryExpression": 28,
            "path": 44,
            "pathSegments": 13
        },
        "52": {
            "RelationalExpression": 79,
            "AdditiveExpression": 25,
            "MultiplicativeExpression": 26,
            "UnaryExpression": 27,
            "PrimaryExpression": 28,
            "path": 44,
            "pathSegments": 13
        },
        "53": {
            "RelationalExpression": 80,
            "AdditiveExpression": 25,
            "MultiplicativeExpression": 26,
            "UnaryExpression": 27,
            "PrimaryExpression": 28,
            "path": 44,
            "pathSegments": 13
        },
        "54": {
            "AdditiveExpression": 81,
            "MultiplicativeExpression": 26,
            "UnaryExpression": 27,
            "PrimaryExpression": 28,
            "path": 44,
            "pathSegments": 13
        },
        "55": {
            "AdditiveExpression": 82,
            "MultiplicativeExpression": 26,
            "UnaryExpression": 27,
            "PrimaryExpression": 28,
            "path": 44,
            "pathSegments": 13
        },
        "56": {
            "AdditiveExpression": 83,
            "MultiplicativeExpression": 26,
            "UnaryExpression": 27,
            "PrimaryExpression": 28,
            "path": 44,
            "pathSegments": 13
        },
        "57": {
            "AdditiveExpression": 84,
            "MultiplicativeExpression": 26,
            "UnaryExpression": 27,
            "PrimaryExpression": 28,
            "path": 44,
            "pathSegments": 13
        },
        "58": {
            "MultiplicativeExpression": 85,
            "UnaryExpression": 27,
            "PrimaryExpression": 28,
            "path": 44,
            "pathSegments": 13
        },
        "59": {
            "MultiplicativeExpression": 86,
            "UnaryExpression": 27,
            "PrimaryExpression": 28,
            "path": 44,
            "pathSegments": 13
        },
        "60": {
            "UnaryExpression": 87,
            "PrimaryExpression": 28,
            "path": 44,
            "pathSegments": 13
        },
        "61": {
            "UnaryExpression": 88,
            "PrimaryExpression": 28,
            "path": 44,
            "pathSegments": 13
        },
        "62": {
            "UnaryExpression": 89,
            "PrimaryExpression": 28,
            "path": 44,
            "pathSegments": 13
        },
        "66": {
            "statement": 33,
            "openBlock": 8,
            "tpl": 9
        },
        "67": {
            "path": 90,
            "pathSegments": 13
        },
        "69": {
            "Expression": 91,
            "ConditionalOrExpression": 21,
            "ConditionalAndExpression": 22,
            "EqualityExpression": 23,
            "RelationalExpression": 24,
            "AdditiveExpression": 25,
            "MultiplicativeExpression": 26,
            "UnaryExpression": 27,
            "PrimaryExpression": 28,
            "path": 44,
            "pathSegments": 13
        }
    },
    "action": {
        "0": {
            "CONTENT": {
                "type": 1,
                "to": 1
            },
            "OPEN_BLOCK": {
                "type": 1,
                "to": 2
            },
            "OPEN_UN_ESCAPED": {
                "type": 1,
                "to": 3
            },
            "OPEN": {
                "type": 1,
                "to": 4
            }
        },
        "1": {
            "$EOF": {
                "type": 2,
                "production": 7
            },
            "OPEN_INVERSE": {
                "type": 2,
                "production": 7
            },
            "OPEN_BLOCK": {
                "type": 2,
                "production": 7
            },
            "OPEN": {
                "type": 2,
                "production": 7
            },
            "OPEN_UN_ESCAPED": {
                "type": 2,
                "production": 7
            },
            "CONTENT": {
                "type": 2,
                "production": 7
            },
            "OPEN_END_BLOCK": {
                "type": 2,
                "production": 7
            }
        },
        "2": {
            "ID": {
                "type": 1,
                "to": 10
            }
        },
        "3": {
            "LPAREN": {
                "type": 1,
                "to": 14
            },
            "NOT": {
                "type": 1,
                "to": 15
            },
            "STRING": {
                "type": 1,
                "to": 16
            },
            "BOOLEAN": {
                "type": 1,
                "to": 17
            },
            "NUMBER": {
                "type": 1,
                "to": 18
            },
            "ID": {
                "type": 1,
                "to": 10
            }
        },
        "4": {
            "LPAREN": {
                "type": 1,
                "to": 14
            },
            "NOT": {
                "type": 1,
                "to": 15
            },
            "STRING": {
                "type": 1,
                "to": 16
            },
            "BOOLEAN": {
                "type": 1,
                "to": 17
            },
            "NUMBER": {
                "type": 1,
                "to": 18
            },
            "ID": {
                "type": 1,
                "to": 10
            }
        },
        "5": {
            "$EOF": {
                "type": 0
            }
        },
        "6": {
            "CONTENT": {
                "type": 1,
                "to": 1
            },
            "OPEN_BLOCK": {
                "type": 1,
                "to": 2
            },
            "OPEN_INVERSE": {
                "type": 1,
                "to": 32
            },
            "OPEN_UN_ESCAPED": {
                "type": 1,
                "to": 3
            },
            "OPEN": {
                "type": 1,
                "to": 4
            },
            "$EOF": {
                "type": 2,
                "production": 2
            },
            "OPEN_END_BLOCK": {
                "type": 2,
                "production": 2
            }
        },
        "7": {
            "$EOF": {
                "type": 2,
                "production": 3
            },
            "OPEN_INVERSE": {
                "type": 2,
                "production": 3
            },
            "OPEN_BLOCK": {
                "type": 2,
                "production": 3
            },
            "OPEN": {
                "type": 2,
                "production": 3
            },
            "OPEN_UN_ESCAPED": {
                "type": 2,
                "production": 3
            },
            "CONTENT": {
                "type": 2,
                "production": 3
            },
            "OPEN_END_BLOCK": {
                "type": 2,
                "production": 3
            }
        },
        "8": {
            "CONTENT": {
                "type": 1,
                "to": 1
            },
            "OPEN_BLOCK": {
                "type": 1,
                "to": 2
            },
            "OPEN_UN_ESCAPED": {
                "type": 1,
                "to": 3
            },
            "OPEN": {
                "type": 1,
                "to": 4
            }
        },
        "9": {
            "$EOF": {
                "type": 2,
                "production": 6
            },
            "OPEN_INVERSE": {
                "type": 2,
                "production": 6
            },
            "OPEN_BLOCK": {
                "type": 2,
                "production": 6
            },
            "OPEN": {
                "type": 2,
                "production": 6
            },
            "OPEN_UN_ESCAPED": {
                "type": 2,
                "production": 6
            },
            "CONTENT": {
                "type": 2,
                "production": 6
            },
            "OPEN_END_BLOCK": {
                "type": 2,
                "production": 6
            }
        },
        "10": {
            "CLOSE": {
                "type": 2,
                "production": 56
            },
            "ID": {
                "type": 2,
                "production": 56
            },
            "NOT": {
                "type": 2,
                "production": 56
            },
            "STRING": {
                "type": 2,
                "production": 56
            },
            "NUMBER": {
                "type": 2,
                "production": 56
            },
            "BOOLEAN": {
                "type": 2,
                "production": 56
            },
            "LPAREN": {
                "type": 2,
                "production": 56
            },
            "SEP": {
                "type": 2,
                "production": 56
            },
            "MINUS": {
                "type": 2,
                "production": 56
            },
            "PLUS": {
                "type": 2,
                "production": 56
            },
            "DIVIDE": {
                "type": 2,
                "production": 56
            },
            "MODULUS": {
                "type": 2,
                "production": 56
            },
            "MULTIPLY": {
                "type": 2,
                "production": 56
            },
            "AND": {
                "type": 2,
                "production": 56
            },
            "OR": {
                "type": 2,
                "production": 56
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 56
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 56
            },
            "GE": {
                "type": 2,
                "production": 56
            },
            "GT": {
                "type": 2,
                "production": 56
            },
            "LE": {
                "type": 2,
                "production": 56
            },
            "LT": {
                "type": 2,
                "production": 56
            },
            "RPAREN": {
                "type": 2,
                "production": 56
            }
        },
        "11": {
            "CLOSE": {
                "type": 1,
                "to": 36
            }
        },
        "12": {
            "LPAREN": {
                "type": 1,
                "to": 14
            },
            "NOT": {
                "type": 1,
                "to": 15
            },
            "STRING": {
                "type": 1,
                "to": 16
            },
            "BOOLEAN": {
                "type": 1,
                "to": 17
            },
            "NUMBER": {
                "type": 1,
                "to": 18
            },
            "ID": {
                "type": 1,
                "to": 37
            },
            "CLOSE": {
                "type": 2,
                "production": 18
            }
        },
        "13": {
            "SEP": {
                "type": 1,
                "to": 45
            },
            "CLOSE": {
                "type": 2,
                "production": 53
            },
            "ID": {
                "type": 2,
                "production": 53
            },
            "NOT": {
                "type": 2,
                "production": 53
            },
            "STRING": {
                "type": 2,
                "production": 53
            },
            "NUMBER": {
                "type": 2,
                "production": 53
            },
            "BOOLEAN": {
                "type": 2,
                "production": 53
            },
            "LPAREN": {
                "type": 2,
                "production": 53
            },
            "MINUS": {
                "type": 2,
                "production": 53
            },
            "PLUS": {
                "type": 2,
                "production": 53
            },
            "DIVIDE": {
                "type": 2,
                "production": 53
            },
            "MODULUS": {
                "type": 2,
                "production": 53
            },
            "MULTIPLY": {
                "type": 2,
                "production": 53
            },
            "AND": {
                "type": 2,
                "production": 53
            },
            "OR": {
                "type": 2,
                "production": 53
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 53
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 53
            },
            "GE": {
                "type": 2,
                "production": 53
            },
            "GT": {
                "type": 2,
                "production": 53
            },
            "LE": {
                "type": 2,
                "production": 53
            },
            "LT": {
                "type": 2,
                "production": 53
            },
            "RPAREN": {
                "type": 2,
                "production": 53
            }
        },
        "14": {
            "LPAREN": {
                "type": 1,
                "to": 14
            },
            "NOT": {
                "type": 1,
                "to": 15
            },
            "STRING": {
                "type": 1,
                "to": 16
            },
            "BOOLEAN": {
                "type": 1,
                "to": 17
            },
            "NUMBER": {
                "type": 1,
                "to": 18
            },
            "ID": {
                "type": 1,
                "to": 10
            }
        },
        "15": {
            "LPAREN": {
                "type": 1,
                "to": 14
            },
            "NOT": {
                "type": 1,
                "to": 15
            },
            "STRING": {
                "type": 1,
                "to": 16
            },
            "BOOLEAN": {
                "type": 1,
                "to": 17
            },
            "NUMBER": {
                "type": 1,
                "to": 18
            },
            "ID": {
                "type": 1,
                "to": 10
            }
        },
        "16": {
            "CLOSE": {
                "type": 2,
                "production": 44
            },
            "MINUS": {
                "type": 2,
                "production": 44
            },
            "PLUS": {
                "type": 2,
                "production": 44
            },
            "DIVIDE": {
                "type": 2,
                "production": 44
            },
            "MODULUS": {
                "type": 2,
                "production": 44
            },
            "MULTIPLY": {
                "type": 2,
                "production": 44
            },
            "AND": {
                "type": 2,
                "production": 44
            },
            "OR": {
                "type": 2,
                "production": 44
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 44
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 44
            },
            "GE": {
                "type": 2,
                "production": 44
            },
            "GT": {
                "type": 2,
                "production": 44
            },
            "LE": {
                "type": 2,
                "production": 44
            },
            "LT": {
                "type": 2,
                "production": 44
            },
            "ID": {
                "type": 2,
                "production": 44
            },
            "NOT": {
                "type": 2,
                "production": 44
            },
            "STRING": {
                "type": 2,
                "production": 44
            },
            "NUMBER": {
                "type": 2,
                "production": 44
            },
            "BOOLEAN": {
                "type": 2,
                "production": 44
            },
            "LPAREN": {
                "type": 2,
                "production": 44
            },
            "RPAREN": {
                "type": 2,
                "production": 44
            }
        },
        "17": {
            "CLOSE": {
                "type": 2,
                "production": 46
            },
            "MINUS": {
                "type": 2,
                "production": 46
            },
            "PLUS": {
                "type": 2,
                "production": 46
            },
            "DIVIDE": {
                "type": 2,
                "production": 46
            },
            "MODULUS": {
                "type": 2,
                "production": 46
            },
            "MULTIPLY": {
                "type": 2,
                "production": 46
            },
            "AND": {
                "type": 2,
                "production": 46
            },
            "OR": {
                "type": 2,
                "production": 46
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 46
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 46
            },
            "GE": {
                "type": 2,
                "production": 46
            },
            "GT": {
                "type": 2,
                "production": 46
            },
            "LE": {
                "type": 2,
                "production": 46
            },
            "LT": {
                "type": 2,
                "production": 46
            },
            "ID": {
                "type": 2,
                "production": 46
            },
            "NOT": {
                "type": 2,
                "production": 46
            },
            "STRING": {
                "type": 2,
                "production": 46
            },
            "NUMBER": {
                "type": 2,
                "production": 46
            },
            "BOOLEAN": {
                "type": 2,
                "production": 46
            },
            "LPAREN": {
                "type": 2,
                "production": 46
            },
            "RPAREN": {
                "type": 2,
                "production": 46
            }
        },
        "18": {
            "CLOSE": {
                "type": 2,
                "production": 45
            },
            "MINUS": {
                "type": 2,
                "production": 45
            },
            "PLUS": {
                "type": 2,
                "production": 45
            },
            "DIVIDE": {
                "type": 2,
                "production": 45
            },
            "MODULUS": {
                "type": 2,
                "production": 45
            },
            "MULTIPLY": {
                "type": 2,
                "production": 45
            },
            "AND": {
                "type": 2,
                "production": 45
            },
            "OR": {
                "type": 2,
                "production": 45
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 45
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 45
            },
            "GE": {
                "type": 2,
                "production": 45
            },
            "GT": {
                "type": 2,
                "production": 45
            },
            "LE": {
                "type": 2,
                "production": 45
            },
            "LT": {
                "type": 2,
                "production": 45
            },
            "ID": {
                "type": 2,
                "production": 45
            },
            "NOT": {
                "type": 2,
                "production": 45
            },
            "STRING": {
                "type": 2,
                "production": 45
            },
            "NUMBER": {
                "type": 2,
                "production": 45
            },
            "BOOLEAN": {
                "type": 2,
                "production": 45
            },
            "LPAREN": {
                "type": 2,
                "production": 45
            },
            "RPAREN": {
                "type": 2,
                "production": 45
            }
        },
        "19": {
            "CLOSE": {
                "type": 1,
                "to": 48
            }
        },
        "20": {
            "CLOSE": {
                "type": 1,
                "to": 49
            }
        },
        "21": {
            "OR": {
                "type": 1,
                "to": 50
            },
            "CLOSE": {
                "type": 2,
                "production": 22
            },
            "ID": {
                "type": 2,
                "production": 22
            },
            "NOT": {
                "type": 2,
                "production": 22
            },
            "STRING": {
                "type": 2,
                "production": 22
            },
            "NUMBER": {
                "type": 2,
                "production": 22
            },
            "BOOLEAN": {
                "type": 2,
                "production": 22
            },
            "LPAREN": {
                "type": 2,
                "production": 22
            },
            "RPAREN": {
                "type": 2,
                "production": 22
            }
        },
        "22": {
            "AND": {
                "type": 1,
                "to": 51
            },
            "CLOSE": {
                "type": 2,
                "production": 23
            },
            "OR": {
                "type": 2,
                "production": 23
            },
            "ID": {
                "type": 2,
                "production": 23
            },
            "NOT": {
                "type": 2,
                "production": 23
            },
            "STRING": {
                "type": 2,
                "production": 23
            },
            "NUMBER": {
                "type": 2,
                "production": 23
            },
            "BOOLEAN": {
                "type": 2,
                "production": 23
            },
            "LPAREN": {
                "type": 2,
                "production": 23
            },
            "RPAREN": {
                "type": 2,
                "production": 23
            }
        },
        "23": {
            "LOGIC_EQUALS": {
                "type": 1,
                "to": 52
            },
            "LOGIC_NOT_EQUALS": {
                "type": 1,
                "to": 53
            },
            "CLOSE": {
                "type": 2,
                "production": 25
            },
            "AND": {
                "type": 2,
                "production": 25
            },
            "OR": {
                "type": 2,
                "production": 25
            },
            "ID": {
                "type": 2,
                "production": 25
            },
            "NOT": {
                "type": 2,
                "production": 25
            },
            "STRING": {
                "type": 2,
                "production": 25
            },
            "NUMBER": {
                "type": 2,
                "production": 25
            },
            "BOOLEAN": {
                "type": 2,
                "production": 25
            },
            "LPAREN": {
                "type": 2,
                "production": 25
            },
            "RPAREN": {
                "type": 2,
                "production": 25
            }
        },
        "24": {
            "GT": {
                "type": 1,
                "to": 54
            },
            "GE": {
                "type": 1,
                "to": 55
            },
            "LT": {
                "type": 1,
                "to": 56
            },
            "LE": {
                "type": 1,
                "to": 57
            },
            "CLOSE": {
                "type": 2,
                "production": 27
            },
            "AND": {
                "type": 2,
                "production": 27
            },
            "OR": {
                "type": 2,
                "production": 27
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 27
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 27
            },
            "ID": {
                "type": 2,
                "production": 27
            },
            "NOT": {
                "type": 2,
                "production": 27
            },
            "STRING": {
                "type": 2,
                "production": 27
            },
            "NUMBER": {
                "type": 2,
                "production": 27
            },
            "BOOLEAN": {
                "type": 2,
                "production": 27
            },
            "LPAREN": {
                "type": 2,
                "production": 27
            },
            "RPAREN": {
                "type": 2,
                "production": 27
            }
        },
        "25": {
            "PLUS": {
                "type": 1,
                "to": 58
            },
            "MINUS": {
                "type": 1,
                "to": 59
            },
            "CLOSE": {
                "type": 2,
                "production": 30
            },
            "AND": {
                "type": 2,
                "production": 30
            },
            "OR": {
                "type": 2,
                "production": 30
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 30
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 30
            },
            "GE": {
                "type": 2,
                "production": 30
            },
            "GT": {
                "type": 2,
                "production": 30
            },
            "LE": {
                "type": 2,
                "production": 30
            },
            "LT": {
                "type": 2,
                "production": 30
            },
            "ID": {
                "type": 2,
                "production": 30
            },
            "NOT": {
                "type": 2,
                "production": 30
            },
            "STRING": {
                "type": 2,
                "production": 30
            },
            "NUMBER": {
                "type": 2,
                "production": 30
            },
            "BOOLEAN": {
                "type": 2,
                "production": 30
            },
            "LPAREN": {
                "type": 2,
                "production": 30
            },
            "RPAREN": {
                "type": 2,
                "production": 30
            }
        },
        "26": {
            "MULTIPLY": {
                "type": 1,
                "to": 60
            },
            "DIVIDE": {
                "type": 1,
                "to": 61
            },
            "MODULUS": {
                "type": 1,
                "to": 62
            },
            "CLOSE": {
                "type": 2,
                "production": 35
            },
            "MINUS": {
                "type": 2,
                "production": 35
            },
            "PLUS": {
                "type": 2,
                "production": 35
            },
            "AND": {
                "type": 2,
                "production": 35
            },
            "OR": {
                "type": 2,
                "production": 35
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 35
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 35
            },
            "GE": {
                "type": 2,
                "production": 35
            },
            "GT": {
                "type": 2,
                "production": 35
            },
            "LE": {
                "type": 2,
                "production": 35
            },
            "LT": {
                "type": 2,
                "production": 35
            },
            "ID": {
                "type": 2,
                "production": 35
            },
            "NOT": {
                "type": 2,
                "production": 35
            },
            "STRING": {
                "type": 2,
                "production": 35
            },
            "NUMBER": {
                "type": 2,
                "production": 35
            },
            "BOOLEAN": {
                "type": 2,
                "production": 35
            },
            "LPAREN": {
                "type": 2,
                "production": 35
            },
            "RPAREN": {
                "type": 2,
                "production": 35
            }
        },
        "27": {
            "CLOSE": {
                "type": 2,
                "production": 38
            },
            "MINUS": {
                "type": 2,
                "production": 38
            },
            "PLUS": {
                "type": 2,
                "production": 38
            },
            "DIVIDE": {
                "type": 2,
                "production": 38
            },
            "MODULUS": {
                "type": 2,
                "production": 38
            },
            "MULTIPLY": {
                "type": 2,
                "production": 38
            },
            "AND": {
                "type": 2,
                "production": 38
            },
            "OR": {
                "type": 2,
                "production": 38
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 38
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 38
            },
            "GE": {
                "type": 2,
                "production": 38
            },
            "GT": {
                "type": 2,
                "production": 38
            },
            "LE": {
                "type": 2,
                "production": 38
            },
            "LT": {
                "type": 2,
                "production": 38
            },
            "ID": {
                "type": 2,
                "production": 38
            },
            "NOT": {
                "type": 2,
                "production": 38
            },
            "STRING": {
                "type": 2,
                "production": 38
            },
            "NUMBER": {
                "type": 2,
                "production": 38
            },
            "BOOLEAN": {
                "type": 2,
                "production": 38
            },
            "LPAREN": {
                "type": 2,
                "production": 38
            },
            "RPAREN": {
                "type": 2,
                "production": 38
            }
        },
        "28": {
            "CLOSE": {
                "type": 2,
                "production": 43
            },
            "MINUS": {
                "type": 2,
                "production": 43
            },
            "PLUS": {
                "type": 2,
                "production": 43
            },
            "DIVIDE": {
                "type": 2,
                "production": 43
            },
            "MODULUS": {
                "type": 2,
                "production": 43
            },
            "MULTIPLY": {
                "type": 2,
                "production": 43
            },
            "AND": {
                "type": 2,
                "production": 43
            },
            "OR": {
                "type": 2,
                "production": 43
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 43
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 43
            },
            "GE": {
                "type": 2,
                "production": 43
            },
            "GT": {
                "type": 2,
                "production": 43
            },
            "LE": {
                "type": 2,
                "production": 43
            },
            "LT": {
                "type": 2,
                "production": 43
            },
            "ID": {
                "type": 2,
                "production": 43
            },
            "NOT": {
                "type": 2,
                "production": 43
            },
            "STRING": {
                "type": 2,
                "production": 43
            },
            "NUMBER": {
                "type": 2,
                "production": 43
            },
            "BOOLEAN": {
                "type": 2,
                "production": 43
            },
            "LPAREN": {
                "type": 2,
                "production": 43
            },
            "RPAREN": {
                "type": 2,
                "production": 43
            }
        },
        "29": {
            "LPAREN": {
                "type": 1,
                "to": 14
            },
            "NOT": {
                "type": 1,
                "to": 15
            },
            "STRING": {
                "type": 1,
                "to": 16
            },
            "BOOLEAN": {
                "type": 1,
                "to": 17
            },
            "NUMBER": {
                "type": 1,
                "to": 18
            },
            "ID": {
                "type": 1,
                "to": 37
            },
            "CLOSE": {
                "type": 2,
                "production": 18
            },
            "MINUS": {
                "type": 2,
                "production": 47
            },
            "PLUS": {
                "type": 2,
                "production": 47
            },
            "DIVIDE": {
                "type": 2,
                "production": 47
            },
            "MODULUS": {
                "type": 2,
                "production": 47
            },
            "MULTIPLY": {
                "type": 2,
                "production": 47
            },
            "AND": {
                "type": 2,
                "production": 47
            },
            "OR": {
                "type": 2,
                "production": 47
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 47
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 47
            },
            "GE": {
                "type": 2,
                "production": 47
            },
            "GT": {
                "type": 2,
                "production": 47
            },
            "LE": {
                "type": 2,
                "production": 47
            },
            "LT": {
                "type": 2,
                "production": 47
            }
        },
        "30": {
            "CLOSE": {
                "type": 1,
                "to": 63
            }
        },
        "31": {
            "CLOSE": {
                "type": 1,
                "to": 64
            }
        },
        "32": {
            "CLOSE": {
                "type": 1,
                "to": 65
            }
        },
        "33": {
            "$EOF": {
                "type": 2,
                "production": 4
            },
            "OPEN_INVERSE": {
                "type": 2,
                "production": 4
            },
            "OPEN_BLOCK": {
                "type": 2,
                "production": 4
            },
            "OPEN": {
                "type": 2,
                "production": 4
            },
            "OPEN_UN_ESCAPED": {
                "type": 2,
                "production": 4
            },
            "CONTENT": {
                "type": 2,
                "production": 4
            },
            "OPEN_END_BLOCK": {
                "type": 2,
                "production": 4
            }
        },
        "34": {
            "CONTENT": {
                "type": 1,
                "to": 1
            },
            "OPEN_BLOCK": {
                "type": 1,
                "to": 2
            },
            "OPEN_UN_ESCAPED": {
                "type": 1,
                "to": 3
            },
            "OPEN": {
                "type": 1,
                "to": 4
            }
        },
        "35": {
            "OPEN_END_BLOCK": {
                "type": 1,
                "to": 67
            }
        },
        "36": {
            "OPEN_BLOCK": {
                "type": 2,
                "production": 8
            },
            "OPEN": {
                "type": 2,
                "production": 8
            },
            "OPEN_UN_ESCAPED": {
                "type": 2,
                "production": 8
            },
            "CONTENT": {
                "type": 2,
                "production": 8
            }
        },
        "37": {
            "EQUALS": {
                "type": 1,
                "to": 69
            },
            "CLOSE": {
                "type": 2,
                "production": 56
            },
            "MINUS": {
                "type": 2,
                "production": 56
            },
            "PLUS": {
                "type": 2,
                "production": 56
            },
            "DIVIDE": {
                "type": 2,
                "production": 56
            },
            "MODULUS": {
                "type": 2,
                "production": 56
            },
            "MULTIPLY": {
                "type": 2,
                "production": 56
            },
            "AND": {
                "type": 2,
                "production": 56
            },
            "OR": {
                "type": 2,
                "production": 56
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 56
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 56
            },
            "GE": {
                "type": 2,
                "production": 56
            },
            "GT": {
                "type": 2,
                "production": 56
            },
            "LE": {
                "type": 2,
                "production": 56
            },
            "LT": {
                "type": 2,
                "production": 56
            },
            "ID": {
                "type": 2,
                "production": 56
            },
            "NOT": {
                "type": 2,
                "production": 56
            },
            "STRING": {
                "type": 2,
                "production": 56
            },
            "NUMBER": {
                "type": 2,
                "production": 56
            },
            "BOOLEAN": {
                "type": 2,
                "production": 56
            },
            "LPAREN": {
                "type": 2,
                "production": 56
            },
            "SEP": {
                "type": 2,
                "production": 56
            }
        },
        "38": {
            "LPAREN": {
                "type": 1,
                "to": 14
            },
            "NOT": {
                "type": 1,
                "to": 15
            },
            "STRING": {
                "type": 1,
                "to": 16
            },
            "BOOLEAN": {
                "type": 1,
                "to": 17
            },
            "NUMBER": {
                "type": 1,
                "to": 18
            },
            "ID": {
                "type": 1,
                "to": 37
            },
            "CLOSE": {
                "type": 2,
                "production": 16
            }
        },
        "39": {
            "CLOSE": {
                "type": 2,
                "production": 20
            },
            "ID": {
                "type": 2,
                "production": 20
            },
            "NOT": {
                "type": 2,
                "production": 20
            },
            "STRING": {
                "type": 2,
                "production": 20
            },
            "NUMBER": {
                "type": 2,
                "production": 20
            },
            "BOOLEAN": {
                "type": 2,
                "production": 20
            },
            "LPAREN": {
                "type": 2,
                "production": 20
            }
        },
        "40": {
            "CLOSE": {
                "type": 2,
                "production": 21
            },
            "ID": {
                "type": 2,
                "production": 21
            },
            "NOT": {
                "type": 2,
                "production": 21
            },
            "STRING": {
                "type": 2,
                "production": 21
            },
            "NUMBER": {
                "type": 2,
                "production": 21
            },
            "BOOLEAN": {
                "type": 2,
                "production": 21
            },
            "LPAREN": {
                "type": 2,
                "production": 21
            }
        },
        "41": {
            "CLOSE": {
                "type": 2,
                "production": 17
            }
        },
        "42": {
            "ID": {
                "type": 1,
                "to": 72
            },
            "CLOSE": {
                "type": 2,
                "production": 49
            }
        },
        "43": {
            "CLOSE": {
                "type": 2,
                "production": 51
            },
            "ID": {
                "type": 2,
                "production": 51
            }
        },
        "44": {
            "CLOSE": {
                "type": 2,
                "production": 47
            },
            "MINUS": {
                "type": 2,
                "production": 47
            },
            "PLUS": {
                "type": 2,
                "production": 47
            },
            "DIVIDE": {
                "type": 2,
                "production": 47
            },
            "MODULUS": {
                "type": 2,
                "production": 47
            },
            "MULTIPLY": {
                "type": 2,
                "production": 47
            },
            "AND": {
                "type": 2,
                "production": 47
            },
            "OR": {
                "type": 2,
                "production": 47
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 47
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 47
            },
            "GE": {
                "type": 2,
                "production": 47
            },
            "GT": {
                "type": 2,
                "production": 47
            },
            "LE": {
                "type": 2,
                "production": 47
            },
            "LT": {
                "type": 2,
                "production": 47
            },
            "ID": {
                "type": 2,
                "production": 47
            },
            "NOT": {
                "type": 2,
                "production": 47
            },
            "STRING": {
                "type": 2,
                "production": 47
            },
            "NUMBER": {
                "type": 2,
                "production": 47
            },
            "BOOLEAN": {
                "type": 2,
                "production": 47
            },
            "LPAREN": {
                "type": 2,
                "production": 47
            },
            "RPAREN": {
                "type": 2,
                "production": 47
            }
        },
        "45": {
            "NUMBER": {
                "type": 1,
                "to": 74
            },
            "ID": {
                "type": 1,
                "to": 75
            }
        },
        "46": {
            "RPAREN": {
                "type": 1,
                "to": 76
            }
        },
        "47": {
            "CLOSE": {
                "type": 2,
                "production": 42
            },
            "MINUS": {
                "type": 2,
                "production": 42
            },
            "PLUS": {
                "type": 2,
                "production": 42
            },
            "DIVIDE": {
                "type": 2,
                "production": 42
            },
            "MODULUS": {
                "type": 2,
                "production": 42
            },
            "MULTIPLY": {
                "type": 2,
                "production": 42
            },
            "AND": {
                "type": 2,
                "production": 42
            },
            "OR": {
                "type": 2,
                "production": 42
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 42
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 42
            },
            "GE": {
                "type": 2,
                "production": 42
            },
            "GT": {
                "type": 2,
                "production": 42
            },
            "LE": {
                "type": 2,
                "production": 42
            },
            "LT": {
                "type": 2,
                "production": 42
            },
            "ID": {
                "type": 2,
                "production": 42
            },
            "NOT": {
                "type": 2,
                "production": 42
            },
            "STRING": {
                "type": 2,
                "production": 42
            },
            "NUMBER": {
                "type": 2,
                "production": 42
            },
            "BOOLEAN": {
                "type": 2,
                "production": 42
            },
            "LPAREN": {
                "type": 2,
                "production": 42
            },
            "RPAREN": {
                "type": 2,
                "production": 42
            }
        },
        "48": {
            "$EOF": {
                "type": 2,
                "production": 11
            },
            "OPEN_INVERSE": {
                "type": 2,
                "production": 11
            },
            "OPEN_BLOCK": {
                "type": 2,
                "production": 11
            },
            "OPEN": {
                "type": 2,
                "production": 11
            },
            "OPEN_UN_ESCAPED": {
                "type": 2,
                "production": 11
            },
            "CONTENT": {
                "type": 2,
                "production": 11
            },
            "OPEN_END_BLOCK": {
                "type": 2,
                "production": 11
            }
        },
        "49": {
            "$EOF": {
                "type": 2,
                "production": 13
            },
            "OPEN_INVERSE": {
                "type": 2,
                "production": 13
            },
            "OPEN_BLOCK": {
                "type": 2,
                "production": 13
            },
            "OPEN": {
                "type": 2,
                "production": 13
            },
            "OPEN_UN_ESCAPED": {
                "type": 2,
                "production": 13
            },
            "CONTENT": {
                "type": 2,
                "production": 13
            },
            "OPEN_END_BLOCK": {
                "type": 2,
                "production": 13
            }
        },
        "50": {
            "LPAREN": {
                "type": 1,
                "to": 14
            },
            "NOT": {
                "type": 1,
                "to": 15
            },
            "STRING": {
                "type": 1,
                "to": 16
            },
            "BOOLEAN": {
                "type": 1,
                "to": 17
            },
            "NUMBER": {
                "type": 1,
                "to": 18
            },
            "ID": {
                "type": 1,
                "to": 10
            }
        },
        "51": {
            "LPAREN": {
                "type": 1,
                "to": 14
            },
            "NOT": {
                "type": 1,
                "to": 15
            },
            "STRING": {
                "type": 1,
                "to": 16
            },
            "BOOLEAN": {
                "type": 1,
                "to": 17
            },
            "NUMBER": {
                "type": 1,
                "to": 18
            },
            "ID": {
                "type": 1,
                "to": 10
            }
        },
        "52": {
            "LPAREN": {
                "type": 1,
                "to": 14
            },
            "NOT": {
                "type": 1,
                "to": 15
            },
            "STRING": {
                "type": 1,
                "to": 16
            },
            "BOOLEAN": {
                "type": 1,
                "to": 17
            },
            "NUMBER": {
                "type": 1,
                "to": 18
            },
            "ID": {
                "type": 1,
                "to": 10
            }
        },
        "53": {
            "LPAREN": {
                "type": 1,
                "to": 14
            },
            "NOT": {
                "type": 1,
                "to": 15
            },
            "STRING": {
                "type": 1,
                "to": 16
            },
            "BOOLEAN": {
                "type": 1,
                "to": 17
            },
            "NUMBER": {
                "type": 1,
                "to": 18
            },
            "ID": {
                "type": 1,
                "to": 10
            }
        },
        "54": {
            "LPAREN": {
                "type": 1,
                "to": 14
            },
            "NOT": {
                "type": 1,
                "to": 15
            },
            "STRING": {
                "type": 1,
                "to": 16
            },
            "BOOLEAN": {
                "type": 1,
                "to": 17
            },
            "NUMBER": {
                "type": 1,
                "to": 18
            },
            "ID": {
                "type": 1,
                "to": 10
            }
        },
        "55": {
            "LPAREN": {
                "type": 1,
                "to": 14
            },
            "NOT": {
                "type": 1,
                "to": 15
            },
            "STRING": {
                "type": 1,
                "to": 16
            },
            "BOOLEAN": {
                "type": 1,
                "to": 17
            },
            "NUMBER": {
                "type": 1,
                "to": 18
            },
            "ID": {
                "type": 1,
                "to": 10
            }
        },
        "56": {
            "LPAREN": {
                "type": 1,
                "to": 14
            },
            "NOT": {
                "type": 1,
                "to": 15
            },
            "STRING": {
                "type": 1,
                "to": 16
            },
            "BOOLEAN": {
                "type": 1,
                "to": 17
            },
            "NUMBER": {
                "type": 1,
                "to": 18
            },
            "ID": {
                "type": 1,
                "to": 10
            }
        },
        "57": {
            "LPAREN": {
                "type": 1,
                "to": 14
            },
            "NOT": {
                "type": 1,
                "to": 15
            },
            "STRING": {
                "type": 1,
                "to": 16
            },
            "BOOLEAN": {
                "type": 1,
                "to": 17
            },
            "NUMBER": {
                "type": 1,
                "to": 18
            },
            "ID": {
                "type": 1,
                "to": 10
            }
        },
        "58": {
            "LPAREN": {
                "type": 1,
                "to": 14
            },
            "NOT": {
                "type": 1,
                "to": 15
            },
            "STRING": {
                "type": 1,
                "to": 16
            },
            "BOOLEAN": {
                "type": 1,
                "to": 17
            },
            "NUMBER": {
                "type": 1,
                "to": 18
            },
            "ID": {
                "type": 1,
                "to": 10
            }
        },
        "59": {
            "LPAREN": {
                "type": 1,
                "to": 14
            },
            "NOT": {
                "type": 1,
                "to": 15
            },
            "STRING": {
                "type": 1,
                "to": 16
            },
            "BOOLEAN": {
                "type": 1,
                "to": 17
            },
            "NUMBER": {
                "type": 1,
                "to": 18
            },
            "ID": {
                "type": 1,
                "to": 10
            }
        },
        "60": {
            "LPAREN": {
                "type": 1,
                "to": 14
            },
            "NOT": {
                "type": 1,
                "to": 15
            },
            "STRING": {
                "type": 1,
                "to": 16
            },
            "BOOLEAN": {
                "type": 1,
                "to": 17
            },
            "NUMBER": {
                "type": 1,
                "to": 18
            },
            "ID": {
                "type": 1,
                "to": 10
            }
        },
        "61": {
            "LPAREN": {
                "type": 1,
                "to": 14
            },
            "NOT": {
                "type": 1,
                "to": 15
            },
            "STRING": {
                "type": 1,
                "to": 16
            },
            "BOOLEAN": {
                "type": 1,
                "to": 17
            },
            "NUMBER": {
                "type": 1,
                "to": 18
            },
            "ID": {
                "type": 1,
                "to": 10
            }
        },
        "62": {
            "LPAREN": {
                "type": 1,
                "to": 14
            },
            "NOT": {
                "type": 1,
                "to": 15
            },
            "STRING": {
                "type": 1,
                "to": 16
            },
            "BOOLEAN": {
                "type": 1,
                "to": 17
            },
            "NUMBER": {
                "type": 1,
                "to": 18
            },
            "ID": {
                "type": 1,
                "to": 10
            }
        },
        "63": {
            "$EOF": {
                "type": 2,
                "production": 10
            },
            "OPEN_INVERSE": {
                "type": 2,
                "production": 10
            },
            "OPEN_BLOCK": {
                "type": 2,
                "production": 10
            },
            "OPEN": {
                "type": 2,
                "production": 10
            },
            "OPEN_UN_ESCAPED": {
                "type": 2,
                "production": 10
            },
            "CONTENT": {
                "type": 2,
                "production": 10
            },
            "OPEN_END_BLOCK": {
                "type": 2,
                "production": 10
            }
        },
        "64": {
            "$EOF": {
                "type": 2,
                "production": 12
            },
            "OPEN_INVERSE": {
                "type": 2,
                "production": 12
            },
            "OPEN_BLOCK": {
                "type": 2,
                "production": 12
            },
            "OPEN": {
                "type": 2,
                "production": 12
            },
            "OPEN_UN_ESCAPED": {
                "type": 2,
                "production": 12
            },
            "CONTENT": {
                "type": 2,
                "production": 12
            },
            "OPEN_END_BLOCK": {
                "type": 2,
                "production": 12
            }
        },
        "65": {
            "OPEN_BLOCK": {
                "type": 2,
                "production": 14
            },
            "OPEN": {
                "type": 2,
                "production": 14
            },
            "OPEN_UN_ESCAPED": {
                "type": 2,
                "production": 14
            },
            "CONTENT": {
                "type": 2,
                "production": 14
            }
        },
        "66": {
            "CONTENT": {
                "type": 1,
                "to": 1
            },
            "OPEN_BLOCK": {
                "type": 1,
                "to": 2
            },
            "OPEN_UN_ESCAPED": {
                "type": 1,
                "to": 3
            },
            "OPEN": {
                "type": 1,
                "to": 4
            },
            "$EOF": {
                "type": 2,
                "production": 1
            },
            "OPEN_END_BLOCK": {
                "type": 2,
                "production": 1
            }
        },
        "67": {
            "ID": {
                "type": 1,
                "to": 10
            }
        },
        "68": {
            "$EOF": {
                "type": 2,
                "production": 5
            },
            "OPEN_INVERSE": {
                "type": 2,
                "production": 5
            },
            "OPEN_BLOCK": {
                "type": 2,
                "production": 5
            },
            "OPEN": {
                "type": 2,
                "production": 5
            },
            "OPEN_UN_ESCAPED": {
                "type": 2,
                "production": 5
            },
            "CONTENT": {
                "type": 2,
                "production": 5
            },
            "OPEN_END_BLOCK": {
                "type": 2,
                "production": 5
            }
        },
        "69": {
            "LPAREN": {
                "type": 1,
                "to": 14
            },
            "NOT": {
                "type": 1,
                "to": 15
            },
            "STRING": {
                "type": 1,
                "to": 16
            },
            "BOOLEAN": {
                "type": 1,
                "to": 17
            },
            "NUMBER": {
                "type": 1,
                "to": 18
            },
            "ID": {
                "type": 1,
                "to": 10
            }
        },
        "70": {
            "CLOSE": {
                "type": 2,
                "production": 19
            },
            "ID": {
                "type": 2,
                "production": 19
            },
            "NOT": {
                "type": 2,
                "production": 19
            },
            "STRING": {
                "type": 2,
                "production": 19
            },
            "NUMBER": {
                "type": 2,
                "production": 19
            },
            "BOOLEAN": {
                "type": 2,
                "production": 19
            },
            "LPAREN": {
                "type": 2,
                "production": 19
            }
        },
        "71": {
            "CLOSE": {
                "type": 2,
                "production": 15
            }
        },
        "72": {
            "EQUALS": {
                "type": 1,
                "to": 69
            }
        },
        "73": {
            "CLOSE": {
                "type": 2,
                "production": 50
            },
            "ID": {
                "type": 2,
                "production": 50
            }
        },
        "74": {
            "CLOSE": {
                "type": 2,
                "production": 55
            },
            "ID": {
                "type": 2,
                "production": 55
            },
            "NOT": {
                "type": 2,
                "production": 55
            },
            "STRING": {
                "type": 2,
                "production": 55
            },
            "NUMBER": {
                "type": 2,
                "production": 55
            },
            "BOOLEAN": {
                "type": 2,
                "production": 55
            },
            "LPAREN": {
                "type": 2,
                "production": 55
            },
            "SEP": {
                "type": 2,
                "production": 55
            },
            "MINUS": {
                "type": 2,
                "production": 55
            },
            "PLUS": {
                "type": 2,
                "production": 55
            },
            "DIVIDE": {
                "type": 2,
                "production": 55
            },
            "MODULUS": {
                "type": 2,
                "production": 55
            },
            "MULTIPLY": {
                "type": 2,
                "production": 55
            },
            "AND": {
                "type": 2,
                "production": 55
            },
            "OR": {
                "type": 2,
                "production": 55
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 55
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 55
            },
            "GE": {
                "type": 2,
                "production": 55
            },
            "GT": {
                "type": 2,
                "production": 55
            },
            "LE": {
                "type": 2,
                "production": 55
            },
            "LT": {
                "type": 2,
                "production": 55
            },
            "RPAREN": {
                "type": 2,
                "production": 55
            }
        },
        "75": {
            "CLOSE": {
                "type": 2,
                "production": 54
            },
            "ID": {
                "type": 2,
                "production": 54
            },
            "NOT": {
                "type": 2,
                "production": 54
            },
            "STRING": {
                "type": 2,
                "production": 54
            },
            "NUMBER": {
                "type": 2,
                "production": 54
            },
            "BOOLEAN": {
                "type": 2,
                "production": 54
            },
            "LPAREN": {
                "type": 2,
                "production": 54
            },
            "SEP": {
                "type": 2,
                "production": 54
            },
            "MINUS": {
                "type": 2,
                "production": 54
            },
            "PLUS": {
                "type": 2,
                "production": 54
            },
            "DIVIDE": {
                "type": 2,
                "production": 54
            },
            "MODULUS": {
                "type": 2,
                "production": 54
            },
            "MULTIPLY": {
                "type": 2,
                "production": 54
            },
            "AND": {
                "type": 2,
                "production": 54
            },
            "OR": {
                "type": 2,
                "production": 54
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 54
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 54
            },
            "GE": {
                "type": 2,
                "production": 54
            },
            "GT": {
                "type": 2,
                "production": 54
            },
            "LE": {
                "type": 2,
                "production": 54
            },
            "LT": {
                "type": 2,
                "production": 54
            },
            "RPAREN": {
                "type": 2,
                "production": 54
            }
        },
        "76": {
            "CLOSE": {
                "type": 2,
                "production": 48
            },
            "MINUS": {
                "type": 2,
                "production": 48
            },
            "PLUS": {
                "type": 2,
                "production": 48
            },
            "DIVIDE": {
                "type": 2,
                "production": 48
            },
            "MODULUS": {
                "type": 2,
                "production": 48
            },
            "MULTIPLY": {
                "type": 2,
                "production": 48
            },
            "AND": {
                "type": 2,
                "production": 48
            },
            "OR": {
                "type": 2,
                "production": 48
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 48
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 48
            },
            "GE": {
                "type": 2,
                "production": 48
            },
            "GT": {
                "type": 2,
                "production": 48
            },
            "LE": {
                "type": 2,
                "production": 48
            },
            "LT": {
                "type": 2,
                "production": 48
            },
            "ID": {
                "type": 2,
                "production": 48
            },
            "NOT": {
                "type": 2,
                "production": 48
            },
            "STRING": {
                "type": 2,
                "production": 48
            },
            "NUMBER": {
                "type": 2,
                "production": 48
            },
            "BOOLEAN": {
                "type": 2,
                "production": 48
            },
            "LPAREN": {
                "type": 2,
                "production": 48
            },
            "RPAREN": {
                "type": 2,
                "production": 48
            }
        },
        "77": {
            "AND": {
                "type": 1,
                "to": 51
            },
            "CLOSE": {
                "type": 2,
                "production": 24
            },
            "OR": {
                "type": 2,
                "production": 24
            },
            "ID": {
                "type": 2,
                "production": 24
            },
            "NOT": {
                "type": 2,
                "production": 24
            },
            "STRING": {
                "type": 2,
                "production": 24
            },
            "NUMBER": {
                "type": 2,
                "production": 24
            },
            "BOOLEAN": {
                "type": 2,
                "production": 24
            },
            "LPAREN": {
                "type": 2,
                "production": 24
            },
            "RPAREN": {
                "type": 2,
                "production": 24
            }
        },
        "78": {
            "LOGIC_EQUALS": {
                "type": 1,
                "to": 52
            },
            "LOGIC_NOT_EQUALS": {
                "type": 1,
                "to": 53
            },
            "CLOSE": {
                "type": 2,
                "production": 26
            },
            "AND": {
                "type": 2,
                "production": 26
            },
            "OR": {
                "type": 2,
                "production": 26
            },
            "ID": {
                "type": 2,
                "production": 26
            },
            "NOT": {
                "type": 2,
                "production": 26
            },
            "STRING": {
                "type": 2,
                "production": 26
            },
            "NUMBER": {
                "type": 2,
                "production": 26
            },
            "BOOLEAN": {
                "type": 2,
                "production": 26
            },
            "LPAREN": {
                "type": 2,
                "production": 26
            },
            "RPAREN": {
                "type": 2,
                "production": 26
            }
        },
        "79": {
            "GT": {
                "type": 1,
                "to": 54
            },
            "GE": {
                "type": 1,
                "to": 55
            },
            "LT": {
                "type": 1,
                "to": 56
            },
            "LE": {
                "type": 1,
                "to": 57
            },
            "CLOSE": {
                "type": 2,
                "production": 28
            },
            "AND": {
                "type": 2,
                "production": 28
            },
            "OR": {
                "type": 2,
                "production": 28
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 28
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 28
            },
            "ID": {
                "type": 2,
                "production": 28
            },
            "NOT": {
                "type": 2,
                "production": 28
            },
            "STRING": {
                "type": 2,
                "production": 28
            },
            "NUMBER": {
                "type": 2,
                "production": 28
            },
            "BOOLEAN": {
                "type": 2,
                "production": 28
            },
            "LPAREN": {
                "type": 2,
                "production": 28
            },
            "RPAREN": {
                "type": 2,
                "production": 28
            }
        },
        "80": {
            "GT": {
                "type": 1,
                "to": 54
            },
            "GE": {
                "type": 1,
                "to": 55
            },
            "LT": {
                "type": 1,
                "to": 56
            },
            "LE": {
                "type": 1,
                "to": 57
            },
            "CLOSE": {
                "type": 2,
                "production": 29
            },
            "AND": {
                "type": 2,
                "production": 29
            },
            "OR": {
                "type": 2,
                "production": 29
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 29
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 29
            },
            "ID": {
                "type": 2,
                "production": 29
            },
            "NOT": {
                "type": 2,
                "production": 29
            },
            "STRING": {
                "type": 2,
                "production": 29
            },
            "NUMBER": {
                "type": 2,
                "production": 29
            },
            "BOOLEAN": {
                "type": 2,
                "production": 29
            },
            "LPAREN": {
                "type": 2,
                "production": 29
            },
            "RPAREN": {
                "type": 2,
                "production": 29
            }
        },
        "81": {
            "PLUS": {
                "type": 1,
                "to": 58
            },
            "MINUS": {
                "type": 1,
                "to": 59
            },
            "CLOSE": {
                "type": 2,
                "production": 32
            },
            "AND": {
                "type": 2,
                "production": 32
            },
            "OR": {
                "type": 2,
                "production": 32
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 32
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 32
            },
            "GE": {
                "type": 2,
                "production": 32
            },
            "GT": {
                "type": 2,
                "production": 32
            },
            "LE": {
                "type": 2,
                "production": 32
            },
            "LT": {
                "type": 2,
                "production": 32
            },
            "ID": {
                "type": 2,
                "production": 32
            },
            "NOT": {
                "type": 2,
                "production": 32
            },
            "STRING": {
                "type": 2,
                "production": 32
            },
            "NUMBER": {
                "type": 2,
                "production": 32
            },
            "BOOLEAN": {
                "type": 2,
                "production": 32
            },
            "LPAREN": {
                "type": 2,
                "production": 32
            },
            "RPAREN": {
                "type": 2,
                "production": 32
            }
        },
        "82": {
            "PLUS": {
                "type": 1,
                "to": 58
            },
            "MINUS": {
                "type": 1,
                "to": 59
            },
            "CLOSE": {
                "type": 2,
                "production": 34
            },
            "AND": {
                "type": 2,
                "production": 34
            },
            "OR": {
                "type": 2,
                "production": 34
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 34
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 34
            },
            "GE": {
                "type": 2,
                "production": 34
            },
            "GT": {
                "type": 2,
                "production": 34
            },
            "LE": {
                "type": 2,
                "production": 34
            },
            "LT": {
                "type": 2,
                "production": 34
            },
            "ID": {
                "type": 2,
                "production": 34
            },
            "NOT": {
                "type": 2,
                "production": 34
            },
            "STRING": {
                "type": 2,
                "production": 34
            },
            "NUMBER": {
                "type": 2,
                "production": 34
            },
            "BOOLEAN": {
                "type": 2,
                "production": 34
            },
            "LPAREN": {
                "type": 2,
                "production": 34
            },
            "RPAREN": {
                "type": 2,
                "production": 34
            }
        },
        "83": {
            "PLUS": {
                "type": 1,
                "to": 58
            },
            "MINUS": {
                "type": 1,
                "to": 59
            },
            "CLOSE": {
                "type": 2,
                "production": 31
            },
            "AND": {
                "type": 2,
                "production": 31
            },
            "OR": {
                "type": 2,
                "production": 31
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 31
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 31
            },
            "GE": {
                "type": 2,
                "production": 31
            },
            "GT": {
                "type": 2,
                "production": 31
            },
            "LE": {
                "type": 2,
                "production": 31
            },
            "LT": {
                "type": 2,
                "production": 31
            },
            "ID": {
                "type": 2,
                "production": 31
            },
            "NOT": {
                "type": 2,
                "production": 31
            },
            "STRING": {
                "type": 2,
                "production": 31
            },
            "NUMBER": {
                "type": 2,
                "production": 31
            },
            "BOOLEAN": {
                "type": 2,
                "production": 31
            },
            "LPAREN": {
                "type": 2,
                "production": 31
            },
            "RPAREN": {
                "type": 2,
                "production": 31
            }
        },
        "84": {
            "PLUS": {
                "type": 1,
                "to": 58
            },
            "MINUS": {
                "type": 1,
                "to": 59
            },
            "CLOSE": {
                "type": 2,
                "production": 33
            },
            "AND": {
                "type": 2,
                "production": 33
            },
            "OR": {
                "type": 2,
                "production": 33
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 33
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 33
            },
            "GE": {
                "type": 2,
                "production": 33
            },
            "GT": {
                "type": 2,
                "production": 33
            },
            "LE": {
                "type": 2,
                "production": 33
            },
            "LT": {
                "type": 2,
                "production": 33
            },
            "ID": {
                "type": 2,
                "production": 33
            },
            "NOT": {
                "type": 2,
                "production": 33
            },
            "STRING": {
                "type": 2,
                "production": 33
            },
            "NUMBER": {
                "type": 2,
                "production": 33
            },
            "BOOLEAN": {
                "type": 2,
                "production": 33
            },
            "LPAREN": {
                "type": 2,
                "production": 33
            },
            "RPAREN": {
                "type": 2,
                "production": 33
            }
        },
        "85": {
            "MULTIPLY": {
                "type": 1,
                "to": 60
            },
            "DIVIDE": {
                "type": 1,
                "to": 61
            },
            "MODULUS": {
                "type": 1,
                "to": 62
            },
            "CLOSE": {
                "type": 2,
                "production": 36
            },
            "MINUS": {
                "type": 2,
                "production": 36
            },
            "PLUS": {
                "type": 2,
                "production": 36
            },
            "AND": {
                "type": 2,
                "production": 36
            },
            "OR": {
                "type": 2,
                "production": 36
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 36
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 36
            },
            "GE": {
                "type": 2,
                "production": 36
            },
            "GT": {
                "type": 2,
                "production": 36
            },
            "LE": {
                "type": 2,
                "production": 36
            },
            "LT": {
                "type": 2,
                "production": 36
            },
            "ID": {
                "type": 2,
                "production": 36
            },
            "NOT": {
                "type": 2,
                "production": 36
            },
            "STRING": {
                "type": 2,
                "production": 36
            },
            "NUMBER": {
                "type": 2,
                "production": 36
            },
            "BOOLEAN": {
                "type": 2,
                "production": 36
            },
            "LPAREN": {
                "type": 2,
                "production": 36
            },
            "RPAREN": {
                "type": 2,
                "production": 36
            }
        },
        "86": {
            "MULTIPLY": {
                "type": 1,
                "to": 60
            },
            "DIVIDE": {
                "type": 1,
                "to": 61
            },
            "MODULUS": {
                "type": 1,
                "to": 62
            },
            "CLOSE": {
                "type": 2,
                "production": 37
            },
            "MINUS": {
                "type": 2,
                "production": 37
            },
            "PLUS": {
                "type": 2,
                "production": 37
            },
            "AND": {
                "type": 2,
                "production": 37
            },
            "OR": {
                "type": 2,
                "production": 37
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 37
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 37
            },
            "GE": {
                "type": 2,
                "production": 37
            },
            "GT": {
                "type": 2,
                "production": 37
            },
            "LE": {
                "type": 2,
                "production": 37
            },
            "LT": {
                "type": 2,
                "production": 37
            },
            "ID": {
                "type": 2,
                "production": 37
            },
            "NOT": {
                "type": 2,
                "production": 37
            },
            "STRING": {
                "type": 2,
                "production": 37
            },
            "NUMBER": {
                "type": 2,
                "production": 37
            },
            "BOOLEAN": {
                "type": 2,
                "production": 37
            },
            "LPAREN": {
                "type": 2,
                "production": 37
            },
            "RPAREN": {
                "type": 2,
                "production": 37
            }
        },
        "87": {
            "CLOSE": {
                "type": 2,
                "production": 39
            },
            "MINUS": {
                "type": 2,
                "production": 39
            },
            "PLUS": {
                "type": 2,
                "production": 39
            },
            "DIVIDE": {
                "type": 2,
                "production": 39
            },
            "MODULUS": {
                "type": 2,
                "production": 39
            },
            "MULTIPLY": {
                "type": 2,
                "production": 39
            },
            "AND": {
                "type": 2,
                "production": 39
            },
            "OR": {
                "type": 2,
                "production": 39
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 39
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 39
            },
            "GE": {
                "type": 2,
                "production": 39
            },
            "GT": {
                "type": 2,
                "production": 39
            },
            "LE": {
                "type": 2,
                "production": 39
            },
            "LT": {
                "type": 2,
                "production": 39
            },
            "ID": {
                "type": 2,
                "production": 39
            },
            "NOT": {
                "type": 2,
                "production": 39
            },
            "STRING": {
                "type": 2,
                "production": 39
            },
            "NUMBER": {
                "type": 2,
                "production": 39
            },
            "BOOLEAN": {
                "type": 2,
                "production": 39
            },
            "LPAREN": {
                "type": 2,
                "production": 39
            },
            "RPAREN": {
                "type": 2,
                "production": 39
            }
        },
        "88": {
            "CLOSE": {
                "type": 2,
                "production": 40
            },
            "MINUS": {
                "type": 2,
                "production": 40
            },
            "PLUS": {
                "type": 2,
                "production": 40
            },
            "DIVIDE": {
                "type": 2,
                "production": 40
            },
            "MODULUS": {
                "type": 2,
                "production": 40
            },
            "MULTIPLY": {
                "type": 2,
                "production": 40
            },
            "AND": {
                "type": 2,
                "production": 40
            },
            "OR": {
                "type": 2,
                "production": 40
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 40
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 40
            },
            "GE": {
                "type": 2,
                "production": 40
            },
            "GT": {
                "type": 2,
                "production": 40
            },
            "LE": {
                "type": 2,
                "production": 40
            },
            "LT": {
                "type": 2,
                "production": 40
            },
            "ID": {
                "type": 2,
                "production": 40
            },
            "NOT": {
                "type": 2,
                "production": 40
            },
            "STRING": {
                "type": 2,
                "production": 40
            },
            "NUMBER": {
                "type": 2,
                "production": 40
            },
            "BOOLEAN": {
                "type": 2,
                "production": 40
            },
            "LPAREN": {
                "type": 2,
                "production": 40
            },
            "RPAREN": {
                "type": 2,
                "production": 40
            }
        },
        "89": {
            "CLOSE": {
                "type": 2,
                "production": 41
            },
            "MINUS": {
                "type": 2,
                "production": 41
            },
            "PLUS": {
                "type": 2,
                "production": 41
            },
            "DIVIDE": {
                "type": 2,
                "production": 41
            },
            "MODULUS": {
                "type": 2,
                "production": 41
            },
            "MULTIPLY": {
                "type": 2,
                "production": 41
            },
            "AND": {
                "type": 2,
                "production": 41
            },
            "OR": {
                "type": 2,
                "production": 41
            },
            "LOGIC_EQUALS": {
                "type": 2,
                "production": 41
            },
            "LOGIC_NOT_EQUALS": {
                "type": 2,
                "production": 41
            },
            "GE": {
                "type": 2,
                "production": 41
            },
            "GT": {
                "type": 2,
                "production": 41
            },
            "LE": {
                "type": 2,
                "production": 41
            },
            "LT": {
                "type": 2,
                "production": 41
            },
            "ID": {
                "type": 2,
                "production": 41
            },
            "NOT": {
                "type": 2,
                "production": 41
            },
            "STRING": {
                "type": 2,
                "production": 41
            },
            "NUMBER": {
                "type": 2,
                "production": 41
            },
            "BOOLEAN": {
                "type": 2,
                "production": 41
            },
            "LPAREN": {
                "type": 2,
                "production": 41
            },
            "RPAREN": {
                "type": 2,
                "production": 41
            }
        },
        "90": {
            "CLOSE": {
                "type": 1,
                "to": 92
            }
        },
        "91": {
            "CLOSE": {
                "type": 2,
                "production": 52
            },
            "ID": {
                "type": 2,
                "production": 52
            }
        },
        "92": {
            "$EOF": {
                "type": 2,
                "production": 9
            },
            "OPEN_INVERSE": {
                "type": 2,
                "production": 9
            },
            "OPEN_BLOCK": {
                "type": 2,
                "production": 9
            },
            "OPEN": {
                "type": 2,
                "production": 9
            },
            "OPEN_UN_ESCAPED": {
                "type": 2,
                "production": 9
            },
            "CONTENT": {
                "type": 2,
                "production": 9
            },
            "OPEN_END_BLOCK": {
                "type": 2,
                "production": 9
            }
        }
    }
};
parser.parse = function parse(input) {

    var self = this,
        lexer = self.lexer,
        state, symbol, action, table = self.table,
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

        switch (action.type) {

        case SHIFT_TYPE:

            stack.push(symbol);

            valueStack.push(lexer.text);

            // push state
            stack.push(action.to);

            // allow to read more
            symbol = null;

            break;

        case REDUCE_TYPE:

            var production = productions[action.production],
                reducedSymbol = production.symbol,
                reducedAction = production.action,
                reducedRhs = production.rhs;

            var len = reducedRhs.length;

            var $$ = valueStack[valueStack.length - len]; // default to $$ = $1

            this.$$ = $$;

            for (var i = 0; i < len; i++) {
                this["$" + (len - i)] = valueStack[valueStack.length - 1 - i];
            }

            var ret;

            if (reducedAction) {
                ret = reducedAction.call(this);
            }

            if (ret !== undefined) {
                $$ = ret;
            } else {
                $$ = this.$$;
            }

            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                valueStack = valueStack.slice(0, -1 * len);
            }

            stack.push(reducedSymbol);

            valueStack.push($$);

            var newState = gotos[stack[stack.length - 2]][stack[stack.length - 1]];

            stack.push(newState);

            break;

        case ACCEPT_TYPE:

            return $$;
        }

    }

    return undefined;

};
return parser;
});/**
 * enhanced kissy template engine
 * @author yiminghe@gmail.com
 */
KISSY.add('xtemplate', function (S, XTemplate, commands) {

    XTemplate.addCommand = function (commandName, fn) {
        commands[commandName] = fn;
    };

    XTemplate.commands = commands;

    var subTpls = {};

    XTemplate.subTpls = subTpls;

    XTemplate.addSubTpl = function (tplName, def) {
        subTpls[tplName] = def;
    };

    return XTemplate;

}, {
    requires: ['xtemplate/base', 'xtemplate/commands']
});
/**
 * 2012-09-12 yiminghe@gmail.com
 *  - 参考 velocity, 扩充 ast
 *          - Expression/ConditionalOrExpression
 *          - EqualityExpression/RelationalExpression...
 *
 * 2012-09-11 yiminghe@gmail.com
 *  - 初步完成，添加 tc
 *
 * 对比 template
 *
 *  优势
 *      - 不会莫名其妙报错（with）
 *      - 更多出错信息，直接给出行号
 *      - 更容易扩展 command,sub-tpl
 *      - 支持子模板
 *      - 支持作用域链: ..\x ..\..\y
 *      - 内置 escapeHTML 支持
 *      - 支持预编译
 *      - 支持简单表达式 +-/%* ()
 *      - 支持简单比较 === !===
 *   劣势
 *      - 不支持表达式
 *      - 不支持复杂比较操作
 *      - 不支持 js 语法
 *
 */
