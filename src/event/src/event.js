/**
 * deprecated event module! please use 'event/dom' and 'event/custom' modules instead.
 */
KISSY.add(function (S, require) {
    var Event = S.Event = {};
    var util = require('util');
    util.mix(Event, require('event/dom'));
    Event.Target = require('event/custom').Target;
    return Event;
});