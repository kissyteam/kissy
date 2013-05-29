/**
 * traversal ie hack
 * @author yiminghe@gmail.com
 */
KISSY.add('dom/ie/traversal', function (S, DOM) {

    DOM._contains = function (a, b) {
        if (a.nodeType == DOM.NodeType.DOCUMENT_NODE) {
            a = a.documentElement;
        }
        // !a.contains => a===document || text
        // 注意原生 contains 判断时 a===b 也返回 true
        b = b.parentNode;

        if (a == b) {
            return true;
        }

        // when b is document, a.contains(b) 不支持的接口 in ie
        if (b && b.nodeType == DOM.NodeType.ELEMENT_NODE) {
            return a.contains && a.contains(b);
        } else {
            return false;
        }
    };

}, {
    requires: ['dom/base']
});