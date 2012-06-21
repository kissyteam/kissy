/**
 * LALR grammar parser
 * @author yiminghe@gmail.com
 */
KISSY.add("Grammar", function (S, Base, Item, ItemSet, NonTerminal) {

    var mix = S.mix;

    function setSize(set) {
        var count = 0;
        for (var i in set) {
            if (set.hasOwnProperty(i)) {
                count++;
            }
        }
        return count;
    }

    function Grammar() {
        var self = this;
        Grammar.superclass.constructor.apply(self, arguments);
        self.buildNonTerminals();
        self.buildNullAble();
        self.buildFirsts();
    }


    S.extend(Grammar, Base, {

        buildNonTerminals:function () {
            var self = this,
                terminals = self.get("terminals"),
                nonTerminals = self.get("nonTerminals"),
                productions = self.get("productions");

            S.each(productions, function (production) {
                var symbol = production.symbol,
                    nonTerminal = nonTerminals[symbol];

                if (!nonTerminal) {
                    nonTerminal = nonTerminals[symbol] = new NonTerminal({
                        symbol:symbol
                    });
                }

                nonTerminal.get("productions").push(production);

                S.each(production.get("handles"), function (handle) {
                    if (!terminals[handle] && !nonTerminals[handle]) {
                        nonTerminals[handle] = new NonTerminal({
                            symbol:handle
                        });
                    }
                });
            });
        },

        buildNullAble:function () {
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
                    if (!symbol.get("nullAble")) {
                        productions = nonTerminals[symbol].get("productions");
                        for (i = 0; production = productions[i]; i++) {
                            if (production.get("nullAble")) {
                                nonTerminals[symbol].set("nullAble", cont = true);
                            }
                        }
                    }
                }
            }
        },

        isNullAble:function (symbol) {
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

        findFirst:function (symbol) {
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

        buildFirsts:function () {
            var self = this,
                nonTerminal,
                productions = self.get("productions"),
                nonTerminals = self.get("nonTerminals"),
                cont = true,
                symbol, firsts;

            // loop until no further changes have been made
            while (cont) {
                cont = false;

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

        closure:function (itemSet) {
            var self = this,
                items = itemSet.get("items"),
                productions = self.get("productions");
            var cont;
            while (cont) {
                cont = false;
                S.each(items, function (item) {
                    var dotPosition = item.get("dotPosition"),
                        production = item.get("production"),
                        rhs = production.get("rhs"),
                        dotSymbol = rhs[dotPosition],
                        lookAhead = item.get("lookAhead"),
                        rightRhs = rhs.slice(dotPosition);
                    if (lookAhead[0]) {
                        rightRhs.push(lookAhead[0]);
                    }
                    var firsts = self.findFirst(rightRhs);
                    S.each(productions, function (p2) {
                        if (p2.get("symbol") == dotSymbol) {
                            items.push(new Item({
                                production:p2,
                                lookAhead:S.merge(firsts)
                            }));
                            cont = true;
                        }
                    });
                });
            }
        },

        /**
         * build item set.
         * algorithm: 4.53
         */
        buildItemSet:function () {
            var self = this,
                itemSet = self.get("itemSet"),
                productions = self.get("productions");

            var initItem = new Item({
                production:productions[0],
                lookAhead:['$EOF']
            });

            itemSet.addItem(initItem);
            var count;
            // !TODO 还未完成
            while (1) {
            }


        }

    }, {
        ATTRS:{
            itemSet:{
                value:new ItemSet()
            },
            productions:{
                value:[]
            },
            nonTerminals:{
                value:{

                }
            },
            terminals:{
                value:{
                    "$EOF":1
                }
            }
        }
    });

}, {
    requires:[
        'base',
        './Item',
        './ItemSet',
        './NonTerminal'
    ]
});

/**
 * Refer
 *   - Compilers: Principles,Techniques and Tools.
 *   - http://zaach.github.com/jison/
 */