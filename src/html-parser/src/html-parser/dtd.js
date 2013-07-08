/**
 * modified from ckeditor dtd by yiminghe, support html5 tag and dtd
 * @author yimingh@gmail.com
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.add("html-parser/dtd", function(KY) {
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
