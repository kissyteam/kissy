KISSY.use("kison", function (S, Kison) {
    var Production = Kison.Production;
    var Grammar = Kison.Grammar;

    describe("grammar", function () {

        // 4-41 文法 GOTO 图
        it("generate goto map ok", function () {

            var grammar = new Grammar({
                productions:[
                    new Production({
                        symbol:"S0",
                        rhs:[
                            "S"
                        ]
                    }),
                    new Production({
                        symbol:"S",
                        rhs:[
                            "C", "C"
                        ]
                    }),
                    new Production({
                        symbol:"C",
                        rhs:[
                            "c", "C"
                        ]
                    }),
                    new Production({
                        symbol:"C",
                        rhs:[
                            "d"
                        ]
                    })
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

    });
});
