/**
 * parse html to a hierarchy dom tree
 * @author yiminghe@gmail.com
 */
KISSY.add(function(S, Cursor, Lexer) {

    function Iterator(lexer) {
        this.lexer = lexer;
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
                            ret = scanner.scan(ret, lexer, stack);
                        }
                    } else {
                        return this.nextNode();
                    }
                }
            }
            return ret;
        }
    };


    function Parser(html) {
        this.lexer = new Lexer(html);
    }

    Parser.prototype = {
        elements:function() {
            return new Iterator(this.lexer);
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