/**
 * @ignore
 * @fileOverview utils for event
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/utils', function (S, DOM) {
    var EVENT_GUID = 'ksEventTargetId' + S.now();

    var data;

    data = {
        hasData: function (elem) {
            return DOM.hasData(elem, EVENT_GUID);
        },

        data: function (elem, v) {
            return DOM.data(elem, EVENT_GUID, v);
        },

        removeData: function (elem) {
            return DOM.removeData(elem, EVENT_GUID);
        }
    };

    var doc = S.Env.host.document,
        simpleAdd = doc && doc.addEventListener ?
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
        simpleRemove = doc && doc.removeEventListener ?
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


    return S.mix({
        EVENT_GUID: EVENT_GUID,
        simpleAdd: simpleAdd,
        simpleRemove: simpleRemove
    }, data);

}, {
    requires: ['dom']
});