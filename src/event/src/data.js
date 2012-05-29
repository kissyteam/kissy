/**
 * @fileOverview for other kissy core usage
 * @author yiminghe@gmail.com
 */
KISSY.add("event/data", function (S, DOM, Utils) {
    var EVENT_GUID = Utils.EVENT_GUID,
        data,
        makeArray = S.makeArray;
    data = {
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
    return data;
}, {
    requires:['dom', './utils']
});