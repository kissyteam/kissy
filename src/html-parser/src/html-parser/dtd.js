/**
 * @ignore
 * modified from ckeditor dtd by yiminghe, support html5 tag and dtd
 * @author yimingh@gmail.com
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.add(function (S) {
    var merge = S.merge,
        A = {'isindex': 1, 'fieldset': 1},
        B = {'input': 1, 'button': 1, 'select': 1, 'textarea': 1, 'label': 1},
        C = merge({'a': 1}, B),
        D = merge({'iframe': 1}, C),
        E = {
            'hr': 1,
            'ul': 1,
            'menu': 1,
            'div': 1,
            'blockquote': 1,
            'noscript': 1,
            'table': 1,
            'center': 1,
            'address': 1,
            'dir': 1,
            'pre': 1,
            'h5': 1,
            'dl': 1,
            'h4': 1,
            'noframes': 1,
            'h6': 1,
            'ol': 1,
            'h1': 1,
            'h3': 1,
            'h2': 1
        },
        F = {
            'ins': 1,
            'del': 1,
            'script': 1,
            'style': 1
        },
        G = merge({
            'b': 1,
            'acronym': 1,
            'bdo': 1,
            'var': 1,
            '#text': 1,
            'abbr': 1,
            'code': 1,
            'br': 1,
            'i': 1,
            'cite': 1,
            'kbd': 1,
            'u': 1,
            'strike': 1,
            's': 1,
            'tt': 1,
            'strong': 1,
            'q': 1,
            'samp': 1,
            'em': 1,
            'dfn': 1,
            'span': 1
        }, F),
        H = merge({
            'sub': 1,
            'img': 1,
            'object': 1,
            'sup': 1,
            'basefont': 1,
            'map': 1,
            'applet': 1,
            'font': 1,
            'big': 1,
            'small': 1
        }, G),
        I = merge({'p': 1}, H),
        J = merge({'iframe': 1}, H, B),
        K = {
            'img': 1,
            'noscript': 1,
            'br': 1,
            'kbd': 1,
            'center': 1,
            'button': 1,
            'basefont': 1,
            'h5': 1,
            'h4': 1,
            'samp': 1,
            'h6': 1,
            'ol': 1,
            'h1': 1,
            'h3': 1,
            'h2': 1,
            'form': 1,
            'font': 1,
            '#text': 1,
            'select': 1,
            'menu': 1,
            'ins': 1,
            'abbr': 1,
            'label': 1,
            'code': 1,
            'table': 1,
            'script': 1,
            'cite': 1,
            'input': 1,
            'iframe': 1,
            'strong': 1,
            'textarea': 1,
            'noframes': 1,
            'big': 1,
            'small': 1,
            'span': 1,
            'hr': 1,
            'sub': 1,
            'bdo': 1,
            'var': 1,
            'div': 1,
            'object': 1,
            'sup': 1,
            'strike': 1,
            'dir': 1,
            'map': 1,
            'dl': 1,
            'applet': 1,
            'del': 1,
            'isindex': 1,
            'fieldset': 1,
            'ul': 1,
            'b': 1,
            'acronym': 1,
            'a': 1,
            'blockquote': 1,
            'i': 1,
            'u': 1,
            's': 1,
            'tt': 1,
            'address': 1,
            'q': 1,
            'pre': 1,
            'p': 1,
            'em': 1,
            'dfn': 1
        },
        L = merge({'a': 1}, J),
        M = {'tr': 1},
        N = {'#text': 1},
        O = merge({'param': 1}, K),
        P = merge({'form': 1}, A, D, E, I),
        Q = {'li': 1},
        R = {'style': 1, 'script': 1},
        headTags = {'base': 1, 'link': 1, 'meta': 1, 'title': 1},
        T = merge(headTags, R),
        U = {'head': 1, 'body': 1},
        V = {'html': 1};

    var block = {
        'address': 1,
        'blockquote': 1,
        'center': 1,
        'dir': 1,
        'div': 1,
        'dl': 1,
        'fieldset': 1,
        'form': 1,
        'h1': 1,
        'h2': 1,
        'h3': 1,
        'h4': 1,
        'h5': 1,
        'h6': 1,
        'hr': 1,
        'isindex': 1,
        'menu': 1,
        'noframes': 1,
        'ol': 1,
        'p': 1,
        'pre': 1,
        'table': 1,
        'ul': 1
    };

    /**
     * Holds and object representation of the HTML DTD to be used by the editor in
     * its internal operations.
     *
     * Each element in the DTD is represented by a
     * property in this object. Each property contains the list of elements that
     * can be contained by the element. Text is represented by the '#text' property.
     *
     * Several special grouping properties are also available. Their names start
     * with the '$' character.
     *
     * @class KISSY.HtmlParser.Dtd
     * @singleton
     *
     *
     *      // Check if 'div' can be contained in a 'p' element.
     *      alert( !!dtd[ 'p' ][ 'div' ] );  'false'
     *      // Check if 'p' can be contained in a 'div' element.
     *      alert( !!dtd[ 'div' ][ 'p' ] );  'true'
     *      // Check if 'p' is a block element.
     *      alert( !!dtd.$block[ 'p' ] );  'true'
     */
    var dtd = {
        /**
         * The '$' items have been added manually.
         * List of elements living outside body.
         */
        $nonBodyContent: merge(V, U, headTags),

        /**
         * List of block elements, like 'p' or 'div'.
         * @type {Object}
         */
        $block: block,

        /**
         * List of block limit elements.
         * @type {Object}
         */
        $blockLimit: {'body': 1, 'div': 1, 'td': 1, 'th': 1, 'caption': 1, 'form': 1 },

        /**
         * List of inline elements
         * @type {Object}
         */
        $inline: L,    // Just like span.

        /**
         * elements which can be include in body
         * @type {Object}
         */
        $body: merge({'script': 1, 'style': 1}, block),

        /**
         * cdata elements
         * @type {Object}
         */
        $cdata: {'script': 1, 'style': 1},

        /**
         * List of empty (self-closing) elements, like 'br' or 'img'.
         * @type {Object}
         */
        $empty: {'area': 1, 'base': 1, 'br': 1, 'col': 1, 'hr': 1, 'img': 1, 'input': 1, 'link': 1, 'meta': 1, 'param': 1},

        /**
         * List of list item elements, like 'li' or 'dd'.
         * @type {Object}
         */
        $listItem: {'dd': 1, 'dt': 1, 'li': 1},

        /**
         * List of list root elements.
         * @type {Object}
         */
        $list: {'ul': 1, 'ol': 1, 'dl': 1},

        /**
         * Elements that accept text nodes, but are not possible to edit into
         * the browser.
         * @type {Object}
         */
        $nonEditable: {
            'applet': 1,
            'button': 1,
            'embed': 1,
            'iframe': 1,
            'map': 1,
            'object': 1,
            'option': 1,
            'script': 1,
            'textarea': 1,
            'param': 1
        },

        /**
         * List of elements that can be ignored if empty, like 'b' or 'span'.
         * @type {Object}
         */
        $removeEmpty: {
            'abbr': 1,
            'acronym': 1,
            'address': 1,
            'b': 1,
            'bdo': 1,
            'big': 1,
            'cite': 1,
            'code': 1,
            'del': 1,
            'dfn': 1,
            'em': 1,
            'font': 1,
            'i': 1,
            'ins': 1,
            'label': 1,
            'kbd': 1,
            'q': 1,
            's': 1,
            'samp': 1,
            'small': 1,
            'span': 1,
            'strike': 1,
            'strong': 1,
            'sub': 1,
            'sup': 1,
            'tt': 1,
            'u': 1,
            'var': 1
        },

        /**
         * List of elements that have tabindex set to zero by default.
         * @type {Object}
         */
        $tabIndex: {
            'a': 1,
            'area': 1,
            'button': 1,
            'input': 1,
            'object': 1,
            'select': 1,
            'textarea': 1
        },

        /**
         * List of elements used inside the 'table' element, like 'tbody' or 'td'.
         * @type {Object}
         */
        $tableContent: {
            'caption': 1,
            'col': 1,
            'colgroup': 1,
            'tbody': 1,
            'td': 1,
            'tfoot': 1,
            'th': 1,
            'thead': 1,
            'tr': 1
        },
        /**
         * List of elements used inside the 'html' element
         * @type {Object}
         */
        'html': U,
        /**
         * List of elements used inside the 'head' element
         * @type {Object}
         */
        'head': T,
        /**
         * List of elements used inside the 'style' element
         * @type {Object}
         */
        'style': N,
        /**
         * List of elements used inside the 'body' element
         * @type {Object}
         */
        'body': P,
        /**
         * List of elements used inside the 'base' element
         * @type {Object}
         */
        'base': {},
        /**
         * List of elements used inside the 'link' element
         * @type {Object}
         */
        'link': {},
        /**
         * List of elements used inside the 'meta' element
         * @type {Object}
         */
        'meta': {},
        /**
         * List of elements used inside the 'title' element
         * @type {Object}
         */
        'title': N,
        /**
         * List of elements used inside the 'col' element
         * @type {Object}
         */
        'col': {},
        /**
         * List of elements used inside the 'tr' element
         * @type {Object}
         */
        'tr': {
            'td': 1,
            'th': 1
        },
        /**
         * List of elements used inside the 'img' element
         * @type {Object}
         */
        'img': {},
        /**
         * List of elements used inside the 'colgroup' element
         * @type {Object}
         */
        'colgroup': {'col': 1},
        /**
         * List of elements used inside the 'noscript' element
         * @type {Object}
         */
        'noscript': P,
        /**
         * List of elements used inside the 'td' element
         * @type {Object}
         */
        'td': P,
        /**
         * List of elements used inside the 'br' element
         * @type {Object}
         */
        'br': {},
        /**
         * List of elements used inside the 'th' element
         * @type {Object}
         */
        'th': P,
        /**
         * List of elements used inside the 'center' element
         * @type {Object}
         */
        'center': P,
        /**
         * List of elements used inside the 'kbd' element
         * @type {Object}
         */
        'kbd': L,
        /**
         * List of elements used inside the 'button' element
         * @type {Object}
         */
        'button': merge(I, E),
        /**
         * List of elements used inside the 'basefont' element
         * @type {Object}
         */
        'basefont': {},
        /**
         * List of elements used inside the 'h5' element
         * @type {Object}
         */
        'h5': L,
        /**
         * List of elements used inside the 'h4' element
         * @type {Object}
         */
        'h4': L,
        /**
         * List of elements used inside the 'samp' element
         * @type {Object}
         */
        'samp': L,
        /**
         * List of elements used inside the 'h6' element
         * @type {Object}
         */
        'h6': L,
        /**
         * List of elements used inside the 'ol' element
         * @type {Object}
         */
        'ol': Q,
        /**
         * List of elements used inside the 'h1' element
         * @type {Object}
         */
        'h1': L,
        /**
         * List of elements used inside the 'h3' element
         * @type {Object}
         */
        'h3': L,
        /**
         * List of elements used inside the 'option' element
         * @type {Object}
         */
        'option': N,
        /**
         * List of elements used inside the 'h2' element
         * @type {Object}
         */
        'h2': L,
        /**
         * List of elements used inside the 'form' element
         * @type {Object}
         */
        'form': merge(A, D, E, I),
        /**
         * List of elements used inside the 'select' element
         * @type {Object}
         */
        'select': {
            'optgroup': 1,
            'option': 1
        },
        /**
         * List of elements used inside the 'font' element
         * @type {Object}
         */
        'font': L,
        /**
         * List of elements used inside the 'ins' element
         * @type {Object}
         */
        'ins': L,
        /**
         * List of elements used inside the 'menu' element
         * @type {Object}
         */
        'menu': Q,
        /**
         * List of elements used inside the 'abbr' element
         * @type {Object}
         */
        'abbr': L,
        /**
         * List of elements used inside the 'label' element
         * @type {Object}
         */
        'label': L,
        /**
         * List of elements used inside the 'table' element
         * @type {Object}
         */
        'table': {
            'thead': 1,
            'col': 1,
            'tbody': 1,
            'tr': 1,
            'colgroup': 1,
            'caption': 1,
            'tfoot': 1
        },
        /**
         * List of elements used inside the 'code' element
         * @type {Object}
         */
        'code': L,
        /**
         * List of elements used inside the 'script' element
         * @type {Object}
         */
        'script': N,
        /**
         * List of elements used inside the 'tfoot' element
         * @type {Object}
         */
        'tfoot': M,
        /**
         * List of elements used inside the 'cite' element
         * @type {Object}
         */
        'cite': L,
        /**
         * List of elements used inside the 'li' element
         * @type {Object}
         */
        'li': P,
        /**
         * List of elements used inside the 'input' element
         * @type {Object}
         */
        'input': {},
        /**
         * List of elements used inside the 'iframe' element
         * @type {Object}
         */
        'iframe': P,
        /**
         * List of elements used inside the 'strong' element
         * @type {Object}
         */
        'strong': L,
        /**
         * List of elements used inside the 'textarea' element
         * @type {Object}
         */
        'textarea': N,
        /**
         * List of elements used inside the 'noframes' element
         * @type {Object}
         */
        'noframes': P,
        /**
         * List of elements used inside the 'big' element
         * @type {Object}
         */
        'big': L,
        /**
         * List of elements used inside the 'small' element
         * @type {Object}
         */
        'small': L,
        /**
         * List of elements used inside the 'span' element
         * @type {Object}
         */
        'span': L,
        /**
         * List of elements used inside the 'hr' element
         * @type {Object}
         */
        'hr': {},
        /**
         * List of elements used inside the 'dt' element
         * @type {Object}
         */
        'dt': L,
        /**
         * List of elements used inside the 'sub' element
         * @type {Object}
         */
        'sub': L,
        /**
         * List of elements used inside the 'optgroup' element
         * @type {Object}
         */
        'optgroup': {'option': 1},
        /**
         * List of elements used inside the 'param' element
         * @type {Object}
         */
        'param': {},
        /**
         * List of elements used inside the 'bdo' element
         * @type {Object}
         */
        'bdo': L,
        /**
         * List of elements used inside the 'var' element
         * @type {Object}
         */
        'var': L,
        /**
         * List of elements used inside the 'div' element
         * @type {Object}
         */
        'div': P,
        /**
         * List of elements used inside the 'object' element
         * @type {Object}
         */
        'object': O,
        /**
         * List of elements used inside the 'sup' element
         * @type {Object}
         */
        'sup': L,
        /**
         * List of elements used inside the 'dd' element
         * @type {Object}
         */
        'dd': P,
        /**
         * List of elements used inside the 'strike' element
         * @type {Object}
         */
        'strike': L,
        /**
         * List of elements used inside the 'area' element
         * @type {Object}
         */
        'area': {},
        /**
         * List of elements used inside the 'dir' element
         * @type {Object}
         */
        'dir': Q,
        /**
         * List of elements used inside the 'map' element
         * @type {Object}
         */
        'map': merge({'area': 1, 'form': 1, 'p': 1}, A, F, E),
        /**
         * List of elements used inside the 'applet' element
         * @type {Object}
         */
        'applet': O,
        /**
         * List of elements used inside the 'dl' element
         * @type {Object}
         */
        'dl': {'dt': 1, 'dd': 1},
        /**
         * List of elements used inside the 'del' element
         * @type {Object}
         */
        'del': L,
        /**
         * List of elements used inside the 'isindex' element
         * @type {Object}
         */
        'isindex': {},
        /**
         * List of elements used inside the 'fieldset' element
         * @type {Object}
         */
        'fieldset': merge({
            legend: 1
        }, K),
        /**
         * List of elements used inside the 'thead' element
         * @type {Object}
         */
        'thead': M,
        /**
         * List of elements used inside the 'ul' element
         * @type {Object}
         */
        'ul': Q,
        /**
         * List of elements used inside the 'acronym' element
         * @type {Object}
         */
        'acronym': L,
        /**
         * List of elements used inside the 'b' element
         * @type {Object}
         */
        'b': L,
        /**
         * List of elements used inside the 'a' element
         * @type {Object}
         */
        'a': J,
        /**
         * List of elements used inside the 'blockquote' element
         * @type {Object}
         */
        'blockquote': P,
        /**
         * List of elements used inside the 'caption' element
         * @type {Object}
         */
        'caption': L,
        /**
         * List of elements used inside the 'i' element
         * @type {Object}
         */
        'i': L,
        /**
         * List of elements used inside the 'u' element
         * @type {Object}
         */
        'u': L,
        /**
         * List of elements used inside the 'tbody' element
         * @type {Object}
         */
        'tbody': M,
        /**
         * List of elements used inside the 's' element
         * @type {Object}
         */
        's': L,
        /**
         * List of elements used inside the 'address' element
         * @type {Object}
         */
        'address': merge(D, I),
        /**
         * List of elements used inside the 'tt' element
         * @type {Object}
         */
        'tt': L,
        /**
         * List of elements used inside the 'legend' element
         * @type {Object}
         */
        'legend': L,
        /**
         * List of elements used inside the 'q' element
         * @type {Object}
         */
        'q': L,
        /**
         * List of elements used inside the 'pre' element
         * @type {Object}
         */
        'pre': merge(G, C),
        /**
         * List of elements used inside the 'p' element
         * @type {Object}
         */
        'p': L,
        /**
         * List of elements used inside the 'em' element
         * @type {Object}
         */
        'em': L,
        /**
         * List of elements used inside the 'dfn' element
         * @type {Object}
         */
        'dfn': L
    };

    (function () {
        var i,
            html5Tags = [
                'article', 'figure', 'nav',
                'aside', 'section', 'footer'
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

        dtd.$empty['!doctype'] = 1;
    })();

    return dtd;
});
