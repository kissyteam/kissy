/**
 * @ignore
 * event facade for event module.contains custom dom and touch event
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    // 'event/dom', 'event/custom'
    var DomEvent = require('event/dom');
    var CustomEvent = require('event/custom');
    /**
     * KISSY event utils. Provides event management.
     * @class KISSY.Event
     * @singleton
     * @mixins KISSY.Event.DomEvent
     */
    var Event = S.Event = S.merge(DomEvent, {
        DomEvent: DomEvent,
        CustomEvent: CustomEvent
    });


    /**
     * @member KISSY.Event
     * @property {KISSY.Event.CustomEvent.Target} Target
     */

    /**
     * @property {KISSY.Event.CustomEvent.Target} EventTarget
     * @member KISSY
     */

    /**
     * global event target
     * @property {KISSY.Event.CustomEvent.Target} global
     * @member KISSY.Event
     */
    Event.global = CustomEvent.global;

    // compatibility
    S.EventTarget = Event.Target = CustomEvent.Target;

    return Event;
});