/**
 * ie selector hack
 * @author yiminghe@gmail.com
 */
KISSY.add('dom/ie/selector', function (S, DOM) {

    var doc = S.Env.host.document;

    DOM._compareNodeOrder = function (a, b) {
        return a.sourceIndex - b.sourceIndex;
    };

    if (!doc.querySelectorAll) {

        DOM._getElementsByClassName = function (cls, tag, context) {
            if (!context) {
                return [];
            }
            var els = context.getElementsByTagName(tag || '*'),
                ret = [],
                i = 0,
                j = 0,
                len = els.length,
                el;
            for (; i < len; ++i) {
                el = els[i];
                if (DOM._hasSingleClass(el, cls)) {
                    ret[j++] = el;
                }
            }
            return ret;
        };

    }

    // ie<9
    // Check to see if the browser returns only elements
    // when doing getElementsByTagName('*')
    DOM._getElementsByTagName = function (tag, context) {
        var ret = S.makeArray(context.getElementsByTagName(tag)),
            t, i, j, node;
        if (tag === '*') {
            t = [];
            i = 0;
            j = 0;
            while ((node = ret[i++])) {
                // Filter out possible comments
                if (node.nodeType === 1) {
                    t[j++] = node;
                }
            }
            ret = t;
        }
        return ret;
    };

}, {
    requires: ['dom/base']
});

/**
 * @ignore
 *
 * 2012.12.26
 * - 尽量用原生方法提高性能
 *
 */