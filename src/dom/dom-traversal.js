/**
 * @module  dom-traversal
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-traversal', function(S, undefined) {

    var DOM = S.DOM,
        isElementNode = DOM._isElementNode;

    S.mix(DOM, {

        /**
         * Gets the children of the first matched element.
         */
        children: function(elem) {
            var ret = [];
            if ((elem = S.get(elem))) {
                // 只有 firefox 的低版本不支持 children
                ret = elem.children ? S.makeArray(elem.children) : getSiblings(elem.firstChild);
            }
            return ret;
        },

        /**
         * Gets the siblings of the first matched element.
         */
        siblings: function(elem) {
            var ret = [];
            if ((elem = S.get(elem)) && elem.parentNode) {
                ret = getSiblings(elem.parentNode.firstChild, elem);
            }
            return ret;
        },

        /**
         * Gets the immediately following sibling of the element.
         */
        next: function(elem, n) {
            var ret = null;
            if ((elem = S.get(elem))) {
                ret = nth(elem, n === undefined ? 1 : n);
            }
            return ret;
        },

        /**
         * Gets the immediately preceding sibling of the element.
         */
        prev: function(elem, n) {
            return this.next(elem, n === undefined ? -1 : -n);
        },

        /**
         * Gets the parentNode of the elment.
         */
        parent: function(elem, n) {
            var parent = elem.parentNode;
            return parent && parent.nodeType !== 11 ? parent : null;
        }
    });

    // 获取元素 n 的所有 siblings, 不包括 elem
    function getSiblings(n/* first */, elem) {
        for (var r = [], j = 0; n; n = n.nextSibling) {
            if (isElementNode(n) && n !== elem) {
                r[j++] = n;
            }
        }
        return r;
    }

    // 获取元素 elem 在 d(irection) 上的第 n 个元素
    function nth(elem, n, d) {
        var ret = null;

        if ((elem = S.get(elem))) {
            n = n || 0;
            if(n === 0) return elem;

            if (d === undefined) d = n > 0 ? 'nextSibling' : 'previousSibling';
            if (n < 0) n = -n;

            for (var i = 0; n && (ret = elem[d]); ) {
                if (isElementNode(ret) && i++ === n) {
                    break;
                }
            }
        }

        return ret;
    }
});

/**
 * NOTES:
 *
 *  - api 的设计上，没有跟随 jQuery. 一是为了和其他 api 一致，保持 first-all 原则。二是从用户
 *    的期望出发，在不看文档、不做深思的情况下，用户光看方法名，期望方法具有怎样的功能。
 *
 */
