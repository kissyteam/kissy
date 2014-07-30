/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 30 14:53
*/
/*
combined modules:
json
json/stringify
json/quote
json/parse
json/parser
*/
KISSY.add('json', [
    './json/stringify',
    './json/parse'
], function (S, require, exports, module) {
    /**
 * @ignore
 * Json emulator for KISSY
 * @author yiminghe@gmail.com
 */
    var stringify = require('./json/stringify'), parse = require('./json/parse');    /**
 * The Json object contains methods for converting values to JavaScript Object Notation (Json)
 * and for converting Json to values.
 * @class KISSY.JSON
 * @singleton
 */
    /**
 * The Json object contains methods for converting values to JavaScript Object Notation (Json)
 * and for converting Json to values.
 * @class KISSY.JSON
 * @singleton
 */
    module.exports = {
        /**
     * Convert a value to Json, optionally replacing values if a replacer function is specified,
     * or optionally including only the specified properties if a replacer array is specified.
     * @method
     * @param value The value to convert to a Json string.
     * @param [replacer]
     * The replacer parameter can be either a function or an array. As a function, it takes two parameters, the key and the value being stringified. Initially it gets called with an empty key representing the object being stringified, and it then gets called for each property on the object or array being stringified. It should return the value that should be added to the Json string, as follows:

     * - If you return a Number, the string corresponding to that number is used as the value for the property when added to the Json string.
     * - If you return a String, that string is used as the property's value when adding it to the Json string.
     * - If you return a Boolean, "true" or "false" is used as the property's value, as appropriate, when adding it to the Json string.
     * - If you return any other object, the object is recursively stringified into the Json string, calling the replacer function on each property, unless the object is a function, in which case nothing is added to the Json string.
     * - If you return undefined, the property is not included in the output Json string.
     *
     * **Note:** You cannot use the replacer function to remove values from an array. If you return undefined or a function then null is used instead.
     *
     * @param [space] space Causes the resulting string to be pretty-printed.
     * The space argument may be used to control spacing in the final string.
     * If it is a number, successive levels in the stringification will each be indented by this many space characters (up to 10).
     * If it is a string, successive levels will indented by this string (or the first ten characters of it).
     * @return {String}
     */
        stringify: stringify,
        /**
     * Parse a string as Json, optionally transforming the value produced by parsing.
     * @param {String} text The string to parse as Json.
     * @param {Function} [reviver] If a function, prescribes how the value originally produced by parsing is transformed,
     * before being returned.
     */
        parse: parse
    };
});
KISSY.add('json/stringify', [
    './quote',
    'util'
], function (S, require, exports, module) {
    /**
 * @ignore
 * Json.stringify for KISSY
 * @author yiminghe@gmail.com
 */
    var Quote = require('./quote');
    var util = require('util');
    function padding2(n) {
        return n < 10 ? '0' + n : n;
    }
    function str(key, holder, replacerFunction, propertyList, gap, stack, indent) {
        var value = holder[key];
        if (value && typeof value === 'object') {
            if (typeof value.toJSON === 'function') {
                value = value.toJSON(key);
            } else if (value instanceof Date) {
                value = isFinite(value.valueOf()) ? value.getUTCFullYear() + '-' + padding2(value.getUTCMonth() + 1) + '-' + padding2(value.getUTCDate()) + 'T' + padding2(value.getUTCHours()) + ':' + padding2(value.getUTCMinutes()) + ':' + padding2(value.getUTCSeconds()) + 'Z' : null;
            } else if (value instanceof String || value instanceof Number || value instanceof Boolean) {
                value = value.valueOf();
            }
        }
        if (replacerFunction !== undefined) {
            value = replacerFunction.call(holder, key, value);
        }
        switch (typeof value) {
        case 'number':
            return isFinite(value) ? String(value) : 'null';
        case 'string':
            return Quote.quote(value);
        case 'boolean':
            return String(value);
        case 'object':
            if (!value) {
                return 'null';
            }
            if (util.isArray(value)) {
                return ja(value, replacerFunction, propertyList, gap, stack, indent);
            }
            return jo(value, replacerFunction, propertyList, gap, stack, indent);    // ignore undefined
        }
        // ignore undefined
        return undefined;
    }
    function jo(value, replacerFunction, propertyList, gap, stack, indent) {
        if ('@DEBUG@') {
            if (util.inArray(value, stack)) {
                throw new TypeError('cyclic json');
            }
            stack[stack.length] = value;
        }
        var stepBack = indent;
        indent += gap;
        var k, kl, i, p;
        if (propertyList !== undefined) {
            k = propertyList;
        } else {
            k = util.keys(value);
        }
        var partial = [];
        for (i = 0, kl = k.length; i < kl; i++) {
            p = k[i];
            var strP = str(p, value, replacerFunction, propertyList, gap, stack, indent);
            if (strP !== undefined) {
                var member = Quote.quote(p);
                member += ':';
                if (gap) {
                    member += ' ';
                }
                member += strP;
                partial[partial.length] = member;
            }
        }
        var ret;
        if (!partial.length) {
            ret = '{}';
        } else {
            if (!gap) {
                ret = '{' + partial.join(',') + '}';
            } else {
                var separator = ',\n' + indent;
                var properties = partial.join(separator);
                ret = '{\n' + indent + properties + '\n' + stepBack + '}';
            }
        }
        if ('@DEBUG@') {
            stack.pop();
        }
        return ret;
    }
    function ja(value, replacerFunction, propertyList, gap, stack, indent) {
        if ('@DEBUG@') {
            if (util.inArray(value, stack)) {
                throw new TypeError('cyclic json');
            }
            stack[stack.length] = value;
        }
        var stepBack = indent;
        indent += gap;
        var partial = [];
        var len = value.length;
        var index = 0;
        while (index < len) {
            var strP = str(String(index), value, replacerFunction, propertyList, gap, stack, indent);
            if (strP === undefined) {
                partial[partial.length] = 'null';
            } else {
                partial[partial.length] = strP;
            }
            ++index;
        }
        var ret;
        if (!partial.length) {
            ret = '[]';
        } else {
            if (!gap) {
                ret = '[' + partial.join(',') + ']';
            } else {
                var separator = '\n,' + indent;
                var properties = partial.join(separator);
                ret = '[\n' + indent + properties + '\n' + stepBack + ']';
            }
        }
        if ('@DEBUG@') {
            stack.pop();
        }
        return ret;
    }
    function stringify(value, replacer, space) {
        var gap = '';
        var propertyList, replacerFunction;
        if (replacer) {
            if (typeof replacer === 'function') {
                replacerFunction = replacer;
            } else if (util.isArray(replacer)) {
                propertyList = replacer;
            }
        }
        if (typeof space === 'number') {
            space = Math.min(10, space);
            gap = new Array(space + 1).join(' ');
        } else if (typeof space === 'string') {
            gap = space.slice(0, 10);
        }
        return str('', { '': value }, replacerFunction, propertyList, gap, [], '');
    }
    module.exports = stringify;    /**
 * @ignore
 * refer:
 *  - http://www.ecma-international.org/publications/standards/Ecma-262.htm
 *  - https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Json/stringify
 *  - http://www.json.org/
 *  - http://www.ietf.org/rfc/rfc4627.txt
 */
});
KISSY.add('json/quote', ['util'], function (S, require, exports, module) {
    /**
 * @ignore
 * quote and unQuote for json
 * @author yiminghe@gmail.com
 */
    var util = require('util');
    var CONTROL_MAP = {
            '\b': '\\b',
            '\f': '\\f',
            '\n': '\\n',
            '\r': '\\r',
            '\t': '\\t',
            '"': '\\"'
        }, REVERSE_CONTROL_MAP = {}, QUOTE_REG = /["\b\f\n\r\t\x00-\x1f]/g, UN_QUOTE_REG = /\\\\|\\\/|\\b|\\f|\\n|\\r|\\t|\\"|\\u[0-9a-zA-Z]{4}/g;
    util.each(CONTROL_MAP, function (original, encoded) {
        REVERSE_CONTROL_MAP[original] = encoded;
    });
    REVERSE_CONTROL_MAP['\\/'] = '/';
    REVERSE_CONTROL_MAP['\\\\'] = '\\';
    module.exports = {
        quote: function (value) {
            return '"' + value.replace(QUOTE_REG, function (m) {
                var v;
                if (!(v = CONTROL_MAP[m])) {
                    v = '\\u' + ('0000' + m.charCodeAt(0).toString(16)).slice(0 - 4);
                }
                return v;
            }) + '"';
        },
        unQuote: function (value) {
            return value.slice(1, value.length - 1).replace(UN_QUOTE_REG, function (m) {
                var v;
                if (!(v = REVERSE_CONTROL_MAP[m])) {
                    v = String.fromCharCode(parseInt(m.slice(2), 16));
                }
                return v;
            });
        }
    };
});

KISSY.add('json/parse', [
    './parser',
    './quote',
    'util'
], function (S, require, exports, module) {
    /**
 * @ignore
 * Json.parse for KISSY
 * @author yiminghe@gmail.com
 */
    var parser = require('./parser'), Quote = require('./quote');
    var util = require('util');
    parser.yy = { unQuote: Quote.unQuote };
    function walk(holder, name, reviver) {
        var val = holder[name], i, len, newElement;
        if (typeof val === 'object') {
            if (util.isArray(val)) {
                i = 0;
                len = val.length;
                var newVal = [];
                while (i < len) {
                    newElement = walk(val, String(i), reviver);
                    if (newElement !== undefined) {
                        newVal[newVal.length] = newElement;
                    }
                }
                val = newVal;
            } else {
                var keys = util.keys(val);
                for (i = 0, len = keys.length; i < len; i++) {
                    var p = keys[i];
                    newElement = walk(val, p, reviver);
                    if (newElement === undefined) {
                        delete val[p];
                    } else {
                        val[p] = newElement;
                    }
                }
            }
        }
        return reviver.call(holder, name, val);
    }
    module.exports = function (str, reviver) {
        var root = parser.parse(String(str));
        if (reviver) {
            return walk({ '': root }, '', reviver);
        } else {
            return root;
        }
    };    /**
 * @ignore
 * refer:
 *  - kison
 *  - http://www.ecma-international.org/publications/standards/Ecma-262.htm
 *  - https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Json/stringify
 *  - http://www.json.org/
 *  - http://www.ietf.org/rfc/rfc4627.txt
 */
});
KISSY.add('json/parser', [], function (S, require, exports, module) {
    /*
  Generated by kison.*/
    var parser = function (undefined) {
            /*jshint quotmark:false, loopfunc:true, indent:false, unused:false, asi:true, boss:true*/
            /* Generated by kison */
            var parser = {}, GrammarConst = {
                    'SHIFT_TYPE': 1,
                    'REDUCE_TYPE': 2,
                    'ACCEPT_TYPE': 0,
                    'TYPE_INDEX': 0,
                    'PRODUCTION_INDEX': 1,
                    'TO_INDEX': 2
                };    /*jslint quotmark: false*/
            /*jslint quotmark: false*/
            function mix(to, from) {
                for (var f in from) {
                    to[f] = from[f];
                }
            }
            function isArray(obj) {
                return '[object Array]' === Object.prototype.toString.call(obj);
            }
            function each(object, fn, context) {
                if (object) {
                    var key, val, length, i = 0;
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
                        for (val = object[0]; i < length; val = object[++i]) {
                            if (fn.call(context, val, i, object) === false) {
                                break;
                            }
                        }
                    }
                }
            }
            function inArray(item, arr) {
                for (var i = 0, l = arr.length; i < l; i++) {
                    if (arr[i] === item) {
                        return true;
                    }
                }
                return false;
            }
            var Lexer = function Lexer(cfg) {
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
                self.rules = [];
                mix(self, cfg);    /*
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
                'getCurrentRules': function () {
                    var self = this, currentState = self.stateStack[self.stateStack.length - 1], rules = [];    //#JSCOVERAGE_IF
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
                    var past = (matched.length > DEBUG_CONTEXT_LIMIT ? '...' : '') + matched.slice(0 - DEBUG_CONTEXT_LIMIT).replace(/\n/, ' '), next = match + input;    //#JSCOVERAGE_ENDIF
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
                        var regexp = rule.regexp || rule[1], token = rule.token || rule[0], action = rule.action || rule[2] || undefined;    //#JSCOVERAGE_ENDIF
                        //#JSCOVERAGE_ENDIF
                        if (m = input.match(regexp)) {
                            lines = m[0].match(/\n.*/g);
                            if (lines) {
                                self.lineNumber += lines.length;
                            }
                            mix(self, {
                                firstLine: self.lastLine,
                                lastLine: self.lineNumber + 1,
                                firstColumn: self.lastColumn,
                                lastColumn: lines ? lines[lines.length - 1].length - 1 : self.lastColumn + m[0].length
                            });
                            var match;    // for error report
                            // for error report
                            match = self.match = m[0];    // all matches
                            // all matches
                            self.matches = m;    // may change by user
                            // may change by user
                            self.text = match;    // matched content utils now
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
                            'b',
                            /^"(\\"|\\\\|\\\/|\\b|\\f|\\n|\\r|\\t|\\u[0-9a-zA-Z]{4}|[^\\"\x00-\x1f])*"/,
                            0
                        ],
                        [
                            0,
                            /^[\t\r\n\x20]/,
                            0
                        ],
                        [
                            'c',
                            /^,/,
                            0
                        ],
                        [
                            'd',
                            /^:/,
                            0
                        ],
                        [
                            'e',
                            /^\[/,
                            0
                        ],
                        [
                            'f',
                            /^\]/,
                            0
                        ],
                        [
                            'g',
                            /^\{/,
                            0
                        ],
                        [
                            'h',
                            /^\}/,
                            0
                        ],
                        [
                            'i',
                            /^-?\d+(?:\.\d+)?(?:e-?\d+)?/i,
                            0
                        ],
                        [
                            'j',
                            /^true|false/,
                            0
                        ],
                        [
                            'k',
                            /^null/,
                            0
                        ],
                        [
                            'l',
                            /^./,
                            0
                        ]
                    ]
                });
            parser.lexer = lexer;
            lexer.symbolMap = {
                '$EOF': 'a',
                'STRING': 'b',
                'COMMA': 'c',
                'COLON': 'd',
                'LEFT_BRACKET': 'e',
                'RIGHT_BRACKET': 'f',
                'LEFT_BRACE': 'g',
                'RIGHT_BRACE': 'h',
                'NUMBER': 'i',
                'BOOLEAN': 'j',
                'NULL': 'k',
                'INVALID': 'l',
                '$START': 'm',
                'json': 'n',
                'value': 'o',
                'object': 'p',
                'array': 'q',
                'elementList': 'r',
                'member': 's',
                'memberList': 't'
            };
            parser.productions = [
                [
                    'm',
                    ['n']
                ],
                [
                    'n',
                    ['o'],
                    function () {
                        return this.$1;
                    }
                ],
                [
                    'o',
                    ['b'],
                    function () {
                        return this.yy.unQuote(this.$1);
                    }
                ],
                [
                    'o',
                    ['i'],
                    function () {
                        return parseFloat(this.$1);
                    }
                ],
                [
                    'o',
                    ['p'],
                    function () {
                        return this.$1;
                    }
                ],
                [
                    'o',
                    ['q'],
                    function () {
                        return this.$1;
                    }
                ],
                [
                    'o',
                    ['j'],
                    function () {
                        return this.$1 === 'true';
                    }
                ],
                [
                    'o',
                    ['k'],
                    function () {
                        return null;
                    }
                ],
                [
                    'r',
                    ['o'],
                    function () {
                        return [this.$1];
                    }
                ],
                [
                    'r',
                    [
                        'r',
                        'c',
                        'o'
                    ],
                    function () {
                        this.$1[this.$1.length] = this.$3;
                        return this.$1;
                    }
                ],
                [
                    'q',
                    [
                        'e',
                        'f'
                    ],
                    function () {
                        return [];
                    }
                ],
                [
                    'q',
                    [
                        'e',
                        'r',
                        'f'
                    ],
                    function () {
                        return this.$2;
                    }
                ],
                [
                    's',
                    [
                        'b',
                        'd',
                        'o'
                    ],
                    function () {
                        return {
                            key: this.yy.unQuote(this.$1),
                            value: this.$3
                        };
                    }
                ],
                [
                    't',
                    ['s'],
                    function () {
                        var ret = {};
                        ret[this.$1.key] = this.$1.value;
                        return ret;
                    }
                ],
                [
                    't',
                    [
                        't',
                        'c',
                        's'
                    ],
                    function () {
                        this.$1[this.$3.key] = this.$3.value;
                        return this.$1;
                    }
                ],
                [
                    'p',
                    [
                        'g',
                        'h'
                    ],
                    function () {
                        return {};
                    }
                ],
                [
                    'p',
                    [
                        'g',
                        't',
                        'h'
                    ],
                    function () {
                        return this.$2;
                    }
                ]
            ];
            parser.table = {
                'gotos': {
                    '0': {
                        'n': 7,
                        'o': 8,
                        'q': 9,
                        'p': 10
                    },
                    '2': {
                        'o': 12,
                        'r': 13,
                        'q': 9,
                        'p': 10
                    },
                    '3': {
                        's': 16,
                        't': 17
                    },
                    '18': {
                        'o': 23,
                        'q': 9,
                        'p': 10
                    },
                    '20': {
                        'o': 24,
                        'q': 9,
                        'p': 10
                    },
                    '21': { 's': 25 }
                },
                'action': {
                    '0': {
                        'b': [
                            1,
                            undefined,
                            1
                        ],
                        'e': [
                            1,
                            undefined,
                            2
                        ],
                        'g': [
                            1,
                            undefined,
                            3
                        ],
                        'i': [
                            1,
                            undefined,
                            4
                        ],
                        'j': [
                            1,
                            undefined,
                            5
                        ],
                        'k': [
                            1,
                            undefined,
                            6
                        ]
                    },
                    '1': {
                        'a': [
                            2,
                            2
                        ],
                        'f': [
                            2,
                            2
                        ],
                        'c': [
                            2,
                            2
                        ],
                        'h': [
                            2,
                            2
                        ]
                    },
                    '2': {
                        'b': [
                            1,
                            undefined,
                            1
                        ],
                        'e': [
                            1,
                            undefined,
                            2
                        ],
                        'f': [
                            1,
                            undefined,
                            11
                        ],
                        'g': [
                            1,
                            undefined,
                            3
                        ],
                        'i': [
                            1,
                            undefined,
                            4
                        ],
                        'j': [
                            1,
                            undefined,
                            5
                        ],
                        'k': [
                            1,
                            undefined,
                            6
                        ]
                    },
                    '3': {
                        'b': [
                            1,
                            undefined,
                            14
                        ],
                        'h': [
                            1,
                            undefined,
                            15
                        ]
                    },
                    '4': {
                        'a': [
                            2,
                            3
                        ],
                        'f': [
                            2,
                            3
                        ],
                        'c': [
                            2,
                            3
                        ],
                        'h': [
                            2,
                            3
                        ]
                    },
                    '5': {
                        'a': [
                            2,
                            6
                        ],
                        'f': [
                            2,
                            6
                        ],
                        'c': [
                            2,
                            6
                        ],
                        'h': [
                            2,
                            6
                        ]
                    },
                    '6': {
                        'a': [
                            2,
                            7
                        ],
                        'f': [
                            2,
                            7
                        ],
                        'c': [
                            2,
                            7
                        ],
                        'h': [
                            2,
                            7
                        ]
                    },
                    '7': { 'a': [0] },
                    '8': {
                        'a': [
                            2,
                            1
                        ]
                    },
                    '9': {
                        'a': [
                            2,
                            5
                        ],
                        'f': [
                            2,
                            5
                        ],
                        'c': [
                            2,
                            5
                        ],
                        'h': [
                            2,
                            5
                        ]
                    },
                    '10': {
                        'a': [
                            2,
                            4
                        ],
                        'f': [
                            2,
                            4
                        ],
                        'c': [
                            2,
                            4
                        ],
                        'h': [
                            2,
                            4
                        ]
                    },
                    '11': {
                        'a': [
                            2,
                            10
                        ],
                        'f': [
                            2,
                            10
                        ],
                        'c': [
                            2,
                            10
                        ],
                        'h': [
                            2,
                            10
                        ]
                    },
                    '12': {
                        'f': [
                            2,
                            8
                        ],
                        'c': [
                            2,
                            8
                        ]
                    },
                    '13': {
                        'c': [
                            1,
                            undefined,
                            18
                        ],
                        'f': [
                            1,
                            undefined,
                            19
                        ]
                    },
                    '14': {
                        'd': [
                            1,
                            undefined,
                            20
                        ]
                    },
                    '15': {
                        'a': [
                            2,
                            15
                        ],
                        'f': [
                            2,
                            15
                        ],
                        'c': [
                            2,
                            15
                        ],
                        'h': [
                            2,
                            15
                        ]
                    },
                    '16': {
                        'h': [
                            2,
                            13
                        ],
                        'c': [
                            2,
                            13
                        ]
                    },
                    '17': {
                        'c': [
                            1,
                            undefined,
                            21
                        ],
                        'h': [
                            1,
                            undefined,
                            22
                        ]
                    },
                    '18': {
                        'b': [
                            1,
                            undefined,
                            1
                        ],
                        'e': [
                            1,
                            undefined,
                            2
                        ],
                        'g': [
                            1,
                            undefined,
                            3
                        ],
                        'i': [
                            1,
                            undefined,
                            4
                        ],
                        'j': [
                            1,
                            undefined,
                            5
                        ],
                        'k': [
                            1,
                            undefined,
                            6
                        ]
                    },
                    '19': {
                        'a': [
                            2,
                            11
                        ],
                        'f': [
                            2,
                            11
                        ],
                        'c': [
                            2,
                            11
                        ],
                        'h': [
                            2,
                            11
                        ]
                    },
                    '20': {
                        'b': [
                            1,
                            undefined,
                            1
                        ],
                        'e': [
                            1,
                            undefined,
                            2
                        ],
                        'g': [
                            1,
                            undefined,
                            3
                        ],
                        'i': [
                            1,
                            undefined,
                            4
                        ],
                        'j': [
                            1,
                            undefined,
                            5
                        ],
                        'k': [
                            1,
                            undefined,
                            6
                        ]
                    },
                    '21': {
                        'b': [
                            1,
                            undefined,
                            14
                        ]
                    },
                    '22': {
                        'a': [
                            2,
                            16
                        ],
                        'f': [
                            2,
                            16
                        ],
                        'c': [
                            2,
                            16
                        ],
                        'h': [
                            2,
                            16
                        ]
                    },
                    '23': {
                        'f': [
                            2,
                            9
                        ],
                        'c': [
                            2,
                            9
                        ]
                    },
                    '24': {
                        'h': [
                            2,
                            12
                        ],
                        'c': [
                            2,
                            12
                        ]
                    },
                    '25': {
                        'h': [
                            2,
                            14
                        ],
                        'c': [
                            2,
                            14
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
                        if (tableAction[state]) {
                            for (var symbolForState in tableAction[state]) {
                                expected.push(self.lexer.mapReverseSymbol(symbolForState));
                            }
                        }
                        error = prefix + 'syntax error at line ' + lexer.lineNumber + ':\n' + lexer.showDebugInfo() + '\n' + 'expect ' + expected.join(', ');
                        throw new Error(error);
                    }
                    switch (action[GrammarConst.TYPE_INDEX]) {
                    case GrammarConst.SHIFT_TYPE:
                        stack.push(symbol);
                        valueStack.push(lexer.text);    // push state
                        // push state
                        stack.push(action[GrammarConst.TO_INDEX]);    // allow to read more
                        // allow to read more
                        symbol = null;
                        break;
                    case GrammarConst.REDUCE_TYPE:
                        var production = productions[action[GrammarConst.PRODUCTION_INDEX]], reducedSymbol = production.symbol || production[0], reducedAction = production.action || production[2], reducedRhs = production.rhs || production[1], len = reducedRhs.length, i = 0, ret, $$ = valueStack[valueStack.length - len];    // default to $$ = $1
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
        }();
    if (typeof module !== 'undefined') {
        module.exports = parser;
    }
});
