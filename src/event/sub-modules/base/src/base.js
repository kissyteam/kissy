/**
 * set up event/base module
 * @author yiminghe@gmail.com
 */
KISSY.add('event/base', function (S, Utils, Object, Subscriber, BaseCustomEvent) {
    return S.Event = {
        _Utils: Utils,
        _Object: Object,
        _Subscriber: Subscriber,
        _BaseCustomEvent: BaseCustomEvent
    };
}, {
    requires: ['./base/utils', './base/object', './base/subscriber', './base/custom-event']
});