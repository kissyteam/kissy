/**
 * parse html to a hierarchy dom tree
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/Parser", function(S, Cursor, Lexer) {

    function Iterator(lexer, opts) {
        this.lexer = lexer;
        this.opts = opts;
    }

    Iterator.prototype = {
        nextNode:function() {
            var ret,
                stack,
                scanner,
                lexer = this.lexer;

            ret = lexer.nextNode();
            if (ret) {
                if (ret.nodeType == 1) {
                    if (!ret.isEndTag()) {
                        scanner = ret.scanner;
                        if (scanner) {
                            stack = [];
                            ret = scanner.scan(ret, lexer, stack, this.opts);
                        }
                    } else {
                        return this.nextNode();
                    }
                }
            }
            return ret;
        }
    };

    function Parser(html, opts) {
        this.lexer = new Lexer(html);
        this.opts = opts || {};
    }

    Parser.prototype = {
        elements:function() {
            return new Iterator(this.lexer, this.opts);
        },

        parse:function() {
            var ret = [],
                n,
                iter = this.elements();
            while (n = iter.nextNode()) {
                ret.push(n);
            }
            return ret;
        }
    };

    return Parser;
}, {
    requires:['./lexer/Cursor','./lexer/Lexer']
});