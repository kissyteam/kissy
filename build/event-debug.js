/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 9 14:04
*/
/*
combined modules:
event
*/
/**
 * deprecated event module! please use 'event/dom' and 'event/custom' modules instead.
 */
KISSY.add('event', [
    'event/dom',
    'event/custom'
], function (S, require) {
    var Event = S.Event = {};
    S.mix(Event, require('event/dom'));
    Event.Target = require('event/custom').Target;
    return Event;
});

