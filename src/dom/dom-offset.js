/**
 * @module  dom-offset
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-offset', function(S, undefined) {

    var DOM = S.DOM,
        win = window,
        doc = document,
        docElem = doc.documentElement,
        OWNER_DOCUMENT = 'ownerDocument',
        GET_BOUNDING_CLIENT_RECT = 'getBoundingClientRect';

    S.mix(DOM, {

        offset: function(elem, val) {
            if (!(elem = S.get(elem)) || !elem[OWNER_DOCUMENT]) return null;

            // getter
            if (val === undefined) {
                return getOffset(elem);
            }

            // setter
            setOffset(elem, val);
        },

        /**
         * Returns the left scroll value of the document.
         */
        scrollLeft: function() {
            return win.pageXOffset || docElem.scrollLeft || doc.body.scrollLeft;
        },

        /**
         * Returns the top scroll value of the document.
         */
        scrollTop: function() {
            return win.pageYOffset || docElem.scrollTop || doc.body.scrollTop;
        }
    });

    function getOffset(elem) {
        var box, x = 0, y = 0;

        // 1. 对于 body 和 docElem, 直接返回 0, 绝大部分情况下，这都不会有问题
        // 2. 根据 GBS 最新数据，A-Grade Browsers 都已支持 getBoundingClientRect 方法，不用再考虑传统的实现方式
        if (elem !== doc.body && elem !== docElem && elem[GET_BOUNDING_CLIENT_RECT]) {
            box = elem[GET_BOUNDING_CLIENT_RECT]();

            // 注：jQuery 还考虑减去 docElem.clientLeft/clientTop
            // 但测试发现，这样反而会导致当 html 和 body 有边距/边框样式时，获取的值不正确
            // 此外，ie6 会忽略 html 的 margin 值，幸运地是没有谁会去设置 html 的 margin

            x = box.left + DOM.scrollLeft();
            y = box.top + DOM.scrollTop();
        }

        return { left: x, top: y };
    }

    function setOffset(elem, val) {
        
    }
});

/**
 * TODO:
 *  - 考虑是否实现 jQuery 的 position, offsetParent 等功能
 *
 */
