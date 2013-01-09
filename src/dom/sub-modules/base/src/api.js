/**
 * @ignore
 * dom
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('dom/base/api', function (S) {

    var WINDOW = S.Env.host,
        UA = S.UA,
        RE_NUM = /[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source,
        /**
         * DOM Element node type.
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
        };
    /**
     * KISSY DOM Utils.
     * Provides DOM helper methods.
     * @class KISSY.DOM
     * @singleton
     */
    var DOM = {

        /**
         * Whether has been set a custom domain.
         * Note not perfect: localhost:8888, domain='localhost'
         * @param {window} [win] Test window. Default current window.
         * @return {Boolean}
         */
        isCustomDomain: function (win) {
            win = win || WINDOW;
            var domain = win.document.domain,
                hostname = win.location.hostname;
            return domain != hostname &&
                domain != ( '[' + hostname + ']' );	// IPv6 IP support
        },

        /**
         * Get appropriate src for new empty iframe.
         * Consider custom domain.
         * @param {window} [win] Window new iframe will be inserted into.
         * @return {String} Src for iframe.
         */
        getEmptyIframeSrc: function (win) {
            win = win || WINDOW;
            if (UA['ie'] && DOM.isCustomDomain(win)) {
                return  'javascript:void(function(){' + encodeURIComponent(
                    'document.open();' +
                        "document.domain='" +
                        win.document.domain
                        + "';" +
                        'document.close();') + '}())';
            }
            return '';
        },

        NodeType: NodeType,

        /**
         * Return corresponding window if elem is document or window.
         * Return global window if elem is undefined
         * Else return false.
         * @param {undefined|window|HTMLDocument} elem
         * @return {window|Boolean}
         */
        getWindow: function (elem) {
            if (!elem) {
                return WINDOW;
            }
            return ('scrollTo' in elem && elem['document']) ?
                elem : elem.nodeType == NodeType.DOCUMENT_NODE ?
                elem.defaultView || elem.parentWindow :
                false;
        },

        // Ref: http://lifesinger.github.com/lab/2010/nodelist.html
        _isNodeList: function (o) {
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
            var el = DOM.get(selector),
                nodeName = el.nodeName.toLowerCase();
            // http://msdn.microsoft.com/en-us/library/ms534388(VS.85).aspx
            if (UA['ie']) {
                var scopeName = el['scopeName'];
                if (scopeName && scopeName != 'HTML') {
                    nodeName = scopeName.toLowerCase() + ':' + nodeName;
                }
            }
            return nodeName;
        },

        _RE_NUM_NO_PX: new RegExp("^(" + RE_NUM + ")(?!px)[a-z%]+$", "i")
    };

    S.mix(DOM, NodeType);

    return DOM;

});

/*
 2011-08
 - 添加键盘枚举值，方便依赖程序清晰
 */
