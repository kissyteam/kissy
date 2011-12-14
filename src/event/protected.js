/**
 * @fileOverview for other kissy core usage
 * @author yiminghe@gmail.com
 */
KISSY.add("event/protected", function (S, DOM, Utils) {
    var EVENT_GUID = Utils.EVENT_GUID,
        _protected,
        makeArray = S.makeArray;
    _protected = {
        _clone:function (src, dest) {
            if (dest.nodeType !== DOM.ELEMENT_NODE ||
                !_protected._hasData(src)) {
                return;
            }
            var eventDesc = _protected._data(src),
                events = eventDesc.events;
            S.each(events, function (handlers, type) {
                S.each(handlers, function (handler) {
                    // scope undefined 时不能写死在 handlers 中，否则不能保证 clone 时的 this
                    Event.on(dest, type, {
                        fn:handler.fn,
                        scope:handler.scope,
                        data:handler.data,
                        selector:handler.selector
                    });
                });
            });
        },

        _hasData:function (elem) {
            return DOM.hasData(elem, EVENT_GUID);
        },

        _data:function (elem) {
            var args = makeArray(arguments);
            args.splice(1, 0, EVENT_GUID);
            return DOM.data.apply(DOM, args);
        },

        _removeData:function (elem) {
            var args = makeArray(arguments);
            args.splice(1, 0, EVENT_GUID);
            return DOM.removeData.apply(DOM, args);
        }
    };
    return _protected;
}, {
    requires:['dom', './utils']
});