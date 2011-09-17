/**
 * parse html to a hierarchy dom tree
 * @author yiminghe@gmail.com
 */
KISSY.add(function(S, Cursor, Lexer) {

    function Iterator(lexer) {
        this.lexer = lexer;
        this.cursor = new Cursor(0);
    }

    Iterator.prototype = {
        hasMoreNodes:function() {
            this.cursor.position = this.lexer.getPosition();
            return this.lexer.page.getChar(this.cursor) != -1;
        },

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
                iter = this.elements();
            while (iter.hasMoreNodes()) {
                ret.push(iter.nextNode());
            }
            return ret;
        }
    };

    return Parser;
}, {
    requires:['./lexer/Cursor','./lexer/Lexer']
});