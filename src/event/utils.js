/**
 * utils for event
 * @author yiminghe@gmail.com
 */
KISSY.add("event/utils", function(S, DOM) {

    /**
     * whether two event listens are the same
     * @param h1 已有的 handler 描述
     * @param h2 用户提供的 handler 描述
     */
    function isIdenticalHandler(h1, h2, el) {
        var scope1 = h1.scope || el,
            ret = 1,
            d1,
            d2,
            scope2 = h2.scope || el;
        if (h1.fn !== h2.fn
            || scope1 !== scope2) {
            ret = 0;
        } else if ((d1 = h1.data) !== (d2 = h2.data)) {
            // undelgate 不能 remove 普通 on 的 handler
            // remove 不能 remove delegate 的 handler
            if (!d1 && d2
                || d1 && !d2
                ) {
                ret = 0;
            } else if (d1 && d2) {
                if (!d1.equals || !d2.equals) {
                    S.error("no equals in data");
                } else if (!d1.equals(d2,el)) {
                    ret = 0;
                }
            }
        }
        return ret;
    }


    function isValidTarget(target) {
        // 3 - is text node
        // 8 - is comment node
        return target &&
            target.nodeType !== DOM.TEXT_NODE &&
            target.nodeType !== DOM.COMMENT_NODE;
    }


    function batchForType(obj, methodName, targets, types) {
        // on(target, 'click focus', fn)
        if (types && types.indexOf(" ") > 0) {
            var args = S.makeArray(arguments);
            S.each(types.split(/\s+/), function(type) {
                var args2 = [].concat(args);
                args2.splice(0, 4, targets, type);
                obj[methodName].apply(obj, args2);
            });
            return true;
        }
        return 0;
    }


    function splitAndRun(type, fn) {
        S.each(type.split(/\s+/), fn);
    }


    var doc = document,
        simpleAdd = doc.addEventListener ?
            function(el, type, fn, capture) {
                if (el.addEventListener) {
                    el.addEventListener(type, fn, !!capture);
                }
            } :
            function(el, type, fn) {
                if (el.attachEvent) {
                    el.attachEvent('on' + type, fn);
                }
            },
        simpleRemove = doc.removeEventListener ?
            function(el, type, fn, capture) {
                if (el.removeEventListener) {
                    el.removeEventListener(type, fn, !!capture);
                }
            } :
            function(el, type, fn) {
                if (el.detachEvent) {
                    el.detachEvent('on' + type, fn);
                }
            };


    return {
        splitAndRun:splitAndRun,
        batchForType:batchForType,
        isValidTarget:isValidTarget,
        isIdenticalHandler:isIdenticalHandler,
        simpleAdd:simpleAdd,
        simpleRemove:simpleRemove
    };

}, {
    requires:['dom']
});