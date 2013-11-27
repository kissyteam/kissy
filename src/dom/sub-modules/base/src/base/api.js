/**
 * @ignore
 * dom
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add(function (S) {
    var WINDOW = S.Env.host || {},
        DOCUMENT = WINDOW.document,
        UA = S.UA,
        RE_NUM = /[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source,
        /**
         * Dom Element node type.
         * @enum {Number} KISSY.DOM.NodeType
         */
            NodeType = {
            /**
             * element type
             */
            ELEMENT_NODE: 1,
            /**
             * attribute node type
             */
            'ATTRIBUTE_NODE': 2,
            /**
             * text node type
             */
            TEXT_NODE: 3,
            /**
             * cdata node type
             */
            'CDATA_SECTION_NODE': 4,
            /**
             * entity reference node type
             */
            'ENTITY_REFERENCE_NODE': 5,
            /**
             * entity node type
             */
            'ENTITY_NODE': 6,
            /**
             * processing instruction node type
             */
            'PROCESSING_INSTRUCTION_NODE': 7,
            /**
             * comment node type
             */
            COMMENT_NODE: 8,
            /**
             * document node type
             */
            DOCUMENT_NODE: 9,
            /**
             * document type
             */
            'DOCUMENT_TYPE_NODE': 10,
            /**
             * document fragment type
             */
            DOCUMENT_FRAGMENT_NODE: 11,
            /**
             * notation type
             */
            'NOTATION_NODE': 12
        },
        /**
         * KISSY Dom Utils.
         * Provides Dom helper methods.
         * @class KISSY.DOM
         * @singleton
         */
            Dom = {

            /**
             * Whether has been set a custom domain.
             * Note not perfect: localhost:8888, domain='localhost'
             * @param {Window} [win] Test window. Default current window.
             * @return {Boolean}
             */
            isCustomDomain: function (win) {
                win = win || WINDOW;
                win = Dom.get(win);
                var domain = win.document.domain,
                    hostname = win.location.hostname;
                return domain !== hostname &&
                    domain !== ( '[' + hostname + ']' );	// IPv6 IP support
            },

            /**
             * Get appropriate src for new empty iframe.
             * Consider custom domain.
             * @param {Window} [win] Window new iframe will be inserted into.
             * @return {String} Src for iframe.
             */
            getEmptyIframeSrc: function (win) {
                win = win || WINDOW;
                win = Dom.get(win);
                if (UA.ie && Dom.isCustomDomain(win)) {
                    /*jshint scripturl: true*/
                    return  'javascript:void(function(){' + encodeURIComponent(
                        'document.open();' +
                            'document.domain="' +
                            win.document.domain + '";' +
                            'document.close();') + '}())';
                }
                return '';
            },

            NodeType: NodeType,

            /**
             * Return corresponding window if elem is document or window.
             * Return global window if elem is undefined
             * Else return false.
             * @param {undefined|Window|HTMLDocument} [elem]
             * @return {Window|Boolean}
             */
            getWindow: function (elem) {
                if (!elem) {
                    return WINDOW;
                }

                elem = Dom.get(elem);

                if (S.isWindow(elem)) {
                    return elem;
                }

                var doc = elem;

                if (doc.nodeType !== NodeType.DOCUMENT_NODE) {
                    doc = elem.ownerDocument;
                }

                return doc.defaultView || doc.parentWindow;
            },


            /**
             * Return corresponding document of this element.
             * @param {HTMLElement|Window|HTMLDocument} [elem]
             * @return {HTMLDocument}
             */
            getDocument: function (elem) {
                if (!elem) {
                    return DOCUMENT;
                }
                elem = Dom.get(elem);
                return S.isWindow(elem) ?
                    elem.document :
                    (elem.nodeType === NodeType.DOCUMENT_NODE ?
                        elem :
                        elem.ownerDocument);
            },

            isDomNodeList: function (o) {
                // 注1：ie 下，有 window.item, typeof node.item 在 ie 不同版本下，返回值不同
                // 注2：select 等元素也有 item, 要用 !node.nodeType 排除掉
                // 注3：通过 namedItem 来判断不可靠
                // 注4：getElementsByTagName 和 querySelectorAll 返回的集合不同
                // 注5: 考虑 iframe.contentWindow
                return o && !o.nodeType && o.item && !o.setTimeout;
            },

            /**
             * Get node 's nodeName in lowercase.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements.
             * @return {String} el 's nodeName in lowercase
             */
            nodeName: function (selector) {
                var el = Dom.get(selector),
                    nodeName = el.nodeName.toLowerCase();
                // http://msdn.microsoft.com/en-us/library/ms534388(VS.85).aspx
                if (UA.ie) {
                    var scopeName = el.scopeName;
                    if (scopeName && scopeName !== 'HTML') {
                        nodeName = scopeName.toLowerCase() + ':' + nodeName;
                    }
                }
                return nodeName;
            },

            _RE_NUM_NO_PX: new RegExp('^(' + RE_NUM + ')(?!px)[a-z%]+$', 'i')
        };

    S.mix(Dom, NodeType);

    return Dom;

});

/*
 2011-08
 - 添加节点类型枚举值，方便依赖程序清晰
 */
