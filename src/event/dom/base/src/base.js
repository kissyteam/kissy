/**
 * @ignore
 * dom event facade
 * @author yiminghe@gmail.com
 */
var DomEvent = require('./base/dom-event');
var DomEventObject = require('./base/object');
var KeyCode = require('./base/key-codes');
var Special = require('./base/special-events');
require('./base/mouseenter');
var util = require('util');
module.exports = util.merge({
    add: DomEvent.on,
    remove: DomEvent.detach,
    KeyCode: KeyCode,
    Special: Special,
    Object: DomEventObject
}, DomEvent);
