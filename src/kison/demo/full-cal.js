x({
    productions:[
        {
            symbol:"expressions",
            rhs:["e"],
            action:function (e) {
                KISSY.log("expression -> e");
                KISSY.log(e);
                return e;
            }
        },

        {
            symbol:"e",
            rhs:["e", "-", "e"],
            action:function (e1, _, e2) {
                KISSY.log("e -> e-e");
                KISSY.log(e1+" - "+e2);
                return e1 - e2;
            }
        },
        {
            symbol:"e",
            rhs:["e", "+", "e"],
            action:function (e1, _, e2) {
                KISSY.log("e -> e+e");
                KISSY.log(e1+" + "+e2);
                return e1 + e2;
            }
        },
        {
            symbol:"f",
            rhs:["f", "*", "f"],
            action:function (f1, _, f2) {
                KISSY.log("f -> f*f");
                KISSY.log(f1+" * "+f2);
                return f1 * f2;
            }
        },
        {
            symbol:"f",
            rhs:["f", "/", "f"],
            action:function (f1, _, f2) {
                KISSY.log("f -> f/f");
                KISSY.log(f1+" / "+f2);
                return f1 / f2;
            }
        },
        {
            symbol:"f",
            rhs:["-", "f"],
            action:function (_,e1) {
                KISSY.log("f -> -f");
                KISSY.log(" - "+e1);
                return -e1;
            }
        },
        {
            symbol:"f",
            rhs:["(", "e", ")"],
            action:function (_,e1) {
                KISSY.log("f -> (e)");
                KISSY.log(" ( "+e1+" ) ");
                return e1;
            }
        },
        {
            symbol:"e",
            rhs:["f"],
            action:function (e) {
                KISSY.log("e -> f");
                KISSY.log(e);
                return e;
            }
        },
        {
            symbol:"f",
            rhs:["NUMBER"],
            action:function (e) {
                KISSY.log("f -> NUMBER");
                KISSY.log(e);
                return Number(e);
            }
        }
    ],

    lexer:{
        rules:[
            {
                regexp:/^\s+/
            },
            {
                regexp:/^[0-9]+(\.[0-9]+)?\b/,
                token:'NUMBER'
            },
            {
                regexp:/^\+/,
                token:'+'
            },
            {
                regexp:/^-/,
                token:'-'
            },
            {
                regexp:/^\*/,
                token:'*'
            },
            {
                regexp:/^\//,
                token:'/'
            },
            {
                regexp:/^\(/,
                token:'('
            },
            {
                regexp:/^\)/,
                token:')'
            }
        ]
    }
});