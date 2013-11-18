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
                len = els.length,
                el;
            for (; i < len; ++i) {
                el = els[i];
                if (DOM.hasClass(el, cls)) {
                    ret.push(el);
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
            t, i, node;
        if (tag === '*') {
            t = [];
            i = 0;
            while ((node = ret[i++])) {
                // Filter out possible comments
                if (node.nodeType === 1) {
                    t.push(node);
                }
            }
            ret = t;
        }
        return ret;
    };


    DOM._getElementById = function (id, doc) {
        var el = doc.getElementById(id);
        if (el && DOM.attr(el, 'id') != id) {
            // ie opera confuse name with id
            // https://github.com/kissyteam/kissy/issues/67
            // 不能直接 el.id ，否则 input shadow form attribute
            el = DOM.filter('*', '#' + id, doc)[0] || null;
        }
        return el;
    };


}, {
    requires: ['dom/base']
});
