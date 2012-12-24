/*
Copyright 2012, KISSY UI Library v1.30
MIT Licensed
build time: Dec 20 22:27
*/
/**
 * LALR grammar parser
 * @author yiminghe@gmail.com
 */
KISSY.add("kison/grammar", function (S, Base, Utils, Item, ItemSet, NonTerminal, Lexer, Production) {

    var GrammarConst = {
            SHIFT_TYPE: 1,
            REDUCE_TYPE: 2,
            ACCEPT_TYPE: 0,
            TYPE_INDEX: 0,
            PRODUCTION_INDEX: 1,
            TO_INDEX: 2
        },
        serializeObject = Utils.serializeObject,
        mix = S.mix, END_TAG = Lexer.STATIC.END_TAG, START_TAG = '$START';

    function setSize(set3) {
        var count = 0, i;
        for (i in set3) {
            count++;
        }
        return count;
    }

    function indexOf(obj, array) {
        for (var i = 0; i < array.length; i++) {

            if (obj.equals(array[i])) {
                return i;
            }

        }
        return -1;
    }


    function Grammar() {
        var self = this;
        Grammar.superclass.constructor.apply(self, arguments);
    }


    S.extend(Grammar, Base, {

        build: function () {
            var self = this,
                lexer = self.lexer,
                vs = self.get('productions');

            vs.unshift({
                symbol: START_TAG,
                rhs: [vs[0].symbol]
            });

            S.each(vs, function (v, index) {
                v.symbol = lexer.mapSymbol(v.symbol);
                var rhs = v.rhs;
                S.each(rhs, function (r, index) {
                    rhs[index] = lexer.mapSymbol(r);
                });
                vs[index] = new Production(v);
            });

            self.buildTerminals();
            self.buildNonTerminals();
            self.buildNullAble();
            self.buildFirsts();
            self.buildItemSet();
            self.buildLalrItemSets();
            self.buildTable();

        },

        buildTerminals: function () {
            var self = this,
                lexer = self.get("lexer"),
                rules = lexer && lexer.rules,
                terminals = self.get("terminals");
            terminals[lexer.mapSymbol(END_TAG)] = 1;
            S.each(rules, function (rule) {
                var token = rule.token || rule[0];
                if (token) {
                    terminals[token] = 1;
                }
            });
        },

        buildNonTerminals: function () {
            var self = this,
                terminals = self.get("terminals"),
                nonTerminals = self.get("nonTerminals"),
                productions = self.get("productions");

            S.each(productions, function (production) {
                var symbol = production.get("symbol"),
                    nonTerminal = nonTerminals[symbol];

                if (!nonTerminal) {
                    nonTerminal = nonTerminals[symbol] = new NonTerminal({
                        symbol: symbol
                    });
                }

                nonTerminal.get("productions").push(production);

                S.each(production.get("handles"), function (handle) {
                    if (!terminals[handle] && !nonTerminals[handle]) {
                        nonTerminals[handle] = new NonTerminal({
                            symbol: handle
                        });
                    }
                });
            });
        },

        buildNullAble: function () {
            var self = this,
                i,
                rhs,
                n,
                symbol,
                t,
                production,
                productions,
                nonTerminals = self.get("nonTerminals"),
                cont = true;

            // loop until no further changes have been made
            while (cont) {
                cont = false;
                // 传递
                // S -> T
                // T -> t


                // check if each production is null able
                S.each(self.get("productions"), function (production) {
                    if (!production.get("nullAble")) {
                        rhs = production.get("rhs");
                        for (i = 0, n = 0; t = rhs[i]; ++i) {
                            if (self.isNullAble(t)) {
                                n++;
                            }
                        }
                        if (n === i) { // production is null able if all tokens are null able
                            production.set("nullAble", cont = true);
                        }
                    }
                });

                //check if each symbol is null able
                for (symbol in nonTerminals) {

                    if (!nonTerminals[symbol].get("nullAble")) {
                        productions = nonTerminals[symbol].get("productions");
                        for (i = 0; production = productions[i]; i++) {
                            if (production.get("nullAble")) {
                                nonTerminals[symbol].set("nullAble", cont = true);
                                break;
                            }
                        }
                    }

                }
            }
        },

        isNullAble: function (symbol) {
            var self = this,
                nonTerminals = self.get("nonTerminals");
            // rhs
            if (symbol instanceof Array) {
                for (var i = 0, t; t = symbol[i]; ++i) {
                    if (!self.isNullAble(t)) {
                        return false;
                    }
                }
                return true;
                // terminal
            } else if (!nonTerminals[symbol]) {
                return false;
                // non terminal
            } else {
                return nonTerminals[symbol].get("nullAble");
            }
        },

        findFirst: function (symbol) {
            var self = this,
                firsts = {},
                t,
                i,
                nonTerminals = self.get("nonTerminals");
            // rhs
            if (symbol instanceof Array) {
                for (i = 0; t = symbol[i]; ++i) {
                    if (!nonTerminals[t]) {
                        firsts[t] = 1;
                    } else {
                        mix(firsts, nonTerminals[t].get("firsts"));
                    }
                    if (!self.isNullAble(t))
                        break;
                }
                return firsts;
                // terminal
            } else if (!nonTerminals[symbol]) {
                return [symbol];
                // non terminal
            } else {
                return nonTerminals[symbol].get("firsts");
            }
        },

        buildFirsts: function () {
            var self = this,
                nonTerminal,
                productions = self.get("productions"),
                nonTerminals = self.get("nonTerminals"),
                cont = true,
                symbol, firsts;

            // loop until no further changes have been made
            while (cont) {
                cont = false;

                // 传递
                // S -> T
                // T -> t

                // S -> S y
                // S -> t
                S.each(self.get("productions"), function (production) {
                    var firsts = self.findFirst(production.get("rhs"));
                    if (setSize(firsts) !== setSize(production.get("firsts"))) {
                        production.set("firsts", firsts);
                        cont = true;
                    }
                });

                for (symbol in nonTerminals) {

                    nonTerminal = nonTerminals[symbol];
                    firsts = {};
                    S.each(nonTerminal.get("productions"), function (production) {
                        mix(firsts, production.get("firsts"));
                    });
                    if (setSize(firsts) !== setSize(nonTerminal.get("firsts"))) {
                        nonTerminal.set("firsts", firsts);
                        cont = true;
                    }

                }
            }
        },

        closure: function (itemSet) {
            var self = this,
                items = itemSet.get("items"),
                productions = self.get("productions"),
                cont = 1;

            while (cont) {
                cont = false;
                S.each(items, function (item) {

                    var dotPosition = item.get("dotPosition"),
                        production = item.get("production"),
                        rhs = production.get("rhs"),
                        dotSymbol = rhs[dotPosition],
                        lookAhead = item.get("lookAhead"),
                        finalFirsts = {};

                    S.each(lookAhead, function (_, ahead) {
                        var rightRhs = rhs.slice(dotPosition + 1);
                        rightRhs.push(ahead);
                        S.mix(finalFirsts, self.findFirst(rightRhs));
                    });

                    S.each(productions, function (p2) {
                        if (p2.get("symbol") == dotSymbol) {

                            var newItem = new Item({
                                    production: p2
                                }),

                            /*
                             2012-07-26
                             improve performance,
                             reduce item number,
                             merge lookahead with same production
                             and dotPosition
                             */
                                itemIndex = itemSet.findItemIndex(newItem, true),
                                findItem;

                            if (itemIndex != -1) {
                                findItem = itemSet.getItemAt(itemIndex);
                                cont = cont || (!!findItem.addLookAhead(finalFirsts));
                            } else {
                                newItem.addLookAhead(finalFirsts);
                                itemSet.addItem(newItem);
                                cont = true;
                            }
                        }
                    });
                });
            }

            return itemSet;
        },

        gotos: function (i, x) {
            var j = new ItemSet(),
                iItems = i.get("items");
            S.each(iItems, function (item) {
                var production = item.get("production"),
                    dotPosition = item.get("dotPosition"),
                    markSymbol = production.get("rhs")[dotPosition];
                if (markSymbol == x) {
                    var newItem = new Item({
                            production: production,
                            dotPosition: dotPosition + 1
                        }),
                        itemIndex = j.findItemIndex(newItem, true), findItem;

                    if (itemIndex != -1) {
                        findItem = j.getItemAt(itemIndex);
                        findItem.addLookAhead(item.get("lookAhead"));
                    } else {
                        newItem.addLookAhead(item.get("lookAhead"));
                        j.addItem(newItem);
                    }
                }
            });
            return this.closure(j);
        },

        findItemSetIndex: function (itemSet) {
            var itemSets = this.get("itemSets"), i;
            for (i = 0; i < itemSets.length; i++) {
                if (itemSets[i].equals(itemSet)) {
                    return i;
                }
            }
            return -1;

        },

        /**
         * build item set.
         * algorithm: 4.53
         */
        buildItemSet: function () {
            var self = this,
                lexer = self.lexer,
                itemSets = self.get("itemSets"),
                lookAheadTmp = {},
                productions = self.get("productions");

            lookAheadTmp[lexer.mapSymbol(END_TAG)] = 1;

            var initItemSet = self.closure(
                new ItemSet({
                    items: [
                        new Item({
                            production: productions[0],
                            lookAhead: lookAheadTmp
                        })
                    ]
                }));

            itemSets.push(initItemSet);

            var condition = true,
                symbols = S.merge(self.get("terminals"), self.get("nonTerminals"));

            delete  symbols[lexer.mapSymbol(END_TAG)];

            while (condition) {
                condition = false;
                var itemSets2 = itemSets.concat();
                S.each(itemSets2, function (itemSet) {
                    S.each(symbols, function (v, symbol) {

                        if (!itemSet.__cache) {
                            itemSet.__cache = {};
                        }

                        // already computed itemSet 's symbol closure
                        if (itemSet.__cache[symbol]) {
                            return;
                        }

                        var itemSetNew = self.gotos(itemSet, symbol);

                        itemSet.__cache[symbol] = 1;

                        if (itemSetNew.size() == 0) {
                            return;
                        }

                        var index = self.findItemSetIndex(itemSetNew);

                        if (index > -1) {
                            itemSetNew = itemSets[index];
                        } else {
                            itemSets.push(itemSetNew);
                            condition = true;
                        }

                        itemSet.get("gotos")[symbol] = itemSetNew;
                        itemSetNew.addReverseGoto(symbol, itemSet);
                    })
                });

            }
        },

        buildLalrItemSets: function () {
            var itemSets = this.get("itemSets"), i, j, one, two;

            for (i = 0; i < itemSets.length; i++) {
                one = itemSets[i];
                for (j = i + 1; j < itemSets.length; j++) {
                    two = itemSets[j];
                    if (one.equals(two, true)) {

                        for (var k = 0; k < one.get("items").length; k++) {
                            one.get("items")[k]
                                .addLookAhead(two.get("items")[k]
                                .get("lookAhead"));
                        }

                        var oneGotos = one.get("gotos");

                        S.each(two.get("gotos"), function (item, symbol) {
                            oneGotos[symbol] = item;
                            item.addReverseGoto(symbol, one);
                        });

                        S.each(two.get("reverseGotos"), function (items, symbol) {
                            S.each(items, function (item) {
                                item.get("gotos")[symbol] = one;
                                one.addReverseGoto(symbol, item);
                            });
                        });

                        itemSets.splice(j--, 1);
                    }
                }
            }
        },

        buildTable: function () {
            var self = this,
                lexer = self.lexer,
                table = self.get("table"),
                itemSets = self.get("itemSets"),
                productions = self.get("productions"),
                gotos = {},
                action = {},
                nonTerminals,
                i,
                itemSet,
                t;
            table.gotos = gotos;
            table.action = action;
            nonTerminals = self.get("nonTerminals");
            for (i = 0; i < itemSets.length; i++) {
                itemSet = itemSets[i];

                S.each(itemSet.get("gotos"), function (anotherItemSet, symbol) {
                    if (!nonTerminals[symbol]) {
                        action[i] = action[i] || {};
                        t = action[i][symbol] = [];
                        t[GrammarConst.TYPE_INDEX] = GrammarConst.SHIFT_TYPE;
                        t[GrammarConst.PRODUCTION_INDEX] = 0;
                        t[GrammarConst.TO_INDEX] = indexOf(anotherItemSet, itemSets);
                    } else {
                        gotos[i] = gotos[i] || {};
                        gotos[i][symbol] = indexOf(anotherItemSet, itemSets);
                    }
                });

                S.each(itemSet.get("items"), function (item) {
                    var production = item.get("production");
                    if (item.get("dotPosition") == production.get("rhs").length) {
                        if (production.get("symbol") == lexer.mapSymbol(START_TAG)) {
                            if (item.get("lookAhead")[lexer.mapSymbol(END_TAG)]) {
                                action[i] = action[i] || {};
                                t = action[i][lexer.mapSymbol(END_TAG)] = [];
                                t[GrammarConst.TYPE_INDEX] = GrammarConst.ACCEPT_TYPE;
                                t[GrammarConst.TO_INDEX] = t[GrammarConst.PRODUCTION_INDEX] = 0;
                            }
                        } else {
                            action[i] = action[i] || {};
                            // 移入，规约冲突
                            // 1+ 2*3
                            // 2 -> f, f 's lookahead contains *
                            // f !-> e, e 's lookahead does not contain *
                            S.each(item.get("lookAhead"), function (_, l) {
                                t = action[i][l] = [];
                                t[GrammarConst.TYPE_INDEX] = GrammarConst.REDUCE_TYPE;
                                t[GrammarConst.TO_INDEX] = 0;
                                t[GrammarConst.PRODUCTION_INDEX] = S.indexOf(production, productions);
                            });
                        }
                    }
                });
            }
        },

        visualizeTable: function () {
            var self = this,
                table = self.get("table"),
                gotos = table.gotos,
                action = table.action,
                productions = self.get("productions"),
                ret = [];

            S.each(self.get("itemSets"), function (itemSet, i) {
                ret.push(new Array(70).join("*") + " itemSet : " + i);
                ret.push(itemSet.toString());
                ret.push("");
            });

            ret.push("");

            ret.push(new Array(70).join("*") + " table : ");

            S.each(action, function (av, index) {
                S.each(av, function (v, s) {
                    var str, type = v[GrammarConst.TYPE_INDEX];
                    if (type == GrammarConst.ACCEPT_TYPE) {
                        str = "acc"
                    } else if (type == GrammarConst.REDUCE_TYPE) {
                        var production = productions[v[GrammarConst.PRODUCTION_INDEX]];
                        str = "r, " + production.get("symbol") + "=" +
                            production.get("rhs").join(" ");
                    } else if (type == GrammarConst.SHIFT_TYPE) {
                        str = "s, " + v[GrammarConst.TO_INDEX];
                    }
                    ret.push("action[" + index + "]" + "[" + s + "] = " + str);
                });
            });

            ret.push("");

            S.each(gotos, function (sv, index) {
                S.each(sv, function (v, s) {
                    ret.push("goto[" + index + "]" + "[" + s + "] = " + v);
                });
            });

            return ret;
        },

        genCode: function (cfg) {

            cfg = cfg || {};

            var self = this,
                table = self.get("table"),
                lexer = self.get("lexer"),
                lexerCode = lexer.genCode(cfg);

            self.build();

            var productions = [];

            S.each(self.get("productions"), function (p) {
                var action = p.get("action"),
                    ret = [p.get('symbol'), p.get('rhs')];
                if (action) {
                    ret.push(action);
                }
                productions.push(ret);
            });

            var code = [];

            code.push("/* Generated by kison from KISSY */");

            code.push("var parser = {}," +
                "S = KISSY," +
                "GrammarConst = " + serializeObject(GrammarConst) +
                ";");

            code.push(lexerCode);

            code.push("parser.lexer = lexer;");

            if (cfg.compressSymbol) {
                code.push("lexer.symbolMap = " + serializeObject(lexer.symbolMap) + ";");
            }

            code.push('parser.productions = ' + serializeObject(productions) + ";");
            code.push("parser.table = " + serializeObject(table) + ";");
            code.push("parser.parse = " + parse.toString() + ";");
            code.push("return parser;");
            return code.join("\n");
        }

    }, {
        ATTRS: {
            table: {
                value: {}
            },
            itemSets: {
                value: []
            },
            productions: {
                value: []
            },
            nonTerminals: {
                value: {}
            },
            lexer: {
                setter: function (v) {
                    if (!(v instanceof  Lexer)) {
                        v = new Lexer(v);
                    }
                    this.lexer = v;
                    return v;
                }
            },
            terminals: {
                value: {}
            }
        }
    });


    // #-------------- for generation start
    function parse(input) {

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
                S.log("it is not a valid input: " + input, "error");
                return false;
            }

            // read action for current state and first input
            action = tableAction[state] && tableAction[state][symbol];

            if (!action) {
                var expected = [], error;
                if (tableAction[state]) {
                    S.each(tableAction[state], function (_, symbol) {
                        expected.push(self.lexer.mapReverseSymbol(symbol));
                    });
                }
                error = "parse error at line " + lexer.lineNumber +
                    ":\n" + lexer.showDebugInfo() +
                    "\n" + "expect " + expected.join(", ");
                S.error(error);
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
                        reducedRhs = production.rhs || production[1],
                        len = reducedRhs.length,
                        i,
                        ret,
                        $$ = valueStack[valueStack.length - len]; // default to $$ = $1

                    self.$$ = $$;

                    for (i = 0; i < len; i++) {
                        self["$" + (len - i)] = valueStack[valueStack.length - 1 - i];
                    }

                    if (reducedAction) {
                        ret = reducedAction.call(self);
                    }

                    if (ret !== undefined) {
                        $$ = ret;
                    } else {
                        $$ = self.$$;
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

                case GrammarConst.ACCEPT_TYPE:

                    return $$;
            }

        }

        return undefined;

    }

    // #-------------------- for generation end

    return Grammar;
}, {
    requires: [
        'base',
        './utils',
        './item',
        './item-set',
        './non-terminal',
        './lexer',
        './production'
    ]
});

/**
 * Refer
 *   - Compilers: Principles,Techniques and Tools.
 *   - http://zaach.github.com/jison/
 *   - http://www.gnu.org/software/bison/
 *//**
 * Item Set for KISON
 * @author yiminghe@gmail.com
 */
KISSY.add("kison/item-set", function (S, Base) {
    function ItemSet() {
        ItemSet.superclass.constructor.apply(this, arguments);
    }

    S.extend(ItemSet, Base, {

        /**
         * Insert item by order
         * @param item
         */
        addItem:function (item) {
            var items = this.get("items");
            for (var i = 0; i < items.length; i++) {
                if (items[i].get("production").toString() > item.get("production").toString()) {
                    break;
                }
            }
            items.splice(i, 0, item);
        },

        size:function () {
            return this.get("items").length;
        },

        findItemIndex:function (item, ignoreLookAhead) {
            var oneItems = this.get("items");
            for (var i = 0; i < oneItems.length; i++) {
                if (oneItems[i].equals(item, ignoreLookAhead)) {
                    return i;
                }
            }
            return -1;
        },

        getItemAt:function (index) {
            return this.get("items")[index];
        },

        equals:function (other, ignoreLookAhead) {
            var oneItems = this.get("items"),
                i,
                otherItems = other.get("items");
            if (oneItems.length != otherItems.length) {
                return false;
            }
            for (i = 0; i < oneItems.length; i++) {
                if (!oneItems[i].equals(otherItems[i], ignoreLookAhead)) {
                    return false;
                }
            }
            return true;
        },
        toString:function () {
            var ret = [];
            S.each(this.get("items"), function (item) {
                ret.push(item.toString());
            });
            return ret.join("\n");
        },

        addReverseGoto:function (symbol, item) {
            var reverseGotos = this.get("reverseGotos");
            reverseGotos[symbol] = reverseGotos[symbol] || [];
            reverseGotos[symbol].push(item);
        }

    }, {
        ATTRS:{
            items:{
                value:[]
            },
            gotos:{
                value:{}
            },
            reverseGotos:{
                // 多个来源同一个symbol指向自己
                //{ c: [x,y]}
                value:{}
            }
        }
    });

    return ItemSet;
}, {
    requires:['base']
});/**
 * Item for KISON
 * @author yiminghe@gmail.com
 */
KISSY.add("kison/item", function (S, Base) {

    function Item() {
        Item.superclass.constructor.apply(this, arguments);
    }


    S.extend(Item, Base, {

        equals: function (other, ignoreLookAhead) {
            var self = this;
            if (!other.get("production").equals(self.get("production"))) {
                return false;
            }
            if (other.get("dotPosition") != self.get("dotPosition")) {
                return false;
            }
            if (!ignoreLookAhead) {
                if (!S.equals(self.get("lookAhead"), other.get("lookAhead"))) {
                    return false;
                }
            }
            return true;
        },

        toString: function (ignoreLookAhead) {
            return this.get("production")
                .toString(this.get("dotPosition"))
                + (ignoreLookAhead ? "" :
                ("," + S.keys(this.get("lookAhead")).join("/")));
        },

        addLookAhead: function (ls) {
            var lookAhead = this.get("lookAhead"), ret = 0;
            S.each(ls, function (_, l) {
                if (!lookAhead[l]) {
                    lookAhead[l] = 1;
                    ret = 1;
                }
            });
            return ret;
        }

    }, {
        ATTRS: {
            production: {},
            dotPosition: {
                value: 0
            },
            lookAhead: {
                /*
                 2012-07-27
                 improve performance,use object to compare( equal )
                 and find( indexOf )
                 instead of array
                 */
                value: {}
            }
        }
    });

    return Item;
}, {
    requires: ['base']
});/**
 * Parser generator for kissy.
 * @author yiminghe@gmail.com
 */
KISSY.add("kison", function (S, Grammar, Production, Lexer, Utils) {

    var Kison = {};
    Kison.Grammar = Grammar;
    Kison.Production = Production;
    Kison.Lexer = Lexer;
    Kison.Utils = Utils;
    if (!S.trim('@DEBUG@')) {
        alert('kison can only use uncompressed version!');
        return null;
    }
    return Kison;

}, {
    requires: ['kison/grammar', 'kison/production', 'kison/lexer', 'kison/utils']
});/**
 * Lexer to scan token.
 * @author yiminghe@gmail.com
 */
KISSY.add("kison/lexer", function (S, Utils) {

    var serializeObject = Utils.serializeObject,

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

            S.mix(self, cfg);

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

        resetInput: function (input) {
            S.mix(this, {
                input: input,
                matched: "",
                stateStack: [Lexer.STATIC.INITIAL],
                match: "",
                text: "",
                firstLine: 1,
                lineNumber: 1,
                lastLine: 1,
                firstColumn: 1,
                lastColumn: 1
            });
        },

        genCode: function (cfg) {

            var STATIC = Lexer.STATIC,
                self = this,
                compressSymbol = cfg.compressSymbol,
                compressState = cfg.compressLexerState,
                code = [],
                stateMap;

            self.symbolId = self.stateId = 0;

            if (compressSymbol) {
                self.symbolMap = {};
                self.mapSymbol(STATIC.END_TAG);
            }

            if (compressState) {
                stateMap = self.stateMap = {};
            }

            code.push("var Lexer = " + Lexer.toString() + ';');

            code.push("Lexer.prototype= " + serializeObject(Lexer.prototype, /genCode/) + ";");

            code.push("Lexer.STATIC= " + serializeObject(STATIC) + ";");

            var newCfg = serializeObject({rules: self.rules},
                (compressState || compressSymbol) ? function (v) {
                    if (v && v.regexp) {
                        var state = v.state,
                            ret,
                            action = v.action,
                            token = v.token || 0;
                        if (token) {
                            token = self.mapSymbol(token);
                        }
                        ret = [
                            token,
                            v.regexp,
                            action || 0
                        ];
                        if (compressState && state) {
                            state = S.map(state, function (s) {
                                return self.mapState(s);
                            });
                        }
                        if (state) {
                            ret.push(state);
                        }
                        return ret;
                    }
                } : 0);

            code.push("var lexer = new Lexer(" + newCfg + ");");

            if (compressState || compressSymbol) {
                // for grammar
                self.rules = eval('(' + newCfg + ')').rules;
                if (compressState) {
                    code.push('lexer.stateMap = ' + serializeObject(stateMap) + ';');
                }
            }

            return code.join("\n");
        },

        getCurrentRules: function () {
            var self = this,
                currentState = self.stateStack[self.stateStack.length - 1],
                rules = [];
            currentState = self.mapState(currentState);
            S.each(self.rules, function (r) {
                var state = r.state || r[3];
                if (!state) {
                    if (currentState == Lexer.STATIC.INITIAL) {
                        rules.push(r);
                    }
                } else if (S.inArray(currentState, state)) {
                    rules.push(r);
                }
            });
            return rules;
        },

        pushState: function (state) {
            this.stateStack.push(state);
        },

        popState: function () {
            return this.stateStack.pop();
        },

        getStateStack: function () {
            return this.stateStack;
        },

        showDebugInfo: function () {
            var self = this,
                DEBUG_CONTEXT_LIMIT = Lexer.STATIC.DEBUG_CONTEXT_LIMIT,
                matched = self.matched,
                match = self.match,
                input = self.input;
            matched = matched.slice(0, matched.length - match.length);
            var past = (matched.length > DEBUG_CONTEXT_LIMIT ? "..." : "") +
                    matched.slice(-DEBUG_CONTEXT_LIMIT).replace(/\n/, " "),
                next = match + input;
            next = next.slice(0, DEBUG_CONTEXT_LIMIT) +
                (next.length > DEBUG_CONTEXT_LIMIT ? "..." : "");
            return past + next + "\n" + new Array(past.length + 1).join("-") + "^";
        },

        mapSymbol: function (t) {
            var self = this,
                symbolMap = self.symbolMap;
            if (!symbolMap) {
                return t;
            }
            return symbolMap[t] || (symbolMap[t] = (++self.symbolId));
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
            return stateMap[s] || (stateMap[s] = (++self.stateId));
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

            self.match = self.text = "";

            if (!S.trim(input)) {
                return self.mapSymbol(Lexer.STATIC.END_TAG);
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
                    if (ret == undefined) {
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

            S.error("lex error at line " + self.lineNumber + ":\n" + self.showDebugInfo());
        }
    };

    return Lexer;

}, {
    requires: ['./utils']
});/**
 * NonTerminal Set for KISON
 * @author yiminghe@gmail.com
 */
KISSY.add("kison/non-terminal", function (S, Base) {

    function NonTerminal() {
        NonTerminal.superclass.constructor.apply(this, arguments);
    }

    S.extend(NonTerminal, Base, {

    }, {
        ATTRS:{
            productions:{
                value:[]
            },
            firsts:{
                value:{}
            },
            symbol:{

            },
            nullAble:{
                value:false
            }
        }
    });

    return NonTerminal;

}, {
    requires:['base']
});/**
 * Production for KISON
 * @author yiminghe@gmail.com
 */
KISSY.add("kison/production", function (S, Base) {

    function Production() {
        Production.superclass.constructor.apply(this, arguments);
    }

    S.extend(Production, Base, {

        equals: function (other) {
            var self = this;
            if (!S.equals(other.get("rhs"), self.get("rhs"))) {
                return false;
            }
            return other.get("symbol") == self.get("symbol");

        },

        toString: function (dot) {
            var rhsStr = "";
            var rhs = this.get("rhs");
            S.each(rhs, function (r, index) {
                if (index == dot) {
                    rhsStr += ".";
                }
                rhsStr += r;
            });
            if (dot == rhs.length) {
                rhsStr += ".";
            }
            return this.get("symbol") + "=>" + rhsStr;
        }

    }, {
        ATTRS: {
            firsts: {
                value: {}
            },
            follows: {
                value: []
            },
            symbol: {},
            rhs: {
                value: []
            },
            nullAble: {
                value: false
            },
            action: {
                // action for this production
            }
        }
    });

    return Production;

}, {
    requires: ['base']
});/**
 * utils for kison.
 * @author yiminghe@gmail.com
 */
KISSY.add("kison/utils", function (S) {

    var doubleReg = /"/g, single = /'/g, escapeString;

    return {

        escapeString: escapeString = function (str, quote) {
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
        },

        serializeObject: function serializeObject(obj, excludeReg) {

            var r;

            if (excludeReg &&
                S.isFunction(excludeReg) &&
                (r = excludeReg(obj)) === false) {
                return false;
            }

            if (r !== undefined) {
                obj = r;
            }

            var ret = [];

            if (typeof obj == 'string') {
                return "'" + escapeString(obj) + "'";
            } else if (S.isNumber(obj)) {
                return obj + "";
            } else if (S.isRegExp(obj)) {
                return '/' +
                    obj.source + '/' +
                    (obj.global ? 'g' : '') +
                    (obj.ignoreCase ? 'i' : '') +
                    (obj.multiline ? 'm' : '');
            } else if (S.isArray(obj)) {
                ret.push('[');
                var sub = [];
                S.each(obj, function (v) {
                    var t = serializeObject(v, excludeReg);
                    if (t !== false) {
                        sub.push(t);
                    }
                });
                ret.push(sub.join(', '));
                ret.push(']');
                return ret.join("");
            } else if (S.isObject(obj)) {
                ret = ['{'];
                var start = 1;
                for (var i in obj) {
                    var v = obj[i];
                    if (excludeReg && S.isRegExp(excludeReg) && i.match(excludeReg)) {
                        continue;
                    }
                    var t = serializeObject(v, excludeReg);
                    if (t === false) {
                        continue;
                    }
                    var key = "'" + escapeString(i) + "'";
                    ret.push((start ? '' : ',') + key + ': ' + t);
                    start = 0;
                }
                ret.push('}');
                return ret.join('\n');
            } else {
                return obj + '';
            }
        }
    };

});
