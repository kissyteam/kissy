/**
 * @ignore
 * @fileOverview for other kissy core usage
 * @author yiminghe@gmail.com
 */
KISSY.add('event/data', function (S, DOM, Utils) {
    var EVENT_GUID = Utils.EVENT_GUID,
        data;

    data = {
        _hasData: function (elem, isCustomEvent) {
            if (isCustomEvent) {
                return elem[EVENT_GUID] && (!S.isEmptyObject(elem[EVENT_GUID]));
            } else {
                return DOM.hasData(elem, EVENT_GUID);
            }
        },

        _data: function (elem, v, isCustomEvent) {
            if (isCustomEvent) {
                if (v !== undefined) {
                    return elem[EVENT_GUID] = v;
                } else {
                    return elem[EVENT_GUID];
                }
            } else {
                return DOM.data(elem, EVENT_GUID, v);
            }
        },

        _removeData: function (elem, isCustomEvent) {
            if (isCustomEvent) {
                delete elem[EVENT_GUID];
            } else {
                return DOM.removeData(elem, EVENT_GUID);
            }
        }
    };
    return data;
}, {
    requires: ['dom', './utils']
});