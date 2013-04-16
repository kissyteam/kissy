/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:21
*/
/**
 * parse html to a hierarchy dom tree
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/Parser", function (S, dtd, Tag, Fragment, Cursor, Lexer, Document, Scanner) {

    function Parser(html, opts) {
        // fake root node
        html = S.trim(html);
        this.originalHTML = html;
        // only allow condition
        // 1. start with <!doctype
        // 2. start with <!html
        // 3. start with <!body
        // 4. not start with <head
        // 5. not start with <meta
        if (/^(<!doctype|<html|<body)/i.test(html)) {
            html = "<document>" + html + "</document>";
        } else {
            html = "<body>" + html + "</body>";
        }
        this.lexer = new Lexer(html);
        this.opts = opts || {};
    }

    Parser.prototype = {

        constructor:Parser,

        elements:function () {
            var root ,
                doc,
                lexer = this.lexer,
                opts = this.opts;

            doc = root = lexer.nextNode();

            if (root.tagName != 'document') {
                doc = new Document();
                doc.appendChild(root);
            }

            doc.nodeType = 9;

            Scanner.getScanner("div").scan(root, lexer, opts);

            var body = fixBody(doc);

            if (body && opts['autoParagraph']) {
                autoParagraph(body);
            }

            post_process(doc);

            var originalHTML = this.originalHTML,
                fragment = new Fragment(), cs;

            if (/^(<!doctype|<html|<body)/i.test(originalHTML)) {
                cs = doc.childNodes;
            } else {
                cs = body.childNodes;
            }
            S.each(cs, function (c) {
                fragment.appendChild(c);
            });
            return fragment;
        },

        parse:function () {
            return this.elements();
        }
    };

    function fixBody(doc) {
        // 3 limit depth
        var body = findTagWithName(doc, "body", 3);
        if (body) {
            /**
             * <body>
             <li>2</li>
             <span>1</span>
             <li>2</li>
             <span>3</span>
             <li>2</li>
             </body>
             */
            var parent = body.parentNode,
                silbing = parent.childNodes,
                bodyIndex = S.indexOf(body, silbing);
            if (bodyIndex != silbing.length - 1) {
                var fixes = silbing.slice(bodyIndex + 1, silbing.length);
                for (var i = 0; i < fixes.length; i++) {
                    parent.removeChild(fixes[i]);
                    if (fixes[i].tagName == "body") {
                        S.each(fixes[i].childNodes, function (c) {
                            body.appendChild(c);
                        });
                    } else {
                        body.appendChild(fixes[i]);
                    }
                }
            }
        }
        return body;
    }


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
            var newChildren = [],
                holder = new Tag();
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


    function findTagWithName(root, tagName, level) {
        if (level === 0) return 0;
        if (S.isNumber(level)) {
            level--;
        }
        var r, childNodes = root.childNodes;
        if (childNodes) {
            for (var i = 0; i < childNodes.length; i++) {
                if (childNodes[i].tagName === tagName) {
                    return childNodes[i];
                }
                if (r = findTagWithName(childNodes[i], tagName, level)) {
                    return r;
                }
            }
        }
        return 0;
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
                    if (childNodes[j].nodeType == 3 && !S.trim(childNodes[j].toHTML())) {
                        doc.removeChild(childNodes[j]);
                    }
                }
                while (html.firstChild &&
                    html.firstChild.nodeType == 3 &&
                    !S.trim(html.firstChild.toHTML())) {
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
        './nodes/Fragment',
        './lexer/Cursor',
        './lexer/Lexer',
        './nodes/Document',
        './Scanner'
    ]
});/**
 * declare and initiate sub scanners
 * @author yiminghe@gmail.com
 */
KISSY.add('htmlparser/Scanner', function(S, TagScanner, SpecialScanners) {
    return {
        getScanner:function(nodeName) {
            return SpecialScanners[nodeName] || TagScanner;
        }
    };
}, {
    requires:[
        './scanners/TagScanner',
        './scanners/SpecialScanners',
        './scanners/QuoteCdataScanner',
        './scanners/TextareaScanner'
    ]
})/**
 * utils about language for html parser
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/Utils", function() {
    return {
        collapseWhitespace:function (str) {
            return str.replace(/[\s\xa0]+/g, ' ');
        },
        isLetter:function(ch) {
            return 'a' <= ch && 'z' >= ch || 'A' <= ch && 'Z' >= ch;
        },
        /**
         * refer: http://www.w3.org/TR/html5/syntax.html#attributes-0
         */
        isValidAttributeNameStartChar:function(ch) {
            return !this.isWhitespace(ch) &&
                ch != '"' &&
                ch != "'" &&
                ch != '>' &&
                ch != "<" &&
                ch != '/' &&
                ch != '=';
        },
        /**
         *
         * @param ch
         */
        isWhitespace:function(ch) {
            // http://yiminghe.iteye.com/admin/blogs/722786
            // http://yiminghe.iteye.com/admin/blogs/788929
            // 相比平时的空格（&#32;），nbsp拥有不间断（non-breaking）特性。
            // 即连续的nbsp会在同一行内显示。即使有100个连续的nbsp，浏览器也不会把它们拆成两行。
            // &nbsp; => 160
            // /\s/.test(String.fromCharCode(160))
            // ie return false, others return true
            return /^[\s\xa0]$/.test(ch);
        }
    };
});
/**
 * refer:
 *  -  http://www.w3.org/TR/html5/syntax.html
 **//**
 * modified from ckeditor dtd by yiminghe, support html5 tag and dtd
 * @author yimingh@gmail.com
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.add("htmlparser/dtd", function(KY) {
    /**
     * Holds and object representation of the HTML DTD to be used by the editor in
     * its internal operations.
     *
     * Each element in the DTD is represented by a
     * property in this object. Each property contains the list of elements that
     * can be contained by the element. Text is represented by the "#text" property.
     *
     * Several special grouping properties are also available. Their names start
     * with the "$" character.
     * @example
     * // Check if "div" can be contained in a "p" element.
     * alert( !!dtd[ 'p' ][ 'div' ] );  "false"
     * @example
     * // Check if "p" can be contained in a "div" element.
     * alert( !!dtd[ 'div' ][ 'p' ] );  "true"
     * @example
     * // Check if "p" is a block element.
     * alert( !!dtd.$block[ 'p' ] );  "true"
     */

    var merge = KY.merge;

    var A = {"isindex":1,"fieldset":1},
        B = {"input":1,"button":1,"select":1,"textarea":1,"label":1},
        C = merge({"a":1}, B),
        D = merge({"iframe":1}, C),
        E = {
            "hr":1,"ul":1,"menu":1,"div":1,
            "blockquote":1,"noscript":1,"table":1,
            "center":1,"address":1,"dir":1,"pre":1,"h5":1,
            "dl":1,"h4":1,"noframes":1,"h6":1,
            "ol":1,"h1":1,"h3":1,"h2":1
        },
        F = {"ins":1,"del":1,"script":1,"style":1},
        G = merge({
            "b":1,"acronym":1,"bdo":1,'var':1,'#text':1,
            "abbr":1,"code":1,
            "br":1,"i":1,"cite":1,
            "kbd":1,
            "u":1,
            "strike":1,
            "s":1,
            "tt":1,
            "strong":1,
            "q":1,
            "samp":1,
            "em":1,
            "dfn":1,
            "span":1}, F),
        H = merge({
            "sub":1,
            "img":1,
            "object":1,
            "sup":1,
            "basefont":1,
            "map":1,
            "applet":1,
            "font":1,
            "big":1,
            "small":1
        }, G),
        I = merge({"p":1}, H),
        J = merge({"iframe":1}, H, B),
        K = {
            "img":1,"noscript":1,"br":1,"kbd":1,
            "center":1,"button":1,
            "basefont":1,"h5":1,"h4":1,"samp":1,
            "h6":1,"ol":1,
            "h1":1,"h3":1,"h2":1,
            "form":1,
            "font":1,
            '#text':1,
            "select":1,
            "menu":1,
            "ins":1,
            "abbr":1,
            "label":1,
            "code":1,
            "table":1,
            "script":1,"cite":1,"input":1,"iframe":1,
            "strong":1,"textarea":1,"noframes":1,"big":1,
            "small":1,"span":1,"hr":1,"sub":1,"bdo":1,
            'var':1,"div":1,"object":1,"sup":1,"strike":1,
            "dir":1,"map":1,"dl":1,"applet":1,"del":1,"isindex":1,
            "fieldset":1,"ul":1,"b":1,"acronym":1,"a":1,"blockquote":1,
            "i":1,"u":1,"s":1,"tt":1,"address":1,"q":1,
            "pre":1,"p":1,"em":1,"dfn":1
        },
        L = merge({"a":1}, J),
        M = {"tr":1},
        N = {'#text':1},
        O = merge({"param":1}, K),
        P = merge({"form":1}, A, D, E, I),
        Q = {"li":1},
        R = {"style":1,"script":1},
        S = {"base":1,"link":1,"meta":1,"title":1},
        T = merge(S, R),
        U = {"head":1,"body":1},
        V = {"html":1};

    var block = {
        "address":1,"blockquote":1,"center":1,
        "dir":1,"div":1,"dl":1,"fieldset":1,
        "form":1,"h1":1,"h2":1,"h3":1,"h4":1,
        "h5":1,"h6":1,"hr":1,"isindex":1,
        "menu":1,"noframes":1,"ol":1,"p":1,
        "pre":1,"table":1,"ul":1
    };

    var ret = {

        // The "$" items have been added manually.
        // List of elements living outside body.
        $nonBodyContent: merge(V, U, S),

        /**
         * List of block elements, like "p" or "div".
         * @type {Object}
         * @example
         */
        $block : block,

        /**
         * List of block limit elements.
         * @type {Object}
         * @example
         */
        $blockLimit : {"body":1,"div":1,"td":1,"th":1,"caption":1,"form":1 },

        $inline : L,    // Just like span.

        $body : merge({"script":1,"style":1}, block),

        $cdata : {"script":1,"style":1},

        /**
         * List of empty (self-closing) elements, like "br" or "img".
         * @type {Object}
         * @example
         */
        $empty : {"area":1,"base":1,"br":1,"col":1,"hr":1,"img":1,"input":1,"link":1,"meta":1,"param":1},

        /**
         * List of list item elements, like "li" or "dd".
         * @type {Object}
         * @example
         */
        $listItem : {"dd":1,"dt":1,"li":1},

        /**
         * List of list root elements.
         * @type {Object}
         * @example
         */
        $list: {"ul":1,"ol":1,"dl":1},

        /**
         * Elements that accept text nodes, but are not possible to edit into
         * the browser.
         * @type {Object}
         * @example
         */
        $nonEditable : {
            "applet":1,"button":1,"embed":1,"iframe":1,"map":1,
            "object":1,"option":1,"script":1,"textarea":1,"param":1
        },

        /**
         * List of elements that can be ignored if empty, like "b" or "span".
         * @type {Object}
         * @example
         */
        $removeEmpty : {
            "abbr":1,"acronym":1,"address":1,"b":1,"bdo":1,"big":1,
            "cite":1,"code":1,"del":1,"dfn":1,"em":1,"font":1,"i":1,"ins":1,
            "label":1,"kbd":1,"q":1,"s":1,"samp":1,"small":1,"span":1,"strike":1,
            "strong":1,"sub":1,"sup":1,"tt":1,"u":1,'var':1
        },

        /**
         * List of elements that have tabindex set to zero by default.
         * @type {Object}
         * @example
         */
        $tabIndex : {
            "a":1,"area":1,"button":1,
            "input":1,"object":1,"select":1,
            "textarea":1
        },

        /**
         * List of elements used inside the "table" element, like "tbody" or "td".
         * @type {Object}
         * @example
         */
        $tableContent : {
            "caption":1,"col":1,"colgroup":1,
            "tbody":1,"td":1,"tfoot":1,
            "th":1,"thead":1,"tr":1
        },
        "html": U,
        "head": T,
        "style": N,
        "body": P,
        "base": {},
        "link": {},
        "meta": {},
        "title": N,
        "col": {},
        "tr": {"td":1,"th":1},
        "img": {},
        "colgroup": {"col":1},
        "noscript": P,
        "td": P,
        "br": {},
        "th": P,
        "center": P,
        "kbd": L,
        "button": merge(I, E),
        "basefont": {},
        "h5": L,
        "h4": L,
        "samp": L,
        "h6": L,
        "ol": Q,
        "h1": L,
        "h3": L,
        "option": N,
        "h2": L,
        "form" : merge(A, D, E, I),
        "select" : {"optgroup":1,"option":1},
        "font" : L,
        "ins": L,
        "menu" : Q,
        "abbr": L,
        "label": L,
        "table": {
            "thead":1,"col":1,"tbody":1,
            "tr":1,"colgroup":1,"caption":1,
            "tfoot":1
        },
        "code": L,
        "script": N,
        "tfoot": M,
        "cite": L,
        "li": P,
        "input": {},
        "iframe": P,
        "strong": L,
        "textarea": N,
        "noframes": P,
        "big": L,
        "small": L,
        "span": L,
        "hr": {},
        "dt": L,
        "sub": L,
        "optgroup": {"option":1},
        "param": {},
        "bdo": L,
        'var' : L,
        "div": P,
        "object": O,
        "sup": L,
        "dd": P,
        "strike": L,
        "area": {},
        "dir": Q,
        "map": merge({"area":1,"form":1,"p":1}, A, F, E),
        "applet": O,
        "dl": {"dt":1,"dd":1},
        "del": L,
        "isindex": {},
        "fieldset": merge({
            legend:1
        }, K),
        "thead": M,
        "ul": Q,
        "acronym": L,
        "b": L,
        "a": J,
        "blockquote": P,
        "caption": L,
        "i": L,
        "u": L,
        "tbody": M,
        "s": L,
        "address": merge(D, I),
        "tt": L,
        "legend": L,
        "q": L,
        "pre": merge(G, C),
        "p": L,
        "em": L,
        "dfn": L
    };
    (function() {
        var i,
            html_tags = [
                "article","figure","nav",
                "aside","section","footer"
            ];

        for (var p in ret) {
            for (var p2 in ret[p]) {
                if (p2 == "div") {
                    for (i = 0; i < html_tags.length; i++) {
                        ret[p][html_tags[i]] = ret[p][p2];
                    }
                }
            }
        }

        for (i = 0; i < html_tags.length; i++) {
            ret[html_tags[i]] = ret["div"];
        }


        ret.$empty['!doctype'] = 1;
    })();

    return ret;
});
/**
 * HTMLParser for KISSY (Editor)
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser", function (S, DTD, Lexer, Parser, BasicWriter, BeautifyWriter, MinifyWriter, Filter, CData, Comment, Node, Tag, Text) {
    return {
        CData:CData,
        Comment:Comment,
        Node:Node,
        Tag:Tag,
        Text:Text,
        Lexer:Lexer,
        Parser:Parser,
        BasicWriter:BasicWriter,
        BeautifyWriter:BeautifyWriter,
        MinifyWriter:MinifyWriter,
        Filter:Filter,
        DTD:DTD,
        serialize:function (n, filter) {
            var basicWriter = new BasicWriter();
            n.writeHTML(basicWriter, filter);
            return basicWriter.getHTML();
        },
        parse:function (html) {
            return new Parser(html).parse();
        }
    };
}, {
    requires:[
        'htmlparser/dtd',
        'htmlparser/lexer/Lexer',
        'htmlparser/Parser',
        'htmlparser/writer/basic',
        'htmlparser/writer/beautify',
        'htmlparser/writer/minify',
        'htmlparser/writer/filter',
        'htmlparser/nodes/CData',
        'htmlparser/nodes/Comment',
        'htmlparser/nodes/Node',
        'htmlparser/nodes/Tag',
        'htmlparser/nodes/Text'
    ]
});

/**
 * refer
 *  - http://htmlparser.sourceforge.net/
 *  - http://www.w3.org/TR/html5/syntax.html
 *  - http://www.w3.org/TR/html5/parsing.html
 *
 * TODO
 *  - http://blogs.msdn.com/b/ie/archive/2010/09/13/interoperable-html-parsing-in-ie9.aspx
 **//**
 * represent a cursor of page , it can advance and retreat
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/lexer/Cursor",function() {
    function Cursor(offset) {
        this.position = offset || 0;
    }

    Cursor.prototype = {

        constructor:Cursor,

        advance:function() {
            this.position++;
        },

        retreat:function() {
            this.position = Math.max(--this.position, 0);
        }
    };

    return Cursor;
});/**
 * represent line index of each line
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/lexer/Index", function () {

    function Index() {
        this.lineCursors = [];
    }

    Index.prototype = {

        constructor: Index,

        add: function (cursor) {
            if (indexOfCursor(this.lineCursors, cursor) != -1) {
                return;
            }
            var index = indexOfCursorForInsert(this.lineCursors, cursor);
            this.lineCursors.splice(index, 0, cursor);
        },

        remove: function (cursor) {
            var cs = this.lineCursors;
            var index = indexOfCursor(this.lineCursors, cursor);
            if (index != -1) {
                cs.splice(index, 1);
            }
        },

        /**
         * line number of this cursor , index from zero
         * @param cursor
         */
        row: function (cursor) {
            return indexOfCursorForInsert(this.lineCursors, cursor) - 1;
        },

        col: function (cursor) {
            var row = indexOfCursorForInsert(this.lineCursors, cursor) - 1;
            return cursor.position - this.lineCursors[row]
        }

    };

    function indexOfCursor(cs, c) {
        for (var i = 0; i < cs.length; i++) {
            if (cs[i].position === c.position) {
                return i;
            }
        }
        return -1;
    }

    function indexOfCursorForInsert(cs, c) {
        for (var i = 0; i < cs.length; i++) {
            if (cs[i].position > c.position) {
                return i;
            }
        }
        return i;
    }

    return Index;

});/**
 * parse html string into Nodes
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/lexer/Lexer", function (S, Cursor, Page, TextNode, CData, Utils, Attribute, TagNode, CommentNode) {

    function Lexer(text) {
        var self = this;
        self.page = new Page(text);
        self.cursor = new Cursor();
        self.nodeFactory = this;
    }

    Lexer.prototype = {

        constructor: Lexer,

        setPosition: function (p) {
            this.cursor.position = p;
        },

        getPosition: function () {
            return this.cursor.position;
        },

        nextNode: function (quoteSmart) {
            var start ,
                ch,
                ret,
                cursor = this.cursor,
                page = this.page;

            start = cursor.position;
            ch = page.getChar(cursor);

            switch (ch) {
                case -1:
                    ret = null;
                    break;
                case '<':
                    ch = page.getChar(cursor);
                    if (ch == -1) {
                        ret = this.makeString(start, cursor.position);
                    } else if (ch == '/' || Utils.isLetter(ch)) {
                        page.ungetChar(cursor);
                        ret = this.parseTag(start);
                    } else if ('!' == ch || '?' == ch) {
                        ch = page.getChar(cursor);
                        if (ch == -1) {
                            ret = this.makeString(start, cursor.position);
                        } else {
                            if ('>' == ch) {
                                ret = this.makeComment(start, cursor.position);
                            } else {
                                page.ungetChar(cursor); // remark/tag need this char
                                if ('-' == ch) {
                                    ret = this.parseComment(start, quoteSmart);
                                } else {
                                    // <!DOCTYPE html>
                                    // <?xml:namespace>
                                    page.ungetChar(cursor); // tag needs prior one too
                                    ret = this.parseTag(start);
                                }
                            }
                        }
                    } else {
                        page.ungetChar(cursor); // see bug #1547354 <<tag> parsed as text
                        ret = this.parseString(start, quoteSmart);
                    }
                    break;
                default:
                    page.ungetChar(cursor); // string needs to see leading fore slash
                    ret = this.parseString(start, quoteSmart);
                    break;
            }

            return (ret);
        },

        makeComment: function (start, end) {
            var length, ret;

            length = end - start;
            if (0 != length) {   // return tag based on second character, '/', '%', Letter (ch), '!'
                if (2 > length) {
                    // this is an error
                    return (this.makeString(start, end));
                }
                ret = this.nodeFactory.createCommentNode(this.page, start, end);
            }
            else
                ret = null;

            return (ret);
        },

        makeString: function (start, end) {
            var ret = null, l;
            l = end - start;
            if (l > 0) {
                ret = this.nodeFactory.createStringNode(this.page, start, end);
            }
            return ret;
        },

        /**
         * different from text node : space does matter
         * @param start
         * @param end
         */
        makeCData: function (start, end) {
            var ret = null, l;
            l = end - start;
            if (l > 0) {
                ret = this.nodeFactory.createCDataNode(this.page, start, end);
            }
            return ret;
        },

        makeTag: function (start, end, attributes) {
            var length,
                ret;
            length = end - start;
            if (0 != length) {   // return tag based on second character, '/', '%', Letter (ch), '!'
                if (2 > length) {
                    // this is an error
                    return (this.makeString(start, end));
                }
                ret = this.nodeFactory.createTagNode(this.page, start, end, attributes);
            }
            else {
                ret = null;
            }
            return ret;
        },

        createTagNode: function (page, start, end, attributes) {
            return new TagNode(page, start, end, attributes);
        },

        createStringNode: function (page, start, end) {
            return new TextNode(page, start, end);
        },

        createCDataNode: function (page, start, end) {
            return new CData(page, start, end);
        },

        createCommentNode: function (page, start, end) {
            return new CommentNode(page, start, end);
        },

        /**
         * parse tag node according to fsm
         * state 0 - outside of any attribute</li>
         * state 1 - within attribute name</li>
         * state 2 - equals hit</li>
         * state 3 - within naked attribute value.</li>
         * state 4 - within single quoted attribute value</li>
         * state 5 - within double quoted attribute value</li>
         * state 6 - whitespaces after attribute name could lead to state 2 (=)or state 0</li>
         */
        parseTag: function (start) {
            var done,
                bookmarks = [],
                attributes = [],
                ch,
                page = this.page,
                state = 0,
                cursor = this.cursor;
            /**
             * record state position
             *
             * states 0 -> bookmarks[1]
             * states 1 -> bookmarks[2]
             */
            bookmarks[0] = cursor.position;
            while (!done) {
                // next possible end position for next state
                bookmarks[state + 1] = cursor.position;
                ch = page.getChar(cursor);
                // fsm go!
                switch (state) {
                    case 0:
                        // outside of any attribute
                        if (ch == -1 || '>' == ch || '<' == ch) {
                            if ('<' == ch) {
                                // don't consume the opening angle
                                page.ungetChar(cursor);
                                bookmarks[state + 1] = cursor.position;
                            }
                            done = true;
                        } else {
                            // tag name as a attribute
                            if (!attributes.length) {
                                // </div>
                                if (ch == "/" || Utils.isValidAttributeNameStartChar(ch)) {
                                    state = 1;
                                }
                            }
                            // <img />
                            else if (ch == "/" || Utils.isValidAttributeNameStartChar(ch)) {
                                state = 1;
                            }
                        }
                        break;

                    case 1: // within attribute name
                        if ((-1 == ch) || ('>' == ch) || ('<' == ch)) {
                            if ('<' == ch) {
                                // don't consume the opening angle
                                page.ungetChar(cursor);
                                bookmarks[state + 1] = cursor.getPosition;
                            }
                            this.standalone(attributes, bookmarks);
                            done = true;
                        }
                        else if (Utils.isWhitespace(ch)) {
                            // whitespaces might be followed by next attribute or an equal sign
                            // see Bug #891058 Bug in lexer.
                            bookmarks[6] = bookmarks[2]; // setting the bookmark[0] is done in state 6 if applicable
                            state = 6;
                        }
                        else if ('=' == ch)
                            state = 2;
                        break;

                    case 2: // equals hit
                        if ((-1 == ch) || ('>' == ch)) {
                            this.standalone(attributes, bookmarks);
                            done = true;
                        }
                        else if ('\'' == ch) {
                            state = 4;
                            bookmarks[4] = bookmarks[3];
                        }
                        else if ('"' == ch) {
                            state = 5;
                            bookmarks[5] = bookmarks[3];
                        }
                        else if (Utils.isWhitespace(ch)) {
                            // collect white spaces after "=" into the assignment string;
                            // do nothing
                            // see Bug #891058 Bug in lexer.
                        }
                        else
                            state = 3;
                        break;
                    case 3: // within naked attribute value
                        if ((-1 == ch) || ('>' == ch)) {
                            this.naked(attributes, bookmarks);
                            done = true;
                        }
                        else if (Utils.isWhitespace(ch)) {
                            this.naked(attributes, bookmarks);
                            bookmarks[0] = bookmarks[4];
                            state = 0;
                        }
                        break;
                    case 4: // within single quoted attribute value
                        if (-1 == ch) {
                            this.single_quote(attributes, bookmarks);
                            done = true; // complain?
                        }
                        else if ('\'' == ch) {
                            this.single_quote(attributes, bookmarks);
                            bookmarks[0] = bookmarks[5] + 1;
                            state = 0;
                        }
                        break;
                    case 5: // within double quoted attribute value
                        if (-1 == ch) {
                            this.double_quote(attributes, bookmarks);
                            done = true; // complain?
                        }
                        else if ('"' == ch) {
                            this.double_quote(attributes, bookmarks);
                            bookmarks[0] = bookmarks[6] + 1;
                            state = 0;
                        }
                        break;
                    // patch for lexer state correction by
                    // Gernot Fricke
                    // See Bug # 891058 Bug in lexer.
                    case 6: // undecided for state 0 or 2
                        // we have read white spaces after an attributte name
                        if (-1 == ch) {
                            // same as last else clause
                            this.standalone(attributes, bookmarks);
                            bookmarks[0] = bookmarks[6];
                            page.ungetChar(cursor);
                            state = 0;
                        }
                        else if (Utils.isWhitespace(ch)) {
                            // proceed
                        }
                        else if ('=' == ch) // yepp. the white spaces belonged to the equal.
                        {
                            bookmarks[2] = bookmarks[6];
                            bookmarks[3] = bookmarks[7];
                            state = 2;
                        }
                        else {
                            // white spaces were not ended by equal
                            // meaning the attribute was a stand alone attribute
                            // now: create the stand alone attribute and rewind
                            // the cursor to the end of the white spaces
                            // and restart scanning as whitespace attribute.
                            this.standalone(attributes, bookmarks);
                            bookmarks[0] = bookmarks[6];
                            page.ungetChar(cursor);
                            state = 0;
                        }
                        break;
                    default:
                        throw new Error("how ** did we get in state " + state);
                }
            }

            return this.makeTag(start, cursor.position, attributes);
        },

        /**
         * Parse a comment.
         * state 0 - prior to the first open delimiter (first dash)
         * state 1 - prior to the second open delimiter (second dash)
         * state 2 - prior to the first closing delimiter (first dash)
         * state 3 - prior to the second closing delimiter (second dash)
         * state 4 - prior to the terminating
         * @param start
         * @param quoteSmart
         */
        parseComment: function (start, quoteSmart) {
            var done,
                ch,
                page = this.page,
                cursor = this.cursor,
                state;

            done = false;
            state = 0;
            while (!done) {
                ch = page.getChar(cursor);
                if (-1 == ch) {
                    done = true;
                }
                else {
                    switch (state) {
                        case 0: // prior to the first open delimiter
                            if ('>' == ch)
                                done = true;
                            if ('-' == ch)
                                state = 1;
                            else
                                return this.parseString(start, quoteSmart);
                            break;
                        case 1: // prior to the second open delimiter
                            if ('-' == ch) {
                                // handle <!--> because netscape does
                                ch = page.getChar(cursor);
                                if (-1 == ch) {
                                    done = true;
                                }
                                else if ('>' == ch) {
                                    done = true;
                                }
                                else {
                                    page.ungetChar(cursor);
                                    state = 2;
                                }
                            }
                            else {
                                return this.parseString(start, quoteSmart);
                            }
                            break;
                        case 2: // prior to the first closing delimiter
                            if ('-' == ch) {
                                state = 3;
                            }
                            else if (-1 == ch) {
                                return this.parseString(start, quoteSmart); // no terminator
                            }
                            break;
                        case 3: // prior to the second closing delimiter
                            if ('-' == ch) {
                                state = 4;
                            }
                            else {
                                state = 2;
                            }
                            break;
                        case 4: // prior to the terminating >
                            if ('>' == ch) {
                                done = true;
                            }
                            else if (Utils.isWhitespace(ch)) {
                                // stay in state 4
                            }
                            else {
                                // bug #1345049 HTMLParser should not terminate a comment with --->
                                // should maybe issue a warning mentioning STRICT_REMARKS
                                state = 2;
                            }
                            break;
                        default:
                            throw new Error("how ** did we get in state " + state);
                    }
                }
            }

            return this.makeComment(start, cursor.position);
        },

        /**
         * parse a string node
         * @param start
         * @param quoteSmart strings ignore quoted contents
         */
        parseString: function (start, quoteSmart) {
            var done = 0,
                ch,
                page = this.page,
                cursor = this.cursor,
                quote = 0;

            while (!done) {
                ch = page.getChar(cursor);
                if (-1 == ch) {
                    done = 1;
                }
                else if (quoteSmart && (0 == quote)
                    && (('\'' == ch) || ('"' == ch))) {
                    quote = ch; // enter quoted state
                }
                // patch from Gernot Fricke to handle escaped closing quote
                else if (quoteSmart && (0 != quote) && ('\\' == ch)) {
                    ch = page.getChar(cursor); // try to consume escape
                    if ((-1 != ch)
                        && ('\\' != ch) // escaped backslash
                        && (ch != quote)) // escaped quote character
                    {
                        // ( reflects ["] or [']  whichever opened the quotation)
                        page.ungetChar(cursor); // unconsume char if char not an escape
                    }
                }
                else if (quoteSmart && (ch == quote)) {
                    quote = 0; // exit quoted state
                }
                else if (quoteSmart && (0 == quote) && (ch == '/')) {
                    // handle multiline and double slash comments (with a quote)
                    // in script like:
                    // I can't handle single quotations.
                    ch = page.getChar(cursor);
                    if (-1 == ch) {
                        done = 1;
                    }
                    else if ('/' == ch) {
                        do {
                            ch = page.getChar(cursor);
                        } while ((-1 != ch) && ('\n' != ch));
                    }
                    else if ('*' == ch) {
                        do
                        {
                            do {
                                ch = page.getChar(cursor);
                            } while ((-1 != ch) && ('*' != ch));
                            ch = page.getChar(cursor);
                            if (ch == '*') {
                                page.ungetChar(cursor);
                            }
                        }
                        while ((-1 != ch) && ('/' != ch));
                    }
                    else {
                        page.ungetChar(cursor);
                    }
                }
                else if ((0 == quote) && ('<' == ch)) {
                    ch = page.getChar(cursor);
                    if (-1 == ch) {
                        done = 1;
                    }
                    // the order of these tests might be optimized for speed:
                    else if ('/' == ch ||
                        Utils.isLetter(ch) ||
                        '!' == ch ||
                        // <?xml:namespace
                        '?' == ch) {
                        done = 1;
                        page.ungetChar(cursor);
                        page.ungetChar(cursor);
                    }
                    else {
                        // it's not a tag, so keep going, but check for quotes
                        page.ungetChar(cursor);
                    }
                }
            }

            return this.makeString(start, cursor.position);

        },

        /**
         * parse cdata such as code in script
         * @param quoteSmart if set true end tag in quote (but not in comment mode) does not end current tag ( <script>x="<a>taobao</a>"</script> )
         */
        parseCDATA: function (quoteSmart, tagName) {
            var start,
                state,
                done,
                quote,
                ch,
                end,
                comment,
                mCursor = this.cursor,
                mPage = this.page;

            start = mCursor.position;
            state = 0;
            done = false;
            quote = '';
            comment = false;

            while (!done) {
                ch = mPage.getChar(mCursor);
                switch (state) {
                    case 0: // prior to ETAGO
                        switch (ch) {
                            case -1:
                                done = true;
                                break;
                            case '\'':
                                if (quoteSmart && !comment) {
                                    if ('' == quote) {
                                        quote = '\''; // enter quoted state
                                    } else if ('\'' == quote) {
                                        quote = ''; // exit quoted state
                                    }
                                }
                                break;
                            case '"':
                                if (quoteSmart && !comment) {
                                    if ('' == quote) {
                                        quote = '"'; // enter quoted state
                                    } else if ('"' == quote) {
                                        quote = ''; // exit quoted state
                                    }
                                }
                                break;
                            case '\\':
                                if (quoteSmart) {
                                    if ('' != quote) {
                                        ch = mPage.getChar(mCursor); // try to consume escaped character
                                        if (-1 == ch) {
                                            done = true;
                                        } else if ((ch != '\\') && (ch != quote)) {
                                            // unconsume char if character was not an escapable char.
                                            mPage.ungetChar(mCursor);
                                        }
                                    }
                                }
                                break;
                            case '/':
                                if (quoteSmart) {
                                    if ('' == quote) {
                                        // handle multiline and double slash comments (with a quote)
                                        ch = mPage.getChar(mCursor);
                                        if (-1 == ch) {
                                            done = true;
                                        } else if ('/' == ch) {
                                            comment = true;
                                        } else if ('*' == ch) {
                                            do {
                                                do
                                                    ch = mPage.getChar(mCursor);
                                                while ((-1 != ch) && ('*' != ch));
                                                ch = mPage.getChar(mCursor);
                                                if (ch == '*') {
                                                    mPage.ungetChar(mCursor);
                                                }
                                            } while ((-1 != ch) && ('/' != ch));
                                        }
                                        else {
                                            mPage.ungetChar(mCursor);
                                        }
                                    }
                                }
                                break;
                            case '\n':
                                comment = false;
                                break;
                            case '<':
                                if (quoteSmart) {
                                    if ('' == quote) {
                                        state = 1;
                                    }
                                }
                                else {
                                    state = 1;
                                }
                                break;
                            default:
                                break;
                        }
                        break;
                    case 1: // <
                        switch (ch) {
                            case -1:
                                done = true;
                                break;
                            case '/':
                                // tagName = "textarea"
                                // <textarea><div></div></textarea>
                                /**
                                 * 8.1.2.6 Restrictions on the contents of raw text and RCDATA elements
                                 *
                                 *   The text in raw text and RCDATA elements must not contain any occurrences
                                 *   of the string "</" (U+003C LESS-THAN SIGN, U+002F SOLIDUS)
                                 *   followed by characters that case-insensitively match the tag name of the element
                                 *   followed by one of U+0009 CHARACTER TABULATION (tab),
                                 *   U+000A LINE FEED (LF), U+000C FORM FEED (FF), U+000D CARRIAGE RETURN (CR),
                                 *   U+0020 SPACE, U+003E GREATER-THAN SIGN (>), or U+002F SOLIDUS (/).
                                 */
                                if (!tagName || (mPage.getText(mCursor.position,
                                    mCursor.position + tagName.length) === tagName && !(mPage.getText(mCursor.position + tagName.length,
                                    mCursor.position + tagName.length + 1).match(/\w/))
                                    )) {
                                    state = 2;
                                } else {
                                    state = 0;
                                }

                                break;
                            case '!':
                                ch = mPage.getChar(mCursor);
                                if (-1 == ch) {
                                    done = true;
                                } else if ('-' == ch) {
                                    ch = mPage.getChar(mCursor);
                                    if (-1 == ch) {
                                        done = true;
                                    } else if ('-' == ch) {
                                        state = 3;
                                    } else {
                                        state = 0;
                                    }
                                }
                                else
                                    state = 0;
                                break;
                            default:
                                state = 0;
                                break;
                        }
                        break;
                    case 2: // </
                        comment = false;
                        if (-1 == ch) {
                            done = true;
                        } else if (Utils.isLetter(ch)) {
                            // 严格 parser 遇到 </x lexer 立即结束
                            // 浏览器实现更复杂点，可能 lexer 和 parser 混合了
                            done = true;
                            // back up to the start of ETAGO
                            mPage.ungetChar(mCursor);
                            mPage.ungetChar(mCursor);
                            mPage.ungetChar(mCursor);
                        } else {
                            state = 0;
                        }
                        break;
                    case 3: // <!
                        comment = false;
                        if (-1 == ch) {
                            done = true;
                        } else if ('-' == ch) {
                            ch = mPage.getChar(mCursor);
                            if (-1 == ch) {
                                done = true;
                            } else if ('-' == ch) {
                                ch = mPage.getChar(mCursor);
                                if (-1 == ch) {
                                    done = true;
                                } else if ('>' == ch) {
                                    // <!----> <!-->
                                    state = 0;
                                } else {
                                    // retreat twice , still begin to check -->
                                    mPage.ungetChar(mCursor);
                                    mPage.ungetChar(mCursor);
                                }
                            } else {
                                // retreat once , still begin to check
                                mPage.ungetChar(mCursor);
                            }
                        } else {
                            // eat comment
                        }
                        break;
                    default:
                        throw new Error("unexpected " + state);
                }
            }
            end = mCursor.position;

            return this.makeCData(start, end);
        },

        /**
         * Generate an single quoted attribute
         * @param attributes The list so far.
         * @param bookmarks The array of positions.
         */
        single_quote: function (attributes, bookmarks) {
            var page = this.page;
            attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), "=", page.getText(bookmarks[4] + 1, bookmarks[5]), "'"));
        },

        /**
         * Generate an double quoted attribute
         * @param attributes The list so far.
         * @param bookmarks The array of positions.
         */
        double_quote: function (attributes, bookmarks) {
            var page = this.page;
            attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), "=", page.getText(bookmarks[5] + 1, bookmarks[6]), '"'));
        },


        /**
         * Generate a standalone attribute
         * @param attributes The list so far.
         * @param bookmarks The array of positions.
         */
        standalone: function (attributes, bookmarks) {
            var page = this.page;
            attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2])));
        },

        /**
         * Generate an unquoted attribute
         * @param attributes The list so far.
         * @param bookmarks The array of positions.
         */
        naked: function (attributes, bookmarks) {
            var page = this.page;
            attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), "=", page.getText(bookmarks[3], bookmarks[4])));
        }
    };

    return Lexer;

}, {
    requires: [
        './Cursor',
        './Page',
        '../nodes/Text',
        '../nodes/CData',
        '../Utils',
        '../nodes/Attribute',
        '../nodes/Tag',
        '../nodes/Comment'
    ]});/**
 * represent html source
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/lexer/Page", function (S, Index) {
    function Page(source) {
        this.source = source;
        this.lineIndex = new Index();
    }

    Page.prototype = {

        constructor: Page,

        getChar: function (cursor) {
            var source = this.source;
            var i = cursor.position;
            if (i >= source.length) {
                return -1;
            }
            var ret = source.charAt(i);

            cursor.advance();

            // U+000D CARRIAGE RETURN (CR) characters and U+000A LINE FEED (LF) characters are treated specially.
            // Any CR characters that are followed by LF characters must be removed,
            // and any CR characters not followed by LF characters must be converted to LF characters.
            // Thus, newlines in HTML DOMs are represented by LF characters,
            // and there are never any CR characters in the input to the tokenization stage.
            // normalize line separator
            if ('\r' === ret) {
                ret = '\n';
                i = cursor.position;
                var next = source.charAt(i);
                if (next === '\n') {
                    cursor.advance();
                }
            }

            // update line Index
            if ('\n' === ret) {
                this.lineIndex.add(cursor);
            }

            return ret;

        },

        ungetChar: function (cursor) {
            var source = this.source;
            cursor.retreat();
            var i = cursor.position,
                ch = source.charAt(i);
            if (ch === '\n' && 0 != i) {
                ch = source.charAt(i - 1);
                if ('\r' === ch) {
                    cursor.retreat();
                }
            }
        },

        getText: function (start, end) {
            return this.source.slice(start, end);
        },

        row: function (cursor) {
            return this.lineIndex.row(cursor);
        },

        col: function (cursor) {
            return this.lineIndex.col(cursor);
        }
    };

    return Page;
}, {
    requires: ['./Index']
});/**
 * represent attribute node in tag node
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/nodes/Attribute", function(S) {
    function Attribute(name, assignMent, value, quote) {
        this.nodeType = 2;
        this.name = name;
        this['assignMent'] = assignMent;
        this.value = value;
        this.quote = quote;
    }

    S.augment(Attribute, {
        clone: function() {
            var ret = new Attribute();
            S.mix(ret, this);
            return ret;
        },
        equals:function(other) {
            return this.name == other.name && this.value == other.value && this.nodeType == other.nodeType;
        }
    });
    Attribute.prototype.clone = function() {
        var ret = new Attribute();
        S.mix(ret, this);
        return ret;
    };
    return Attribute;
});/**
 * dom text node
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/nodes/CData", function (S, Text) {

    function CData() {
        CData.superclass.constructor.apply(this, arguments);
        this.nodeType = 4;
        this.nodeName = "#cdata";
    }

    S.extend(CData, Text, {
        writeHTML:function (writer, filter) {
            var ret;
            if (!filter || (ret = filter.onCData(this)) !== false) {
                if (ret) {
                    if (this !== ret) {
                        ret.writeHTML(writer, filter);
                        return;
                    }
                }
                writer.cdata(this.toHTML());
            }
        }
    });

    return CData;
}, {
    requires:['./Text']
});/**
 * comment node (<!-- content -->)
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/nodes/Comment", function (S, Text) {

    function Comment() {
        Comment.superclass.constructor.apply(this, arguments);
        this.nodeType = 8;
        this.nodeName = "#comment";
    }

    S.extend(Comment, Text, {
        writeHTML:function (writer, filter) {
            var ret;
            if (!filter || (ret = filter.onComment(this)) !== false) {
                if (ret) {
                    if (this !== ret) {
                        ret.writeHTML(writer, filter);
                        return;
                    }
                }
                writer.comment(this.toHTML());
            }
        },
        toHTML:function () {
            if (this.nodeValue) {
                return this.nodeValue;
            } else {
                var value = Text.superclass.toHTML.apply(this, arguments);
                // <!-- -->
                return value.substring(4, value.length - 3);
            }
        }
    });

    return Comment;
}, {
    requires:['./Text']
});/**
 * fake document node
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/nodes/Document", function (S, Tag) {
    function Document() {
        this.childNodes = [];
        this.nodeType = 9;
        this.nodeName = '#document';
    }

    S.extend(Document, Tag, {
        writeHTML:function (writer, filter) {
            this.__filter = filter;
            this._writeChildrenHTML(writer);
        }
    });

    return Document;
}, {
    requires:['./Tag']
});/**
 * fake document fragment
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/nodes/Fragment", function (S, Tag) {
    function Fragment() {
        this.childNodes = [];
        this.nodeType = 9;
        this.nodeName = '#fragment';
    }

    S.extend(Fragment, Tag, {
        writeHTML:function (writer, filter) {
            this.__filter = filter;
            this.isChildrenFiltered = 0;
            if (filter) {
                filter.onFragment(this);
            }
            this._writeChildrenHTML(writer);
        }
    });

    return Fragment;
}, {
    requires:['./Tag']
});/**
 * abstract class for tag and text , comment .. etc
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/nodes/Node", function (S) {

    function lineCount(str) {
        var i = 0;
        str.replace(/\n/g, function () {
            i++;
        });
        return i;
    }

    function Node(page, startPosition, endPosition) {
        this.parentNode = null;
        this.page = page;
        this.startPosition = startPosition;
        this.endPosition = endPosition;
        this.nodeName = null;
        this.previousSibling = null;
        this.nextSibling = null;
        if (page) {
            this.startLine = lineCount(this.page.getText(0, startPosition));
            this.endLine = lineCount(this.page.getText(0, endPosition));
        }
        if (S.Config.debug) {
            this.toHTMLContent = this.toHTML();
        }
    }

    Node.prototype = {

        constructor: Node,

        toHTML: function () {
            if (this.page && this.page.getText) {
                return this.page.getText(this.startPosition, this.endPosition);
            }
        },
        toString: function () {
            var ret = [],
                self = this;
            ret.push(self.nodeName +
                "  [ " + self.startPosition + "|" +
                self.startLine +
                " : " + self.endPosition +
                "|" + self.endLine +
                " ]\n");
            ret.push(self.toHTML());
            return ret.join("");
        }
    };

    return Node;
});/**
 * represent tag, it can nest other tag
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/nodes/Tag", function (S, Node, Attribute, Dtd) {

    function createTag(self, tagName, attrs) {
        self.nodeName = self.tagName = tagName.toLowerCase();
        self._updateSelfClosed();
        S.each(attrs, function (v, n) {
            self.setAttribute(n, v);
        });
    }

    function Tag(page, startPosition, endPosition, attributes) {
        var self = this;

        self.childNodes = [];
        self.firstChild = null;
        self.lastChild = null;
        self.attributes = attributes || [];
        self.nodeType = 1;

        if (typeof page == 'string') {
            createTag.apply(null, [self].concat(S.makeArray(arguments)));
        } else {
            Tag.superclass.constructor.apply(self, arguments);

            attributes = self.attributes;
            // first attribute is actually nodeName

            if (attributes[0]) {
                self.nodeName = attributes[0].name.toLowerCase();
                // end tag (</div>) is a tag too in lexer , but not exist in parsed dom tree
                self.tagName = self.nodeName.replace(/\//, "");
                self._updateSelfClosed();
                attributes.splice(0, 1);
            }

            var lastAttr = attributes[attributes.length - 1],
                lastSlash = !!(lastAttr && /\/$/.test(lastAttr.name));

            if (lastSlash) {
                attributes.length = attributes.length - 1;
            }

            // self-closing flag
            self.isSelfClosed = self.isSelfClosed || lastSlash;

            // whether has been closed by its end tag
            // !TODO how to set closed position correctly
            self['closed'] = self.isSelfClosed;
        }
        self['closedStartPosition'] = -1;
        self['closedEndPosition'] = -1;
    }

    function refreshChildNodes(self) {
        var c = self.childNodes;
        self.firstChild = c[0];
        self.lastChild = c[c.length - 1];
        if (c.length >= 1) {
            c[0].nextSibling = c[0].nextSibling = null;
            c[0].parentNode = self;
        }
        if (c.length > 1) {
            for (var i = 0; i < c.length - 1; i++) {
                c[i].nextSibling = c[i + 1];
                c[i + 1].previousSibling = c[i];
                c[i + 1].parentNode = self;
            }
            c[c.length - 1].nextSibling = null
        }
    }

    S.extend(Tag, Node, {

        _updateSelfClosed:function () {
            var self = this;
            // <br> <img> <input> , just recognize them immediately
            self.isSelfClosed = !!(Dtd.$empty[self.nodeName]);
            if (!self.isSelfClosed) {
                self.isSelfClosed = /\/$/.test(self.nodeName);
            }
            self['closed'] = self.isSelfClosed;
        },

        clone:function () {
            var ret = new Tag(),
                attrs = [];
            S.each(this.attributes, function (a) {
                attrs.push(a.clone());
            });
            S.mix(ret, {
                childNodes:[],
                firstChild:null,
                lastChild:null,
                attributes:attrs,
                nodeType:this.nodeType,
                nodeName:this.nodeName,
                tagName:this.tagName,
                isSelfClosed:this.isSelfClosed,
                closed:this.closed,
                closedStartPosition:this.closedStartPosition,
                closedEndPosition:this.closedEndPosition
            });
            return ret;
        },

        setTagName:function (v) {
            var self = this;
            self.nodeName = self.tagName = v;
            if (v) {
                self._updateSelfClosed();
            }
        },

        equals:function (tag) {
            if (!tag || this.nodeName != tag.nodeName) {
                return 0;
            }
            if (this.nodeType != tag.nodeType) {
                return 0;
            }
            if (this.attributes.length != tag.attributes.length) {
                return 0;
            }
            for (var i = 0; i < this.attributes.length; i++) {
                if (!this.attributes[i].equals(tag.attributes[i])) {
                    return 0;
                }
            }
            return 1;
        },

        isEndTag:function () {
            return /^\//.test(this.nodeName);
        },

        appendChild:function (node) {
            this.childNodes.push(node);
            refreshChildNodes(this);
        },

        replace:function (ref) {
            var silbing = ref.parentNode.childNodes,
                index = S.indexOf(ref, silbing);
            silbing[index] = this;
            refreshChildNodes(ref.parentNode);
        },

        replaceChild:function (newC, refC) {
            var self = this,
                childNodes = self.childNodes;
            var index = S.indexOf(refC, childNodes);
            childNodes[index] = newC;
            refreshChildNodes(self);
        },

        prepend:function (node) {
            this.childNodes.unshift(node);
            refreshChildNodes(this);
        },

        insertBefore:function (ref) {
            var silbing = ref.parentNode.childNodes,
                index = S.indexOf(ref, silbing);
            silbing.splice(index, 0, this);
            refreshChildNodes(ref.parentNode);
        },


        insertAfter:function (ref) {
            var silbing = ref.parentNode.childNodes,
                index = S.indexOf(ref, silbing);
            if (index == silbing.length - 1) {
                ref.parentNode.appendChild(this);
            } else {
                this.insertBefore(ref.parentNode.childNodes[[index + 1]]);
            }
        },

        empty:function () {
            this.childNodes = [];
            refreshChildNodes(this);
        },

        removeChild:function (node) {
            var silbing = node.parentNode.childNodes,
                index = S.indexOf(node, silbing);
            silbing.splice(index, 1);
            refreshChildNodes(node.parentNode);
        },

        getAttribute:function (name) {
            var attr = findAttributeByName(this.attributes, name);
            return attr && attr.value;
        },

        setAttribute:function (name, value) {
            var attr = findAttributeByName(this.attributes, name);
            if (attr) {
                attr.value = value;
            } else {
                this.attributes.push(new Attribute(name, '=', value, '"'));
            }
        },

        removeAttribute:function (name) {
            var attr = findAttributeByName(this.attributes, name);
            if (attr) {
                var index = S.indexOf(attr, this.attributes);
                this.attributes.splice(index, 1);
            }
        },

        /**
         * give root node a chance to filter children first
         */
        filterChildren:function () {
            var self = this;
            if (!self.isChildrenFiltered) {
                var writer = new (S.require('htmlparser/writer/basic'))();
                self._writeChildrenHTML(writer);
                var parser = new (S.require('htmlparser/Parser'))(writer.getHTML()),
                    children = parser.parse().childNodes;
                self.empty();
                S.each(children, function (c) {
                    self.appendChild(c);
                });
                self.isChildrenFiltered = 1;
            }
        },

        /**
         * serialize tag to html string in writer
         * @param writer
         * @param filter
         */
        writeHTML:function (writer, filter) {
            var el = this,
                tmp,
                attrName,
                tagName = el.tagName;

            // special treat for doctype
            if (tagName == "!doctype") {
                writer.append(this.toHTML() + "\n");
                return;
            }

            el.__filter = filter;
            el.isChildrenFiltered = 0;

            // process its open tag
            if (filter) {
                // element filtered by its name directly
                if (!(tagName = filter.onTagName(tagName))) {
                    return;
                }

                el.tagName = tagName;

                tmp = filter.onTag(el);

                if (tmp === false) {
                    return;
                }

                // replaced
                if (tmp) {
                    el = tmp;
                }

                // replaced by other type of node
                if (el.nodeType !== 1) {
                    el.writeHTML(writer, filter);
                    return;
                }

                // preserve children but delete itself
                if (!el.tagName) {
                    el._writeChildrenHTML(writer);
                    return;
                }
            }

            writer.openTag(el);

            // process its attributes
            var attributes = el.attributes;
            for (var i = 0; i < attributes.length; i++) {
                var attr = attributes[i];
                attrName = attr.name;
                if (filter) {
                    // filtered directly by name
                    if (!(attrName = filter.onAttributeName(attrName, el))) {
                        continue;
                    }
                    attr.name = attrName;
                    // filtered by value and node
                    if (filter.onAttribute(attr, el) === false) {
                        continue;
                    }
                }
                writer.attribute(attr, el);
            }

            // close its open tag
            writer.openTagClose(el);

            if (!el.isSelfClosed) {
                el._writeChildrenHTML(writer);
                // process its close tag
                writer.closeTag(el);
            }
        },


        /**
         * @param writer
         * @protected
         */
        _writeChildrenHTML:function (writer) {
            var self = this,
                filter = self.isChildrenFiltered ? 0 : self.__filter;
            // process its children recursively
            S.each(self.childNodes, function (child) {
                child.writeHTML(writer, filter);
            });
        }

    });

    function findAttributeByName(attributes, name) {
        for (var i = 0; i < attributes.length; i++) {
            if (attributes[i].name == name) {
                return attributes[i];
            }
        }
        return null;
    }

    return Tag;

}, {
    requires:['./Node', './Attribute', '../dtd']
});/**
 * dom text node
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/nodes/Text", function (S, Node) {

    function Text(v) {
        if (typeof v == 'string') {
            this.nodeValue = v;
            Text.superclass.constructor.apply(this, [null, -1, -1]);
        } else {
            Text.superclass.constructor.apply(this, arguments);
            this.nodeValue = this.toHTML();
        }
        this.nodeType = 3;
        this.nodeName = "#text";
    }

    S.extend(Text, Node, {
        writeHTML:function (writer, filter) {
            var ret;
            if (!filter || (ret = filter.onText(this)) !== false) {
                if (ret) {
                    if (this !== ret) {
                        ret.writeHTML(writer, filter);
                        return;
                    }
                }
                writer.text(this.toHTML());
            }
        },
        toHTML:function () {
            if (this.nodeValue) {
                return this.nodeValue;
            } else {
                return Text.superclass.toHTML.apply(this, arguments);
            }
        }
    });

    return Text;
}, {
    requires:['./Node']
});/**
 * scanner cdata (script/textarea/style)
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/scanners/CDataScanner", function () {
    return {
        scan:function (tag, lexer, opts) {
            // only terminate when encounter </tag>
            // <textarea><div></div></textarea>
            var content = lexer.parseCDATA(opts.quoteSmart, tag.nodeName),
                position = lexer.getPosition(),
                node = lexer.nextNode();
            if (node) {
                // 这段应该永远不会执行到的
                if (node.nodeType != 1 ||
                    !(node.isEndTag() &&
                        node.tagName == tag.tagName)) {
                    lexer.setPosition(position);
                    node = null;
                }
            }
            tag.closed = true;
            if (content) {
                tag.appendChild(content);
            }
        }
    };
});/**
 * scanner cdata (script/textarea/style) with quote smart
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/scanners/QuoteCdataScanner", function(S, CDataScanner, Dtd, SpecialScanners) {
    var ret = {
        scan:function(tag, lexer, opts) {
            opts = opts || {};
            opts.quoteSmart = 1;
            CDataScanner.scan(tag, lexer, opts);
            opts.quoteSmart = 0;
        }
    };
    // script/style
    for (var t in Dtd.$cdata) {
        SpecialScanners[t] = ret;
    }
    return ret;
}, {
    requires:["./CDataScanner",'../dtd','./SpecialScanners']
});/**
 * special scanners holder (textarea/style/script)
 * @author yiminghe@gmail.com
 */
KISSY.add('htmlparser/scanners/SpecialScanners', function() {
    return {};
});/**
 * nest tag scanner recursively
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/scanners/TagScanner", function (S, dtd, Tag, SpecialScanners) {

    var /**
     * will create ul when encounter li and li's parent is not ul
     */
        wrapper = {
        li:'ul',
        dt:'dl',
        dd:'dl'
    };

    /**
     * refer: http://www.w3.org/TR/html5/tree-construction.html#tree-construction
     * When the steps below require the UA to generate implied end tags,
     * then, while the current node is a dd element,
     * a dt element, an li element, an option element,
     * an optgroup element, a p element, an rp element, or an rt element,
     * the UA must pop the current node off the stack of open elements.
     */
    var impliedEndTag = {
        // if dd encounter another dd before encounter dl ,then close last dd
        'dd':{'dl':1},
        'dt':{'dl':1},
        // 2012.06.27 Note: li may has two kinds of parent!
        'li':{'ul':1, 'ol':1},
        'option':{'select':1},
        'optgroup':{'select':1}
        // p? rp? rt?
    };

    /**
     * close tag and check nest by xhtml dtd rules
     * <span> 1 <span>2</span> <p>3</p> </span> => <span> 1 <span>2</span> </span> <p><span>3</span></p>
     * @param tag
     */
    function fixCloseTagByDtd(tag, opts) {
        tag['closed'] = 1;

        if (!opts['fixByDtd']) {
            return 0;
        }

        var valid = 1,
            childNodes = [].concat(tag.childNodes);

        S.each(childNodes, function (c) {
            if (!canHasNodeAsChild(tag, c)) {
                valid = 0;
                return false;
            }
        });

        if (valid) {
            return 0;
        }

        var
        // a valid element which will replace current invalid tag
        // and move tag's children to holder validly !
            holder = tag.clone(),
        // last escape position that tag's children can be insertAfter
        // escape from its parent if its parent can not include him :(
            prev = tag,
            recursives = [];

        function closeCurrentHolder() {
            if (holder.childNodes.length) {
                // close current holder
                holder.insertAfter(prev);
                // if child can not be included in holder
                // : <a><a></a></a>
                // then will insertAfter last holder
                prev = holder;
                // open new holder to accommodate child which can reside in holder
                // <a>1<a>2</a>3</a> => <a>1</a>(-<close holder)<a>2</a>(<-child can not be included in holder)<a>3</a>(<-new holder)
                holder = tag.clone();
            }
        }

        for (var i = 0; i < childNodes.length; i++) {
            var c = childNodes[i];

            if (canHasNodeAsChild(holder, c)) {
                holder.appendChild(c);
            } else {

                // if can not include text as its child , then discard
                if (c.nodeType != 1) {
                    continue;
                }

                var currentChildName = c.tagName;

                // li -> ul
                if (dtd.$listItem[currentChildName]) {
                    closeCurrentHolder();
                    var pTagName = wrapper[c.tagName],
                        pTag = new Tag();
                    pTag.nodeName = pTag.tagName = pTagName;
                    while (i < childNodes.length) {
                        if (childNodes[i].tagName == currentChildName) {
                            pTag.appendChild(childNodes[i]);
                        } else if (childNodes[i].nodeType == 3 &&
                            !S.trim(childNodes[i].toHTML())) {
                        }
                        // non-empty text leave it to outer loop
                        else if (childNodes[i].nodeType == 3) {
                            break;
                        }
                        i++;
                    }
                    pTag.insertAfter(prev);
                    prev = pTag;
                    i--;
                    continue;
                }

                // only deal with inline element mistakenly wrap block element ?
                // also consider <pre>1 \n<div>2\n 3\n</div> 4</pre> : 2012-01-13
                // if (dtd.$inline[tag.tagName]) {
                closeCurrentHolder();
                if (!c.equals(holder)) {
                    // <a><p></p></a> => <p><a></a></p>
                    if (canHasNodeAsChild(c, holder)) {
                        holder = tag.clone();
                        S.each(c.childNodes, function (cc) {
                            holder.appendChild(cc);
                        });
                        c.empty();
                        c.insertAfter(prev);
                        prev = c;
                        c.appendChild(holder);
                        // recursive to a,lower
                        recursives.push(holder);
                        holder = tag.clone();
                    } else {
                        // <a href='1'> <a href='2'>2</a> </a>
                        c.insertAfter(prev);
                        prev = c;
                    }
                } else {
                    c.insertAfter(prev);
                    prev = c;
                }
                // }
            }
        }

        // <a>1<p>3</p>3</a>
        // encouter 3 , last holder should be inserted after <p>
        if (holder.childNodes.length) {
            holder.insertAfter(prev);
        }

        // <a><p>1</p></a> => <a></a><p><a>1</a></p> => <p><a>1</a></p>
        tag.parentNode.removeChild(tag);

        // <a><div><div>1</div></div></a>
        // =>
        // <div><a><div>1</div></a></div>

        // => fixCloseTagByDtd("<a><div>1</div></a>")
        S.each(recursives, function (r) {
            fixCloseTagByDtd(r, opts);
        });

        return 1;
    }


    /**
     * checked whether tag can include node as its child according to DTD
     */
    function canHasNodeAsChild(tag, node) {
        // document can nest any tag
        if (tag.nodeType == 9) {
            return 1;
        }
        if (!dtd[tag.tagName]) {

        }
        if (node.nodeType == 8) {
            return 1;
        }
        var nodeName = node.tagName || node.nodeName;
        return !!dtd[tag.tagName][nodeName];
    }


    return {
        scan:function (tag, lexer, opts) {

            function closeStackOpenTag(end, from) {
                for (i = end; i > from; i--) {
                    var currentStackItem = stack[i],
                        preStackItem = stack[i - 1];
                    preStackItem.appendChild(currentStackItem);
                    fixCloseTagByDtd(currentStackItem, opts);
                }
                tag = stack[from];
                stack.length = from;
            }

            // fix
            // <ol><li>1<li>2</ol>
            function processImpliedEndTag(node) {
                var needFix = 0,
                    endParentTagName;
                // <ul><li>1<ul><li>2</ul></ul>
                if (endParentTagName = impliedEndTag[node.tagName]) {
                    var from = stack.length - 1,
                        parent = stack[from];
                    // <ol><li><ol><li>
                    // parent ol break li check
                    while (parent && !(parent.tagName in endParentTagName)) {
                        // <ul><li>1<div><li>2</div></ul>
                        if (parent.tagName == node.tagName) {
                            needFix = 1;
                            break;
                        }
                        from--;
                        parent = stack[from];
                    }
                    if (needFix) {
                        closeStackOpenTag(stack.length - 1, from - 1);
                    }
                }
                return needFix;
            }

            var node,
                i,
                stack;
            // http://www.w3.org/TR/html5/parsing.html#stack-of-open-elements
            // stack of open elements
            stack = opts.stack = opts.stack || [];
            do {
                node = lexer.nextNode();
                if (node) {
                    if (node.nodeType === 1) {
                        // normal end tag
                        if (node.isEndTag() &&
                            node.tagName == tag.tagName) {
                            node = null;
                        } else if (!node.isEndTag()) {

                            if (SpecialScanners[node.tagName]) {
                                // change scanner ,such as textarea scanner ... etc
                                SpecialScanners[node.tagName].scan(node, lexer, opts);
                                tag.appendChild(node);
                            } else {
                                // now fake recursive using stack
                                if (node.isSelfClosed) {
                                    tag.appendChild(node);
                                } else {
                                    // When the steps below require the UA to insert an HTML element for a token,
                                    // the UA must first create an element for the token in the HTML namespace,
                                    // and then append this node to the current node,
                                    // and push it onto the stack of open elements so that it is the new current node.
                                    // 一点改动：先放入栈中，等到结束标签再 appendChild
                                    // fake stack
                                    stack.push(tag);// <ul>
                                    //      <li>1
                                    //      <li>2
                                    // </ul>
                                    if (processImpliedEndTag(node)) {
                                        stack.push(tag);
                                    }
                                    tag = node;
                                }
                            }
                        } else if (node.isEndTag()) {
                            // encounter a end tag without open tag
                            // There are two cases...
                            // 1) The tag hasn't been registered, in which case
                            // we just add it as a simple child, like it's
                            // opening tag
                            // 2) There may be an opening tag further up the
                            // parse stack that needs closing.
                            // So, we ask the factory for a node like this one
                            // (since end tags never have scanners) and see
                            // if it's scanner is a composite tag scanner.
                            // If it is we walk up the parse stack looking for
                            // something that needs this end tag to finish it.
                            // If there is something, we close off all the tags
                            // walked over and continue on as if nothing
                            // happened.
                            var index = -1;
                            for (i = stack.length - 1; i >= 0; i--) {
                                var c = stack[i];
                                if (c.tagName === node.tagName) {
                                    index = i;
                                    break;
                                }
                            }

                            if (index != -1) {
                                // <div><span> <a> </div>
                                // tag==a
                                stack[stack.length - 1].appendChild(tag);
                                fixCloseTagByDtd(tag, opts);
                                closeStackOpenTag(stack.length - 1, index);
                                node = null;
                            } else {
                                // discard this close tag
                            }

                        }
                    } else {
                        tag.appendChild(node);
                    }
                }

                // fake recursive success , stack retreat
                if (node == null) {
                    if (stack.length > 0) {
                        node = stack[stack.length - 1];
                        // fake recursion
                        if (!SpecialScanners[node.tagName]) {
                            stack.length = stack.length - 1;
                            node.appendChild(tag);
                            // child fix
                            fixCloseTagByDtd(tag, opts);
                            tag = node;
                        } else {
                            node = null;
                        }
                    }
                }
            } while (node);

            // root tag fix
            fixCloseTagByDtd(tag, opts);
        }
    };
}, {
    requires:["../dtd", "../nodes/Tag", "./SpecialScanners"]
});/**
 * textarea data scanner
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/scanners/TextareaScanner", function(S, CDataScanner, SpecialScanners) {
    return SpecialScanners["textarea"] = {
        scan:function(tag, lexer, opts) {
            opts = opts || {};
            CDataScanner.scan(tag, lexer, opts);
        }
    };
}, {
    requires:["./CDataScanner","./SpecialScanners"]
});/**
 * basic writer for inheritance
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/writer/basic", function () {

    function escapeAttrValue(str) {
        return String(str).replace(/"/g, "&quote;");
    }


    function BasicWriter() {
        this.output = [];
    }

    BasicWriter.prototype = {

        constructor: BasicWriter,

        append: function () {
            var o = this.output,
                args = (arguments),
                arg;
            for (var i = 0; i < args.length; i++) {
                arg = args[i];
                if (arg.length > 1) {
                    for (var j = 0; j < arg.length; j++) {
                        o.push(arg.charAt(j));
                    }
                } else {
                    o.push(arg);
                }
            }
            return this;
        },

        openTag: function (el) {
            this.append("<", el.tagName);
        },

        openTagClose: function (el) {
            if (el.isSelfClosed) {
                this.append(" ", "/");
            }
            this.append(">");
        },

        closeTag: function (el) {
            this.append("<\/", el.tagName, ">");
        },

        attribute: function (attr) {
            this.append(" ",
                attr.name,
                "=\"",
                escapeAttrValue(attr.value || attr.name),
                "\"");
        },

        text: function (text) {
            this.append(text);
        },

        cdata: function (cdata) {
            this.append(cdata);
        },

        comment: function (comment) {
            this.append("<!--" + comment + "-->");
        },

        getHTML: function () {
            return this.output.join("");
        }

    };

    return BasicWriter;

});/**
 * format html prettily
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/writer/beautify", function (S, BasicWriter, dtd, Utils) {

    function BeautifyWriter() {
        var self = this;
        BeautifyWriter.superclass.constructor.apply(self, arguments);
        // tag in pre should not indent
        // space (\t\r\n ) in pre should not collapse
        self.inPre = 0;
        self.indentChar = "\t";
        self.indentLevel = 0;
        // whether to indent on current line
        // if already indent and then not line break ,next tag should not indent
        self.allowIndent = 0;
        self.rules = {};

        for (var e in S.merge(
            dtd.$nonBodyContent,
            dtd.$block,
            dtd.$listItem,
            dtd.$tableContent,
            // may add unnecessary whitespaces
            {
                "select":1,
                // add unnecessary whitespaces is ok for script and style
                "script":1,
                "style":1
            }
        )) {
            self.setRules(e, {
                // whether its tag/text children should indent
                allowIndent:1,
                breakBeforeOpen:1,
                breakAfterOpen:1,
                breakBeforeClose:1, // !dtd[e]['#text']
                breakAfterClose:1
            });
        }

        self.setRules('option', {
            breakBeforeOpen:1
        });

        self.setRules('optiongroup', {
            breakBeforeOpen:1
        });

        self.setRules('br', {
            breakAfterOpen:1
        });

        self.setRules('title', {
            allowIndent:0,
            breakBeforeClose:0,
            breakAfterOpen:0
        });

        // Disable indentation on <pre>.
        self.setRules('pre', {
            allowIndent:0
        });
    }

    S.extend(BeautifyWriter, BasicWriter, {
        indentation:function () {
            if (!this.inPre) {
                this.append(new Array(this.indentLevel + 1).join(this.indentChar));
            }
            // already indent ,unless line break  it will not indent again
            this.allowIndent = 0;
        },

        lineBreak:function () {
            var o = this.output;
            if (!this.inPre && o.length) {
                // prevent adding more \n between tags :
                // before : <div>\n<div>\n</div>\n</div> => <div>\n\t' '\n<div>
                // now : <div>\n<div>\n</div>\n</div> => <div>\n<div> => indentation =><div>\n\t<div>
                for (var j = o.length - 1; j >= 0; j--) {
                    if (!(/[\r\n\t ]/.test(o[j]))) {
                        break;
                    }
                }
                o.length = j + 1;
                this.append("\n");
            }
            // allow indentation if encounter next tag
            this.allowIndent = 1;
        },

        setRules:function (tagName, rule) {
            if (!this.rules[tagName]) {
                this.rules[tagName] = {};
            }
            S.mix(this.rules[tagName], rule);
        },

        openTag:function (el) {

            var tagName = el.tagName,
                rules = this.rules[tagName] || {};
            if (this.allowIndent) {
                this.indentation();
            } else if (rules.breakBeforeOpen) {
                this.lineBreak();
                this.indentation();
            }
            BeautifyWriter.superclass.openTag.apply(this, arguments);
        },

        openTagClose:function (el) {

            var tagName = el.tagName;
            var rules = this.rules[tagName] || {};
            if (el.isSelfClosed) {
                this.append(" />")
            } else {
                this.append(">");
                if (rules.allowIndent) {
                    this.indentLevel++;
                }
            }
            if (rules.breakAfterOpen) {
                this.lineBreak();
            }
            if (tagName === 'pre') {
                this.inPre = 1;
            }
        },

        closeTag:function (el) {
            var self = this,
                tagName = el.tagName,
                rules = self.rules[tagName] || {};

            if (rules.allowIndent) {
                self.indentLevel--;
            }

            if (self.allowIndent) {
                self.indentation();
            } else if (rules.breakBeforeClose) {
                self.lineBreak();
                self.indentation();
            }

            BeautifyWriter.superclass.closeTag.apply(self, arguments);

            if (tagName === "pre") {
                self.inPre = 0;
            }

            if (rules.breakAfterClose) {
                self.lineBreak();
            }

        },

        text:function (text) {
            if (this.allowIndent) {
                this.indentation();
            }
            if (!this.inPre) {
                // shrink consequential spaces into one space
                // 换行也没了，否则由于 closeTag 时 lineBreak 会导致换行越来越多
                text = Utils.collapseWhitespace(text);
            }
            this.append(text);
        },

        comment:function (comment) {
            if (this.allowIndent) {
                this.indentation();
            }
            this.append("<!--" + comment + "-->");
        },

        cdata:function (text) {
            if (this.allowIndent) {
                this.indentation();
            }
            this.append(S.trim(text));
        }

    });

    return BeautifyWriter;

}, {
    requires:['./basic', '../dtd', '../Utils']
});/**
 * filter dom tree to html string form,api designed by ckeditor
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/writer/filter", function (S) {
    function Filter() {
        // {priority: ?, value:?}
        this.tagNames = [];
        this.attributeNames = [];
        this.tags = [];
        this.comment = [];
        this.text = [];
        this.cdata = [];
        this.attributes = [];
        this.root = [];
    }

    function findIndexToInsert(arr, p) {
        for (var i = 0; arr && i < arr.length; i++) {
            if (arr[i].priority > p) {
                return i;
            }
        }
        return arr.length;
    }

    function filterName(arr, v) {
        for (var i = 0; arr && i < arr.length; i++) {
            var items = arr[i].value;
            S.each(items, function (item) {
                v = v.replace(item[0], item[1]);
            });
        }
        return v;
    }

    function filterFn(arr, args, el) {
        var item, i, ret;
        for (i = 0; arr && i < arr.length; i++) {
            item = arr[i].value;
            if ((ret = item.apply(null, args)) === false) {
                return false;
            }
            // node can be replaced with another node
            if (el && ret && ret != el) {
                // text filter can return string value directly
                if (typeof ret == 'string') {
                    if (el.toHTML() == ret) {
                        return el;
                    }
                    el.nodeValue = ret;
                    ret = el;
                }
                return this.onNode(ret);
            }
        }
        return el;
    }

    function filterAttr(arr, attrNode, el, _default) {
        for (var i = 0; arr && i < arr.length; i++) {
            var item = arr[i].value,
                ret,
                name = attrNode.name;
            if (item[name] && (ret = item[name].call(null, attrNode.value, el)) === false) {
                return ret;
            }
            // 2012.06.26 change attribute value
            if (typeof ret == 'string') {
                attrNode.value = ret;
            }
        }
        return _default;
    }

    Filter.prototype = {

        constructor: Filter,

        /**
         *
         * @param rules
         * {
         *   tagNames:[ [/^ke/,''] ],
         *   attributeNames:[[^on],''],
         *   tags:{
         *      p:function(element){},
         *      ^:function(element){},
         *      $:function(element){}
         *   }
         *   comment:function(){},
         *   attributes:{style:function(){}},
         *   text:function(){},
         *   root:function(){}
         * }
         * @param {Number} [priority] 值越小，优先级越高 ,最低 1
         */
        addRules: function (rules, priority) {
            priority = priority || 10;
            for (var r in rules) {

                var holder = this[r];
                if (holder) {
                    var index = findIndexToInsert(holder, priority);
                    holder.splice(index, 0, {
                        value: rules[r],
                        priority: priority
                    });
                }

            }
        },

        /**
         * when encounter element name transformer ,directly transform
         * @param v
         */
        onTagName: function (v) {
            return filterName(this.tagNames, v);
        },

        onAttributeName: function (v) {
            return filterName(this.attributeNames, v);
        },

        onText: function (el) {
            return filterFn.call(this, this.text, [el.toHTML(), el], el);
        },

        onCData: function (el) {
            return filterFn.call(this, this.cdata, [el.toHTML(), el], el);
        },

        onAttribute: function (attrNode, el) {
            return filterAttr(this.attributes, attrNode, el, attrNode);
        },

        onComment: function (el) {
            return filterFn.call(this, this.comment, [el.toHTML(), el], el);
        },

        onNode: function (el) {
            var t = el.nodeType;
            if (t === 1) {
                return this.onTag(el);
            } else if (t === 3) {
                return this.onText(el);
            } else if (t === 8) {
                return this.onComment(el);
            }
        },

        onFragment: function (el) {
            return filterFn.call(this, this.root, [el], el);
        },

        onTag: function (el) {
            // ^ tagName $
            var filters = ["^", el.tagName, "$"],
                tags = this.tags,
                ret;
            for (var i = 0; i < filters.length; i++) {
                var filter = filters[i];
                for (var j = 0; j < tags.length; j++) {
                    var element = tags[j].value;
                    if (element[filter]) {
                        // node is removed with its children
                        if ((ret = element[filter](el)) === false) {
                            return false;
                        }
                        // node is replaced with another node
                        if (ret && ret != el) {
                            return this.onNode(ret);
                        }
                        // node is removed (children preserved)
                        if (!el.tagName) {
                            return el;
                        }
                    }
                }
            }
            return el;
        }

    };

    return Filter;
});/**
 * write html into its minified form,thanks to kangax where minify algorithm comes from
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/writer/minify", function (S, BasicWriter, Utils) {

    var trim = S.trim,
        collapseWhitespace = Utils.collapseWhitespace,
        reEmptyAttribute = new RegExp(
            '^(?:class|id|style|title|lang|dir|on' +
                '(?:focus|blur|change|click|dblclick|mouse(' +
                '?:down|up|over|move|out)|key(?:press|down|up)))$');

    function escapeAttrValue(str) {
        return String(str).replace(/"/g, "&quote;");
    }

    function canDeleteEmptyAttribute(tag, attr) {
        var attrValue = attr.value || "",
            attrName = attr.name;
        if (!trim(attrValue)) {
            return ((tag === 'input' && attrName === 'value') ||
                reEmptyAttribute.test(attrName));
        }
        return 0;
    }

    function isBooleanAttribute(attrName) {
        return (/^(?:checked|disabled|selected|readonly|defer|multiple|nohref|noshape|nowrap|noresize|compact|ismap)$/i).test(attrName);
    }

    function canRemoveAttributeQuotes(value) {
        // http://www.w3.org/TR/html5/syntax.html#unquoted
        // avoid \w, which could match unicode in some implementations
        return !(/[ "'=<>`]/).test(value);
    }

    function isAttributeRedundant(el, attr) {
        var tag = el.nodeName,
            attrName = attr.name,
            attrValue = attr.value || "";
        attrValue = trim(attrValue.toLowerCase());
        return (
            (tag === 'script' &&
                attrName === 'language' &&
                attrValue === 'javascript') ||

                (tag === 'form' &&
                    attrName === 'method' &&
                    attrValue === 'get') ||

                (tag === 'input' &&
                    attrName === 'type' &&
                    attrValue === 'text') ||

                (tag === 'script' &&
                    attrName === 'type' &&
                    attrValue === 'text/javascript') ||

                (tag === 'style' &&
                    attrName === 'type' &&
                    attrValue === 'text/css') ||

                (tag === 'area' &&
                    attrName === 'shape' &&
                    attrValue === 'rect')
            );
    }

    function isConditionalComment(text) {
        return (/\[if[^\]]+\]/).test(text);
    }

    function isEventAttribute(attrName) {
        return (/^on[a-z]+/).test(attrName);
    }

    function isUriTypeAttribute(attrName, tag) {
        return (
            ((/^(?:a|area|link|base)$/).test(tag) && attrName === 'href') ||
                (tag === 'img' && (/^(?:src|longdesc|usemap)$/).test(attrName)) ||
                (tag === 'object' && (/^(?:classid|codebase|data|usemap)$/).test(attrName)) ||
                (tag === 'q' && attrName === 'cite') ||
                (tag === 'blockquote' && attrName === 'cite') ||
                ((tag === 'ins' || tag === 'del') && attrName === 'cite') ||
                (tag === 'form' && attrName === 'action') ||
                (tag === 'input' && (attrName === 'src' || attrName === 'usemap')) ||
                (tag === 'head' && attrName === 'profile') ||
                (tag === 'script' && (attrName === 'src' || attrName === 'for'))
            );
    }

    function isNumberTypeAttribute(attrName, tag) {
        return (
            ((/^(?:a|area|object|button)$/).test(tag) && attrName === 'tabindex') ||
                (tag === 'input' && (attrName === 'maxlength' || attrName === 'tabindex')) ||
                (tag === 'select' && (attrName === 'size' || attrName === 'tabindex')) ||
                (tag === 'textarea' && (/^(?:rows|cols|tabindex)$/).test(attrName)) ||
                (tag === 'colgroup' && attrName === 'span') ||
                (tag === 'col' && attrName === 'span') ||
                ((tag === 'th' || tag == 'td') && (attrName === 'rowspan' || attrName === 'colspan'))
            );
    }

    function cleanAttributeValue(el, attr) {
        var tag = el.nodeName,
            attrName = attr.name,
            attrValue = attr.value || "";
        if (isEventAttribute(attrName)) {
            attrValue = trim(attrValue)
                .replace(/^javascript:[\s\xa0]*/i, '')
                .replace(/[\s\xa0]*;$/, '');
        }
        else if (attrName === 'class') {
            attrValue = collapseWhitespace(trim(attrValue));
        }
        else if (isUriTypeAttribute(attrName, tag) ||
            isNumberTypeAttribute(attrName, tag)) {
            attrValue = trim(attrValue);
        }
        else if (attrName === 'style') {
            attrValue = trim(attrValue).replace(/[\s\xa0]*;[\s\xa0]*$/, '');
        }
        return attrValue;
    }

    function cleanConditionalComment(comment) {
        return comment
            .replace(/^(\[[^\]]+\]>)[\s\xa0]*/, '$1')
            .replace(/[\s\xa0]*(<!\[endif\])$/, '$1');
    }

    function removeCDATASections(text) {
        return trim(text)
            // "/* <![CDATA[ */" or "// <![CDATA["
            .replace(/^(?:[\s\xa0]*\/\*[\s\xa0]*<!\[CDATA\[[\s\xa0]*\*\/|[\s\xa0]*\/\/[\s\xa0]*<!\[CDATA\[.*)/, '')// [\s\xa0]* ??
            // "/* ]]> */" or "// ]]>"
            .replace(/(?:\/\*[\s\xa0]*\]\]>[\s\xa0]*\*\/|\/\/[\s\xa0]*\]\]>)[\s\xa0]*$/, '');
    }

    function Minifier() {
        var self = this;
        Minifier.superclass.constructor.apply(self, arguments);
        self.inPre = 0;
    }

    S.extend(Minifier, BasicWriter, {
        /**
         * remove non-conditional comment
         */
        comment: function (text) {
            if (isConditionalComment(text)) {
                text = cleanConditionalComment(text);
                Minifier.superclass.comment.call(this, text);
            }
        },

        /**
         * record pre track
         */
        openTag: function (el) {
            var self = this;
            if (el.tagName == 'pre') {
                self.inPre = 1;
            }
            Minifier.superclass.openTag.apply(self, arguments);
        },

        /**
         * clean pre track
         */
        closeTag: function (el) {
            var self = this;
            if (el.tagName == 'pre') {
                self.inPre = 0;
            }
            Minifier.superclass.closeTag.apply(self, arguments);
        },

        /**
         * textarea | script | style
         */
        cdata: function (cdata) {
            cdata = removeCDATASections(cdata);
            Minifier.superclass.cdata.call(this, cdata);
        },

        attribute: function (attr, el) {
            var self = this,
                name = attr.name,
                normalizedValue,
                value = attr.value || "";

            // remove empty attribute
            if (canDeleteEmptyAttribute(el, attr) ||
                // remove redundant attribute
                isAttributeRedundant(el, attr)) {
                return;
            }

            if (isBooleanAttribute(name)) {
                // collapse boolean attributes
                self.append(" ", name);
                return;
            }

            // clean attribute value
            normalizedValue = escapeAttrValue(cleanAttributeValue(el, attr));

            if (value && canRemoveAttributeQuotes(value)) {
                // remove quote if value is not empty
            } else {
                normalizedValue = '"' + normalizedValue + '"';
            }

            self.append(" ", name, "=", normalizedValue);
        },

        /**
         * note : pre is special
         */
        text: function (text) {
            var self = this;
            if (!self.inPre) {
                // collapse whitespace
                text = collapseWhitespace(text);
            }
            self.append(text);
        }
    });

    return Minifier;

}, {
    requires: ['./basic', '../Utils']
});

/**
 * refer :
 *  - https://github.com/kangax/html-minifier/
 **/
