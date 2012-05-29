/**
 * @fileOverview utils for event
 * @author yiminghe@gmail.com
 */
KISSY.add("event/utils", function (S, DOM) {

    /**
     * whether two event listens are the same
     * @param h1 已有的 handler 描述
     * @param h2 用户提供的 handler 描述
     */
    function isIdenticalHandler(h1, h2, el) {
        var scope1 = h1.scope || el,
            ret = 1,
            scope2 = h2.scope || el;
        if (
            h1.fn !== h2.fn ||
                h1.selector !== h2.selector ||
                h1.data !== h2.data ||
                scope1 !== scope2 ||
                h1.originalType !== h2.originalType ||
                h1.groups !== h2.groups ||
                h1.last !== h2.last
            ) {
            ret = 0;
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


    function batchForType(fn, targets, types) {
        // on(target, 'click focus', fn)
        if (types && types.indexOf(" ") > 0) {
            var args = S.makeArray(arguments);
            S.each(types.split(/\s+/), function (type) {
                var args2 = [].concat(args);
                args2.splice(0, 3, targets, type);
                fn.apply(null, args2);
            });
            return true;
        }
        return 0;
    }


    function splitAndRun(type, fn) {
        S.each(type.split(/\s+/), fn);
    }

    var doc = S.Env.host.document,
        simpleAdd = doc.addEventListener ?
            function (el, type, fn, capture) {
                if (el.addEventListener) {
                    el.addEventListener(type, fn, !!capture);
                }
            } :
            function (el, type, fn) {
                if (el.attachEvent) {
                    el.attachEvent('on' + type, fn);
                }
            },
        simpleRemove = doc.removeEventListener ?
            function (el, type, fn, capture) {
                if (el.removeEventListener) {
                    el.removeEventListener(type, fn, !!capture);
                }
            } :
            function (el, type, fn) {
                if (el.detachEvent) {
                    el.detachEvent('on' + type, fn);
                }
            };


    return {
        // 记录手工 fire(domElement,type) 时的 type
        // 再在浏览器通知的系统 eventHandler 中检查
        // 如果相同，那么证明已经 fire 过了，不要再次触发了
        Event_Triggered:"",
        TRIGGERED_NONE:"trigger-none-" + S.now(),
        EVENT_GUID:'ksEventTargetId' + S.now(),
        splitAndRun:splitAndRun,
        batchForType:batchForType,
        isValidTarget:isValidTarget,
        isIdenticalHandler:isIdenticalHandler,
        simpleAdd:simpleAdd,
        simpleRemove:simpleRemove,
        getTypedGroups:function (type) {
            if (type.indexOf(".") < 0) {
                return [type, ""];
            }
            var m = type.match(/([^.]+)?(\..+)?$/),
                t = m[1],
                ret = [t],
                gs = m[2];
            if (gs) {
                gs = gs.split(".").sort();
                ret.push(gs.join("."));
            } else {
                ret.push("");
            }
            return ret;
        },
        getGroupsRe:function (groups) {
            return new RegExp(groups.split(".").join(".*\\.") + "(?:\\.|$)");
        }
    };

}, {
    requires:['dom']
});