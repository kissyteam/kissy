/**
 * @module  dom-offset
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-offset', function(S, undefined) {

    var DOM = S.DOM, UA = S.UA,
        win = window, doc = document,
        isElementNode = DOM._isElementNode,
        isStrict = doc.compatMode === 'CSS1Compat',
        MAX = Math.max, PARSEINT = parseInt,
        POSITION = 'position', RELATIVE = 'relative',
        DOCUMENT = 'document', BODY = 'body',
        DOC_ELEMENT = 'documentElement',
        OWNER_DOCUMENT = 'ownerDocument',
        VIEWPORT = 'viewport',
        SCROLL = 'scroll', CLIENT = 'client',
        LEFT = 'left', TOP = 'top',
        SCROLL_LEFT = SCROLL + 'Left', SCROLL_TOP = SCROLL + 'Top',
        GET_BOUNDING_CLIENT_RECT = 'getBoundingClientRect';

    S.mix(DOM, {

        /**
         * Gets the current coordinates of the element, relative to the document.
         */
        offset: function(elem, val) {
            // ownerDocument 的判断可以保证 elem 没有游离在 document 之外（比如 fragment）
            if (!(elem = S.get(elem)) || !elem[OWNER_DOCUMENT]) return null;

            // getter
            if (val === undefined) {
                return getOffset(elem);
            }

            // setter
            setOffset(elem, val);
        },

        /**
         * Makes elem visible in the container
         * @refer http://www.w3.org/TR/2009/WD-html5-20090423/editing.html#scrollIntoView
         *        http://www.sencha.com/deploy/dev/docs/source/Element.scroll-more.html#scrollIntoView
         *        http://yiminghe.javaeye.com/blog/390732
         */
        scrollIntoView: function(elem, container, top, hscroll) {
            if (!(elem = S.get(elem)) || !elem[OWNER_DOCUMENT]) return;

            container = S.get(container);
            hscroll = hscroll === undefined ? true : !!hscroll;
            top = top === undefined ? true : !!top;

            // default current window,use native for scrollIntoView(elem, top)
            if (!container || container === win) {
                // 注意：
                // 1. Opera 不支持 top 参数
                // 2. 当 container 已经在视窗中时，也会重新定位
                return elem.scrollIntoView(top);
            }
            //document 归一化到 window
            if (container.nodeType && container.nodeType == 9) {
                container = getWin(container);
            }
            //support iframe's win    
            var notWin = !('scrollTo' in container && container[DOCUMENT]),
                elemOffset = DOM.offset(elem),
                cl = notWin ? container.scrollLeft : DOM.scrollLeft(container),
                ct = notWin ? container.scrollTop : DOM.scrollTop(container),
                //import! viewport should has
                containerOffset = notWin ? DOM.offset(container) : {left:cl,top:ct},
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
                ch = notWin ? container.clientHeight : DOM.viewportHeight(container),
                cw = notWin ? container.clientWidth : DOM.viewportWidth(container),
                //container视窗下doc高度下限
                cb = ct + ch,
                //container视窗下doc右边限
                cr = cl + cw;
            //used if container is window
            var wl = 0,wt = 0;
            if (eh > ch || top) {
                if (notWin)
                    container.scrollTop = t;
                else
                    wt = t;
            } else {
                if (notWin)
                    container.scrollTop = t - (ch - eh);
                else
                    wt = t - (ch - eh);
            }

            if (ew > cw || l < cl) {
                if (notWin)
                    container.scrollLeft = l;
                else
                    wl = l;
            } else if (r > cr) {
                if (notWin)
                    container.scrollLeft = l;
                else
                    wl = l;
            }
            if (!notWin && (wl || wt)) {
                container.scrollTo(wl, wt);
            }

        }
    });

    // add ScrollLeft/ScrollTop getter methods
    S.each(['Left', 'Top'], function(name, i) {
        var method = SCROLL + name;

        DOM[method] = function(elem) {
            var ret = 0,
                w = elem === undefined ? win : getWin(elem),
                d;

            if (w && (d = w[DOCUMENT])) {
                ret = w[i ? 'pageYOffset' : 'pageXOffset']
                    || d[DOC_ELEMENT][method]
                    || d[BODY][method]
            }
            else if (isElementNode((elem = S.get(elem)))) {
                ret = elem[method];
            }
            return ret;
        }
    });

    // add docWidth/Height, viewportWidth/Height getter methods
    S.each(['Width', 'Height'], function(name) {
        DOM['doc' + name] = function(refDoc) {
            var d = refDoc || doc;
            return MAX(isStrict ? d[DOC_ELEMENT][SCROLL + name] : d[BODY][SCROLL + name],
                DOM[VIEWPORT + name](d));
        };

        DOM[VIEWPORT + name] = function(refWin) {
            var prop = 'inner' + name,
                w = getWin(refWin) || win,
                d = w[DOCUMENT];
            return (prop in w) ? w[prop] :
                (isStrict ? d[DOC_ELEMENT][CLIENT + name] : d[BODY][CLIENT + name]);
        }
    });

    // 获取 elem 相对 elem.ownerDocument 的坐标
    function getOffset(elem) {
        var box, x = 0, y = 0,
            w = getWin(elem[OWNER_DOCUMENT]);

        // 根据 GBS 最新数据，A-Grade Browsers 都已支持 getBoundingClientRect 方法，不用再考虑传统的实现方式
        if (elem[GET_BOUNDING_CLIENT_RECT]) {
            box = elem[GET_BOUNDING_CLIENT_RECT]();

            // 注：jQuery 还考虑减去 docElem.clientLeft/clientTop
            // 但测试发现，这样反而会导致当 html 和 body 有边距/边框样式时，获取的值不正确
            // 此外，ie6 会忽略 html 的 margin 值，幸运地是没有谁会去设置 html 的 margin

            x = box[LEFT];
            y = box[TOP];

            // iphone/ipad/itouch 下的 Safari 获取 getBoundingClientRect 时，已经加入 scrollTop
            if (UA.mobile !== 'Apple') {
                x += DOM[SCROLL_LEFT](w);
                y += DOM[SCROLL_TOP](w);
            }
        }

        return { left: x, top: y };
    }

    // 设置 elem 相对 elem.ownerDocument 的坐标
    function setOffset(elem, offset) {
        // set position first, in-case top/left are set even on static elem
        if (DOM.css(elem, POSITION) === 'static') {
            elem.style[POSITION] = RELATIVE;
        }
        var old = getOffset(elem), ret = { }, current, key;

        for (key in offset) {
            current = PARSEINT(DOM.css(elem, key), 10) || 0;
            ret[key] = current + offset[key] - old[key];
        }
        DOM.css(elem, ret);
    }

    // elem 为 window 时，直接返回
    // elem 为 document 时，返回关联的 window
    // 其它值，返回 false
    function getWin(elem) {
        return (elem && ('scrollTo' in elem) && elem[DOCUMENT]) ?
            elem :
            elem && elem.nodeType === 9 ?
                elem.defaultView || elem.parentWindow :
                false;
    }

});

/**
 * TODO:
 *  - 考虑是否实现 jQuery 的 position, offsetParent 等功能
 *  - 更详细的测试用例（比如：测试 position 为 fixed 的情况）
 */
