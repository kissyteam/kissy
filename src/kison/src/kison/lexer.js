/**
 * @ignore
 * Lexer to scan token.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Utils = require('./utils');
    var util = require('util');

    function mix(to, from) {
        for (var f in from) {
            to[f] = from[f];
        }
    }

    function isArray(obj) {
        return '[object Array]' === Object.prototype.toString.call(obj);
    }

    function inArray(item, arr) {
        for (var i = 0, l = arr.length; i < l; i++) {
            if (arr[i] === item) {
                return true;
            }
        }
        return false;
    }

    function each(object, fn, context) {
        if (object) {
            var key,
                val,
                length,
                i = 0;

            context = context || null;

            if (!isArray(object)) {
                for (key in object) {
                    // can not use hasOwnProperty
                    if (fn.call(context, object[key], key, object) === false) {
                        break;
                    }
                }
            } else {
                length = object.length;
                for (val = object[0];
                     i < length; val = object[++i]) {
                    if (fn.call(context, val, i, object) === false) {
                        break;
                    }
                }
            }
        }
    }

    function mapSymbolForCodeGen(t) {
        return this.symbolMap[t];
    }

    var serializeObject = Utils.serializeObject,
        /**
         * Lexer generator
         * @class KISSY.Kison.Lexer
         */
        Lexer = function (cfg) {

            var self = this;

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

            mix(self, cfg);

            /*
             Input languages
             @type {String}
             */

            self.resetInput(self.input);
        };

    Lexer.STATIC = {
        INITIAL: 'I',
        DEBUG_CONTEXT_LIMIT: 20,
        END_TAG: '$EOF'
    };

    Lexer.prototype = {
        constructor: Lexer,

        resetInput: function (input) {
            mix(this, {
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

        genShortId: function (field) {
            var base = 97, // a-1
                max = 122, // z
                interval = max - base + 1;
            field += '__gen';
            var self = this;
            if (!(field in self)) {
                self[field] = -1;
            }
            var index = self[field] = self[field] + 1;
            var ret = '';
            do {
                ret = String.fromCharCode(base + index % interval) + ret;
                // 00 = 10*1+0
                index = Math.floor(index / interval) - 1;
            } while (index >= 0);
            return ret;
        },

        genCode: function (cfg) {
            var STATIC = Lexer.STATIC,
                self = this,
                compressSymbol = cfg.compressSymbol,
                compressState = cfg.compressLexerState,
                code = [
                    '/*jslint quotmark: false*/',
                    mix.toString(),
                    isArray.toString(),
                    each.toString(),
                    inArray.toString()
                ],
                stateMap;

            var genPrototype = util.mix({}, Lexer.prototype, true, function (name, val) {
                if (name.match(/^(?:genCode|constructor|mapState|genShortId)$/)) {
                    return undefined;
                }
                return val;
            });

            if (compressSymbol) {
                self.symbolMap = {};
                self.mapSymbol(STATIC.END_TAG);
                genPrototype.mapSymbol = mapSymbolForCodeGen;
            }

            if (compressState) {
                stateMap = self.stateMap = {};
            }

            code.push('var Lexer = ' + Lexer.toString() + ';');

            code.push('Lexer.prototype= ' + serializeObject(genPrototype) + ';');

            code.push('Lexer.STATIC= ' + serializeObject(STATIC) + ';');

            var newCfg = serializeObject({rules: self.rules},
                (compressState || compressSymbol) ? function (v) {
                    var ret;
                    if (v && v.regexp) {
                        var state = v.state,
                            action = v.action,
                            token = v.token || 0;
                        if (token) {
                            token = self.mapSymbol(token);
                        }
                        ret = [token, v.regexp, action || 0];
                        if (compressState && state) {
                            state = util.map(state, function (s) {
                                return self.mapState(s);
                            });
                        }
                        if (state) {
                            ret.push(state);
                        }
                    }
                    return ret;
                } : 0);

            code.push('var lexer = new Lexer(' + newCfg + ');');

            if (compressState || compressSymbol) {
                // for grammar
                /*jslint evil: true*/
                self.rules = eval('(' + newCfg + ')').rules;
                if (compressState) {
                    code.push('lexer.stateMap = ' + serializeObject(stateMap) + ';');
                }
            }

            return code.join('\n');
        },

        getCurrentRules: function () {
            var self = this,
                currentState = self.stateStack[self.stateStack.length - 1],
                rules = [];
            //#JSCOVERAGE_IF
            if (self.mapState) {
                currentState = self.mapState(currentState);
            }
            each(self.rules, function (r) {
                var state = r.state || r[3];
                if (!state) {
                    if (currentState === Lexer.STATIC.INITIAL) {
                        rules.push(r);
                    }
                } else if (inArray(currentState, state)) {
                    rules.push(r);
                }
            });
            return rules;
        },

        pushState: function (state) {
            this.stateStack.push(state);
        },

        popState: function (num) {
            num = num || 1;
            var ret;
            while (num--) {
                ret = this.stateStack.pop();
            }
            return ret;
        },

        showDebugInfo: function () {
            var self = this,
                DEBUG_CONTEXT_LIMIT = Lexer.STATIC.DEBUG_CONTEXT_LIMIT,
                matched = self.matched,
                match = self.match,
                input = self.input;
            matched = matched.slice(0, matched.length - match.length);
            //#JSCOVERAGE_IF 0
            var past = (matched.length > DEBUG_CONTEXT_LIMIT ? '...' : '') +
                    matched.slice(0 - DEBUG_CONTEXT_LIMIT).replace(/\n/, ' '),
                next = match + input;
            //#JSCOVERAGE_ENDIF
            next = next.slice(0, DEBUG_CONTEXT_LIMIT) +
                (next.length > DEBUG_CONTEXT_LIMIT ? '...' : '');
            return past + next + '\n' + new Array(past.length + 1).join('-') + '^';
        },

        mapSymbol: function (t) {
            var self = this,
                symbolMap = self.symbolMap;
            if (!symbolMap) {
                return t;
            }
            // force string, see util.clone iphone5s ios7 bug
            return symbolMap[t] || (symbolMap[t] = self.genShortId('symbol'));
        },

        mapReverseSymbol: function (rs) {
            var self = this,
                symbolMap = self.symbolMap,
                i,
                reverseSymbolMap = self.reverseSymbolMap;
            if (!reverseSymbolMap && symbolMap) {
                reverseSymbolMap = self.reverseSymbolMap = {};
                for (i in symbolMap) {
                    reverseSymbolMap[symbolMap[i]] = i;
                }
            }
            //#JSCOVERAGE_IF
            if (reverseSymbolMap) {
                return reverseSymbolMap[rs];
            } else {
                return rs;
            }
        },

        mapState: function (s) {
            var self = this,
                stateMap = self.stateMap;
            if (!stateMap) {
                return s;
            }
            return stateMap[s] || (stateMap[s] = self.genShortId('state'));
        },

        lex: function () {
            var self = this,
                input = self.input,
                i,
                rule,
                m,
                ret,
                lines,
                rules = self.getCurrentRules();

            self.match = self.text = '';

            if (!input) {
                return self.mapSymbol(Lexer.STATIC.END_TAG);
            }

            for (i = 0; i < rules.length; i++) {
                rule = rules[i];
                //#JSCOVERAGE_IF 0
                var regexp = rule.regexp || rule[1],
                    token = rule.token || rule[0],
                    action = rule.action || rule[2] || undefined;
                //#JSCOVERAGE_ENDIF
                if ((m = input.match(regexp))) {
                    lines = m[0].match(/\n.*/g);
                    if (lines) {
                        self.lineNumber += lines.length;
                    }
                    mix(self, {
                        firstLine: self.lastLine,
                        lastLine: self.lineNumber + 1,
                        firstColumn: self.lastColumn,
                        lastColumn: lines ?
                            lines[lines.length - 1].length - 1 :
                            self.lastColumn + m[0].length
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

    return Lexer;
});