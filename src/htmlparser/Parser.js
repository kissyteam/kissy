/**
 * parse html to a hierarchy dom tree
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/Parser", function(S, Cursor, Lexer, Document) {

    function Parser(html, opts) {
        this.lexer = new Lexer(html);
        this.opts = opts || {};
        this.document = new Document();
    }

    Parser.prototype = {
        elements:function() {
            var ret,
                scanner,
                lexer = this.lexer;
            do{
                ret = lexer.nextNode();

                if (ret) {
                    // dummy html root node
                    this.document.appendChild(ret);
                    if (ret.nodeType == 1 &&
                        !ret.isEndTag()) {

                        scanner = ret.scanner;
                        if (scanner) {
                            scanner.scan(ret, lexer, this.opts);
                        }

                    }
                }
            } while (ret);

            return this.document.childNodes;
        },

        parse:function() {
            return this.elements();
        }
    };

    return Parser;
}, {
    requires:['./lexer/Cursor','./lexer/Lexer','./nodes/Document']
});