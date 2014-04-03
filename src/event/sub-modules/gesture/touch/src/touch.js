KISSY.add(function (S, require) {
    var TouchEnumeration = S.merge(require('./touch/pinch'),
        require('./touch/rotate'), require('./touch/swipe'));
    var BaseGesture = require('event/gesture/base');
    S.mix(BaseGesture.Enumeration, TouchEnumeration);
    return TouchEnumeration;
});