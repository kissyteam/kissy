/**
 * @ignore
 * event facade for event module.contains custom dom and touch event
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    // 'event/dom', 'event/custom', 'event/gesture'
    var DomEvent = require('event/dom');
    var CustomEvent = require('event/custom');
    var Gesture = require('event/gesture');

    /**
     * KISSY event utils. Provides event management.
     * @class KISSY.Event
     * @singleton
     * @mixins KISSY.Event.DomEvent
     */
    var Event = S.merge(DomEvent, {
        Target: CustomEvent.Target,
        global: CustomEvent.global,
        Gesture: Gesture.Enumeration
    });
    // bad! compatibility
    S.Event = Event;
    return Event;
});