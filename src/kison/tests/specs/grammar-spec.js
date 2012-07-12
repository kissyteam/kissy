/**
 * TC for KISSY LALR Grammar Parser
 */
KISSY.use("kison", function (S, Kison) {
    var Production = Kison.Production;
    var Grammar = Kison.Grammar;
    var Lexer = Kison.Lexer;

    describe("grammar", function () {

        // 4-41 文法 GOTO 图
        it("generate goto map ok", function () {

            var grammar = new Grammar({
                productions:[
                    {
                        symbol:"S0",
                        rhs:[
                            "S"
                        ]
                    },
                    {
                        symbol:"S",
                        rhs:[
                            "C", "C"
                        ]
                    },
                    {
                        symbol:"C",
                        rhs:[
                            "c", "C"
                        ]
                    },
                    {
                        symbol:"C",
                        rhs:[
                            "d"
                        ]
                    }
                ],
                terminals:{
                    "c":1,
                    "d":1
                }
            });

            var itemSets = grammar.get("itemSets");

            S.each(itemSets, function (itemSet, i) {
                S.log("************************* " + i);
                S.log(itemSet.toString());
            });

            expect(itemSets.length).toBe(7);

            S.log(itemSets);

            var i1gotos = itemSets[1].get("gotos");

            expect(itemSets[0].get("gotos")['c']).toBe(itemSets[1]);

            S.log("!!!!!!!!!!!!!!!");
            S.log(itemSets[4].get("gotos")['c'].toString());
            S.log("!!!!!!!!!!!!!!!");

            expect(itemSets[4].get("gotos")['c']).toBe(itemSets[1]);

            var num = 0;

            S.each(i1gotos, function (itemSet, symbol) {
                S.log("************************* " + symbol);
                S.log(itemSet.toString());
                if (symbol == "c") {
                    expect(itemSet).toBe(itemSets[1]);
                }
                num++;
            });

            expect(num).toBe(3);

        });


        it("generate table ok", function () {

            S.log('it("generate table ok", function () {');

            var grammar = new Grammar({
                productions:[
                    {
                        symbol:"S0",
                        rhs:[
                            "S"
                        ]
                    },
                    {
                        symbol:"S",
                        rhs:[
                            "C", "C"
                        ]
                    },
                    {
                        symbol:"C",
                        rhs:[
                            "c", "C"
                        ]
                    },
                    {
                        symbol:"C",
                        rhs:[
                            "d"
                        ]
                    }
                ],
                terminals:{
                    "c":1,
                    "d":1
                }
            });

            var table = grammar.visualizeTable();

            S.log(table.join("\n"));

        });

        it("parse ok", function () {

            var grammar = new Grammar({
                productions:[
                    {
                        symbol:"S0",
                        rhs:[
                            "S"
                        ]
                    },
                    {
                        symbol:"S",
                        rhs:[
                            "C", "C"
                        ]
                    },
                    {
                        symbol:"C",
                        rhs:[
                            "c", "C"
                        ]
                    },
                    {
                        symbol:"C",
                        rhs:[
                            "d"
                        ]
                    }
                ],
                lexer:{
                    rules:[
                        {
                            regexp:/^c/,
                            token:'c'
                        },
                        {
                            regexp:/^d/,
                            token:'d'
                        }
                    ]
                }
            });

            expect(grammar.parse("ccdd")).toBe(true);
        });


        it("can not parse invalid input", function () {

            var grammar = new Grammar({
                productions:[
                    {
                        symbol:"S0",
                        rhs:[
                            "S"
                        ]
                    },
                    {
                        symbol:"S",
                        rhs:[
                            "C", "C"
                        ]
                    },
                    {
                        symbol:"C",
                        rhs:[
                            "c", "C"
                        ]
                    },
                    {
                        symbol:"C",
                        rhs:[
                            "d"
                        ]
                    }
                ],
                lexer:{
                    rules:[
                        {
                            regexp:/^c/,
                            token:'c'
                        },
                        {
                            regexp:/^d/,
                            token:'d'
                        }
                    ]
                }
            });

            expect(grammar.parse("dc")).toBe(false);
        });


        it("parse ok with action", function () {

            S.log("---------------- parse ok with action : ccdd by ");
            S.log(" S0 => S ");
            S.log(" S => CC ");
            S.log(" C => cC ");
            S.log(" C => d ");
            S.log("------------------------------------------------\n");

            // S0 => S
            // S => CC
            // C => cC
            // C => d
            var ret = [];

            var grammar = new Grammar({
                productions:[
                    {
                        symbol:"S0",
                        rhs:[
                            "S"
                        ],
                        action:function (S) {
                            ret.push("S0 => S");
                            ret.push("|_____ " + S + " -> S0");
                            ret.push("");
                        }
                    },
                    {
                        symbol:"S",
                        rhs:[
                            "C", "C"
                        ],
                        action:function (C1, C2) {
                            ret.push("S => C C");
                            ret.push("|_____ " + C1 + " + " + C2 + " -> S");
                            ret.push("");
                            return C1 + C2;
                        }
                    },
                    {
                        symbol:"C",
                        rhs:[
                            "c", "C"
                        ],
                        action:function (c, C) {
                            ret.push("C => c C");
                            ret.push("|_____ " + c + " + " + C + " -> C");
                            ret.push("");
                            return c + C;
                        }
                    },
                    {
                        symbol:"C",
                        rhs:[
                            "d"
                        ],
                        action:function (d) {
                            ret.push("C => d");
                            ret.push("|_____ " + d + " -> C");
                            ret.push("");
                            return d;
                        }
                    }
                ],
                lexer:{
                    rules:[
                        {
                            regexp:/^c/,
                            token:'c'
                        },
                        {
                            regexp:/^d/,
                            token:'d'
                        }
                    ]
                }
            });

            expect(grammar.parse("ccdd")).toBe(true);

            S.log(ret.join("\n"));
        });


    });
});
