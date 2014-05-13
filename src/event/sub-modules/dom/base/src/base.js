/**
 * @ignore
 * dom event facade
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var DomEvent = require('./base/dom-event');
    var DomEventObject = require('./base/object');
    var KeyCode = require('./base/key-codes');
    var Special = require('./base/special-events');
    require('./base/mouseenter');
    var util = require('util');
    return util.merge({
        add: DomEvent.on,
        remove: DomEvent.detach,
        KeyCode: KeyCode,
        Special: Special,
        Object: DomEventObject
    }, DomEvent);
});