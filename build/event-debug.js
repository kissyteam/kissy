/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:26
*/
/*
combined modules:
event
*/
/**
 * deprecated event module! please use 'event/dom' and 'event/custom' modules instead.
 */
KISSY.add('event', [
    'util',
    'event/dom',
    'event/custom'
], function (S, require) {
    var Event = S.Event = {};
    var util = require('util');
    util.mix(Event, require('event/dom'));
    Event.Target = require('event/custom').Target;
    return Event;
});


