/**
 * @ignore
 * dom event facade
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var DomEvent = require('./base/dom-event');
    var DomEventObject = require('./base/object');
    var KeyCode = require('./base/key-codes');
    var Gesture = require('./base/gesture');
    var Special = require('./base/special-events');
    require('./base/mouseenter');
    require('./base/valuechange');
    return S.merge({
        add: DomEvent.on,
        remove: DomEvent.detach,
        KeyCode: KeyCode,
        Gesture: Gesture,
        Special: Special,
        Object: DomEventObject
    }, DomEvent);
});

