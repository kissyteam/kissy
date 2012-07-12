/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 12 21:23
*/
/**
 * LALR grammar parser
 * @author yiminghe@gmail.com
 */
KISSY.add("kison/Grammar", function (S, Base, Item, ItemSet, NonTerminal, Lexer, Production) {

    var SHIFT_TYPE = 1;
    var REDUCE_TYPE = 2;
    var ACCEPT_TYPE = 0;

    var mix = S.mix, END_TAG = '$EOF', START_TAG = '$START';

    function mergeArray(from, to) {
        for (var i = 0; i < to.length; i++) {
            if (!S.inArray(to[i], from)) {
                from.push(to[i]);
            }
        }
    }

    function setSize(set3) {
        var count = 0;
        for (var i in set3) {
            if (set3.hasOwnProperty(i)) {
                count++;
            }
        }
        return count;
    }

    function ObjectToArray(obj) {
        var ret = [];
        S.each(obj, function (v, k) {
            ret.push(k);
        });
        return ret;
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

        self.buildTerminals();
        self.buildNonTerminals();
        self.buildNullAble();
        self.buildFirsts();
        self.buildItemSet();
        self.buildLalrItemSets();
        self.buildTable();
    }


    S.extend(Grammar, Base, {

        buildTerminals:function () {
            var self = this,
                lexer = self.get("lexer"),
                rules = lexer && lexer.get("rules"),
                terminals = self.get("terminals");
            terminals[END_TAG] = 1;
            S.each(rules, function (rule) {
                if (rule.token) {
                    terminals[rule.token] = 1;
                }
            });
        },

        buildNonTerminals:function () {
            var self = this,
                terminals = self.get("terminals"),
                nonTerminals = self.get("nonTerminals"),
                productions = self.get("productions");

            S.each(productions, function (production) {
                var symbol = production.get("symbol"),
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
                    if (nonTerminals.hasOwnProperty(symbol)) {
                        if (!nonTerminals[symbol].get("nullAble")) {
                            productions = nonTerminals[symbol].get("productions");
                            for (i = 0; production = productions[i]; i++) {
                                if (production.get("nullAble")) {
                                    nonTerminals[symbol].set("nullAble", cont = true);
                                }
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

                    if (nonTerminals.hasOwnProperty(symbol)) {

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
            }
        },

        closure:function (itemSet) {
            var self = this,
                items = itemSet.get("items"),
                productions = self.get("productions");
            var cont = 1;
            while (cont) {
                cont = false;
                S.each(items, function (item) {

                    var dotPosition = item.get("dotPosition"),
                        production = item.get("production"),
                        rhs = production.get("rhs"),
                        dotSymbol = rhs[dotPosition],
                        lookAhead = item.get("lookAhead"),
                        finalFirsts = {};

                    S.each(lookAhead, function (ahead) {
                        var rightRhs = rhs.slice(dotPosition + 1);
                        rightRhs.push(ahead);
                        S.mix(finalFirsts, self.findFirst(rightRhs));
                    });

                    S.each(productions, function (p2) {
                        var itemNew = new Item({
                            production:p2,
                            lookAhead:ObjectToArray(finalFirsts)
                        });
                        if (p2.get("symbol") == dotSymbol &&
                            itemSet.findItemIndex(itemNew) == -1) {
                            itemSet.addItem(itemNew);
                            cont = true;
                        }
                    });
                });
            }
            return itemSet;
        },

        gotos:function (i, x) {
            var j = new ItemSet();
            var iItems = i.get("items");
            S.each(iItems, function (item) {
                var production = item.get("production"),
                    dotPosition = item.get("dotPosition"),
                    markSymbol = production.get("rhs")[dotPosition];
                if (markSymbol == x) {
                    j.addItem(new Item({
                        production:production,
                        dotPosition:dotPosition + 1,
                        lookAhead:item.get("lookAhead").concat()
                    }));
                }
            });
            return this.closure(j);
        },

        findItemSetIndex:function (itemSet) {
            var itemSets = this.get("itemSets");
            for (var i = 0; i < itemSets.length; i++) {
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
        buildItemSet:function () {
            var self = this,
                itemSets = self.get("itemSets"),
                productions = self.get("productions");

            var initItemSet = self.closure(
                new ItemSet({
                    items:[
                        new Item({
                            production:productions[0],
                            lookAhead:[END_TAG]
                        })
                    ]
                }));

            itemSets.push(initItemSet);

            var condition = true;

            var symbols = S.merge(self.get("terminals"), self.get("nonTerminals"));

            delete  symbols[END_TAG];

            while (condition) {
                condition = false;
                var itemSets2 = itemSets.concat();
                S.each(itemSets2, function (itemSet) {
                    S.each(symbols, function (v, symbol) {

                        if (!itemSet.__cache) {
                            itemSet.__cache = {};
                        }

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

        buildLalrItemSets:function () {
            var itemSets = this.get("itemSets");

            for (var i = 0; i < itemSets.length; i++) {
                var one = itemSets[i];
                for (var j = i + 1; j < itemSets.length; j++) {
                    var two = itemSets[j];
                    if (one.equals(two, true)) {

                        for (var k = 0; k < one.get("items").length; k++) {
                            mergeArray(one.get("items")[k].get("lookAhead"),
                                two.get("items")[k].get("lookAhead"));
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

        buildTable:function () {
            var self = this;
            var table = self.get("table");
            var itemSets = self.get("itemSets");
            var gotos = {};
            var action = {};
            table.gotos = gotos;
            table.action = action;
            var nonTerminals = self.get("nonTerminals");
            for (var i = 0; i < itemSets.length; i++) {
                var itemSet = itemSets[i];

                S.each(itemSet.get("gotos"), function (anotherItemSet, symbol) {
                    if (!nonTerminals[symbol]) {
                        action[i] = action[i] || {};
                        action[i][symbol] = {
                            type:SHIFT_TYPE,
                            to:indexOf(anotherItemSet, itemSets)
                        };
                    } else {
                        gotos[i] = gotos[i] || {};
                        gotos[i][symbol] = indexOf(anotherItemSet, itemSets);
                    }
                });

                S.each(itemSet.get("items"), function (item) {
                    var production = item.get("production");
                    if (item.get("dotPosition") == production.get("rhs").length) {
                        if (production.get("symbol") == START_TAG) {
                            if (S.inArray(END_TAG, item.get("lookAhead"))) {
                                action[i] = action[i] || {};
                                action[i][END_TAG] = {
                                    type:ACCEPT_TYPE
                                };
                            }
                        } else {
                            action[i] = action[i] || {};
                            S.each(item.get("lookAhead"), function (l) {
                                action[i][l] = {
                                    type:REDUCE_TYPE,
                                    production:production
                                };
                            });
                        }
                    }
                });
            }
        },


        visualizeTable:function () {
            var table = this.get("table");
            var gotos = table.gotos;
            var action = table.action;
            var ret = [];

            S.each(action, function (av, index) {
                S.each(av, function (v, s) {
                    var str, type = v.type;
                    if (type == ACCEPT_TYPE) {
                        str = "acc"
                    } else if (type == REDUCE_TYPE) {
                        str = "r" + v.to;
                    } else if (type == SHIFT_TYPE) {
                        str = "s" + v.to;
                    }
                    ret.push("action[" + index + "]" + "[" + s + "] = " + str);
                });
            });

            S.each(gotos, function (sv, index) {
                S.each(sv, function (v, s) {
                    ret.push("goto[" + index + "]" + "[" + s + "] = " + v);
                });
            });

            return ret;
        },


        parse:function (input) {

            var self = this,
                lexer = this.get("lexer"),
                state,
                symbol,
                lexerRet,
                nonTerminals = self.get("nonTerminals"),
                action,
                table = self.get("table"),
                gotos = table.gotos,
                tableAction = table.action,
                valueStack = [null],
                stack = [0];

            lexer.set("input", input);

            while (1) {
                // retrieve state number from top of stack
                state = stack[stack.length - 1];

                if (!symbol) {
                    lexerRet = lexer.lex();
                    symbol = lexerRet.token;
                }

                if (!symbol) {
                    S.log("it is not a valid input : " + input, "error");
                    return false;
                }

                // read action for current state and first input
                action = tableAction[state] && tableAction[state][symbol];

                if (!action) {
                    S.log(" no action for : " + symbol, "error");
                    S.log("it is not a valid input : " + input, "error");
                    return false;
                }

                switch (action.type) {

                    case SHIFT_TYPE:

                        stack.push(symbol);

                        valueStack.push(lexerRet.text);

                        // push state
                        stack.push(action.to);

                        // allow to read more
                        symbol = null;

                        break;

                    case REDUCE_TYPE:

                        var production = action.production;

                        var len = production.get("rhs").length;

                        var $$ = valueStack[valueStack.length - len]; // default to $$ = $1

                        var args = valueStack.slice(-len);

                        var ret = production.get("action").apply(null, args);

                        if (ret !== undefined) {
                            $$ = ret;
                        }

                        if (len) {
                            stack = stack.slice(0, -1 * len * 2);
                            valueStack = valueStack.slice(0, -1 * len);
                        }

                        stack.push(production.get("symbol"));

                        valueStack.push($$);

                        var newState = gotos[stack[stack.length - 2]][stack[stack.length - 1]];

                        stack.push(newState);

                        break;

                    case ACCEPT_TYPE:

                        return true;
                }

            }

        }

    }, {
        ATTRS:{
            table:{
                value:{}
            },
            itemSets:{
                value:[]
            },
            productions:{
                value:[],
                setter:function (vs) {
                    vs.unshift({
                        symbol:START_TAG,
                        rhs:[vs[0].symbol]
                    });
                    S.each(vs, function (v, index) {
                        vs[index] = new Production(v);
                    });
                }
            },
            nonTerminals:{
                value:{}
            },
            lexer:{
                setter:function (v) {
                    return new Lexer(v);
                }
            },
            terminals:{
                value:{}
            }
        }
    });

    return Grammar;
}, {
    requires:[
        'base',
        './Item',
        './ItemSet',
        './NonTerminal',
        './Lexer',
        './Production'
    ]
});

/**
 * Refer
 *   - Compilers: Principles,Techniques and Tools.
 *   - http://zaach.github.com/jison/
 *   - http://www.gnu.org/software/bison/
 *//**
 * Item for KISON
 * @author yiminghe@gmail.com
 */
KISSY.add("kison/Item", function (S, Base) {

    function Item() {
        Item.superclass.constructor.apply(this, arguments);
    }


    S.extend(Item, Base, {

        equals:function (other, ignoreLookAhead) {
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

        toString:function () {
            return this.get("production").toString(this.get("dotPosition")) +
                "," + this.get("lookAhead").join("/");
        }

    }, {
        ATTRS:{
            production:{},
            dotPosition:{
                value:0
            },
            lookAhead:{
                value:[]
            }
        }
    });

    return Item;
}, {
    requires:['base']
});/**
 * Item Set for KISON
 * @author yiminghe@gmail.com
 */
KISSY.add("kison/ItemSet", function (S, Base) {
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

        findItemIndex:function (item) {
            var oneItems = this.get("items");
            for (var i = 0; i < oneItems.length; i++) {
                if (oneItems[i].equals(item)) {
                    return i;
                }
            }
            return -1;
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
 * Lexer to scan token.
 * @author yiminghe@gmail.com
 */
KISSY.add("kison/Lexer", function (S, Base) {

    var END_TAG = '$EOF';

    function Lexer() {
        Lexer.superclass.constructor.apply(this, arguments);
    }

    Lexer.ATTRS = {
        /**
         * Input languages
         * @type String
         */
        input:{
            value:""
        },

        /**
         * lex rules.
         * @type Object[]
         * @example
         * [
         *  {
         *   regexp:/^\w+/,
         *   token:'c',
         *   action:function(match){}
         *  }
         * ]
         */
        rules:{
            value:[]
        }

    };

    S.extend(Lexer, Base, {
        lex:function () {
            var self = this,
                input = self.get("input"),
                i,
                rule,
                m,
                ret,
                rules = self.get("rules");

            if (!S.trim(input)) {
                return {
                    token:END_TAG
                };
            }

            for (i = 0; i < rules.length; i++) {
                rule = rules[i];
                if (m = input.match(rule.regexp)) {
                    ret = rule.action && rule.action(m);
                    if (ret == undefined) {
                        ret = {
                            token:rule.token,
                            text:m[0]
                        };
                    }
                    input = input.slice(m[0].length);
                    self.set("input", input);
                    if (ret.token) {
                        return ret;
                    } else {
                        return self.lex();
                    }
                }
            }

            S.error("no lex rules for :\n" + input)
        }
    });

    return Lexer;

}, {
    requires:['base']
});/**
 * NonTerminal Set for KISON
 * @author yiminghe@gmail.com
 */
KISSY.add("kison/NonTerminal", function (S, Base) {

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
KISSY.add("kison/Production", function (S, Base) {

    function Production() {
        Production.superclass.constructor.apply(this, arguments);
    }

    S.extend(Production, Base, {

        equals:function (other) {
            var self = this;
            if (!S.equals(other.get("rhs"), self.get("rhs"))) {
                return false;
            }
            return other.get("symbol") == self.get("symbol");

        },

        toString:function (dot) {
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
        ATTRS:{
            firsts:{
                value:{}
            },
            follows:{
                value:[]
            },
            symbol:{},
            rhs:{
                value:[]
            },
            nullAble:{
                value:false
            },
            action:{
                // action for this production
                value:S.noop
            }
        }
    });

    return Production;

}, {
    requires:['base']
});/**
 * Parser generator for kissy.
 * @author yiminghe@gmail.com
 */
KISSY.add("kison", function (S, Grammar, Production, Lexer) {

    var Kison = {};
    Kison.Grammar = Grammar;
    Kison.Production = Production;
    Kison.Lexer = Lexer;
    return Kison;

}, {
    requires:['kison/Grammar', 'kison/Production','kison/Lexer']
});
