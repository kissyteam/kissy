/**
 * @module  dom-offset
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-offset', function(S, undefined) {

    var DOM = S.DOM, UA = S.UA,
        win = window,
        doc = document,
        docElem = doc.documentElement,
        PARSEFLOAT = 'parseFloat',
        OWNER_DOCUMENT = 'ownerDocument',
        GET_BOUNDING_CLIENT_RECT = 'getBoundingClientRect';

    S.mix(DOM, {

        offset: function(elem, val) {
            if (!(elem = S.get(elem)) || !elem[OWNER_DOCUMENT]) return null;

            // getter
            if (val === undefined) {
                return getXY(elem);
            }

            // setter
            setXY(elem, val);
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

    function getXY(elem) {
        var defaultView = doc.defaultView,
            computedStyle,
            borderTopWidth, borderLeftWidth,
            box, x = 0, y = 0,
            hasAbsolute = false,
            root = (doc.body || docElem),
            p, ret = [0, 0];

        if (elem === root) return ret;

        if (elem[GET_BOUNDING_CLIENT_RECT]) {
            box = elem[GET_BOUNDING_CLIENT_RECT]();
            ret = [box.left + DOM.scrollLeft(), box.top + DOM.scrollTop()];
        }
        else {
            p = elem;
            while (p) {
                x += p.offsetLeft;
                y += p.offsetTop;

                if(p.style.position === 'absolute') hasAbsolute = true;

                if (UA.gecko) {
                    computedStyle = defaultView ? defaultView.getComputedStyle(p, null) : elem.currentStyle;
                    x += borderLeftWidth = PARSEFLOAT(computedStyle.borderLeftWidth) || 0;
                    y += borderTopWidth  = PARSEFLOAT(computedStyle.borderTopWidth) || 0;

                    if (p != elem && p.style.overflow !== 'visible') {
                        x += borderLeftWidth;
                        y += borderTopWidth;
                    }
                }
                p = p.offsetParent;
            }

            if (UA.safari && hasAbsolute) {
                x -= root.offsetLeft;
                y -= root.offsetTop;
            }

            if (UA.gecko && !hasAbsolute) {
                computedStyle = defaultView ? defaultView.getComputedStyle(root, null) : root.currentStyle;
                x += PARSEFLOAT(computedStyle.borderLeftWidth) || 0;
                y += PARSEFLOAT(computedStyle.borderTopWidth) || 0;
            }

            while ((p = elem.parentNode) && p != root) {
                if (!UA.opera || (p.tagName != 'TR' && p.style.display !== 'inline')) {
                    x -= p.scrollLeft;
                    y -= p.scrollTop;
                }
            }

            ret = [x, y];
        }

        return ret;
    }

    function setXY(elem, val) {

    }
});

/**
 * TODO:
 *  - 考虑是否实现 jQuery 的 postion, offsetParent 等功能
 *
 */
