/**
 * @module  dom-offset
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-offset', function(S, undefined) {

    var DOM = S.DOM, UA = S.UA,
        win = window,
        doc = document,
        docElem = doc.documentElement,
        isStrict = doc.compatMode === 'CSS1Compat',
        MAX = Math.max,
        PARSEINT = parseInt,
        POSITION = 'position',
        RELATIVE = 'relative',
        OWNER_DOCUMENT = 'ownerDocument',
        GET_BOUNDING_CLIENT_RECT = 'getBoundingClientRect';

    S.mix(DOM, {
        /**
         * get elment's coordinate in page
         * @param elem
         * @param val/refDocument
         */
        offset: function(elem, val) {
            // ownerDocument 的判断可以保证 elem 没有游离在 document 之外（比如 fragment）
            if (!(elem = S.get(elem)) || !elem[OWNER_DOCUMENT]) return null;

            // getter and val is outside document
            if (val === undefined || (val && val.writeln)) {
                var refDocument = val;
                return getOffset(elem, refDocument);
            }

            // setter
            setOffset(elem, val);
        },

        /**
         * Returns the left scroll value of the document.
         */
        scrollLeft: function() {
            return _scrollLeft(win, docElem, doc);
        },

        /**
         * Returns the top scroll value of the document.
         */
        scrollTop: function() {
            return _scrollTop(win, docElem, doc);
        },

        /**
         * Returns the height of the document.
         */
        docHeight: function() {
            return MAX(!isStrict ? doc.body.scrollHeight : docElem.scrollHeight, DOM.viewportHeight());
        },

        /**
         * Returns the width of the document.
         */
        docWidth: function() {
            return MAX(!isStrict ? doc.body.scrollWidth : docElem.scrollWidth, DOM.viewportWidth());
        },

        /**
         * Returns the current height of the viewport.
         */
        viewportHeight: function() {
            return UA.ie ?
                (isStrict ? docElem.clientHeight : doc.body.clientHeight) :
                win.innerHeight;
        },

        /**
         * Returns the current width of the viewport.
         */
        viewportWidth: function() {
            return !isStrict && !UA.opera ? doc.body.clientWidth :
                UA.ie ? docElem.clientWidth : win.innerWidth;
        },

        /**
         * make elem visible in container
         * @param container
         * @refer:http://yiminghe.javaeye.com/blog/390732
         */
        scrollIntoView :function(elem, container) {
            if (!(elem = S.get(elem)) || !elem[OWNER_DOCUMENT]) return null;
            container = (
                container !== doc.documentElement && container !== doc.body
                ) ? container : null;
            var elemOffset = DOM.offset(elem),
                cl = container ? container.scrollLeft : DOM.scrollLeft(),
                ct = container ? container.scrollTop : DOM.scrollTop(),
                //import! viewport should has
                containerOffset = container ? DOM.offset(container) : {left:cl,top:ct},
                diff = {
                    left:elemOffset.left - containerOffset.left  ,
                    top:elemOffset.top - containerOffset.top
                },


                eh = elem.offsetHeight,
                ew = elem.offsetWidth,
                //left
                l = diff.left + cl,
                //top
                t = diff.top + ct,
                b = t + elem.offsetHeight,
                r = l + elem.offsetWidth,
                ch = container ? container.clientHeight : DOM.viewportHeight(),
                cw = container ? container.clientWidth : DOM.viewportWidth(),
                //container视窗下doc高度下限
                cb = ct + ch,
                //container视窗下doc右边限
                cr = cl + cw;
            //used if container is window 
            var wl = 0,wt = 0;
            if (eh > ch || t < ct) {
                if (container)
                    container.scrollTop = t;
                else
                    wt = t;
            } else if (b > cb) {
                if (container)
                    container.scrollTop = t;
                else
                    wt = t;
            }

            if (ew > cw || l < cl) {
                if (container)
                    container.scrollLeft = l;
                else
                    wl = l;
            } else if (r > cr) {
                if (container)
                    container.scrollLeft = l;
                else
                    wl = l;
            }
            if (wl || wt) {
                win.scrollTo(wl, wt);
            }

            //TODO! show element properly

        }
    });

    function _scrollLeft(win, docElem, doc) {
        return win.pageXOffset || docElem.scrollLeft || doc.body.scrollLeft;
    }

    function _scrollTop(win, docElem, doc) {
        return win.pageYOffset || docElem.scrollTop || doc.body.scrollTop;
    }

    /**
     * support elment in iframe
     * @param elem
     * @param refDocument
     */
    function getOffset(elem, refDocument) {
        var box, x = 0,
            y = 0,
            currentWindow = elem.ownerDocument.defaultView || elem.ownerDocument.parentWindow,
            currentDoc = elem.ownerDocument,
            currentDocElem = currentDoc.documentElement;

        // 1. 对于 body 和 docElem, 直接返回 0, 绝大部分情况下，这都不会有问题
        // 2. 根据 GBS 最新数据，A-Grade Browsers 都已支持 getBoundingClientRect 方法，不用再考虑传统的实现方式
        if (elem[GET_BOUNDING_CLIENT_RECT]) {
            if (elem !== currentDoc.body && currentDocElem !== elem) {
                box = elem[GET_BOUNDING_CLIENT_RECT]();

                // 注：jQuery 还考虑减去 docElem.clientLeft/clientTop
                // 但测试发现，这样反而会导致当 html 和 body 有边距/边框样式时，获取的值不正确
                // 此外，ie6 会忽略 html 的 margin 值，幸运地是没有谁会去设置 html 的 margin

                x = box.left + _scrollLeft(currentWindow, currentDocElem, currentDoc);
                y = box.top + _scrollTop(currentWindow, currentDocElem, currentDoc);
            }
            if (refDocument) {
                var refWindow = refDocument.defaultView || refDocument.parentWindow;
                if (currentWindow != refWindow && currentWindow.frameElement) {
                    //note:when iframe is static ,still some mistake
                    var iframePosition = DOM.offset(currentWindow.frameElement, refDocument);
                    x += iframePosition.left;
                    y += iframePosition.top;
                }
            }

        }

        return { left: x, top: y };
    }

    function setOffset(elem, offset) {
        var position = DOM.css(elem, POSITION);

        // set position first, in-case top/left are set even on static elem
        if (position === 'static') {
            position = elem.style[POSITION] = RELATIVE;
        }

        var old = getOffset(elem),
            relative = (position === RELATIVE),v = {};

        if ("left" in offset) {
            var left = PARSEINT(DOM.css(elem, 'left'), 10);
            v.left = left + offset.left - old.left;
        }
        if ("top" in offset) {
            var top = PARSEINT(DOM.css(elem, 'top'), 10);
            v.top = top + offset.top - old.top;
        }
        DOM.css(elem, v);
    }
});

/**
 * TODO:
 *  - 考虑是否实现 jQuery 的 position, offsetParent 等功能
 *  - 更详细的测试用例（比如：测试 position 为 fixed 的情况）
 *
 */
