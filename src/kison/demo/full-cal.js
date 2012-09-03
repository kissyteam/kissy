x({
    productions: [
        {
            symbol: "expressions",
            rhs: ["e"],
            action: function () {
                KISSY.log("expression -> e");
                KISSY.log(this.$1);
            }
        },

        {
            symbol: "e",
            rhs: ["e", "-", "e"],
            action: function () {
                KISSY.log("e -> e-e");
                KISSY.log(this.$1 + " - " + this.$3);
                return this.$1 - this.$3;
            }
        },
        {
            symbol: "e",
            rhs: ["e", "+", "e"],
            action: function () {
                KISSY.log("e -> e+e");
                KISSY.log(this.$1 + " + " + this.$3);
                return this.$1 + this.$3;
            }
        },
        {
            symbol: "f",
            rhs: ["f", "*", "f"],
            action: function () {
                KISSY.log("f -> f*f");
                KISSY.log(this.$1 + " * " + this.$3);
                return this.$1 * this.$3;
            }
        },
        {
            symbol: "f",
            rhs: ["f", "/", "f"],
            action: function () {
                KISSY.log("f -> f/f");
                KISSY.log(this.$1 + " / " + this.$3);
                return this.$1 / this.$3;
            }
        },
        {
            symbol: "f",
            rhs: ["-", "f"],
            action: function () {
                KISSY.log("f -> -f");
                KISSY.log(" - " + this.$2);
                return -this.$2;
            }
        },
        {
            symbol: "f",
            rhs: ["(", "e", ")"],
            action: function () {
                KISSY.log("f -> (e)");
                KISSY.log(" ( " + this.$2 + " ) ");
                return this.$2;
            }
        },
        {
            symbol: "e",
            rhs: ["f"],
            action: function () {
                KISSY.log("e -> f");
                KISSY.log(this.$1);
            }
        },
        {
            symbol: "f",
            rhs: ["NUMBER"],
            action: function () {
                KISSY.log("f -> NUMBER");
                KISSY.log(this.$1);
                return Number(this.$1);
            }
        }
    ],

    lexer: {
        rules: [
            {
                regexp: /^\s+/
            },
            {
                regexp: /^[0-9]+(\.[0-9]+)?\b/,
                token: 'NUMBER'
            },
            {
                regexp: /^\+/,
                token: '+'
            },
            {
                regexp: /^-/,
                token: '-'
            },
            {
                regexp: /^\*/,
                token: '*'
            },
            {
                regexp: /^\//,
                token: '/'
            },
            {
                regexp: /^\(/,
                token: '('
            },
            {
                regexp: /^\)/,
                token: ')'
            }
        ]
    }
});