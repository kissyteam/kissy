/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Sep 27 19:45
*/
/**
 * parse html to a hierarchy dom tree
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/Parser",function(S, Cursor, Lexer) {

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
});/**
 * lang for html parser
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/Utils", function() {
    return {
        isLetter:function(ch) {
            return 'a' <= ch && 'z' >= ch || 'A' <= ch && 'Z' >= ch;
        },
        isWhitespace:function(ch) {
            return /\s/.test(ch);
        }
    };
});/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.add("htmlparser/dtd",function(KY) {
    /**
     * Holds and object representation of the HTML DTD to be used by the editor in
     * its internal operations.
     *
     * Each element in the DTD is represented by a
     * property in this object. Each property contains the list of elements that
     * can be contained by the element. Text is represented by the "#" property.
     *
     * Several special grouping properties are also available. Their names start
     * with the "$" character.
     * @namespace
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
            "b":1,"acronym":1,"bdo":1,'var':1,'#':1,
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
            '#':1,
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
        N = {'#':1},
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

    return  {

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
});
/**
 * represent a cursor of page , it can advance and retreat
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/lexer/Cursor",function() {
    function Cursor(offset) {
        this.position = offset || 0;
    }

    Cursor.prototype = {
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
KISSY.add("htmlparser/lexer/Index",function() {

    function Index() {
        this.lineCursors = [];
    }

    Index.prototype = {


        add:function(cursor) {
            if (indexOfCursor(this.lineCursors, cursor) != -1) {
                return;
            }
            var index = indexOfCursorForInsert(this.lineCursors, cursor);
            this.lineCursors.splice(index, 0, cursor);
        },

        remove:function(cursor) {
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
        row:function(cursor) {
            return indexOfCursorForInsert(this.lineCursors, cursor) - 1;
        },

        col:function(cursor) {
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
KISSY.add("htmlparser/lexer/Lexer",function(S, Cursor, Page, TextNode, CData, Utils, Attribute, TagNode, CommentNode) {

    function Lexer(text) {
        this.page = new Page(text);
        this.cursor = new Cursor();
        this.nodeFactory = this;
    }

    Lexer.prototype = {

        setPosition:function(p) {
            this.cursor.position = p;
        },

        getPosition:function() {
            return this.cursor.position;
        },

        nextNode:function(quoteSmart) {
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
                    } else if ('!' == ch) {
                        ch = page.getChar(cursor);
                        if (ch == -1) {
                            ret = this.makeString(start, cursor.position);
                        } else {
                            if ('>' == ch) {
                                ret = this.makeComment(start, cursor.position);
                            } else {
                                page.ungetChar(cursor); // remark/tag need this char
                                if ('-' == ch)
                                    ret = this.parseComment(start, quoteSmart);
                                else {
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

        makeComment:function (start, end) {
            var length,ret;

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

        makeString:function(start, end) {
            var ret = null,l;
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
        makeCData:function(start, end) {
            var ret = null,l;
            l = end - start;
            if (l > 0) {
                ret = this.nodeFactory.createCDataNode(this.page, start, end);
            }
            return ret;
        },

        makeTag:function(start, end, attributes) {
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

        createTagNode:function(page, start, end, attributes) {
            return new TagNode(page, start, end, attributes);
        },

        createStringNode:function(page, start, end) {
            return new TextNode(page, start, end);
        },

        createCDataNode:function(page, start, end) {
            return new CData(page, start, end);
        },

        createCommentNode:function(page, start, end) {
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
        parseTag:function(start) {
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
                        } else if (!Utils.isWhitespace(ch)) {
                            state = 1;
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
        parseComment:function(start, quoteSmart) {
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
        parseString:function(start, quoteSmart) {
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
                        do{
                            ch = page.getChar(cursor);
                        } while ((-1 != ch) && ('\n' != ch));
                    }
                    else if ('*' == ch) {
                        do
                        {
                            do{
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
                        '!' == ch) {
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
        parseCDATA:function(quoteSmart) {
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
                                state = 2;
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
        single_quote :function(attributes, bookmarks) {
            var page = this.page;
            attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), "=", page.getText(bookmarks[4] + 1, bookmarks[5]), "'"));
        },

        /**
         * Generate an double quoted attribute
         * @param attributes The list so far.
         * @param bookmarks The array of positions.
         */
        double_quote:function (attributes, bookmarks) {
            var page = this.page;
            attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), "=", page.getText(bookmarks[5] + 1, bookmarks[6]), '"'));
        },


        /**
         * Generate a standalone attribute
         * @param attributes The list so far.
         * @param bookmarks The array of positions.
         */
        standalone:function(attributes, bookmarks) {
            var page = this.page;
            attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2])));
        },

        /**
         * Generate an unquoted attribute
         * @param attributes The list so far.
         * @param bookmarks The array of positions.
         */
        naked:function (attributes, bookmarks) {
            var page = this.page;
            attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), "=", page.getText(bookmarks[3], bookmarks[4])));
        }
    };

    return Lexer;

}, {
    requires:[
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
KISSY.add("htmlparser/lexer/Page",function(S, Index) {
    function Page(source) {
        this.source = source;
        this.lineIndex = new Index();
    }

    Page.prototype = {
        getChar:function(cursor) {
            var source = this.source;
            var i = cursor.position;
            if (i >= source.length) {
                return -1;
            }
            var ret = source.charAt(i);

            cursor.advance();

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

        ungetChar:function(cursor) {
            var source = this.source;
            cursor.retreat();
            var i = cursor.position;
            var ch = source.charAt(i);
            if (ch === '\n' && 0 != i) {
                ch = source.charAt(i - 1);
                if ('\r' === ch) {
                    cursor.retreat();
                }
            }
        },

        getText:function(start, end) {
            return this.source.slice(start, end);
        },

        row:function(cursor) {
            return this.lineIndex.row(cursor);
        },

        col:function(cursor) {
            return this.lineIndex.col(cursor);
        }
    };

    return Page;
}, {
    requires:['./Index']
});/**
 * represent attribute node in tag node
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/nodes/Attribute",function() {
    function Attribute(name, assignMent, value, quote) {
        this.nodeType = 2;
        this.name = name;
        this['assignMent'] = assignMent;
        this.value = value;
        this.quote = quote;
    }

    return Attribute;
});/**
 * dom text node
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/nodes/CData",function(S, Text) {

    function CData() {
        CData.superclass.constructor.apply(this, arguments);
        this.nodeType = 4;
        this.nodeName = "#cdata";
    }

    S.extend(CData, Text, {
        writeHtml:function(writer, filter) {
            var value = this.toHtml();
            if (filter.onCData(this) !== false) {
                writer.cdata(value);
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
KISSY.add("htmlparser/nodes/Comment",function(S, Tag) {

    function Comment() {
        Comment.superclass.constructor.apply(this, arguments);
        this.nodeType = 8;
        this.nodeName = "#comment";
    }

    S.extend(Comment, Tag, {
        writeHtml:function(writer, filter) {
            var value = this.toHtml();
            if (filter.onComment(this) !== false) {
                writer.comment(value);
            }
        }
    });

    return Comment;
}, {
    requires:['./Tag']
});/**
 * abstract class for tag and text , comment .. etc
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/nodes/Node",function(S) {

    function Node(page, startPosition, endPosition) {
        this.parentNode = null;
        this.page = page;
        this.startPosition = startPosition;
        this.endPosition = endPosition;
        this.nodeName = null;
        this.previousSibling = null;
        this.nextSibling = null;

        if (S.Config.debug) {
            this.toHtmlContent = this.toHtml();
        }
    }

    Node.prototype = {
        toHtml:function() {
            if (this.page) {
                return this.page.getText(this.startPosition, this.endPosition);
            }
        },
        toString:function() {
            var ret = [];
            ret.push(this.nodeName + "  [" + this.startPosition + ":" + this.endPosition + "]\n");
            ret.push(this.toHtml());
            return ret.join("");
        }
    };

    return Node;
});/**
 * represent tag , it can nest other tag
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/nodes/Tag",function(S, Node, TagScanner, QuoteCdataScanner, TextareaScanner, Attribute) {

    var scanners = {
        'style':QuoteCdataScanner,
        'script':QuoteCdataScanner,
        'textarea':TextareaScanner
    };

    function getScannerForTag(nodeName) {
        return scanners[nodeName] || TagScanner;
    }

    function Tag(page, startPosition, endPosition, attributes) {
        Tag.superclass.constructor.apply(this, arguments);
        this.childNodes = [];
        this.firstChild = null;
        this.lastChild = null;
        this.attributes = attributes || [];
        this.nodeType = 1;
        attributes = this.attributes;
        // first attribute is actually nodeName
        if (attributes[0]) {
            this.nodeName = attributes[0].name.toLowerCase();
            // note :
            // end tag (</div>) is a tag too in lexer , but not exist in parsed dom tree
            this.tagName = this.nodeName.replace(/\//, "");
            this.isEmptyXmlTag = /\/$/.test(this.nodeName);
            attributes.splice(0, 1);
        }

        if (!this.isEmptyXmlTag) {
            var lastAttr = attributes[attributes.length - 1];
            this.isEmptyXmlTag = !!(lastAttr && /\/$/.test(lastAttr.name));
            if (this.isEmptyXmlTag) {
                attributes.length = attributes.length - 1;
            }
        }
        // whether has been closed by its end tag
        // !TODO how to set closed position correctly
        this.closed = this.isEmptyXmlTag;
        this.closedStartPosition = -1;
        this.closedEndPosition = -1;
        // scan it's innerHTMl to childNodes
        this.scanner = getScannerForTag(this.nodeName);
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

        isEndTag:function() {
            return /^\//.test(this.nodeName);
        },

        appendChild:function(node) {
            this.childNodes.push(node);
            refreshChildNodes(this);
        },

        insertBefore:function(ref) {
            var silbing = ref.parentNode.childNodes,
                index = S.indexOf(ref, silbing);
            silbing.splice(index, 0, this);
            refreshChildNodes(ref.parentNode);
        },

        removeChild:function(node) {
            var silbing = node.parentNode.childNodes,
                index = S.indexOf(node, silbing);
            silbing.splice(index, 1);
            refreshChildNodes(node.parentNode);
        },

        getAttribute:function(name) {
            var attr = findAttributeByName(this.attributes, name);
            return attr && attr.value;
        },

        setAttribute:function(name, value) {
            var attr = findAttributeByName(this.attributes, name);
            if (attr) {
                attr.value = value;
            } else {
                this.attributes.push(new Attribute(name, '=', value, '"'));
            }
        },

        removeAttribute:function(name) {
            var attr = findAttributeByName(this.attributes, name);
            if (attr) {
                var index = S.indexOf(attr, this.attributes);
                this.attributes.splice(index, 1);
            }
        },

        /**
         * serialize tag to html string in writer
         * @param writer
         * @param filter
         */
        writeHtml:function(writer, filter) {
            var el = this,
                tmp,
                attrName,
                tagName = el.tagName;

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
                    el.writeHtml(writer, filter);
                    return;
                }

                // preserve children but delete itself
                if (!el.tagName) {
                    S.each(el.childNodes, function(child) {
                        child.writeHtml(writer, filter);
                    });
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
                    if (!(attrName = filter.onAttributeName(attrName))) {
                        continue;
                    }
                    // filtered by value and node
                    if (filter.onAttribute(attr) === false) {
                        continue;
                    }
                }
                writer.attribute(attr);
            }

            // close its open tag
            writer.openTagClose(el);

            if (!el.isEmptyXmlTag) {
                // process its children recursively
                S.each(el.childNodes, function(child) {
                    child.writeHtml(writer, filter);
                });
                // process its close tag
                writer.closeTag(el);
            }
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
    requires:['./Node',
        '../scanners/TagScanner',
        '../scanners/QuoteCdataScanner',
        '../scanners/TextareaScanner',
        './Attribute']
});/**
 * dom text node
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/nodes/Text",function(S, Node) {

    function Text() {
        Text.superclass.constructor.apply(this, arguments);
        this.nodeType = 3;
        this.nodeName = "#text";
    }

    S.extend(Text, Node, {
        writeHtml:function(writer, filter) {
            var value = this.toHtml();
            if (filter.onText(this) !== false) {
                writer.text(value);
            }
        }
    });

    return Text;
}, {
    requires:['./Node']
});KISSY.add("htmlparser/scanners/CdataScanner",function() {
    return {
        scan:function(tag, lexer, stack, quoteSmart) {
            // tolerate var x="<a></a>"
            // but still not var x="<a></a>"; </a>
            var content = lexer.parseCDATA(quoteSmart),
                position = lexer.getPosition(),
                node = lexer.nextNode();
            if (node) {
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
            return tag;
        }
    };
});KISSY.add("htmlparser/scanners/QuoteCdataScanner",function(S, CdataScanner) {
    return {
        scan:function(tag, lexer, stack) {
            return CdataScanner.scan(tag, lexer, stack, true);
        }
    };
}, {
    requires:["./CdataScanner"]
});/**
 * nest tag scanner recursively
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/scanners/TagScanner",function(S, dtd) {
    var scanner = {
        scan:function(tag, lexer, stack) {
            var node,i;
            if (tag.isEmptyXmlTag) {
                tag.closed = true;
            } else {
                do{
                    node = lexer.nextNode();
                    if (node) {
                        if (node.nodeType === 1) {
                            // normal end tag
                            if (node.isEndTag() && node.tagName == tag.tagName) {
                                tag.closed = true;
                                node = null;
                            }
                            // encounter  <a>1<p>2</p>3</a> , close <a> => <a>1</a><p>2</p>3</a> => <a>1</a><p>2</p>3
                            // perfection is better and more complicated :
                            // <a>1<p>2</p>3</a> , move <a> inside => <a>1</a><p><a>2</a></p><a>3</a>
                            else if (!node.isEndTag() && !this.canHasNodeAsChild(tag, node)) {
                                // can not be it as child ,will terminate tag lately
                                lexer.setPosition(node.startPosition);
                                node = null;
                            } else if (!node.isEndTag()) {
                                // now fake recursive using stack
                                var nodeScanner = node.scanner;
                                if (nodeScanner) {
                                    if (nodeScanner === scanner) {
                                        if (node.isEmptyXmlTag) {
                                            tag.appendChild(node);
                                        } else {
                                            stack.push(tag);
                                            tag = node;
                                        }
                                    } else {
                                        // change scanner ,such as textarea scanner ... etc
                                        node = nodeScanner.scan(node, lexer, stack);
                                        tag.appendChild(node);
                                    }
                                } else {
                                    tag.appendChild(node);
                                }
                            } else {
                                // encouter a end tag without open tag
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
                                    } else if (!this.canHasNodeAsChild(c, node)) {
                                        // can not include this node as child of a node in stack
                                        index = i;
                                        break;
                                    }
                                }

                                if (index != -1) {
                                    // <div><span> <a> </div>
                                    // tag==a
                                    tag.closed = true;
                                    stack[stack.length - 1].appendChild(tag);
                                    for (i = stack.length - 1; i > index; i--) {
                                        var currentStackItem = stack[i],preStackItem = stack[i - 1];
                                        currentStackItem.closed = true;
                                        preStackItem.appendChild(currentStackItem);
                                    }
                                    tag = stack[index];
                                    stack.length = index;
                                    node = null;
                                }

                            }
                        } else {
                            // no tag , just simply add
                            tag.appendChild(node);
                        }
                    }

                    // fake recursive success , stack retreat
                    if (node == null) {
                        if (stack.length > 0) {
                            node = stack[stack.length - 1];
                            if (node.nodeType == 1) {
                                // fake recursion
                                if (node.scanner === scanner) {
                                    stack.length = stack.length - 1;
                                    tag.closed = true;
                                    node.appendChild(tag);
                                    tag = node;
                                } else {
                                    node = null;
                                }
                            } else {
                                node = null;
                            }
                        }
                    }
                } while (node);

                tag.closed = true;
            }

            return tag;
        },

        /**
         * checked whether tag can include node as its child according to DTD
         */
        canHasNodeAsChild:function(tag, node) {
            if (!dtd[tag.tagName]) {
                S.error("dtd[" + tag.tagName + "] === undefined!")
            }
            return !! dtd[tag.tagName][node.tagName];
        }
    };
    return scanner;
}, {
    requires:["../dtd"]
});KISSY.add("htmlparser/scanners/TextareaScanner", function(S, CdataScanner) {
    return {
        scan:function(tag, lexer, stack) {
            return CdataScanner.scan(tag, lexer, stack, false);
        }
    };
}, {
    requires:["./CdataScanner"]
});KISSY.add("htmlparser/writer/basic", function(S) {
    function BasicWriter() {
        this.output = [];
    }

    BasicWriter.prototype = {

        append:function() {
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

        openTag:function(el) {
            this.append("<", el.tagName);
        },

        openTagClose:function(el) {
            if (el.isEmptyXmlTag) {
                this.append(" ", "/");
            }
            this.append(">");
        },

        closeTag:function(el) {
            this.append("<\/", el.tagName, ">");
        },

        attribute:function(attr) {
            this.append(" ",
                attr.name,
                "=\"",
                S.escapeHTML(attr.value || attr.name),
                "\"");
        },

        text:function(text) {
            this.append(text);
        },

        cdata:function(cdata) {
            this.append(cdata);
        },

        comment:function(comment) {
            this.append(comment);
        },

        getHtml:function() {
            return this.output.join("");
        }

    };

    return BasicWriter;

});/**
 * format html prettily
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/writer/beautify",function(S, BasicWriter, dtd) {

    function BeautifyWriter() {
        BeautifyWriter.superclass.constructor.apply(this, arguments);
        // tag in pre should not indent
        // space (\t\r\n ) in pre should not collapse
        this.inPre = 0;
        this.indentChar = "\t";
        this.indentLevel = 0;
        // whether to indent on current line
        // if already indent and then not line break ,next tag should not indent
        this.allowIndent = 0;
        this.rules = {};

        for (var e in S.merge(
            dtd.$nonBodyContent,
            dtd.$block,
            dtd.$listItem,
            dtd.$tableContent
        )) {
            this.setRules(e, {
                // whether its tag/text children should indent
                allowIndent : 1,
                breakBeforeOpen : 1,
                breakAfterOpen : 1,
                breakBeforeClose : 1,// !dtd[e]['#']
                breakAfterClose : 1
            });
        }

        this.setRules('br', {
            breakAfterOpen : 1
        });

        this.setRules('title', {
            allowIndent : 0,
            breakBeforeClose:0,
            breakAfterOpen : 0
        });

        this.setRules('style', {
            allowIndent : 0,
            breakBeforeOpen : 1,
            breakAfterOpen : 1,
            breakBeforeClose : 1,
            breakAfterClose : 1
        });

        this.setRules('script', {
            allowIndent : 0,
            breakBeforeOpen : 1,
            breakAfterOpen : 1,
            breakBeforeClose : 1,
            breakAfterClose : 1
        });

        // Disable indentation on <pre>.
        this.setRules('pre', {
            allowIndent : 0
        });
    }

    S.extend(BeautifyWriter, BasicWriter, {
        indentation:function() {
            if (!this.inPre) {
                this.append(new Array(this.indentLevel + 1).join(this.indentChar));
            }
            // already indent ,unless line break  it will not indent again
            this.allowIndent = 0;
        },

        lineBreak:function() {
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

        setRules:function(tagName, rule) {
            if (!this.rules[tagName]) {
                this.rules[tagName] = {};
            }
            S.mix(this.rules[tagName], rule);
        },

        openTag:function(el) {

            var tagName = el.tagName;
            var rules = this.rules[tagName] || {};
            if (this.allowIndent) {
                this.indentation();
            } else if (rules.breakBeforeOpen) {
                this.lineBreak();
                this.indentation();
            }
            BeautifyWriter.superclass.openTag.apply(this, arguments);
        },

        openTagClose:function(el) {

            var tagName = el.tagName;
            var rules = this.rules[tagName] || {};
            if (el.isEmptyXmlTag) {
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

        closeTag:function(el) {

            var tagName = el.tagName;
            var rules = this.rules[tagName] || {};

            if (rules.allowIndent) {
                this.indentLevel--;
            }

            if (this.allowIndent) {
                this.indentation();
            } else if (rules.breakBeforeClose) {
                this.lineBreak();
                this.indentation();
            }

            BeautifyWriter.superclass.closeTag.apply(this, arguments);

            if (tagName === "pre") {
                this.inPre = 0;
            }

            if (rules.breakAfterClose) {
                this.lineBreak();
            }

        },

        text:function(text) {

            if (this.allowIndent) {
                this.indentation();
            }
            if (!this.inPre) {
                // shrink consequential spaces into one space
                text = text.replace(/[\t\r\n ]{2,}|[\t\r\n]/g, ' ');
            }
            this.append(text);
        },

        comment:function(comment) {
            if (this.allowIndent) {
                this.indentation();
            }
            this.append(comment);
        }


    });

    return BeautifyWriter;

}, {
    requires:['./basic','../dtd']
});/**
 * filter dom tree to html string form ,api designed by ckeditor
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/writer/filter", function(S) {
    function Filter() {
        // {priority: ?, value:?}
        this.tagNames = [];
        this.attributeNames = [];
        this.tags = [];
        this.comments = [];
        this.texts = [];
        this.cdatas = [];
        this.attributes = [];
    }

    function findIndexToInsert(arr, p) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].priority > p) {
                return i;
            }
        }
        return arr.length;
    }

    function filterName(arr, v) {
        for (var i = 0; i < arr.length; i++) {
            var items = arr[i].value;
            S.each(items, function(item) {
                v = v.replace(item[0], item[1]);
            });
        }
        return v;
    }

    function filterFn(arr, args, _default) {
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i].value;
            if (item.apply(null, args) === false) {
                return false;
            }
        }
        return _default;
    }

    Filter.prototype = {

        /**
         *
         * @param rules
         * {
         *   tagNames:[ [/^ke/,''] ],
         *   attributeNames:[[^on],''],
         *   tags:{p:function(element){}}
         *   comments:function(){},
         *   attributes:function(){},
         *   texts:function(){}
         * }
         * @param priority 值越小，优先级越高 ,最低 1
         */
        addRules:function(rules, priority) {
            priority = priority || 10;
            for (var r in rules) {
                var holder = this[r],
                    index = findIndexToInsert(holder, priority);
                holder.splice(index, 0, {
                    value:rules[r],
                    priority:priority
                });
            }
        },

        /**
         * when encounter element name transformer ,directly transform
         * @param v
         */
        onTagName:function(v) {
            return filterName(this.tagNames, v);
        },

        onAttributeName:function(v) {
            return filterName(this.attributeNames, v);
        },

        onText:function(el) {
            return filterFn(this.texts, [el.toHtml(),el], el);
        },

        onCData:function(el) {
            return filterFn(this.cdatas, [el.toHtml(),el], el);
        },

        onAttribute:function(el, attrNode) {
            return filterFn(this.attributes, [attrNode,el], attrNode);
        },

        onComment:function(el) {
            return filterFn(this.comments, [el.toHtml(),el], el);
        },

        onNode:function(el) {
            var t = el.nodeType;
            if (t === 1) {
                return this.onTag(el);
            } else if (t === 3) {
                return this.onText(el.toHtml(), el);
            } else if (t === 8) {
                return this.onComment(el.toHtml(), el);
            }
        },

        onTag:function(el) {
            // ^ tagName $
            var filters = ["^",el.tagName,"$"],
                tags = this.tags,
                ret;
            for (var i = 0; i < filters.length; i++) {
                var filter = filters[i];
                for (var j = 0; j < tags.length; j++) {
                    var element = tags[j].value;
                    if (element[filter]) {
                        if ((ret = element[filter](el)) === false) {
                            return false;
                        }
                        if (ret && ret != element) {
                            return this.onNode(ret);
                        }
                        if (!el.name) {
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
 * HtmlParser for KISSY (Editor)
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser", function(S, Lexer, Parser, BasicWriter, BeautifyWriter, Filter) {
    return {
        Lexer:Lexer,
        Parser:Parser,
        BasicWriter:BasicWriter,
        BeautifyWriter:BeautifyWriter,
        Filter:Filter
    };
}, {
    requires:[
        'htmlparser/lexer/Lexer',
        'htmlparser/Parser',
        'htmlparser/writer/basic',
        'htmlparser/writer/beautify',
        'htmlparser/writer/filter'
    ]
});

/**
 * 参考 http://htmlparser.sourceforge.net/
 **/
