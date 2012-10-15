/**
 * Lexer to scan token.
 * @author yiminghe@gmail.com
 */
KISSY.add("kison/lexer", function (S, Utils) {

    var Lexer = function (cfg) {

        var self = this;

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
        self.rules = [];

        S.mix(self, cfg);

        for (var i = 0, l = self.rules.length; i < l; i++) {
            var r = self.rules[i];
            if (!S.isArray(r) && !('state' in r)) {
                r.state = Lexer.STATIC.INIT;
            }
        }

        /**
         * Input languages
         * @type {String}
         */

        self.resetInput(self.input);

    };

    Lexer.STATIC = {
        INIT: S.guid('ks' + S.now()),
        DEBUG_CONTEXT_LIMIT: 20,
        END_TAG: '$EOF'
    };

    Lexer.prototype = {

        resetInput: function (input) {
            var self = this;
            self.input = input;
            S.mix(self, {
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

        genCode: function (compress) {

            if (!arguments.length) {
                compress = 1;
            }

            var code = [],
                stateId = 0,
                stateMap = {},
                tokenMap = {
                },
                tokenId = 0;

            if (compress) {
                stateMap[Lexer.STATIC.INIT] = ++stateId;
                tokenMap[Lexer.STATIC.END_TAG] = ++tokenId;
            }

            code.push("var Lexer = " + Lexer.toString() + ';');

            code.push("Lexer.prototype= " + Utils.serializeObject(Lexer.prototype, /genCode/) + ";");

            code.push("Lexer.STATIC= " + Utils.serializeObject(Lexer.STATIC) + ";");

            var newCfg = Utils.serializeObject({rules: this.rules}, compress ? function (v) {
                if (v && v.regexp) {
                    var state = v.state;
                    var token = v.token || 0;
                    if (token) {
                        token = tokenMap[token] || (tokenMap[token] = (++tokenId));
                    }
                    state = stateMap[state] || (stateMap[state] = (++stateId));
                    return [
                        token,
                        v.regexp || 0,
                        v.action || 0,
                        state
                    ];
                }
            } : 0);

            code.push("var lexer = new Lexer(" + newCfg + ");");

            if (compress) {
                // for grammar
                this.rules = eval('(' + newCfg + ')').rules;
                code.push('lexer.tokenMap = ' + Utils.serializeObject(tokenMap) + ';');
                code.push('lexer.stateMap = ' + Utils.serializeObject(stateMap) + ';');
            }

            return {
                code: code.join("\n"),
                tokenMap: tokenMap,
                stateMap: stateMap,
                tokenId: tokenId
            };
        },

        getCurrentRules: function () {
            var self = this,
                stateMap = self.stateMap || {},
                currentState = self.stateStack[self.stateStack.length - 1],
                rules = [];
            currentState = stateMap[currentState] || currentState;
            S.each(self.rules, function (r) {
                var state = r.state || r[3];
                if (state == currentState) {
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
            var self = this,
                DEBUG_CONTEXT_LIMIT = Lexer.STATIC.DEBUG_CONTEXT_LIMIT,
                matched = self.matched,
                match = self.match,
                input = self.input;
            matched = matched.slice(0, matched.length - match.length);
            var past = (matched.length > DEBUG_CONTEXT_LIMIT ? "..." : "") +
                    matched.slice(-DEBUG_CONTEXT_LIMIT).replace(/\n/, " "),
                next = match + input;
            next = next.slice(0, DEBUG_CONTEXT_LIMIT) +
                (next.length > DEBUG_CONTEXT_LIMIT ? "..." : "");
            return past + next + "\n" + new Array(past.length + 1).join("-") + "^";
        },

        lex: function () {
            var self = this,
                tokenMap = self.tokenMap || {},
                input = self.input,
                i,
                rule,
                m,
                END_TAG = Lexer.STATIC.END_TAG,
                ret,
                lines,
                rules = self.getCurrentRules();

            self.match = self.text = "";

            if (!S.trim(input)) {
                return tokenMap[END_TAG] || END_TAG;
            }

            for (i = 0; i < rules.length; i++) {
                rule = rules[i];
                var regexp = rule.regexp || rule[1],
                    token = rule.token || rule[0],
                    action = rule.action || rule[2] || undefined;
                if (m = input.match(regexp)) {
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
                    ret = action && action.call(self);
                    if (ret == undefined) {
                        ret = token;
                    } else {
                        ret = tokenMap[ret] || ret;
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

            S.error("lex error at line " + self.lineNumber + ":\n" + self.showDebugInfo());
        }
    };

    return Lexer;

}, {
    requires: ['./utils']
});