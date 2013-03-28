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
                error = "Syntax error at line " + lexer.lineNumber +
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
                        i = 0,
                        ret = undefined,
                        $$ = valueStack[valueStack.length - len]; // default to $$ = $1

                    self.$$ = $$;

                    for (; i < len; i++) {
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
 */