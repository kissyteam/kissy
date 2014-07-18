/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:03
*/
/*
combined modules:
html-parser
html-parser/dtd
html-parser/lexer/lexer
html-parser/lexer/cursor
html-parser/lexer/page
html-parser/lexer/index
html-parser/nodes/text
html-parser/nodes/node
html-parser/nodes/cdata
html-parser/utils
html-parser/nodes/attribute
html-parser/nodes/tag
html-parser/nodes/comment
html-parser/parser
html-parser/nodes/fragment
html-parser/nodes/document
html-parser/scanner
html-parser/scanners/tag-scanner
html-parser/scanners/special-scanners
html-parser/scanners/quote-cdata-scanner
html-parser/scanners/cdata-scanner
html-parser/scanners/textarea-scanner
html-parser/writer/basic
html-parser/writer/beautify
html-parser/writer/minify
html-parser/writer/filter
*/
KISSY.add('html-parser', [
    'html-parser/dtd',
    'html-parser/lexer/lexer',
    'html-parser/parser',
    'html-parser/writer/basic',
    'html-parser/writer/beautify',
    'html-parser/writer/minify',
    'html-parser/writer/filter',
    'html-parser/nodes/cdata',
    'html-parser/nodes/comment',
    'html-parser/nodes/tag',
    'html-parser/nodes/text',
    'html-parser/nodes/node'
], function (S, require, exports, module) {
    /**
 * HtmlParser for KISSY (Editor)
 * @ignore
 * @author yiminghe@gmail.com
 */
    var DTD = require('html-parser/dtd');
    var Lexer = require('html-parser/lexer/lexer');
    var Parser = require('html-parser/parser');
    var BasicWriter = require('html-parser/writer/basic');
    var BeautifyWriter = require('html-parser/writer/beautify');
    var MinifyWriter = require('html-parser/writer/minify');
    var Filter = require('html-parser/writer/filter');
    var CData = require('html-parser/nodes/cdata');
    var Comment = require('html-parser/nodes/comment');
    var Tag = require('html-parser/nodes/tag');
    var Text = require('html-parser/nodes/text');
    module.exports = {
        CData: CData,
        Comment: Comment,
        Node: require('html-parser/nodes/node'),
        Tag: Tag,
        Text: Text,
        Lexer: Lexer,
        Parser: Parser,
        BasicWriter: BasicWriter,
        BeautifyWriter: BeautifyWriter,
        MinifyWriter: MinifyWriter,
        Filter: Filter,
        DTD: DTD,
        serialize: function (n, filter) {
            var basicWriter = new BasicWriter();
            n.writeHtml(basicWriter, filter);
            return basicWriter.getHtml();
        },
        parse: function (html) {
            return new Parser(html).parse();
        }
    };    /**
 * @ignore
 * refer
 *  - http://html-parser.sourceforge.net/
 *  - http://www.w3.org/TR/html5/syntax.html
 *  - http://www.w3.org/TR/html5/parsing.html
 *
 * TODO
 *  - http://blogs.msdn.com/b/ie/archive/2010/09/13/interoperable-html-parsing-in-ie9.aspx
 **/
});
KISSY.add('html-parser/dtd', ['util'], function (S, require, exports, module) {
    /**
 * @ignore
 * modified from ckeditor dtd by yiminghe, support html5 tag and dtd
 * @author yimingh@gmail.com
 */
    /*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
    var util = require('util');
    var merge = util.merge, A = {
            isindex: 1,
            fieldset: 1
        }, B = {
            input: 1,
            button: 1,
            select: 1,
            textarea: 1,
            label: 1
        }, C = merge({ a: 1 }, B), D = merge({ iframe: 1 }, C), E = {
            hr: 1,
            ul: 1,
            menu: 1,
            div: 1,
            blockquote: 1,
            noscript: 1,
            table: 1,
            center: 1,
            address: 1,
            dir: 1,
            pre: 1,
            h5: 1,
            dl: 1,
            h4: 1,
            noframes: 1,
            h6: 1,
            ol: 1,
            h1: 1,
            h3: 1,
            h2: 1
        }, F = {
            ins: 1,
            del: 1,
            script: 1,
            style: 1
        }, G = merge({
            b: 1,
            acronym: 1,
            bdo: 1,
            'var': 1,
            '#text': 1,
            abbr: 1,
            code: 1,
            br: 1,
            i: 1,
            cite: 1,
            kbd: 1,
            u: 1,
            strike: 1,
            s: 1,
            tt: 1,
            strong: 1,
            q: 1,
            samp: 1,
            em: 1,
            dfn: 1,
            span: 1
        }, F), H = merge({
            sub: 1,
            img: 1,
            object: 1,
            sup: 1,
            basefont: 1,
            map: 1,
            applet: 1,
            font: 1,
            big: 1,
            small: 1
        }, G), I = merge({ p: 1 }, H), J = merge({ iframe: 1 }, H, B), K = {
            img: 1,
            noscript: 1,
            br: 1,
            kbd: 1,
            center: 1,
            button: 1,
            basefont: 1,
            h5: 1,
            h4: 1,
            samp: 1,
            h6: 1,
            ol: 1,
            h1: 1,
            h3: 1,
            h2: 1,
            form: 1,
            font: 1,
            '#text': 1,
            select: 1,
            menu: 1,
            ins: 1,
            abbr: 1,
            label: 1,
            code: 1,
            table: 1,
            script: 1,
            cite: 1,
            input: 1,
            iframe: 1,
            strong: 1,
            textarea: 1,
            noframes: 1,
            big: 1,
            small: 1,
            span: 1,
            hr: 1,
            sub: 1,
            bdo: 1,
            'var': 1,
            div: 1,
            object: 1,
            sup: 1,
            strike: 1,
            dir: 1,
            map: 1,
            dl: 1,
            applet: 1,
            del: 1,
            isindex: 1,
            fieldset: 1,
            ul: 1,
            b: 1,
            acronym: 1,
            a: 1,
            blockquote: 1,
            i: 1,
            u: 1,
            s: 1,
            tt: 1,
            address: 1,
            q: 1,
            pre: 1,
            p: 1,
            em: 1,
            dfn: 1
        }, L = merge({ a: 1 }, J), M = { tr: 1 }, N = { '#text': 1 }, O = merge({ param: 1 }, K), P = merge({ form: 1 }, A, D, E, I), Q = { li: 1 }, R = {
            style: 1,
            script: 1
        }, headTags = {
            base: 1,
            link: 1,
            meta: 1,
            title: 1
        }, T = merge(headTags, R), U = {
            head: 1,
            body: 1
        }, V = { html: 1 };
    var block = {
            address: 1,
            blockquote: 1,
            center: 1,
            dir: 1,
            div: 1,
            dl: 1,
            fieldset: 1,
            form: 1,
            h1: 1,
            h2: 1,
            h3: 1,
            h4: 1,
            h5: 1,
            h6: 1,
            hr: 1,
            isindex: 1,
            menu: 1,
            noframes: 1,
            ol: 1,
            p: 1,
            pre: 1,
            table: 1,
            ul: 1
        };    /**
 * Holds and object representation of the HTML DTD to be used by the editor in
 * its internal operations.
 *
 * Each element in the DTD is represented by a
 * property in this object. Each property contains the list of elements that
 * can be contained by the element. Text is represented by the #text property.
 *
 * Several special grouping properties are also available. Their names start
 * with the $ character.
 *
 * @class KISSY.HtmlParser.Dtd
 * @singleton
 *
 *
 *      // Check if div can be contained in a p element.
 *      alert( !!dtd[ p ][ div ] );  false
 *      // Check if p can be contained in a div element.
 *      alert( !!dtd[ div ][ p ] );  true
 *      // Check if p is a block element.
 *      alert( !!dtd.$block[ p ] );  true
 */
    /**
 * Holds and object representation of the HTML DTD to be used by the editor in
 * its internal operations.
 *
 * Each element in the DTD is represented by a
 * property in this object. Each property contains the list of elements that
 * can be contained by the element. Text is represented by the #text property.
 *
 * Several special grouping properties are also available. Their names start
 * with the $ character.
 *
 * @class KISSY.HtmlParser.Dtd
 * @singleton
 *
 *
 *      // Check if div can be contained in a p element.
 *      alert( !!dtd[ p ][ div ] );  false
 *      // Check if p can be contained in a div element.
 *      alert( !!dtd[ div ][ p ] );  true
 *      // Check if p is a block element.
 *      alert( !!dtd.$block[ p ] );  true
 */
    var dtd = module.exports = {
            /**
     * The $ items have been added manually.
     * List of elements living outside body.
     */
            $nonBodyContent: merge(V, U, headTags),
            /**
     * List of block elements, like p or div.
     * @type {Object}
     */
            $block: block,
            /**
     * List of block limit elements.
     * @type {Object}
     */
            $blockLimit: {
                body: 1,
                div: 1,
                td: 1,
                th: 1,
                caption: 1,
                form: 1
            },
            /**
     * List of inline elements
     * @type {Object}
     */
            $inline: L,
            // Just like span.
            /**
     * elements which can be include in body
     * @type {Object}
     */
            $body: merge({
                script: 1,
                style: 1
            }, block),
            /**
     * cdata elements
     * @type {Object}
     */
            $cdata: {
                script: 1,
                style: 1
            },
            /**
     * List of empty (self-closing) elements, like br or img.
     * @type {Object}
     */
            $empty: {
                area: 1,
                base: 1,
                br: 1,
                col: 1,
                hr: 1,
                img: 1,
                input: 1,
                link: 1,
                meta: 1,
                param: 1
            },
            /**
     * List of list item elements, like li or dd.
     * @type {Object}
     */
            $listItem: {
                dd: 1,
                dt: 1,
                li: 1
            },
            /**
     * List of list root elements.
     * @type {Object}
     */
            $list: {
                ul: 1,
                ol: 1,
                dl: 1
            },
            /**
     * Elements that accept text nodes, but are not possible to edit into
     * the browser.
     * @type {Object}
     */
            $nonEditable: {
                applet: 1,
                button: 1,
                embed: 1,
                iframe: 1,
                map: 1,
                object: 1,
                option: 1,
                script: 1,
                textarea: 1,
                param: 1
            },
            /**
     * List of elements that can be ignored if empty, like b or span.
     * @type {Object}
     */
            $removeEmpty: {
                abbr: 1,
                acronym: 1,
                address: 1,
                b: 1,
                bdo: 1,
                big: 1,
                cite: 1,
                code: 1,
                del: 1,
                dfn: 1,
                em: 1,
                font: 1,
                i: 1,
                ins: 1,
                label: 1,
                kbd: 1,
                q: 1,
                s: 1,
                samp: 1,
                small: 1,
                span: 1,
                strike: 1,
                strong: 1,
                sub: 1,
                sup: 1,
                tt: 1,
                u: 1,
                'var': 1
            },
            /**
     * List of elements that have tabindex set to zero by default.
     * @type {Object}
     */
            $tabIndex: {
                a: 1,
                area: 1,
                button: 1,
                input: 1,
                object: 1,
                select: 1,
                textarea: 1
            },
            /**
     * List of elements used inside the table element, like tbody or td.
     * @type {Object}
     */
            $tableContent: {
                caption: 1,
                col: 1,
                colgroup: 1,
                tbody: 1,
                td: 1,
                tfoot: 1,
                th: 1,
                thead: 1,
                tr: 1
            },
            /**
     * List of elements used inside the html element
     * @type {Object}
     */
            html: U,
            /**
     * List of elements used inside the head element
     * @type {Object}
     */
            head: T,
            /**
     * List of elements used inside the style element
     * @type {Object}
     */
            style: N,
            /**
     * List of elements used inside the body element
     * @type {Object}
     */
            body: P,
            /**
     * List of elements used inside the base element
     * @type {Object}
     */
            base: {},
            /**
     * List of elements used inside the link element
     * @type {Object}
     */
            link: {},
            /**
     * List of elements used inside the meta element
     * @type {Object}
     */
            meta: {},
            /**
     * List of elements used inside the title element
     * @type {Object}
     */
            title: N,
            /**
     * List of elements used inside the col element
     * @type {Object}
     */
            col: {},
            /**
     * List of elements used inside the tr element
     * @type {Object}
     */
            tr: {
                td: 1,
                th: 1
            },
            /**
     * List of elements used inside the img element
     * @type {Object}
     */
            img: {},
            /**
     * List of elements used inside the colgroup element
     * @type {Object}
     */
            colgroup: { col: 1 },
            /**
     * List of elements used inside the noscript element
     * @type {Object}
     */
            noscript: P,
            /**
     * List of elements used inside the td element
     * @type {Object}
     */
            td: P,
            /**
     * List of elements used inside the br element
     * @type {Object}
     */
            br: {},
            /**
     * List of elements used inside the th element
     * @type {Object}
     */
            th: P,
            /**
     * List of elements used inside the center element
     * @type {Object}
     */
            center: P,
            /**
     * List of elements used inside the kbd element
     * @type {Object}
     */
            kbd: L,
            /**
     * List of elements used inside the button element
     * @type {Object}
     */
            button: merge(I, E),
            /**
     * List of elements used inside the basefont element
     * @type {Object}
     */
            basefont: {},
            /**
     * List of elements used inside the h5 element
     * @type {Object}
     */
            h5: L,
            /**
     * List of elements used inside the h4 element
     * @type {Object}
     */
            h4: L,
            /**
     * List of elements used inside the samp element
     * @type {Object}
     */
            samp: L,
            /**
     * List of elements used inside the h6 element
     * @type {Object}
     */
            h6: L,
            /**
     * List of elements used inside the ol element
     * @type {Object}
     */
            ol: Q,
            /**
     * List of elements used inside the h1 element
     * @type {Object}
     */
            h1: L,
            /**
     * List of elements used inside the h3 element
     * @type {Object}
     */
            h3: L,
            /**
     * List of elements used inside the option element
     * @type {Object}
     */
            option: N,
            /**
     * List of elements used inside the h2 element
     * @type {Object}
     */
            h2: L,
            /**
     * List of elements used inside the form element
     * @type {Object}
     */
            form: merge(A, D, E, I),
            /**
     * List of elements used inside the select element
     * @type {Object}
     */
            select: {
                optgroup: 1,
                option: 1
            },
            /**
     * List of elements used inside the font element
     * @type {Object}
     */
            font: L,
            /**
     * List of elements used inside the ins element
     * @type {Object}
     */
            ins: L,
            /**
     * List of elements used inside the menu element
     * @type {Object}
     */
            menu: Q,
            /**
     * List of elements used inside the abbr element
     * @type {Object}
     */
            abbr: L,
            /**
     * List of elements used inside the label element
     * @type {Object}
     */
            label: L,
            /**
     * List of elements used inside the table element
     * @type {Object}
     */
            table: {
                thead: 1,
                col: 1,
                tbody: 1,
                tr: 1,
                colgroup: 1,
                caption: 1,
                tfoot: 1
            },
            /**
     * List of elements used inside the code element
     * @type {Object}
     */
            code: L,
            /**
     * List of elements used inside the script element
     * @type {Object}
     */
            script: N,
            /**
     * List of elements used inside the tfoot element
     * @type {Object}
     */
            tfoot: M,
            /**
     * List of elements used inside the cite element
     * @type {Object}
     */
            cite: L,
            /**
     * List of elements used inside the li element
     * @type {Object}
     */
            li: P,
            /**
     * List of elements used inside the input element
     * @type {Object}
     */
            input: {},
            /**
     * List of elements used inside the iframe element
     * @type {Object}
     */
            iframe: P,
            /**
     * List of elements used inside the strong element
     * @type {Object}
     */
            strong: L,
            /**
     * List of elements used inside the textarea element
     * @type {Object}
     */
            textarea: N,
            /**
     * List of elements used inside the noframes element
     * @type {Object}
     */
            noframes: P,
            /**
     * List of elements used inside the big element
     * @type {Object}
     */
            big: L,
            /**
     * List of elements used inside the small element
     * @type {Object}
     */
            small: L,
            /**
     * List of elements used inside the span element
     * @type {Object}
     */
            span: L,
            /**
     * List of elements used inside the hr element
     * @type {Object}
     */
            hr: {},
            /**
     * List of elements used inside the dt element
     * @type {Object}
     */
            dt: L,
            /**
     * List of elements used inside the sub element
     * @type {Object}
     */
            sub: L,
            /**
     * List of elements used inside the optgroup element
     * @type {Object}
     */
            optgroup: { option: 1 },
            /**
     * List of elements used inside the param element
     * @type {Object}
     */
            param: {},
            /**
     * List of elements used inside the bdo element
     * @type {Object}
     */
            bdo: L,
            /**
     * List of elements used inside the var element
     * @type {Object}
     */
            'var': L,
            /**
     * List of elements used inside the div element
     * @type {Object}
     */
            div: P,
            /**
     * List of elements used inside the object element
     * @type {Object}
     */
            object: O,
            /**
     * List of elements used inside the sup element
     * @type {Object}
     */
            sup: L,
            /**
     * List of elements used inside the dd element
     * @type {Object}
     */
            dd: P,
            /**
     * List of elements used inside the strike element
     * @type {Object}
     */
            strike: L,
            /**
     * List of elements used inside the area element
     * @type {Object}
     */
            area: {},
            /**
     * List of elements used inside the dir element
     * @type {Object}
     */
            dir: Q,
            /**
     * List of elements used inside the map element
     * @type {Object}
     */
            map: merge({
                area: 1,
                form: 1,
                p: 1
            }, A, F, E),
            /**
     * List of elements used inside the applet element
     * @type {Object}
     */
            applet: O,
            /**
     * List of elements used inside the dl element
     * @type {Object}
     */
            dl: {
                dt: 1,
                dd: 1
            },
            /**
     * List of elements used inside the del element
     * @type {Object}
     */
            del: L,
            /**
     * List of elements used inside the isindex element
     * @type {Object}
     */
            isindex: {},
            /**
     * List of elements used inside the fieldset element
     * @type {Object}
     */
            fieldset: merge({ legend: 1 }, K),
            /**
     * List of elements used inside the thead element
     * @type {Object}
     */
            thead: M,
            /**
     * List of elements used inside the ul element
     * @type {Object}
     */
            ul: Q,
            /**
     * List of elements used inside the acronym element
     * @type {Object}
     */
            acronym: L,
            /**
     * List of elements used inside the b element
     * @type {Object}
     */
            b: L,
            /**
     * List of elements used inside the a element
     * @type {Object}
     */
            a: J,
            /**
     * List of elements used inside the blockquote element
     * @type {Object}
     */
            blockquote: P,
            /**
     * List of elements used inside the caption element
     * @type {Object}
     */
            caption: L,
            /**
     * List of elements used inside the i element
     * @type {Object}
     */
            i: L,
            /**
     * List of elements used inside the u element
     * @type {Object}
     */
            u: L,
            /**
     * List of elements used inside the tbody element
     * @type {Object}
     */
            tbody: M,
            /**
     * List of elements used inside the s element
     * @type {Object}
     */
            s: L,
            /**
     * List of elements used inside the address element
     * @type {Object}
     */
            address: merge(D, I),
            /**
     * List of elements used inside the tt element
     * @type {Object}
     */
            tt: L,
            /**
     * List of elements used inside the legend element
     * @type {Object}
     */
            legend: L,
            /**
     * List of elements used inside the q element
     * @type {Object}
     */
            q: L,
            /**
     * List of elements used inside the pre element
     * @type {Object}
     */
            pre: merge(G, C),
            /**
     * List of elements used inside the p element
     * @type {Object}
     */
            p: L,
            /**
     * List of elements used inside the em element
     * @type {Object}
     */
            em: L,
            /**
     * List of elements used inside the dfn element
     * @type {Object}
     */
            dfn: L
        };
    var i, html5Tags = [
            'article',
            'figure',
            'nav',
            'aside',
            'section',
            'footer'
        ];
    for (var p in dtd) {
        for (var p2 in dtd[p]) {
            if (p2 === 'div') {
                for (i = 0; i < html5Tags.length; i++) {
                    dtd[p][html5Tags[i]] = dtd[p][p2];
                }
            }
        }
    }
    for (i = 0; i < html5Tags.length; i++) {
        dtd[html5Tags[i]] = dtd.div;
    }
});

KISSY.add('html-parser/lexer/lexer', [
    './cursor',
    './page',
    '../nodes/text',
    '../nodes/cdata',
    '../utils',
    '../nodes/attribute',
    '../nodes/tag',
    '../nodes/comment'
], function (S, require, exports, module) {
    /**
 * @ignore
 * parse html string into Nodes
 * @author yiminghe@gmail.com
 */
    var Cursor = require('./cursor');
    var NEGATIVE_1 = 0 - 1;
    var Page = require('./page');
    var TextNode = require('../nodes/text');
    var CData = require('../nodes/cdata');
    var Utils = require('../utils');
    var Attribute = require('../nodes/attribute');
    var TagNode = require('../nodes/tag');
    var CommentNode = require('../nodes/comment');    /**
 * Lexer for html parser
 * @param {String} text html content
 * @param {Object} cfg config object
 * @class KISSY.HtmlParser.Lexer
 */
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
            var self = this, start, ch, ret, cursor = self.cursor, page = self.page;
            start = cursor.position;
            ch = page.getChar(cursor);
            switch (ch) {
            case -1:
                ret = null;
                break;
            case '<':
                ch = page.getChar(cursor);
                if (ch === -1) {
                    ret = self.makeString(start, cursor.position);
                } else if (ch === '/' || Utils.isLetter(ch)) {
                    page.ungetChar(cursor);
                    ret = self.parseTag(start);
                } else if ('!' === ch || '?' === ch) {
                    ch = page.getChar(cursor);
                    if (ch === -1) {
                        ret = self.makeString(start, cursor.position);
                    } else {
                        if ('>' === ch) {
                            ret = self.makeComment(start, cursor.position);
                        } else {
                            page.ungetChar(cursor);    // remark/tag need this char
                            // remark/tag need this char
                            if ('-' === ch) {
                                ret = self.parseComment(start, quoteSmart);
                            } else {
                                // <!DOCTYPE html>
                                // <?xml:namespace>
                                page.ungetChar(cursor);    // tag needs prior one too
                                // tag needs prior one too
                                ret = self.parseTag(start);
                            }
                        }
                    }
                } else {
                    page.ungetChar(cursor);    // see bug #1547354 <<tag> parsed as text
                    // see bug #1547354 <<tag> parsed as text
                    ret = self.parseString(start, quoteSmart);
                }
                break;
            default:
                page.ungetChar(cursor);    // string needs to see leading fore slash
                // string needs to see leading fore slash
                ret = self.parseString(start, quoteSmart);
                break;
            }
            return ret;
        },
        makeComment: function (start, end) {
            var length, ret;
            length = end - start;
            if (0 !== length) {
                // return tag based on second character, '/', '%', Letter (ch), '!'
                if (2 > length) {
                    // this is an error
                    return this.makeString(start, end);
                }
                ret = this.nodeFactory.createCommentNode(this.page, start, end);
            } else {
                ret = null;
            }
            return ret;
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
            var length, ret;
            length = end - start;
            if (0 !== length) {
                // return tag based on second character, '/', '%', Letter (ch), '!'
                if (2 > length) {
                    // this is an error
                    return this.makeString(start, end);
                }
                ret = this.nodeFactory.createTagNode(this.page, start, end, attributes);
            } else {
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
            function checkError() {
                if (strict && ch === -1 && attributes.length) {
                    throw new Error(attributes[0].name + ' syntax error at row ' + (page.row(cursor) + 1) + ' , col ' + (page.col(cursor) + 1));
                }
            }
            var done, bookmarks = [], attributes = [], ch, cfg = this.cfg, strict = cfg.strict, page = this.page, state = 0, cursor = this.cursor;    /*
         record state position

         states 0 -> bookmarks[1]
         states 1 -> bookmarks[2]
         */
            /*
         record state position

         states 0 -> bookmarks[1]
         states 1 -> bookmarks[2]
         */
            bookmarks[0] = cursor.position;
            while (!done) {
                // next possible end position for next state
                bookmarks[state + 1] = cursor.position;
                ch = page.getChar(cursor);    // fsm go!
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
                        } else if (ch === '/' || Utils.isValidAttributeNameStartChar(ch)) {
                            // <img />
                            state = 1;
                        }
                    }
                    break;
                case 1:
                    // within attribute name
                    if (NEGATIVE_1 === ch || '>' === ch || '<' === ch) {
                        if ('<' === ch) {
                            // don't consume the opening angle
                            page.ungetChar(cursor);
                            bookmarks[state + 1] = cursor.getPosition;
                        }
                        this.standalone(attributes, bookmarks);
                        done = true;
                    } else if (Utils.isWhitespace(ch)) {
                        // whitespaces might be followed by next attribute or an equal sign
                        // see Bug #891058 Bug in lexer.
                        bookmarks[6] = bookmarks[2];    // setting the bookmark[0] is done in state 6 if applicable
                        // setting the bookmark[0] is done in state 6 if applicable
                        state = 6;
                    } else if ('=' === ch) {
                        state = 2;
                    }
                    break;
                case 2:
                    // equals hit
                    if (NEGATIVE_1 === ch || '>' === ch) {
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
                case 3:
                    // within naked attribute value
                    if (NEGATIVE_1 === ch || '>' === ch) {
                        this.naked(attributes, bookmarks);
                        done = true;
                    } else if (Utils.isWhitespace(ch)) {
                        this.naked(attributes, bookmarks);
                        bookmarks[0] = bookmarks[4];
                        state = 0;
                    }
                    break;
                case 4:
                    // within single quoted attribute value
                    if (NEGATIVE_1 === ch) {
                        this.singleQuote(attributes, bookmarks);
                        done = true;    // complain?
                    } else // complain?
                    if ('\'' === ch) {
                        this.singleQuote(attributes, bookmarks);
                        bookmarks[0] = bookmarks[5] + 1;
                        state = 0;
                    }
                    break;
                case 5:
                    // within double quoted attribute value
                    if (NEGATIVE_1 === ch) {
                        this.doubleQuote(attributes, bookmarks);
                        done = true;    // complain?
                    } else // complain?
                    if ('"' === ch) {
                        this.doubleQuote(attributes, bookmarks);
                        bookmarks[0] = bookmarks[6] + 1;
                        state = 0;
                    }
                    break;    // patch for lexer state correction by
                              // Gernot Fricke
                              // See Bug # 891058 Bug in lexer.
                // patch for lexer state correction by
                // Gernot Fricke
                // See Bug # 891058 Bug in lexer.
                case 6:
                    // undecided for state 0 or 2
                    // we have read white spaces after an attribute name
                    if (NEGATIVE_1 === ch) {
                        // same as last else clause
                        this.standalone(attributes, bookmarks);
                        bookmarks[0] = bookmarks[6];
                        page.ungetChar(cursor);
                        state = 0;
                    } else if ('=' === ch) {
                        // yepp. the white spaces belonged to the equal.
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
            var done, ch, page = this.page, cursor = this.cursor, state;
            done = false;
            state = 0;
            while (!done) {
                ch = page.getChar(cursor);
                if (NEGATIVE_1 === ch) {
                    done = true;
                } else {
                    switch (state) {
                    case 0:
                        // prior to the first open delimiter
                        if ('>' === ch) {
                            done = true;
                        } else if ('-' === ch) {
                            state = 1;
                        } else {
                            return this.parseString(start, quoteSmart);
                        }
                        break;
                    case 1:
                        // prior to the second open delimiter
                        if ('-' === ch) {
                            // handle <!--> because netscape does
                            ch = page.getChar(cursor);
                            if (NEGATIVE_1 === ch) {
                                done = true;
                            } else if ('>' === ch) {
                                done = true;
                            } else {
                                page.ungetChar(cursor);
                                state = 2;
                            }
                        } else {
                            return this.parseString(start, quoteSmart);
                        }
                        break;
                    case 2:
                        // prior to the first closing delimiter
                        if ('-' === ch) {
                            state = 3;
                        } else if (NEGATIVE_1 === ch) {
                            return this.parseString(start, quoteSmart);    // no terminator
                        }
                        // no terminator
                        break;
                    case 3:
                        // prior to the second closing delimiter
                        if ('-' === ch) {
                            state = 4;
                        } else {
                            state = 2;
                        }
                        break;
                    case 4:
                        // prior to the terminating >
                        if ('>' === ch) {
                            done = true;
                        } else if (!Utils.isWhitespace(ch)) {
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
            var done = 0, ch, page = this.page, cursor = this.cursor, quote = 0;
            while (!done) {
                ch = page.getChar(cursor);
                if (NEGATIVE_1 === ch) {
                    done = 1;
                } else if (quoteSmart && 0 === quote && ('"' === ch || '\'' === ch)) {
                    quote = ch;    // enter quoted state
                } else // enter quoted state
                if (quoteSmart && 0 !== quote && '\\' === ch) {
                    // handle escaped closing quote
                    ch = page.getChar(cursor);    // try to consume escape
                    // try to consume escape
                    if (NEGATIVE_1 !== ch && '\\' !== ch && // escaped backslash
                        ch !== quote)
                        // escaped quote character
                        {
                            // ( reflects ['] or [']  whichever opened the quotation)
                            page.ungetChar(cursor);    // unconsume char if char not an escape
                        }
                } else // unconsume char if char not an escape
                if (quoteSmart && ch === quote) {
                    quote = 0;    // exit quoted state
                } else // exit quoted state
                if (quoteSmart && 0 === quote && ch === '/') {
                    // handle multiline and double slash comments (with a quote)
                    // in script like:
                    // I can't handle single quotations.
                    ch = page.getChar(cursor);
                    if (NEGATIVE_1 === ch) {
                        done = 1;
                    } else if ('/' === ch) {
                        do {
                            ch = page.getChar(cursor);
                        } while (NEGATIVE_1 !== ch && '\n' !== ch);
                    } else if ('*' === ch) {
                        do {
                            do {
                                ch = page.getChar(cursor);
                            } while (NEGATIVE_1 !== ch && '*' !== ch);
                            ch = page.getChar(cursor);
                            if (ch === '*') {
                                page.ungetChar(cursor);
                            }
                        } while (NEGATIVE_1 !== ch && '/' !== ch);
                    } else {
                        page.ungetChar(cursor);
                    }
                } else if (0 === quote && '<' === ch) {
                    ch = page.getChar(cursor);
                    if (NEGATIVE_1 === ch) {
                        done = 1;
                    } else if ('/' === ch || Utils.isLetter(ch) || '!' === ch || // <?xml:namespace
                        '?' === ch) {
                        done = 1;
                        page.ungetChar(cursor);
                        page.ungetChar(cursor);
                    } else {
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
            var start, state, done, quote, ch, end, comment, mCursor = this.cursor, mPage = this.page;
            start = mCursor.position;
            state = 0;
            done = false;
            quote = '';
            comment = false;
            while (!done) {
                ch = mPage.getChar(mCursor);
                switch (state) {
                case 0:
                    // prior to ETAGO
                    switch (ch) {
                    case -1:
                        done = true;
                        break;
                    case '\'':
                        if (quoteSmart && !comment) {
                            if ('' === quote) {
                                quote = '\'';    // enter quoted state
                            } else // enter quoted state
                            if ('\'' === quote) {
                                quote = '';    // exit quoted state
                            }
                        }
                        // exit quoted state
                        break;
                    case '"':
                        if (quoteSmart && !comment) {
                            if ('' === quote) {
                                quote = '"';    // enter quoted state
                            } else // enter quoted state
                            if ('"' === quote) {
                                quote = '';    // exit quoted state
                            }
                        }
                        // exit quoted state
                        break;
                    case '\\':
                        if (quoteSmart) {
                            if ('' !== quote) {
                                ch = mPage.getChar(mCursor);    // try to consume escaped character
                                // try to consume escaped character
                                if (NEGATIVE_1 === ch) {
                                    done = true;
                                } else if (ch !== '\\' && ch !== quote) {
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
                                if (NEGATIVE_1 === ch) {
                                    done = true;
                                } else if ('/' === ch) {
                                    comment = true;
                                } else if ('*' === ch) {
                                    do {
                                        do {
                                            ch = mPage.getChar(mCursor);
                                        } while (NEGATIVE_1 !== ch && '*' !== ch);
                                        ch = mPage.getChar(mCursor);
                                        if (ch === '*') {
                                            mPage.ungetChar(mCursor);
                                        }
                                    } while (NEGATIVE_1 !== ch && '/' !== ch);
                                } else {
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
                        } else {
                            state = 1;
                        }
                        break;
                    default:
                        break;
                    }
                    break;
                case 1:
                    // <
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
                        if (!tagName || mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName && !mPage.getText(mCursor.position + tagName.length, mCursor.position + tagName.length + 1).match(/\w/)) {
                            state = 2;
                        } else {
                            state = 0;
                        }
                        break;
                    case '!':
                        ch = mPage.getChar(mCursor);
                        if (NEGATIVE_1 === ch) {
                            done = true;
                        } else if ('-' === ch) {
                            ch = mPage.getChar(mCursor);
                            if (NEGATIVE_1 === ch) {
                                done = true;
                            } else if ('-' === ch) {
                                state = 3;
                            } else {
                                state = 0;
                            }
                        } else {
                            state = 0;
                        }
                        break;
                    default:
                        state = 0;
                        break;
                    }
                    break;
                case 2:
                    // </
                    comment = false;
                    if (NEGATIVE_1 === ch) {
                        done = true;
                    } else if (Utils.isLetter(ch)) {
                        // 严格 parser 遇到 </x lexer 立即结束
                        // 浏览器实现更复杂点，可能 lexer 和 parser 混合了
                        done = true;    // back up to the start of ETAGO
                        // back up to the start of ETAGO
                        mPage.ungetChar(mCursor);
                        mPage.ungetChar(mCursor);
                        mPage.ungetChar(mCursor);
                    } else {
                        state = 0;
                    }
                    break;
                case 3:
                    // <!
                    comment = false;
                    if (NEGATIVE_1 === ch) {
                        done = true;
                    } else if ('-' === ch) {
                        ch = mPage.getChar(mCursor);
                        if (NEGATIVE_1 === ch) {
                            done = true;
                        } else if ('-' === ch) {
                            ch = mPage.getChar(mCursor);
                            if (NEGATIVE_1 === ch) {
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
                    }    // eat comment
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
    module.exports = Lexer;
});
KISSY.add('html-parser/lexer/cursor', [], function (S, require, exports, module) {
    /**
 * @ignore
 * represent a cursor of page , it can advance and retreat
 * @author yiminghe@gmail.com
 */
    function Cursor(offset) {
        this.position = offset || 0;
    }
    Cursor.prototype = {
        constructor: Cursor,
        advance: function () {
            this.position++;
        },
        clone: function () {
            var c = new Cursor();
            c.position = this.position;
            return c;
        },
        retreat: function () {
            this.position = Math.max(--this.position, 0);
        }
    };
    module.exports = Cursor;
});
KISSY.add('html-parser/lexer/page', ['./index'], function (S, require, exports, module) {
    /**
 * @ignore
 * represent html source
 * @author yiminghe@gmail.com
 */
    var Index = require('./index');
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
            cursor.advance();    // U+000D CARRIAGE RETURN (CR) characters and U+000A LINE FEED (LF) characters are treated specially.
                                 // Any CR characters that are followed by LF characters must be removed,
                                 // and any CR characters not followed by LF characters must be converted to LF characters.
                                 // Thus, newlines in HTML DOMs are represented by LF characters,
                                 // and there are never any CR characters in the input to the tokenization stage.
                                 // normalize line separator
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
            }    // update line Index
            // update line Index
            if ('\n' === ret) {
                this.lineIndex.add(cursor);
            }
            return ret;
        },
        ungetChar: function (cursor) {
            var source = this.source;
            cursor.retreat();
            var i = cursor.position, ch = source.charAt(i);
            if (ch === '\n' && 0 !== i) {
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
    module.exports = Page;
});
KISSY.add('html-parser/lexer/index', [], function (S, require, exports, module) {
    /**
 * @ignore
 * represent line index of each line
 * @author yiminghe@gmail.com
 */
    /**
 * Page index class.
 * @private
 * @class KISSY.HtmlParser.Lexer.Index
 */
    function Index() {
        this.lineCursors = [];
    }
    Index.prototype = {
        constructor: Index,
        add: function (cursor) {
            var index = indexOfCursorForInsert(this.lineCursors, cursor);
            if (index !== -1) {
                this.lineCursors.splice(index, 0, cursor.clone());
            }
        },
        remove: function (cursor) {
            var cs = this.lineCursors;
            var index = indexOfCursor(this.lineCursors, cursor);
            if (index !== -1) {
                cs.splice(index, 1);
            }
        },
        /**
     * line number of this cursor , index from zero
     * @param cursor
     */
        row: function (cursor) {
            var cs = this.lineCursors;
            for (var i = 0; i < cs.length; i++) {
                if (cs[i].position > cursor.position) {
                    return i - 1;
                }
            }
            return i;
        },
        col: function (cursor) {
            var linePosition = 0, lineCursor = this.lineCursors[this.row(cursor) - 1];
            if (lineCursor) {
                linePosition = lineCursor.position;
            }
            return cursor.position - linePosition;
        }
    };
    function indexOfCursor(cs, c) {
        var cPosition = c.position;
        for (var i = 0; i < cs.length; i++) {
            var iPosition = cs[i].position;
            if (iPosition === cPosition) {
                return i;
            } else if (iPosition < cPosition) {
                return -1;
            }
        }
        return -1;
    }
    function indexOfCursorForInsert(cs, c) {
        var cPosition = c.position;
        for (var i = 0; i < cs.length; i++) {
            var iPosition = cs[i].position;
            if (iPosition === cPosition) {
                return -1;
            } else if (iPosition > cPosition) {
                return i;
            }
        }
        return i;
    }
    module.exports = Index;
});
KISSY.add('html-parser/nodes/text', [
    './node',
    'util'
], function (S, require, exports, module) {
    /**
 * @ignore
 * dom text node
 * @author yiminghe@gmail.com
 */
    /*global Node:true*/
    var Node = require('./node');
    var util = require('util');
    function Text(v) {
        if (typeof v === 'string') {
            this.nodeValue = v;
            Text.superclass.constructor.apply(this, [
                null,
                -1,
                -1
            ]);
        } else {
            Text.superclass.constructor.apply(this, arguments);
            this.nodeValue = this.toHtml();
        }
        this.nodeType = 3;
        this.nodeName = '#text';
    }
    util.extend(Text, Node, {
        writeHtml: function (writer, filter) {
            var ret;
            if (!filter || (ret = filter.onText(this)) !== false) {
                if (ret) {
                    if (this !== ret) {
                        ret.writeHtml(writer, filter);
                        return;
                    }
                }
                writer.text(this.toHtml());
            }
        },
        toHtml: function () {
            if (this.nodeValue) {
                return this.nodeValue;
            } else {
                return Text.superclass.toHtml.apply(this, arguments);
            }
        }
    });
    module.exports = Text;
});
KISSY.add('html-parser/nodes/node', [], function (S, require, exports, module) {
    /**
 * @ignore
 * abstract class for tag and text, comment .. etc
 * @author yiminghe@gmail.com
 */
    function lineCount(str) {
        var i = 0;    // cpu!
        // cpu!
        str.replace(/\n/g, function () {
            i++;
        });
        return i;
    }    /**
 * node structure from htmlparser
 * @param page
 * @param startPosition
 * @param endPosition
 * @class KISSY.HtmlParse.Node
 */
    /**
 * node structure from htmlparser
 * @param page
 * @param startPosition
 * @param endPosition
 * @class KISSY.HtmlParse.Node
 */
    function Node(page, startPosition, endPosition) {
        this.parentNode = null;
        this.page = page;
        this.startPosition = startPosition;
        this.endPosition = endPosition;
        this.nodeName = null;
        this.previousSibling = null;
        this.nextSibling = null;
    }
    Node.prototype = {
        constructor: Node,
        getStartLine: function () {
            if (this.page) {
                if ('startLine' in this) {
                    return this.startLine;
                }
                this.startLine = lineCount(this.page.getText(0, this.startPosition));
            }
            return -1;
        },
        getEndLine: function () {
            if (this.page) {
                if ('endLine' in this) {
                    return this.endLine;
                }
                this.endLine = lineCount(this.page.getText(0, this.endPosition));
            }
            return -1;
        },
        /**
     * get outerHtml of current node
     * @returns {String}
     */
        toHtml: function () {
            if (this.page && this.page.getText) {
                return this.page.getText(this.startPosition, this.endPosition);
            }
            return '';
        },
        toDebugString: function () {
            var ret = [], self = this;
            ret.push(self.nodeName + '  [ ' + self.startPosition + '|' + self.getStartLine() + ' : ' + self.endPosition + '|' + self.getEndLine() + ' ]\n');
            ret.push(self.toHtml());
            return ret.join('');
        }
    };
    module.exports = Node;
});
KISSY.add('html-parser/nodes/cdata', [
    './text',
    'util'
], function (S, require, exports, module) {
    /**
 * @ignore
 * dom text node
 * @author yiminghe@gmail.com
 */
    var Text = require('./text');
    var util = require('util');
    function CData() {
        CData.superclass.constructor.apply(this, arguments);
        this.nodeType = 4;
        this.nodeName = '#cdata';
    }
    util.extend(CData, Text, {
        writeHtml: function (writer, filter) {
            var ret;
            if (!filter || (ret = filter.onCData(this)) !== false) {
                if (ret) {
                    if (this !== ret) {
                        ret.writeHtml(writer, filter);
                        return;
                    }
                }
                writer.cdata(this.toHtml());
            }
        }
    });
    module.exports = CData;
});
KISSY.add('html-parser/utils', [], function (S, require, exports, module) {
    /**
 * @ignore
 * utils about language for html parser
 * @author yiminghe@gmail.com
 */
    module.exports = {
        isBooleanAttribute: function (attrName) {
            return /^(?:checked|disabled|selected|readonly|defer|multiple|nohref|noshape|nowrap|noresize|compact|ismap)$/i.test(attrName);
        },
        collapseWhitespace: function (str) {
            return str.replace(/[\s\xa0]+/g, ' ');
        },
        isLetter: function (ch) {
            return 'a' <= ch && 'z' >= ch || 'A' <= ch && 'Z' >= ch;
        },
        /*
     refer: http://www.w3.org/TR/html5/syntax.html#attributes-0
     */
        isValidAttributeNameStartChar: function (ch) {
            return !this.isWhitespace(ch) && ch !== '"' && ch !== '\'' && ch !== '>' && ch !== '' < '' && ch !== '/' && ch !== '=';
        },
        isWhitespace: function (ch) {
            // http://yiminghe.iteye.com/admin/blogs/722786
            // http://yiminghe.iteye.com/admin/blogs/788929
            // 相比平时的空格（&#32;），nbsp拥有不间断（non-breaking）特性。
            // 即连续的nbsp会在同一行内显示。即使有100个连续的nbsp，浏览器也不会把它们拆成两行。
            // &nbsp; => 160
            // /\s/.test(String.fromCharCode(160))
            // ie return false, others return true
            return /^[\s\xa0]$/.test(ch);
        }
    };    /*
 refer:
 -  http://www.w3.org/TR/html5/syntax.html
 */
});
KISSY.add('html-parser/nodes/attribute', ['util'], function (S, require, exports, module) {
    /**
 * @ignore
 * represent attribute node in tag node
 * @author yiminghe@gmail.com
 */
    var util = require('util');
    function Attribute(name, assignment, value, quote) {
        this.nodeType = 2;
        this.name = name;
        this.assignment = assignment;
        this.value = value;
        this.quote = quote;
    }
    Attribute.prototype = {
        clone: function () {
            var ret = new Attribute();
            util.mix(ret, this);
            return ret;
        },
        equals: function (other) {
            return this.name === other.name && this.value === other.value && this.nodeType === other.nodeType;
        }
    };
    Attribute.prototype.clone = function () {
        var ret = new Attribute();
        util.mix(ret, this);
        return ret;
    };
    module.exports = Attribute;
});
KISSY.add('html-parser/nodes/tag', [
    './node',
    './attribute',
    '../dtd',
    'util'
], function (S, require, exports, module) {
    /**
 * @ignore
 * represent tag, it can nest other tag
 * @author yiminghe@gmail.com
 */
    /*global Node:true*/
    var Node = require('./node');
    var Attribute = require('./attribute');
    var Dtd = require('../dtd');
    var util = require('util');
    function createTag(self, tagName, attrs) {
        self.nodeName = self.tagName = tagName.toLowerCase();
        self._updateSelfClosed();
        util.each(attrs, function (v, n) {
            self.setAttribute(n, v);
        });
    }    /**
 * Html Tag Class
 * @param page
 * @param startPosition
 * @param endPosition
 * @param attributes
 * @class KISSY.HtmlParser.Tag
 */
    /**
 * Html Tag Class
 * @param page
 * @param startPosition
 * @param endPosition
 * @param attributes
 * @class KISSY.HtmlParser.Tag
 */
    function Tag(page, startPosition, endPosition, attributes) {
        var self = this;
        self.childNodes = [];
        self.firstChild = null;
        self.lastChild = null;
        self.attributes = attributes || [];
        self.nodeType = 1;
        if (typeof page === 'string') {
            createTag.apply(null, [self].concat(util.makeArray(arguments)));
        } else {
            Tag.superclass.constructor.apply(self, arguments);
            attributes = self.attributes;    // first attribute is actually nodeName
            // first attribute is actually nodeName
            if (attributes[0]) {
                self.nodeName = attributes[0].name.toLowerCase();    // end tag (</div>) is a tag too in lexer , but not exist in parsed dom tree
                // end tag (</div>) is a tag too in lexer , but not exist in parsed dom tree
                self.tagName = self.nodeName.replace(/\//, '');
                self._updateSelfClosed();
                attributes.splice(0, 1);
            }
            var lastAttr = attributes[attributes.length - 1], lastSlash = !!(lastAttr && /\/$/.test(lastAttr.name));
            if (lastSlash) {
                attributes.length = attributes.length - 1;
            }    // self-closing flag
            // self-closing flag
            self.isSelfClosed = self.isSelfClosed || lastSlash;    // whether has been closed by its end tag
                                                                   // !TODO how to set closed position correctly
            // whether has been closed by its end tag
            // !TODO how to set closed position correctly
            self.closed = self.isSelfClosed;
        }
        self.closedStartPosition = -1;
        self.closedEndPosition = -1;
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
            c[c.length - 1].nextSibling = null;
        }
    }
    util.extend(Tag, Node, {
        _updateSelfClosed: function () {
            var self = this;    // <br> <img> <input> , just recognize them immediately
            // <br> <img> <input> , just recognize them immediately
            self.isSelfClosed = !!Dtd.$empty[self.nodeName];
            if (!self.isSelfClosed) {
                self.isSelfClosed = /\/$/.test(self.nodeName);
            }
            self.closed = self.isSelfClosed;
        },
        clone: function () {
            var ret = new Tag(), attrs = [];
            util.each(this.attributes, function (a) {
                attrs.push(a.clone());
            });
            util.mix(ret, {
                childNodes: [],
                firstChild: null,
                lastChild: null,
                attributes: attrs,
                nodeType: this.nodeType,
                nodeName: this.nodeName,
                tagName: this.tagName,
                isSelfClosed: this.isSelfClosed,
                closed: this.closed,
                closedStartPosition: this.closedStartPosition,
                closedEndPosition: this.closedEndPosition
            });
            return ret;
        },
        setTagName: function (v) {
            var self = this;
            self.nodeName = self.tagName = v;
            if (v) {
                self._updateSelfClosed();
            }
        },
        equals: function (tag) {
            if (!tag || this.nodeName !== tag.nodeName) {
                return 0;
            }
            if (this.nodeType !== tag.nodeType) {
                return 0;
            }
            if (this.attributes.length !== tag.attributes.length) {
                return 0;
            }
            for (var i = 0; i < this.attributes.length; i++) {
                if (!this.attributes[i].equals(tag.attributes[i])) {
                    return 0;
                }
            }
            return 1;
        },
        isEndTag: function () {
            return /^\//.test(this.nodeName);
        },
        appendChild: function (node) {
            this.childNodes.push(node);
            refreshChildNodes(this);
        },
        replace: function (ref) {
            var sibling = ref.parentNode.childNodes, index = util.indexOf(ref, sibling);
            sibling[index] = this;
            refreshChildNodes(ref.parentNode);
        },
        replaceChild: function (newC, refC) {
            var self = this, childNodes = self.childNodes;
            var index = util.indexOf(refC, childNodes);
            childNodes[index] = newC;
            refreshChildNodes(self);
        },
        prepend: function (node) {
            this.childNodes.unshift(node);
            refreshChildNodes(this);
        },
        insertBefore: function (ref) {
            var sibling = ref.parentNode.childNodes, index = util.indexOf(ref, sibling);
            sibling.splice(index, 0, this);
            refreshChildNodes(ref.parentNode);
        },
        insertAfter: function (ref) {
            var sibling = ref.parentNode.childNodes, index = util.indexOf(ref, sibling);
            if (index === sibling.length - 1) {
                ref.parentNode.appendChild(this);
            } else {
                this.insertBefore(ref.parentNode.childNodes[[index + 1]]);
            }
        },
        empty: function () {
            this.childNodes = [];
            refreshChildNodes(this);
        },
        removeChild: function (node) {
            var sibling = node.parentNode.childNodes, index = util.indexOf(node, sibling);
            sibling.splice(index, 1);
            refreshChildNodes(node.parentNode);
        },
        getAttribute: function (name) {
            var attr = findAttributeByName(this.attributes, name);
            return attr && attr.value;
        },
        setAttribute: function (name, value) {
            var attr = findAttributeByName(this.attributes, name);
            if (attr) {
                attr.value = value;
            } else {
                this.attributes.push(new Attribute(name, '=', value, '"'));
            }
        },
        removeAttribute: function (name) {
            var attr = findAttributeByName(this.attributes, name);
            if (attr) {
                var index = util.indexOf(attr, this.attributes);
                this.attributes.splice(index, 1);
            }
        },
        /**
     * give root node a chance to filter children first
     */
        filterChildren: function () {
            var self = this;
            if (!self.isChildrenFiltered) {
                var writer = new (module.require('html-parser/writer/basic'))();
                self._writeChildrenHTML(writer);
                var parser = new (module.require('html-parser/parser'))(writer.getHtml()), children = parser.parse().childNodes;
                self.empty();
                util.each(children, function (c) {
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
        writeHtml: function (writer, filter) {
            var self = this, tmp, attrName, tagName = self.tagName;    // special treat for doctype
            // special treat for doctype
            if (tagName === '!doctype') {
                writer.append(this.toHtml() + '\n');
                return;
            }
            self.__filter = filter;
            self.isChildrenFiltered = 0;    // process its open tag
            // process its open tag
            if (filter) {
                // element filtered by its name directly
                if (!(tagName = filter.onTagName(tagName))) {
                    return;
                }
                self.tagName = tagName;
                tmp = filter.onTag(self);
                if (tmp === false) {
                    return;
                }    // replaced
                // replaced
                if (tmp) {
                    self = tmp;
                }    // replaced by other type of node
                // replaced by other type of node
                if (self.nodeType !== 1) {
                    self.writeHtml(writer, filter);
                    return;
                }    // preserve children but delete itself
                // preserve children but delete itself
                if (!self.tagName) {
                    self._writeChildrenHTML(writer);
                    return;
                }
            }
            writer.openTag(self);    // process its attributes
            // process its attributes
            var attributes = self.attributes;
            for (var i = 0; i < attributes.length; i++) {
                var attr = attributes[i];
                attrName = attr.name;
                if (filter) {
                    // filtered directly by name
                    if (!(attrName = filter.onAttributeName(attrName, self))) {
                        continue;
                    }
                    attr.name = attrName;    // filtered by value and node
                    // filtered by value and node
                    if (filter.onAttribute(attr, self) === false) {
                        continue;
                    }
                }
                writer.attribute(attr, self);
            }    // close its open tag
            // close its open tag
            writer.openTagClose(self);
            if (!self.isSelfClosed) {
                self._writeChildrenHTML(writer);    // process its close tag
                // process its close tag
                writer.closeTag(self);
            }
        },
        /**
     * @param writer
     * @protected
     */
        _writeChildrenHTML: function (writer) {
            var self = this, filter = self.isChildrenFiltered ? 0 : self.__filter;    // process its children recursively
            // process its children recursively
            util.each(self.childNodes, function (child) {
                child.writeHtml(writer, filter);
            });
        },
        outerHtml: function () {
            var writer = new (module.require('html-parser/writer/basic'))();
            this.writeHtml(writer);
            return writer.getHtml();
        }
    });
    function findAttributeByName(attributes, name) {
        if (attributes && attributes.length) {
            for (var i = 0; i < attributes.length; i++) {
                if (attributes[i].name === name) {
                    return attributes[i];
                }
            }
        }
        return null;
    }
    module.exports = Tag;
});
KISSY.add('html-parser/nodes/comment', [
    './text',
    'util'
], function (S, require, exports, module) {
    /**
 * @ignore
 * comment node (<!-- content -->)
 * @author yiminghe@gmail.com
 */
    var Text = require('./text');
    var util = require('util');
    function Comment() {
        Comment.superclass.constructor.apply(this, arguments);
        this.nodeType = 8;
        this.nodeName = '#comment';
    }
    util.extend(Comment, Text, {
        writeHtml: function (writer, filter) {
            var ret;
            if (!filter || (ret = filter.onComment(this)) !== false) {
                if (ret) {
                    if (this !== ret) {
                        ret.writeHtml(writer, filter);
                        return;
                    }
                }
                writer.comment(this.toHtml());
            }
        },
        toHtml: function () {
            if (this.nodeValue) {
                return this.nodeValue;
            } else {
                var value = Text.superclass.toHtml.apply(this, arguments);    // <!-- -->
                // <!-- -->
                return value.substring(4, value.length - 3);
            }
        }
    });
    module.exports = Comment;
});
KISSY.add('html-parser/parser', [
    'util',
    './dtd',
    './nodes/tag',
    './nodes/fragment',
    './lexer/lexer',
    './nodes/document',
    './scanner'
], function (S, require, exports, module) {
    /**
 * @ignore
 * parse html to a hierarchy dom tree
 * @author yiminghe@gmail.com
 */
    var util = require('util');
    var dtd = require('./dtd');
    var Tag = require('./nodes/tag');
    var Fragment = require('./nodes/fragment');
    var Lexer = require('./lexer/lexer');
    var Document = require('./nodes/document');
    var Scanner = require('./scanner');    /**
 * Html Parse Class
 * @param html
 * @param opts
 * @class KISSY.HtmlParser.Parser
 */
    /**
 * Html Parse Class
 * @param html
 * @param opts
 * @class KISSY.HtmlParser.Parser
 */
    function Parser(html, opts) {
        // fake root node
        html = util.trim(html);
        this.originalHTML = html;    // only allow condition
                                     // 1. start with <!doctype
                                     // 2. start with <!html
                                     // 3. start with <!body
                                     // 4. not start with <head
                                     // 5. not start with <meta
        // only allow condition
        // 1. start with <!doctype
        // 2. start with <!html
        // 3. start with <!body
        // 4. not start with <head
        // 5. not start with <meta
        if (/^(<!doctype|<html|<body)/i.test(html)) {
            html = '<document>' + html + '</document>';
        } else {
            html = '<body>' + html + '</body>';
        }
        this.lexer = new Lexer(html);
        this.opts = opts || {};
    }
    Parser.prototype = {
        constructor: Parser,
        elements: function () {
            var root, doc, lexer = this.lexer, opts = this.opts;
            doc = root = lexer.nextNode();
            if (root.tagName !== 'document') {
                doc = new Document();
                doc.appendChild(root);
            }
            doc.nodeType = 9;
            Scanner.getScanner('div').scan(root, lexer, opts);
            var body = fixBody(doc);
            if (body && opts.autoParagraph) {
                autoParagraph(body);
            }
            postProcess(doc);
            var originalHTML = this.originalHTML, fragment = new Fragment(), cs;
            if (/^(<!doctype|<html|<body)/i.test(originalHTML)) {
                cs = doc.childNodes;
            } else {
                cs = body.childNodes;
            }
            util.each(cs, function (c) {
                fragment.appendChild(c);
            });
            return fragment;
        },
        parse: function () {
            return this.elements();
        }
    };
    function fixBody(doc) {
        // 3 limit depth
        var body = findTagWithName(doc, 'body', 3);
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
            var parent = body.parentNode, sibling = parent.childNodes, bodyIndex = util.indexOf(body, sibling);
            if (bodyIndex !== sibling.length - 1) {
                var fixes = sibling.slice(bodyIndex + 1, sibling.length);
                for (var i = 0; i < fixes.length; i++) {
                    parent.removeChild(fixes[i]);
                    if (fixes[i].tagName === 'body') {
                        /*jshint loopfunc:true*/
                        util.each(fixes[i].childNodes, function (c) {
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
        var childNodes = doc.childNodes, c, i, pDtd = dtd.p, needFix = 0;
        for (i = 0; i < childNodes.length; i++) {
            c = childNodes[i];
            if (c.nodeType === 3 || c.nodeType === 1 && pDtd[c.nodeName]) {
                needFix = 1;
                break;
            }
        }
        if (needFix) {
            var newChildren = [], holder = new Tag();
            holder.nodeName = holder.tagName = 'p';
            for (i = 0; i < childNodes.length; i++) {
                c = childNodes[i];
                if (c.nodeType === 3 || c.nodeType === 1 && pDtd[c.nodeName]) {
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
        if (level === 0) {
            return 0;
        }
        if (typeof level === 'number') {
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
    function postProcess(doc) {
        // Space characters before the root html element,
        // and space characters at the start of the html element and before the head element,
        // will be dropped when the document is parsed;
        var childNodes = [].concat(doc.childNodes);
        for (var i = 0; i < childNodes.length; i++) {
            if (childNodes[i].nodeName === 'html') {
                var html = childNodes[i];
                for (var j = 0; j < i; j++) {
                    if (childNodes[j].nodeType === 3 && !util.trim(childNodes[j].toHtml())) {
                        doc.removeChild(childNodes[j]);
                    }
                }
                while (html.firstChild && html.firstChild.nodeType === 3 && !util.trim(html.firstChild.toHtml())) {
                    html.removeChild(html.firstChild);
                }
                break;
            }
        }
    }
    module.exports = Parser;
});
KISSY.add('html-parser/nodes/fragment', [
    './tag',
    'util'
], function (S, require, exports, module) {
    /**
 * @ignore
 * fake document fragment
 * @author yiminghe@gmail.com
 */
    var Tag = require('./tag');
    var util = require('util');
    function Fragment() {
        this.childNodes = [];
        this.nodeType = 9;
        this.nodeName = '#fragment';
    }
    util.extend(Fragment, Tag, {
        writeHtml: function (writer, filter) {
            this.__filter = filter;
            this.isChildrenFiltered = 0;
            if (filter) {
                filter.onFragment(this);
            }
            this._writeChildrenHTML(writer);
        }
    });
    module.exports = Fragment;
});
KISSY.add('html-parser/nodes/document', [
    './tag',
    'util'
], function (S, require, exports, module) {
    /**
 * @ignore
 * fake document node
 * @author yiminghe@gmail.com
 */
    var Tag = require('./tag');
    var util = require('util');
    function Document() {
        this.childNodes = [];
        this.nodeType = 9;
        this.nodeName = '#document';
    }
    util.extend(Document, Tag, {
        writeHtml: function (writer, filter) {
            this.__filter = filter;
            this._writeChildrenHTML(writer);
        }
    });
    module.exports = Document;
});
KISSY.add('html-parser/scanner', [
    './scanners/tag-scanner',
    './scanners/special-scanners',
    './scanners/quote-cdata-scanner',
    './scanners/textarea-scanner'
], function (S, require, exports, module) {
    /**
 * @ignore
 * declare and initiate sub scanners
 * @author yiminghe@gmail.com
 */
    var TagScanner = require('./scanners/tag-scanner');
    var SpecialScanners = require('./scanners/special-scanners');
    require('./scanners/quote-cdata-scanner');
    require('./scanners/textarea-scanner');
    exports.getScanner = function (nodeName) {
        return SpecialScanners[nodeName] || TagScanner;
    };
});
KISSY.add('html-parser/scanners/tag-scanner', [
    '../dtd',
    '../nodes/tag',
    './special-scanners',
    'util'
], function (S, require, exports, module) {
    /**
 * @ignore
 * nest tag scanner recursively
 * @author yiminghe@gmail.com
 */
    var dtd = require('../dtd');
    var Tag = require('../nodes/tag');
    var SpecialScanners = require('./special-scanners');
    var util = require('util');
    var
        /*
 will create ul when encounter li and li's parent is not ul
 */
        wrapper = {
            li: 'ul',
            dt: 'dl',
            dd: 'dl'
        };    /*
 refer: http://www.w3.org/TR/html5/tree-construction.html#tree-construction
 When the steps below require the UA to generate implied end tags,
 then, while the current node is a dd element,
 a dt element, an li element, an option element,
 an optgroup element, a p element, an rp element, or an rt element,
 the UA must pop the current node off the stack of open elements.
 */
    /*
 refer: http://www.w3.org/TR/html5/tree-construction.html#tree-construction
 When the steps below require the UA to generate implied end tags,
 then, while the current node is a dd element,
 a dt element, an li element, an option element,
 an optgroup element, a p element, an rp element, or an rt element,
 the UA must pop the current node off the stack of open elements.
 */
    var impliedEndTag = {
            // if dd encounter another dd before encounter dl ,then close last dd
            dd: { dl: 1 },
            dt: { dl: 1 },
            // 2012.06.27 Note: li may has two kinds of parent!
            li: {
                ul: 1,
                ol: 1
            },
            option: { select: 1 },
            optgroup: { select: 1 }    // p? rp? rt?
        };    /*
 close tag and check nest by xhtml dtd rules
 <span> 1 <span>2</span> <p>3</p> </span> => <span> 1 <span>2</span> </span> <p><span>3</span></p>
 @param tag
 */
    // p? rp? rt?
    /*
 close tag and check nest by xhtml dtd rules
 <span> 1 <span>2</span> <p>3</p> </span> => <span> 1 <span>2</span> </span> <p><span>3</span></p>
 @param tag
 */
    function fixCloseTagByDtd(tag, opts) {
        tag.closed = 1;
        if (!opts.fixByDtd) {
            return 0;
        }
        var valid = 1, childNodes = [].concat(tag.childNodes);
        util.each(childNodes, function (c) {
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
            prev = tag, recursives = [];
        function closeCurrentHolder() {
            if (holder.childNodes.length) {
                // close current holder
                holder.insertAfter(prev);    // if child can not be included in holder
                                             // : <a><a></a></a>
                                             // then will insertAfter last holder
                // if child can not be included in holder
                // : <a><a></a></a>
                // then will insertAfter last holder
                prev = holder;    // open new holder to accommodate child which can reside in holder
                                  // <a>1<a>2</a>3</a> => <a>1</a>(-<close holder)<a>2</a>(<-child can not be included in holder)<a>3</a>(<-new holder)
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
                if (c.nodeType !== 1) {
                    continue;
                }
                var currentChildName = c.tagName;    // li -> ul
                // li -> ul
                if (dtd.$listItem[currentChildName]) {
                    closeCurrentHolder();
                    var pTagName = wrapper[c.tagName], pTag = new Tag();
                    pTag.nodeName = pTag.tagName = pTagName;
                    while (i < childNodes.length) {
                        if (childNodes[i].tagName === currentChildName) {
                            pTag.appendChild(childNodes[i]);
                        } else if (childNodes[i].nodeType === 3 && util.trim(childNodes[i].toHtml())) {
                            // non-empty text leave it to outer loop
                            break;
                        }
                        i++;
                    }
                    pTag.insertAfter(prev);
                    prev = pTag;
                    i--;
                    continue;
                }    // only deal with inline element mistakenly wrap block element ?
                     // also consider <pre>1 \n<div>2\n 3\n</div> 4</pre> : 2012-01-13
                     // if (dtd.$inline[tag.tagName]) {
                // only deal with inline element mistakenly wrap block element ?
                // also consider <pre>1 \n<div>2\n 3\n</div> 4</pre> : 2012-01-13
                // if (dtd.$inline[tag.tagName]) {
                closeCurrentHolder();
                if (!c.equals(holder)) {
                    // <a><p></p></a> => <p><a></a></p>
                    if (canHasNodeAsChild(c, holder)) {
                        holder = tag.clone();    /*jshint loopfunc:true*/
                        /*jshint loopfunc:true*/
                        util.each(c.childNodes, function (cc) {
                            holder.appendChild(cc);
                        });
                        c.empty();
                        c.insertAfter(prev);
                        prev = c;
                        c.appendChild(holder);    // recursive to a,lower
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
                }    // }
            }
        }    // <a>1<p>3</p>3</a>
             // encouter 3 , last holder should be inserted after <p>
        // }
        // <a>1<p>3</p>3</a>
        // encouter 3 , last holder should be inserted after <p>
        if (holder.childNodes.length) {
            holder.insertAfter(prev);
        }    // <a><p>1</p></a> => <a></a><p><a>1</a></p> => <p><a>1</a></p>
        // <a><p>1</p></a> => <a></a><p><a>1</a></p> => <p><a>1</a></p>
        tag.parentNode.removeChild(tag);    // <a><div><div>1</div></div></a>
                                            // =>
                                            // <div><a><div>1</div></a></div>
                                            // => fixCloseTagByDtd('<a><div>1</div></a>')
        // <a><div><div>1</div></div></a>
        // =>
        // <div><a><div>1</div></a></div>
        // => fixCloseTagByDtd('<a><div>1</div></a>')
        util.each(recursives, function (r) {
            fixCloseTagByDtd(r, opts);
        });
        return 1;
    }    /*
 checked whether tag can include node as its child according to DTD
 */
    /*
 checked whether tag can include node as its child according to DTD
 */
    function canHasNodeAsChild(tag, node) {
        // document can nest any tag
        if (tag.nodeType === 9) {
            return 1;
        }
        if (!dtd[tag.tagName]) {
            throw new Error('dtd[' + tag.tagName + '] === undefined!');
        }
        if (node.nodeType === 8) {
            return 1;
        }
        var nodeName = node.tagName || node.nodeName;
        return !!dtd[tag.tagName][nodeName];
    }
    exports.scan = function (tag, lexer, opts) {
        function closeStackOpenTag(end, from) {
            for (i = end; i > from; i--) {
                var currentStackItem = stack[i], preStackItem = stack[i - 1];
                preStackItem.appendChild(currentStackItem);
                fixCloseTagByDtd(currentStackItem, opts);
            }
            tag = stack[from];
            stack.length = from;
        }    // fix
             // <ol><li>1<li>2</ol>
        // fix
        // <ol><li>1<li>2</ol>
        function processImpliedEndTag(node) {
            var needFix = 0, endParentTagName;    // <ul><li>1<ul><li>2</ul></ul>
            // <ul><li>1<ul><li>2</ul></ul>
            if (endParentTagName = impliedEndTag[node.tagName]) {
                var from = stack.length - 1, parent = stack[from];    // <ol><li><ol><li>
                                                                      // parent ol break li check
                // <ol><li><ol><li>
                // parent ol break li check
                while (parent && !(parent.tagName in endParentTagName)) {
                    // <ul><li>1<div><li>2</div></ul>
                    if (parent.tagName === node.tagName) {
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
        var node, i, stack;    // http://www.w3.org/TR/html5/parsing.html#stack-of-open-elements
                               // stack of open elements
        // http://www.w3.org/TR/html5/parsing.html#stack-of-open-elements
        // stack of open elements
        stack = opts.stack = opts.stack || [];
        do {
            node = lexer.nextNode();
            if (node) {
                if (node.nodeType === 1) {
                    // normal end tag
                    if (node.isEndTag() && node.tagName === tag.tagName) {
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
                                stack.push(tag);    // <ul>
                                                    //      <li>1
                                                    //      <li>2
                                                    // </ul>
                                // <ul>
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
                        if (index !== -1) {
                            // <div><span> <a> </div>
                            // tag==a
                            stack[stack.length - 1].appendChild(tag);
                            fixCloseTagByDtd(tag, opts);
                            closeStackOpenTag(stack.length - 1, index);
                            node = null;
                        }    // discard this close tag
                    }
                } else
                    // discard this close tag
                    {
                        tag.appendChild(node);
                    }
            }    // fake recursive success , stack retreat
            // fake recursive success , stack retreat
            if (node === null) {
                if (stack.length > 0) {
                    node = stack[stack.length - 1];    // fake recursion
                    // fake recursion
                    if (!SpecialScanners[node.tagName]) {
                        stack.length = stack.length - 1;
                        node.appendChild(tag);    // child fix
                        // child fix
                        fixCloseTagByDtd(tag, opts);
                        tag = node;
                    } else {
                        node = null;
                    }
                }
            }
        } while (node);    // root tag fix
        // root tag fix
        fixCloseTagByDtd(tag, opts);
    };
});
KISSY.add('html-parser/scanners/special-scanners', [], function (S, require, exports, module) {
    /**
 * @ignore
 * special scanners holder (textarea/style/script)
 * @author yiminghe@gmail.com
 */
    module.exports = {};
});
KISSY.add('html-parser/scanners/quote-cdata-scanner', [
    './cdata-scanner',
    '../dtd',
    './special-scanners'
], function (S, require, exports, module) {
    /**
 * @ignore
 * scanner cdata (script/textarea/style) with quote smart
 * @author yiminghe@gmail.com
 */
    var CDataScanner = require('./cdata-scanner');
    var Dtd = require('../dtd');
    var SpecialScanners = require('./special-scanners');
    exports.scan = function (tag, lexer, opts) {
        opts = opts || {};
        opts.quoteSmart = 1;
        CDataScanner.scan(tag, lexer, opts);
        opts.quoteSmart = 0;
    };    // script/style
    // script/style
    for (var t in Dtd.$cdata) {
        SpecialScanners[t] = exports;
    }
});
KISSY.add('html-parser/scanners/cdata-scanner', [], function (S, require, exports, module) {
    /**
 * @ignore
 * scanner cdata (script/textarea/style)
 * @author yiminghe@gmail.com
 */
    exports.scan = function (tag, lexer, opts) {
        // only terminate when encounter </tag>
        // <textarea><div></div></textarea>
        var content = lexer.parseCDATA(opts.quoteSmart, tag.nodeName), position = lexer.getPosition(), node = lexer.nextNode();
        if (node) {
            // 这段应该永远不会执行到的
            if (node.nodeType !== 1 || !(node.isEndTag() && node.tagName === tag.tagName)) {
                lexer.setPosition(position);
                node = null;
            }
        }
        tag.closed = true;
        if (content) {
            tag.appendChild(content);
        }
    };
});
KISSY.add('html-parser/scanners/textarea-scanner', [
    './cdata-scanner',
    './special-scanners'
], function (S, require, exports, module) {
    /**
 * @ignore
 * textarea data scanner
 * @author yiminghe@gmail.com
 */
    var CDataScanner = require('./cdata-scanner');
    var SpecialScanners = require('./special-scanners');
    module.exports = SpecialScanners.textarea = {
        scan: function (tag, lexer, opts) {
            opts = opts || {};
            CDataScanner.scan(tag, lexer, opts);
        }
    };
});
KISSY.add('html-parser/writer/basic', ['../utils'], function (S, require, exports, module) {
    /**
 * @ignore
 * basic writer for inheritance
 * @author yiminghe@gmail.com
 */
    var Utils = require('../utils');
    var isBooleanAttribute = Utils.isBooleanAttribute;
    function escapeAttrValue(str) {
        return String(str).replace(/'/g, '&quot;');
    }    /**
 * BasicWriter for html content
 * @class KISSY.HtmlParser.BasicWriter
 */
    /**
 * BasicWriter for html content
 * @class KISSY.HtmlParser.BasicWriter
 */
    function BasicWriter() {
        this.output = [];
    }
    BasicWriter.prototype = {
        constructor: BasicWriter,
        append: function () {
            var o = this.output, args = arguments, arg;
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
            this.append('<', el.tagName);
        },
        openTagClose: function (el) {
            if (el.isSelfClosed) {
                this.append(' ', '/');
            }
            this.append('>');
        },
        closeTag: function (el) {
            this.append('</', el.tagName, '>');
        },
        attribute: function (attr) {
            var value = attr.value || '', name = attr.name;
            if (isBooleanAttribute(name) && !value) {
                value = name;
            }
            this.append(' ', name, '="', escapeAttrValue(value), '"');
        },
        text: function (text) {
            this.append(text);
        },
        cdata: function (cdata) {
            this.append(cdata);
        },
        comment: function (comment) {
            this.append('<!--' + comment + '-->');
        },
        /**
     * get the html content written to this writer
     * @returns {string}
     */
        getHtml: function () {
            return this.output.join('');
        }
    };
    module.exports = BasicWriter;
});
KISSY.add('html-parser/writer/beautify', [
    './basic',
    '../dtd',
    '../utils',
    'util'
], function (S, require, exports, module) {
    /**
 * @ignore
 * format html prettily
 * @author yiminghe@gmail.com
 */
    var BasicWriter = require('./basic');
    var dtd = require('../dtd');
    var Utils = require('../utils');
    var util = require('util');
    function BeautifyWriter() {
        var self = this;
        BeautifyWriter.superclass.constructor.apply(self, arguments);    // tag in pre should not indent
                                                                         // space (\t\r\n ) in pre should not collapse
        // tag in pre should not indent
        // space (\t\r\n ) in pre should not collapse
        self.inPre = 0;
        self.indentChar = '\t';
        self.indentLevel = 0;    // whether to indent on current line
                                 // if already indent and then not line break ,next tag should not indent
        // whether to indent on current line
        // if already indent and then not line break ,next tag should not indent
        self.allowIndent = 0;
        self.rules = {};
        var beauty = util.merge(dtd.$nonBodyContent, dtd.$block, dtd.$listItem, dtd.$tableContent, {
                // may add unnecessary whitespaces
                select: 1,
                // add unnecessary whitespaces is ok for script and style
                script: 1,
                style: 1
            });
        for (var e in beauty) {
            // whether its tag/text children should indent
            self.setRules(e, {
                allowIndent: 1,
                breakBeforeOpen: 1,
                breakAfterOpen: 1,
                breakBeforeClose: 1,
                breakAfterClose: 1
            });
        }
        util.each([
            'p',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6'
        ], function (e) {
            // text paragraph does not allow
            self.setRules(e, {
                allowIndent: 0,
                breakAfterOpen: 0,
                breakBeforeClose: 0
            });
        });
        self.setRules('option', { breakBeforeOpen: 1 });
        self.setRules('optiongroup', { breakBeforeOpen: 1 });
        self.setRules('br', { breakAfterOpen: 1 });
        self.setRules('title', {
            allowIndent: 0,
            breakBeforeClose: 0,
            breakAfterOpen: 0
        });    // Disable indentation on <pre>.
        // Disable indentation on <pre>.
        self.setRules('pre', {
            breakAfterOpen: 1,
            allowIndent: 0
        });
    }
    util.extend(BeautifyWriter, BasicWriter, {
        indentation: function () {
            if (!this.inPre) {
                this.append(new Array(this.indentLevel + 1).join(this.indentChar));
            }    // already indent ,unless line break  it will not indent again
            // already indent ,unless line break  it will not indent again
            this.allowIndent = 0;
        },
        lineBreak: function () {
            var o = this.output;
            if (!this.inPre && o.length) {
                // prevent adding more \n between tags :
                // before : <div>\n<div>\n</div>\n</div> => <div>\n\t' '\n<div>
                // now : <div>\n<div>\n</div>\n</div> => <div>\n<div> => indentation =><div>\n\t<div>
                for (var j = o.length - 1; j >= 0; j--) {
                    if (!/[\r\n\t ]/.test(o[j])) {
                        break;
                    }
                }
                o.length = j + 1;
                this.append('\n');
            }    // allow indentation if encounter next tag
            // allow indentation if encounter next tag
            this.allowIndent = 1;
        },
        setRules: function (tagName, rule) {
            if (!this.rules[tagName]) {
                this.rules[tagName] = {};
            }
            util.mix(this.rules[tagName], rule);
        },
        openTag: function (el) {
            var tagName = el.tagName, rules = this.rules[tagName] || {};
            if (this.allowIndent) {
                this.indentation();
            } else if (rules.breakBeforeOpen) {
                this.lineBreak();
                this.indentation();
            }
            BeautifyWriter.superclass.openTag.apply(this, arguments);
        },
        openTagClose: function (el) {
            var tagName = el.tagName;
            var rules = this.rules[tagName] || {};
            if (el.isSelfClosed) {
                this.append(' />');
            } else {
                this.append('>');
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
        closeTag: function (el) {
            var self = this, tagName = el.tagName, rules = self.rules[tagName] || {};
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
            if (tagName === 'pre') {
                self.inPre = 0;
            }
            if (rules.breakAfterClose) {
                self.lineBreak();
            }
        },
        text: function (text) {
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
        comment: function (comment) {
            if (this.allowIndent) {
                this.indentation();
            }
            this.append('<!--' + comment + '-->');
        },
        cdata: function (text) {
            if (this.allowIndent) {
                this.indentation();
            }
            this.append(util.trim(text));
        }
    });
    module.exports = BeautifyWriter;
});
KISSY.add('html-parser/writer/minify', [
    './basic',
    '../utils',
    'util'
], function (S, require, exports, module) {
    /**
 * @ignore
 * write html into its minified form,thanks to kangax where minify algorithm comes from
 * @author yiminghe@gmail.com
 */
    var BasicWriter = require('./basic');
    var Utils = require('../utils');
    var util = require('util');
    var trim = util.trim, isBooleanAttribute = Utils.isBooleanAttribute, collapseWhitespace = Utils.collapseWhitespace, reEmptyAttribute = new RegExp('^(?:class|id|style|title|lang|dir|on' + '(?:focus|blur|change|click|dblclick|mouse(' + '?:down|up|over|move|out)|key(?:press|down|up)))$');
    function escapeAttrValue(str) {
        return String(str).replace(/"/g, '&quot;');
    }
    function canDeleteEmptyAttribute(tag, attr) {
        var attrValue = attr.value || '', attrName = attr.name;
        if (!trim(attrValue)) {
            return tag === 'input' && attrName === 'value' || reEmptyAttribute.test(attrName);
        }
        return 0;
    }
    function canRemoveAttributeQuotes(value) {
        // http://www.w3.org/TR/html5/syntax.html#unquoted
        // avoid \w, which could match unicode in some implementations
        return !/[ "'=<>`]/.test(value);
    }
    function isAttributeRedundant(el, attr) {
        var tag = el.nodeName, attrName = attr.name, attrValue = attr.value || '';
        attrValue = trim(attrValue.toLowerCase());
        return tag === 'script' && attrName === 'language' && attrValue === 'javascript' || tag === 'form' && attrName === 'method' && attrValue === 'get' || tag === 'input' && attrName === 'type' && attrValue === 'text' || tag === 'script' && attrName === 'type' && attrValue === 'text/javascript' || tag === 'style' && attrName === 'type' && attrValue === 'text/css' || tag === 'area' && attrName === 'shape' && attrValue === 'rect';
    }
    function isConditionalComment(text) {
        return /\[if[^\]]+\]/.test(text);
    }
    function isEventAttribute(attrName) {
        return /^on[a-z]+/.test(attrName);
    }
    function isUriTypeAttribute(attrName, tag) {
        return /^(?:a|area|link|base)$/.test(tag) && attrName === 'href' || tag === 'img' && /^(?:src|longdesc|usemap)$/.test(attrName) || tag === 'object' && /^(?:classid|codebase|data|usemap)$/.test(attrName) || tag === 'q' && attrName === 'cite' || tag === 'blockquote' && attrName === 'cite' || (tag === 'ins' || tag === 'del') && attrName === 'cite' || tag === 'form' && attrName === 'action' || tag === 'input' && (attrName === 'src' || attrName === 'usemap') || tag === 'head' && attrName === 'profile' || tag === 'script' && (attrName === 'src' || attrName === 'for');
    }
    function isNumberTypeAttribute(attrName, tag) {
        return /^(?:a|area|object|button)$/.test(tag) && attrName === 'tabindex' || tag === 'input' && (attrName === 'maxlength' || attrName === 'tabindex') || tag === 'select' && (attrName === 'size' || attrName === 'tabindex') || tag === 'textarea' && /^(?:rows|cols|tabindex)$/.test(attrName) || tag === 'colgroup' && attrName === 'span' || tag === 'col' && attrName === 'span' || (tag === 'th' || tag === 'td') && (attrName === 'rowspan' || attrName === 'colspan');
    }
    function cleanAttributeValue(el, attr) {
        var tag = el.nodeName, attrName = attr.name, attrValue = attr.value || '';
        if (isEventAttribute(attrName)) {
            attrValue = trim(attrValue).replace(/^javascript:[\s\xa0]*/i, '').replace(/[\s\xa0]*;$/, '');
        } else if (attrName === 'class') {
            attrValue = collapseWhitespace(trim(attrValue));
        } else if (isUriTypeAttribute(attrName, tag) || isNumberTypeAttribute(attrName, tag)) {
            attrValue = trim(attrValue);
        } else if (attrName === 'style') {
            attrValue = trim(attrValue).replace(/[\s\xa0]*;[\s\xa0]*$/, '');
        }
        return attrValue;
    }
    function cleanConditionalComment(comment) {
        return comment.replace(/^(\[[^\]]+\]>)[\s\xa0]*/, '$1').replace(/[\s\xa0]*(<!\[endif\])$/, '$1');
    }
    function removeCDATASections(text) {
        return trim(text)    // "/* <![CDATA[ */" or "// <![CDATA["
.replace(/^(?:[\s\xa0]*\/\*[\s\xa0]*<!\[CDATA\[[\s\xa0]*\*\/|[\s\xa0]*\/\/[\s\xa0]*<!\[CDATA\[.*)/, '')    // [\s\xa0]* ??
                                                                                                           // "/* ]]> */" or "// ]]>"
.replace(/(?:\/\*[\s\xa0]*\]\]>[\s\xa0]*\*\/|\/\/[\s\xa0]*\]\]>)[\s\xa0]*$/, '');
    }    /**
 * MinifyWriter for html content
 * @class KISSY.HtmlParser.MinifyWriter
 * @extends KISSY.HtmlParser.BasicWriter
 */
    /**
 * MinifyWriter for html content
 * @class KISSY.HtmlParser.MinifyWriter
 * @extends KISSY.HtmlParser.BasicWriter
 */
    function MinifyWriter() {
        var self = this;
        MinifyWriter.superclass.constructor.apply(self, arguments);
        self.inPre = 0;
    }
    util.extend(MinifyWriter, BasicWriter, {
        /**
     * remove non-conditional comment
     */
        comment: function (text) {
            if (isConditionalComment(text)) {
                text = cleanConditionalComment(text);
                MinifyWriter.superclass.comment.call(this, text);
            }
        },
        /**
     * record pre track
     */
        openTag: function (el) {
            var self = this;
            if (el.tagName === 'pre') {
                self.inPre = 1;
            }
            MinifyWriter.superclass.openTag.apply(self, arguments);
        },
        /**
     * clean pre track
     */
        closeTag: function (el) {
            var self = this;
            if (el.tagName === 'pre') {
                self.inPre = 0;
            }
            MinifyWriter.superclass.closeTag.apply(self, arguments);
        },
        /**
     * textarea | script | style
     */
        cdata: function (cdata) {
            cdata = removeCDATASections(cdata);
            MinifyWriter.superclass.cdata.call(this, cdata);
        },
        attribute: function (attr, el) {
            var self = this, name = attr.name, normalizedValue, value = attr.value || '';    // remove empty attribute
            // remove empty attribute
            if (canDeleteEmptyAttribute(el, attr) || // remove redundant attribute
                isAttributeRedundant(el, attr)) {
                return;
            }
            if (isBooleanAttribute(name)) {
                // collapse boolean attributes
                self.append(' ', name);
                return;
            }    // clean attribute value
            // clean attribute value
            normalizedValue = escapeAttrValue(cleanAttributeValue(el, attr));
            if (!(value && canRemoveAttributeQuotes(value))) {
                // remove quote if value is not empty
                normalizedValue = '"' + normalizedValue + '"';
            }
            self.append(' ', name, '=', normalizedValue);
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
    module.exports = MinifyWriter;    /*
 refer :
 - https://github.com/kangax/html-minifier/
 */
});
KISSY.add('html-parser/writer/filter', ['util'], function (S, require, exports, module) {
    /**
 * @ignore
 * filter dom tree to html string form,api designed by ckeditor
 * @author yiminghe@gmail.com
 */
    var util = require('util');    /**
 * Filter for Html Parse Writer
 * @class KISSY.HtmlParser.Filter
 */
    /**
 * Filter for Html Parse Writer
 * @class KISSY.HtmlParser.Filter
 */
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
            var items = arr[i].value;    /*jshint loopfunc:true*/
            /*jshint loopfunc:true*/
            util.each(items, function (item) {
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
            }    // node can be replaced with another node
            // node can be replaced with another node
            if (el && ret && ret !== el) {
                // text filter can return string value directly
                if (typeof ret === 'string') {
                    if (el.toHtml() === ret) {
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
            var item = arr[i].value, ret, name = attrNode.name;
            if (item[name] && (ret = item[name].call(null, attrNode.value, el)) === false) {
                return ret;
            }    // 2012.06.26 change attribute value
            // 2012.06.26 change attribute value
            if (typeof ret === 'string') {
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
            return filterFn.call(this, this.text, [
                el.toHtml(),
                el
            ], el);
        },
        onCData: function (el) {
            return filterFn.call(this, this.cdata, [
                el.toHtml(),
                el
            ], el);
        },
        onAttribute: function (attrNode, el) {
            return filterAttr(this.attributes, attrNode, el, attrNode);
        },
        onComment: function (el) {
            return filterFn.call(this, this.comment, [
                el.toHtml(),
                el
            ], el);
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
            var filters = [
                    '^',
                    el.tagName,
                    '$'
                ], tags = this.tags, ret;
            for (var i = 0; i < filters.length; i++) {
                var filter = filters[i];
                for (var j = 0; j < tags.length; j++) {
                    var element = tags[j].value;
                    if (element[filter]) {
                        // node is removed with its children
                        if ((ret = element[filter](el)) === false) {
                            return false;
                        }    // node is replaced with another node
                        // node is replaced with another node
                        if (ret && ret !== el) {
                            return this.onNode(ret);
                        }    // node is removed (children preserved)
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
    module.exports = Filter;
});
