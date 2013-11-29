/**
 * @ignore
 * parse html string into Nodes
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Cursor = require('./cursor');
    var Page = require('./page');
    var TextNode = require('../nodes/text');
    var CData = require('../nodes/cdata');
    var Utils = require('../utils');
    var Attribute = require('../nodes/attribute');
    var TagNode = require('../nodes/tag');
    var CommentNode = require('../nodes/comment');

    /**
     * Lexer for html parser
     * @param {String} text html content
     * @param {Object} cfg config object
     * @class KISSY.HtmlParser.Lexer
     */
    function Lexer(text, cfg) {
        var self = this;
        self.page = new Page(text);
        self.cursor = new Cursor();
        self.nodeFactory = this;
        this.cfg = cfg || {};
    }

    Lexer.prototype = {
        constructor: Lexer,

        setPosition: function (p) {
            this.cursor.position = p;
        },

        getPosition: function () {
            return this.cursor.position;
        },

        /**
         * get next node parsed from content
         * @param quoteSmart
         * @returns {KISSY.HtmlParse.Node}
         */
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
                    if (ch === -1) {
                        ret = this.makeString(start, cursor.position);
                    } else if (ch === '/' || Utils.isLetter(ch)) {
                        page.ungetChar(cursor);
                        ret = this.parseTag(start);
                    } else if ('!' === ch || '?' === ch) {
                        ch = page.getChar(cursor);
                        if (ch === -1) {
                            ret = this.makeString(start, cursor.position);
                        } else {
                            if ('>' === ch) {
                                ret = this.makeComment(start, cursor.position);
                            } else {
                                page.ungetChar(cursor); // remark/tag need this char
                                if ('-' === ch) {
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
            if (0 !== length) {   // return tag based on second character, '/', '%', Letter (ch), '!'
                if (2 > length) {
                    // this is an error
                    return (this.makeString(start, end));
                }
                ret = this.nodeFactory.createCommentNode(this.page, start, end);
            }
            else {
                ret = null;
            }

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

        // different from text node : space does matter
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
            if (0 !== length) {   // return tag based on second character, '/', '%', Letter (ch), '!'
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

        /*
         parse tag node according to fsm
         state 0 - outside of any attribute
         state 1 - within attribute name
         state 2 - equals hit
         state 3 - within naked attribute value.
         state 4 - within single quoted attribute value
         state 5 - within double quoted attribute value
         state 6 - whitespaces after attribute name could lead to state 2 (=)or state 0
         */
        parseTag: function (start) {
            var done,
                bookmarks = [],
                attributes = [],
                ch,
                cfg = this.cfg,
                strict = cfg.strict,
                checkError = S.noop,
                page = this.page,
                state = 0,
                cursor = this.cursor;
            if (strict) {
                checkError = function () {
                    if (strict && ch === -1 && attributes.length) {
                        throw new Error(attributes[0].name + ' syntax error at row ' +
                            (page.row(cursor) + 1) + ' , col ' + (page.col(cursor) + 1));
                    }
                };
            }
            /*
             record state position

             states 0 -> bookmarks[1]
             states 1 -> bookmarks[2]
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
                        if (ch === -1 || '>' === ch || '<' === ch) {
                            if ('<' === ch) {
                                // don't consume the opening angle
                                page.ungetChar(cursor);
                                bookmarks[state + 1] = cursor.position;
                            }
                            done = true;
                        } else {
                            // tag name as a attribute
                            if (!attributes.length) {
                                // </div>
                                if (ch === '/' || Utils.isValidAttributeNameStartChar(ch)) {
                                    state = 1;
                                }
                            }
                            // <img />
                            else if (ch === '/' || Utils.isValidAttributeNameStartChar(ch)) {
                                state = 1;
                            }
                        }
                        break;

                    case 1:
                        // within attribute name
                        if ((-1 === ch) || ('>' === ch) || ('<' === ch)) {
                            if ('<' === ch) {
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
                        else if ('=' === ch) {
                            state = 2;
                        }
                        break;

                    case 2: // equals hit
                        if ((-1 === ch) || ('>' === ch)) {
                            this.standalone(attributes, bookmarks);
                            done = true;
                        } else if ('\'' === ch) {
                            state = 4;
                            bookmarks[4] = bookmarks[3];
                        } else if ('"' === ch) {
                            state = 5;
                            bookmarks[5] = bookmarks[3];
                        } else if (!Utils.isWhitespace(ch)) {
                            // collect white spaces after '=' into the assignment string;
                            // do nothing
                            state = 3;
                        }
                        break;
                    case 3: // within naked attribute value
                        if ((-1 === ch) || ('>' === ch)) {
                            this.naked(attributes, bookmarks);
                            done = true;
                        } else if (Utils.isWhitespace(ch)) {
                            this.naked(attributes, bookmarks);
                            bookmarks[0] = bookmarks[4];
                            state = 0;
                        }
                        break;
                    case 4: // within single quoted attribute value
                        if (-1 === ch) {
                            this.singleQuote(attributes, bookmarks);
                            done = true; // complain?
                        }
                        else if ('\'' === ch) {
                            this.singleQuote(attributes, bookmarks);
                            bookmarks[0] = bookmarks[5] + 1;
                            state = 0;
                        }
                        break;
                    case 5: // within double quoted attribute value
                        if (-1 === ch) {
                            this.doubleQuote(attributes, bookmarks);
                            done = true; // complain?
                        }
                        else if ('"' === ch) {
                            this.doubleQuote(attributes, bookmarks);
                            bookmarks[0] = bookmarks[6] + 1;
                            state = 0;
                        }
                        break;
                    // patch for lexer state correction by
                    // Gernot Fricke
                    // See Bug # 891058 Bug in lexer.
                    case 6: // undecided for state 0 or 2
                        // we have read white spaces after an attribute name
                        if (-1 === ch) {
                            // same as last else clause
                            this.standalone(attributes, bookmarks);
                            bookmarks[0] = bookmarks[6];
                            page.ungetChar(cursor);
                            state = 0;
                        } else if ('=' === ch) {// yepp. the white spaces belonged to the equal.

                            bookmarks[2] = bookmarks[6];
                            bookmarks[3] = bookmarks[7];
                            state = 2;
                        } else if (!Utils.isWhitespace(ch)) {
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
                        throw new Error('how ** did we get in state ' + state);
                }

                checkError();
            }

            return this.makeTag(start, cursor.position, attributes);
        },

        /*
         Parse a comment.
         state 0 - prior to the first open delimiter (first dash)
         state 1 - prior to the second open delimiter (second dash)
         state 2 - prior to the first closing delimiter (first dash)
         state 3 - prior to the second closing delimiter (second dash)
         state 4 - prior to the terminating
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
                if (-1 === ch) {
                    done = true;
                }
                else {
                    switch (state) {
                        case 0: // prior to the first open delimiter
                            if ('>' === ch) {
                                done = true;
                            }else if ('-' === ch) {
                                state = 1;
                            } else {
                                return this.parseString(start, quoteSmart);
                            }
                            break;
                        case 1: // prior to the second open delimiter
                            if ('-' === ch) {
                                // handle <!--> because netscape does
                                ch = page.getChar(cursor);
                                if (-1 === ch) {
                                    done = true;
                                }
                                else if ('>' === ch) {
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
                            if ('-' === ch) {
                                state = 3;
                            }
                            else if (-1 === ch) {
                                return this.parseString(start, quoteSmart); // no terminator
                            }
                            break;
                        case 3: // prior to the second closing delimiter
                            if ('-' === ch) {
                                state = 4;
                            }
                            else {
                                state = 2;
                            }
                            break;
                        case 4: // prior to the terminating >
                            if ('>' === ch) {
                                done = true;
                            } else if(!Utils.isWhitespace(ch)){
                                // HtmlParser should not terminate a comment with --->
                                // should maybe issue a warning mentioning STRICT_REMARKS
                                state = 2;
                            }
                            break;
                        default:
                            throw new Error('how ** did we get in state ' + state);
                    }
                }
            }

            return this.makeComment(start, cursor.position);
        },

        /**
         * parse a string node
         * @private
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
                if (-1 === ch) {
                    done = 1;
                }
                else if (quoteSmart && (0 === quote) && (('"' === ch) || ('\'' === ch))) {
                    quote = ch; // enter quoted state
                }
                // patch from Gernot Fricke to handle escaped closing quote
                else if (quoteSmart && (0 !== quote) && ('\\' === ch)) {
                    ch = page.getChar(cursor); // try to consume escape
                    if ((-1 !== ch)&& ('\\' !== ch) &&// escaped backslash
                        (ch !== quote)) // escaped quote character
                    {
                        // ( reflects ['] or [']  whichever opened the quotation)
                        page.ungetChar(cursor); // unconsume char if char not an escape
                    }
                }
                else if (quoteSmart && (ch === quote)) {
                    quote = 0; // exit quoted state
                }
                else if (quoteSmart && (0 === quote) && (ch === '/')) {
                    // handle multiline and double slash comments (with a quote)
                    // in script like:
                    // I can't handle single quotations.
                    ch = page.getChar(cursor);
                    if (-1 === ch) {
                        done = 1;
                    }
                    else if ('/' === ch) {
                        do {
                            ch = page.getChar(cursor);
                        } while ((-1 !== ch) && ('\n' !== ch));
                    }
                    else if ('*' === ch) {
                        do
                        {
                            do {
                                ch = page.getChar(cursor);
                            } while ((-1 !== ch) && ('*' !== ch));
                            ch = page.getChar(cursor);
                            if (ch === '*') {
                                page.ungetChar(cursor);
                            }
                        }
                        while ((-1 !== ch) && ('/' !== ch));
                    }
                    else {
                        page.ungetChar(cursor);
                    }
                }
                else if ((0 === quote) && ('<' === ch)) {
                    ch = page.getChar(cursor);
                    if (-1 === ch) {
                        done = 1;
                    }
                    // the order of these tests might be optimized for speed:
                    else if ('/' === ch ||
                        Utils.isLetter(ch) ||
                        '!' === ch ||
                        // <?xml:namespace
                        '?' === ch) {
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
         * @private
         * @param quoteSmart if set true end tag in quote
         * (but not in comment mode) does not end current tag ( <script>x='<a>taobao</a>'</script> )
         * @param tagName
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
                                    if ('' === quote) {
                                        quote = '\''; // enter quoted state
                                    } else if ('\'' === quote) {
                                        quote = ''; // exit quoted state
                                    }
                                }
                                break;
                            case '"':
                                if (quoteSmart && !comment) {
                                    if ('' === quote) {
                                        quote = '"'; // enter quoted state
                                    } else if ('"' === quote) {
                                        quote = ''; // exit quoted state
                                    }
                                }
                                break;
                            case '\\':
                                if (quoteSmart) {
                                    if ('' !== quote) {
                                        ch = mPage.getChar(mCursor); // try to consume escaped character
                                        if (-1 === ch) {
                                            done = true;
                                        } else if ((ch !== '\\') && (ch !== quote)) {
                                            // unconsume char if character was not an escapable char.
                                            mPage.ungetChar(mCursor);
                                        }
                                    }
                                }
                                break;
                            case '/':
                                if (quoteSmart) {
                                    if ('' === quote) {
                                        // handle multiline and double slash comments (with a quote)
                                        ch = mPage.getChar(mCursor);
                                        if (-1 === ch) {
                                            done = true;
                                        } else if ('/' === ch) {
                                            comment = true;
                                        } else if ('*' === ch) {
                                            do {
                                                do
                                                {
                                                    ch = mPage.getChar(mCursor);
                                                }
                                                while ((-1 !== ch) && ('*' !== ch));
                                                ch = mPage.getChar(mCursor);
                                                if (ch === '*') {
                                                    mPage.ungetChar(mCursor);
                                                }
                                            } while ((-1 !== ch) && ('/' !== ch));
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
                                    if ('' === quote) {
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
                                // tagName = 'textarea'
                                // <textarea><div></div></textarea>
                                /*
                                 8.1.2.6 Restrictions on the contents of raw text and RCDATA elements

                                 The text in raw text and RCDATA elements must not contain any occurrences
                                 of the string '</' (U+003C LESS-THAN SIGN, U+002F SOLIDUS)
                                 followed by characters that case-insensitively match the tag name of the element
                                 followed by one of U+0009 CHARACTER TABULATION (tab),
                                 U+000A LINE FEED (LF), U+000C FORM FEED (FF), U+000D CARRIAGE RETURN (CR),
                                 U+0020 SPACE, U+003E GREATER-THAN SIGN (>), or U+002F SOLIDUS (/).
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
                                if (-1 === ch) {
                                    done = true;
                                } else if ('-' === ch) {
                                    ch = mPage.getChar(mCursor);
                                    if (-1 === ch) {
                                        done = true;
                                    } else if ('-' === ch) {
                                        state = 3;
                                    } else {
                                        state = 0;
                                    }
                                }
                                else{
                                    state = 0;
                                }
                                break;
                            default:
                                state = 0;
                                break;
                        }
                        break;
                    case 2: // </
                        comment = false;
                        if (-1 === ch) {
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
                        if (-1 === ch) {
                            done = true;
                        } else if ('-' === ch) {
                            ch = mPage.getChar(mCursor);
                            if (-1 === ch) {
                                done = true;
                            } else if ('-' === ch) {
                                ch = mPage.getChar(mCursor);
                                if (-1 === ch) {
                                    done = true;
                                } else if ('>' === ch) {
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
                        }
                        // eat comment
                        break;
                    default:
                        throw new Error('unexpected ' + state);
                }
            }
            end = mCursor.position;

            return this.makeCData(start, end);
        },

        /**
         * Generate an single quoted attribute
         * @param attributes The list so far.
         * @param bookmarks The array of positions.
         * @private
         */
        singleQuote: function (attributes, bookmarks) {
            var page = this.page;
            attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), '=', page.getText(bookmarks[4] + 1, bookmarks[5]), '\''));
        },

        /**
         * Generate an double quoted attribute
         * @param attributes The list so far.
         * @param bookmarks The array of positions.
         * @private
         */
        doubleQuote: function (attributes, bookmarks) {
            var page = this.page;
            attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), '=', page.getText(bookmarks[5] + 1, bookmarks[6]), '"'));
        },


        /**
         * Generate a standalone attribute
         * @private
         * @param attributes The list so far.
         * @param bookmarks The array of positions.
         */
        standalone: function (attributes, bookmarks) {
            var page = this.page;
            attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2])));
        },

        /**
         * Generate an unquoted attribute
         * @private
         * @param attributes The list so far.
         * @param bookmarks The array of positions.
         */
        naked: function (attributes, bookmarks) {
            var page = this.page;
            attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), '=', page.getText(bookmarks[3], bookmarks[4])));
        }
    };

    return Lexer;
});