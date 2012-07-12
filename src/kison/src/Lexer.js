/**
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
});