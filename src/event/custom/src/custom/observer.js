/**
 * @ignore
 * Observer for custom event
 * @author yiminghe@gmail.com
 */

var BaseEvent = require('event/base');
var util = require('util');

/**
 * Observer for custom event
 * @class KISSY.Event.CustomEvent.Observer
 * @extends KISSY.Event.Observer
 * @private
 */
function CustomEventObserver() {
    CustomEventObserver.superclass.constructor.apply(this, arguments);
}

util.extend(CustomEventObserver, BaseEvent.Observer, {
    keys: ['fn', 'context', 'groups']
});

module.exports = CustomEventObserver;