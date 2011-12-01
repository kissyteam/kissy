/**
 * parse html to a hierarchy dom tree
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/Parser", function(S, dtd, Tag, Cursor, Lexer, Document, Scanner) {

    function Parser(html, opts) {
        this.lexer = new Lexer(html);
        this.opts = opts || {};
        this.document = new Document();
    }

    Parser.prototype = {
        elements:function() {
            var ret,
                lexer = this.lexer;
            do{
                
                ret = lexer.nextNode();
                if (ret) {
                    // dummy html root node
                    this.document.appendChild(ret);
                    if (ret.nodeType == 1 && !ret.isEndTag()) {
                        Scanner.getScanner(ret.tagName).scan(ret, lexer, this.opts);
                    }
                }
            } while (ret);

            if (this.opts['autoParagraph']) {
                autoParagraph(this.document);
            }

            post_process(this.document);
            
            return this.document.childNodes;
        },

        parse:function() {
            return this.elements();
        }
    };


    function autoParagraph(doc) {
        var childNodes = doc.childNodes,
            c,
            i,
            pDtd = dtd['p'],
            needFix = 0;

        for (i = 0; i < childNodes.length; i++) {
            c = childNodes[i];
            if (c.nodeType == 3 || (c.nodeType == 1 && pDtd[c.nodeName])) {
                needFix = 1;
                break;
            }
        }
        if (needFix) {
            var newChildren = [],holder = new Tag();
            holder.nodeName = holder.tagName = "p";
            for (i = 0; i < childNodes.length; i++) {
                c = childNodes[i];
                if (c.nodeType == 3 || (c.nodeType == 1 && pDtd[c.nodeName])) {
                    holder.appendChild(c);
                } else {
                    if (holder.childNodes.length) {
                        newChildren.push(holder);
                        holder = holder.clone();
                    }
                    newChildren.push(c);
                }
            }

            if (holder.childNodes.length) {
                newChildren.push(holder);
            }

            doc.empty();

            for (i = 0; i < newChildren.length; i++) {
                doc.appendChild(newChildren[i]);
            }
        }
    }


    function post_process(doc) {
        // Space characters before the root html element,
        // and space characters at the start of the html element and before the head element,
        // will be dropped when the document is parsed;
        var childNodes = [].concat(doc.childNodes);
        for (var i = 0; i < childNodes.length; i++) {
            if (childNodes[i].nodeName == "html") {
                var html = childNodes[i];
                for (var j = 0; j < i; j++) {
                    if (childNodes[j].nodeType == 3 && !S.trim(childNodes[j].toHtml())) {
                        doc.removeChild(childNodes[j]);
                    }
                }
                while (html.firstChild &&
                    html.firstChild.nodeType == 3 &&
                    !S.trim(html.firstChild.toHtml())) {
                    html.removeChild(html.firstChild);
                }
                break;
            }
        }
    }


    return Parser;
}, {
    requires:[
        './dtd',
        './nodes/Tag',
        './lexer/Cursor',
        './lexer/Lexer',
        './nodes/Document',
        './Scanner'
    ]
});