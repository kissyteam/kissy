/**
 * TC for KISSY LALR Grammar Parser
 */
KISSY.use("kison", function (S, Kison) {
    var Grammar = Kison.Grammar;
    var Utils = Kison.Utils;

    if (typeof global == 'undefined') {
        window.global = {};
    }

    describe("kison", function () {

        it('escape correctly', function () {

            expect(Utils.escapeString("'\\")).toBe("\\'\\\\");

            expect(eval("'" + Utils.escapeString("'\\") + "'")).toBe("'\\");

        });

        // 4-41 文法 GOTO 图
        it("generate goto map ok", function () {

            var grammar = new Grammar({
                productions: [
                    {
                        symbol: "S0",
                        rhs: [
                            "S"
                        ]
                    },
                    {
                        symbol: "S",
                        rhs: [
                            "C", "C"
                        ]
                    },
                    {
                        symbol: "C",
                        rhs: [
                            "c", "C"
                        ]
                    },
                    {
                        symbol: "C",
                        rhs: [
                            "d"
                        ]
                    }
                ],
                lexer: {
                    rules: [
                        {
                            regexp: /^c/,
                            token: 'c'
                        },
                        {
                            regexp: /^d/,
                            token: 'd'
                        }
                    ]
                }
            });

            grammar.build();

            var itemSets = grammar.get("itemSets");

            S.each(itemSets, function (itemSet, i) {
                 S.log("************************* " + i);
                 S.log(itemSet.toString());
            });

            expect(itemSets.length).toBe(8);

            var i1gotos = itemSets[1].get("gotos");

            var cItem = itemSets[0].get("gotos")['c'];
            expect(cItem === itemSets[1]).toBe(true);

            // S.log("!!!!!!!!!!!!!!!");
            // // S.log(itemSets[4].get("gotos")['c'].toString());
            // S.log("!!!!!!!!!!!!!!!");

            // expect(itemSets[4].get("gotos")['c']).toBe(itemSets[1]);

            var num = 0;

            S.each(i1gotos, function (itemSet, symbol) {
                // S.log("************************* " + symbol);
                // S.log(itemSet.toString());
                if (symbol == "c") {
                    expect(itemSet === itemSets[1]).toBe(true);
                }
                num++;
            });

            expect(num).toBe(3);

        });

        it("generate table ok", function () {

            // S.log('it("generate table ok", function () {');

            var grammar = new Grammar({
                productions: [
                    {
                        symbol: "S0",
                        rhs: [
                            "S"
                        ]
                    },
                    {
                        symbol: "S",
                        rhs: [
                            "C", "C"
                        ]
                    },
                    {
                        symbol: "C",
                        rhs: [
                            "c", "C"
                        ]
                    },
                    {
                        symbol: "C",
                        rhs: [
                            "d"
                        ]
                    }
                ],
                lexer: {
                    rules: [
                        {
                            regexp: /^c/,
                            token: 'c'
                        },
                        {
                            regexp: /^d/,
                            token: 'd'
                        }
                    ]
                }
            });

            grammar.build();

            var table = grammar.visualizeTable();

            // S.log(table.join("\n"));

        });

        it("parse ok", function () {

            var grammar = new Grammar({
                productions: [
                    {
                        symbol: "S0",
                        rhs: [
                            "S"
                        ]
                    },
                    {
                        symbol: "S",
                        rhs: [
                            "C", "C"
                        ]
                    },
                    {
                        symbol: "C",
                        rhs: [
                            "c", "C"
                        ]
                    },
                    {
                        symbol: "C",
                        rhs: [
                            "d"
                        ]
                    }
                ],
                lexer: {
                    rules: [
                        {
                            regexp: /^c/,
                            token: 'c'
                        },
                        {
                            regexp: /^d/,
                            token: 'd'
                        }
                    ]
                }
            });

            expect(new Function(grammar.genCode(true))().parse("ccdd")).not.toBe(false);
        });


        it("can not parse invalid input", function () {

            var grammar = new Grammar({
                productions: [
                    {
                        symbol: "S0",
                        rhs: [
                            "S"
                        ]
                    },
                    {
                        symbol: "S",
                        rhs: [
                            "C", "C"
                        ]
                    },
                    {
                        symbol: "C",
                        rhs: [
                            "c", "C"
                        ]
                    },
                    {
                        symbol: "C",
                        rhs: [
                            "d"
                        ]
                    }
                ],
                lexer: {
                    rules: [
                        {
                            regexp: /^c/,
                            token: 'c'
                        },
                        {
                            regexp: /^d/,
                            token: 'd'
                        }
                    ]
                }
            });

            expect(function () {
                new Function(grammar.genCode())().parse("dc");
            }).toThrow('parse error at line 1:\ndc\n--^\n' +
                'expect c, d');

        });


        it("can not parse invalid input in compress mode", function () {

            var grammar = new Grammar({
                productions: [
                    {
                        symbol: "S0",
                        rhs: [
                            "S"
                        ]
                    },
                    {
                        symbol: "S",
                        rhs: [
                            "C", "C"
                        ]
                    },
                    {
                        symbol: "C",
                        rhs: [
                            "c", "C"
                        ]
                    },
                    {
                        symbol: "C",
                        rhs: [
                            "d"
                        ]
                    }
                ],
                lexer: {
                    rules: [
                        {
                            regexp: /^c/,
                            token: 'c'
                        },
                        {
                            regexp: /^d/,
                            token: 'd'
                        }
                    ]
                }
            });

            expect(function () {
                new Function(grammar.genCode({
                    compressSymbol: 1
                }))().parse("dc");
            }).toThrow('parse error at line 1:\ndc\n--^\n' +
                'expect c, d');

        });

        describe('state', function () {

            it('can parse', function () {
                var log = [];
                var grammar = new Grammar({
                    productions: [
                        {
                            symbol: "S",
                            rhs: [
                                "a", "b"
                            ],
                            action: function () {
                                this.yy.log.push(this.$1);
                                this.yy.log.push(this.$2);
                            }
                        }
                    ],
                    lexer: {
                        rules: [
                            {
                                regexp: /^a/,
                                token: 'a',
                                action: function () {
                                    this.pushState('b');
                                }
                            },
                            {
                                regexp: /^b/,
                                state: ['b'],
                                token: 'b',
                                action: function () {
                                    this.popState();
                                }
                            }
                        ]
                    }
                });
                var parser = new Function(grammar.genCode({
                    compressSymbol: 0
                }))();

                parser.yy = {
                    log: log
                };

                expect(function () {
                    parser.parse("ab");
                }).not.toThrow(undefined);

                expect(log.length).toBe(2);

                expect(log[0]).toBe('a');

                expect(log[1]).toBe('b');
            });


            it('can not parse', function () {
                var log = [];
                var grammar = new Grammar({
                    productions: [
                        {
                            symbol: "S",
                            rhs: [
                                "a", "b", "b"
                            ],
                            action: function () {
                                this.yy.log.push(this.$1);
                                this.yy.log.push(this.$2);
                            }
                        }
                    ],
                    lexer: {
                        rules: [
                            {
                                regexp: /^a/,
                                token: 'a',
                                action: function () {
                                    this.pushState('b');
                                }
                            },
                            {
                                regexp: /^b/,
                                state: ['b'],
                                token: 'b',
                                action: function () {
                                    this.popState();
                                }
                            }
                        ]
                    }
                });
                var parser = new Function(grammar.genCode({
                    compressSymbol: 1
                }))();

                parser.yy = {
                    log: log
                };

                expect(function () {
                    parser.parse("abb");
                }).toThrow('lex error at line 1:\n' +
                    'abb\n' +
                    '--^');
            });


            it('can not parse when compress', function () {
                var log = [];
                var grammar = new Grammar({
                    productions: [
                        {
                            symbol: "S",
                            rhs: [
                                "a", "b", "b"
                            ],
                            action: function () {
                                this.yy.log.push(this.$1);
                                this.yy.log.push(this.$2);
                            }
                        }
                    ],
                    lexer: {
                        rules: [
                            {
                                regexp: /^a/,
                                token: 'a',
                                action: function () {
                                    this.pushState('b');
                                }
                            },
                            {
                                regexp: /^b/,
                                state: ['b'],
                                token: 'b',
                                action: function () {
                                    this.popState();
                                }
                            }
                        ]
                    }
                });
                var parser = new Function(grammar.genCode({
                    compressSymbol: 0
                }))();

                parser.yy = {
                    log: log
                };

                expect(function () {
                    parser.parse("abb");
                }).toThrow('lex error at line 1:\n' +
                    'abb\n' +
                    '--^');
            });


        });


        it("parse ok with action", function () {

            // S.log("---------------- parse ok with action : ccdd by ");
            // S.log(" S0 => S ");
            // S.log(" S => CC ");
            // S.log(" C => cC ");
            // S.log(" C => d ");
            // S.log("------------------------------------------------\n");

            // S0 => S
            // S => CC
            // C => cC
            // C => d


            var grammar = new Grammar({
                productions: [
                    {
                        symbol: "S0",
                        rhs: [
                            "S"
                        ],
                        action: function () {
                            var ret = global.TEST_RET || (global.TEST_RET = []);
                            ret.push("S0 => S");
                            ret.push("|_____ " + this.$1 + " -> S0");
                            ret.push("");
                        }
                    },
                    {
                        symbol: "S",
                        rhs: [
                            "C", "C"
                        ],
                        action: function () {
                            var ret = global.TEST_RET || (global.TEST_RET = []);
                            ret.push("S => C C");
                            ret.push("|_____ " + this.$1 + " + " + this.$2 + " -> S");
                            ret.push("");
                            return this.$1 + this.$2;
                        }
                    },
                    {
                        symbol: "C",
                        rhs: [
                            "c", "C"
                        ],
                        action: function () {
                            var ret = global.TEST_RET || (global.TEST_RET = []);
                            ret.push("C => c C");
                            ret.push("|_____ " + this.$1 + " + " + this.$2 + " -> C");
                            ret.push("");
                            return this.$1 + this.$2;
                        }
                    },
                    {
                        symbol: "C",
                        rhs: [
                            "d"
                        ],
                        action: function () {
                            var ret = global.TEST_RET || (global.TEST_RET = []);
                            ret.push("C => d");
                            ret.push("|_____ " + this.$1 + " -> C");
                            ret.push("");
                            return this.$1;
                        }
                    }
                ],
                lexer: {
                    rules: [
                        {
                            regexp: /^c/,
                            token: 'c'
                        },
                        {
                            regexp: /^d/,
                            token: 'd'
                        }
                    ]
                }
            });

            expect(function () {
                new Function(grammar.genCode())().parse("ccdd")
            }).not.toThrow(undefined);

            // S.log(global.TEST_RET.join("\n"));
        });


    });
});
