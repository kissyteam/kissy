/**
 * @fileOverview dom
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('dom/base', function (S, UA, undefined) {

    var WINDOW = S.Env.host;

    var NODE_TYPE =
    /**
     * @lends DOM
     */
    {
        ELEMENT_NODE:1,
        "ATTRIBUTE_NODE":2,
        TEXT_NODE:3,
        "CDATA_SECTION_NODE":4,
        "ENTITY_REFERENCE_NODE":5,
        "ENTITY_NODE":6,
        "PROCESSING_INSTRUCTION_NODE":7,
        COMMENT_NODE:8,
        DOCUMENT_NODE:9,
        "DOCUMENT_TYPE_NODE":10,
        DOCUMENT_FRAGMENT_NODE:11,
        "NOTATION_NODE":12
    };
    var DOM = {

        /**
         * Whether has been set a custom domain,
         * @param {window} [win] Test window. Default current window.
         * @return {Boolean}
         */
        isCustomDomain:function (win) {
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
        getEmptyIframeSrc:function (win) {
            win = win || WINDOW;
            if (UA['ie'] && DOM.isCustomDomain(win)) {
                return  'javascript:void(function(){' + encodeURIComponent("" +
                    "document.open();" +
                    "document.domain='" +
                    win.document.domain
                    + "';" +
                    "document.close();") + "}())";
            }
            return undefined;
        },

        NodeTypes:NODE_TYPE,

        /**
         * Return corresponding window if elem is document or window or undefined.
         * Else return false.
         * @param {undefined|window|document} elem
         * @return {window|Boolean}
         */
        _getWin:function (elem) {
            if (elem == null) {
                return WINDOW;
            }
            return ('scrollTo' in elem && elem['document']) ?
                elem : elem.nodeType == DOM.DOCUMENT_NODE ?
                elem.defaultView || elem.parentWindow :
                false;
        },

        // Ref: http://lifesinger.github.com/lab/2010/nodelist.html
        _isNodeList:function (o) {
            // 注1：ie 下，有 window.item, typeof node.item 在 ie 不同版本下，返回值不同
            // 注2：select 等元素也有 item, 要用 !node.nodeType 排除掉
            // 注3：通过 namedItem 来判断不可靠
            // 注4：getElementsByTagName 和 querySelectorAll 返回的集合不同
            // 注5: 考虑 iframe.contentWindow
            return o && !o.nodeType && o.item && !o.setTimeout;
        },

        /**
         * Get node 's nodeName in lowercase.
         * @param {HTMLElement[]|String|HTMLElement|Node} selector Matched elements.
         * @return {String} el 's nodeName in lowercase
         */
        nodeName:function (selector) {
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
        }
    };

    S.mix(DOM, NODE_TYPE);

    return DOM;

}, {
    requires:['ua']
});

/**
 * 2011-08
 *  - 添加键盘枚举值，方便依赖程序清晰
 */
