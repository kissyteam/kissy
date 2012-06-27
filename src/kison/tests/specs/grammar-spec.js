KISSY.use("kison", function (S, Kison) {
    var Production = Kison.Production;
    var Grammar = Kison.Grammar;

    describe("grammar", function () {

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

        });

    });
});
