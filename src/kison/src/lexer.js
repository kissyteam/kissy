/**
 * Lexer to scan token.
 * @author yiminghe@gmail.com
 */
KISSY.add("kison/lexer", function (S, Utils) {

    function Lexer(cfg) {

        /**
         * lex rules.
         * @type {Object[]}
         * @example
         * [
         *  {
         *   regexp:'\\w+',
         *   state:'xx',
         *   token:'c',
         *   // this => lex
         *   action:function(){}
         *  }
         * ]
         */
        this.rules = [];

        S.mix(this, cfg);

        S.each(this.rules, function (r) {
            if (!r.state) {
                r.state = Lexer.STATIC.INIT;
            }
        });

        /**
         * Input languages
         * @type {String}
         */

        this.resetInput(this.input);

    }

    Lexer.STATIC = {
        INIT: S.guid("init"),
        DEBUG_CONTEXT_LIMIT: 20,
        END_TAG: '$EOF'
    };

    Lexer.prototype = {

        resetInput: function (input) {
            this.input = input;
            S.mix(this, {
                matched: "",
                stateStack: [Lexer.STATIC.INIT],
                match: "",
                text: "",
                firstLine: 1,
                lineNumber: 1,
                lastLine: 1,
                firstColumn: 1,
                lastColumn: 1
            });
        },

        genCode: function () {
            var code = [];

            code.push(Lexer.toString());

            code.push("Lexer.prototype= " + Utils.serializeObject(Lexer.prototype, /genCode/) + ";");

            code.push("Lexer.STATIC= " + Utils.serializeObject(Lexer.STATIC) + ";");

            code.push("var lexer = new Lexer(" + Utils.serializeObject({rules: this.rules}) + ");");

            return code.join("\n");
        },

        getCurrentRules: function () {
            var currentState = this.stateStack[this.stateStack.length - 1];
            var rules = [];
            S.each(this.rules, function (r) {
                if (r.state == currentState) {
                    rules.push(r);
                }
            });
            return rules;
        },

        pushState: function (state) {
            this.stateStack.push(state);
        },

        popState: function () {
            this.stateStack.pop();
        },

        showDebugInfo: function () {
            var DEBUG_CONTEXT_LIMIT = Lexer.STATIC.DEBUG_CONTEXT_LIMIT;
            var matched = this.matched,
                match = this.match,
                input = this.input;
            matched = matched.slice(0, matched.length - match.length);
            var past = (matched.length > DEBUG_CONTEXT_LIMIT ? "..." : "") +
                matched.slice(-DEBUG_CONTEXT_LIMIT).replace(/\n/, " ");
            var next = match + input;
            next = next.slice(0, DEBUG_CONTEXT_LIMIT) +
                (next.length > DEBUG_CONTEXT_LIMIT ? "..." : "");
            return past + next + "\n" + new Array(past.length + 1).join("-") + "^";
        },

        lex: function () {
            var self = this,
                input = self.input,
                i,
                rule,
                m,
                ret,
                lines,
                rules = self.getCurrentRules();

            if (!S.trim(input)) {
                return  Lexer.STATIC.END_TAG;
            }

            for (i = 0; i < rules.length; i++) {
                rule = rules[i];
                if (m = input.match(rule.regexp)) {
                    lines = m[0].match(/\n.*/g);
                    if (lines) {
                        self.lineNumber += lines.length;
                    }
                    S.mix(self, {
                        firstLine: self.lastLine,
                        lastLine: self.lineNumber + 1,
                        firstColumn: self.lastColumn,
                        lastColumn: lines ?
                            lines[lines.length - 1].length - 1 :
                            self.lastColumn + m[0].length
                    });
                    var match;
                    // for error report
                    match = self.match = m[0];

                    // all matches
                    self.matches = m;
                    // may change by user
                    self.text = match;
                    // matched content utils now
                    self.matched += match;
                    ret = rule.action && rule.action.call(this);
                    if (ret == undefined) {
                        ret = rule.token;
                    }
                    input = input.slice(match.length);
                    self.input = input;

                    if (ret) {
                        return ret;
                    } else {
                        // ignore
                        return self.lex();
                    }
                }
            }

            S.error("lex error at line " + this.lineNumber + ":\n" + this.showDebugInfo());
        }
    };

    return Lexer;

}, {
    requires: ['./utils']
});