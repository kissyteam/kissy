/**
 * @ignore
 * touch event logic module
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch', function (S, DomEvent, eventHandleMap, eventHandle) {
    var isMsPointerSupported = S.Features.isMsPointerSupported();
    var Gesture = DomEvent.Gesture;
    var startEvent = Gesture.start = 'KSPointerDown';
    var moveEvent = Gesture.move = 'KSPointerMove';
    var endEvent = Gesture.end = 'KSPointerUp';
    Gesture.tap = 'tap';
    Gesture.doubleTap = 'doubleTap';

    eventHandleMap[startEvent] = {
        handle: {
            // always fire
            isActive: 1,
            onTouchStart: function (e) {
                DomEvent.fire(e.target, startEvent, e);
            }
        }
    };

    eventHandleMap[moveEvent] = {
        setup: function () {
            var doc = this.ownerDocument || this;
            doc.__ks__pointer_events_count = doc.__ks__pointer_events_count || 0;
            doc.__ks__pointer_events_count++;
        },
        tearDown: function () {
            var doc = this.ownerDocument || this;
            if (doc.__ks__pointer_events_count) {
                doc.__ks__pointer_events_count--;
            }
        },
        handle: {
            // always fire
            isActive: 1,
            onTouchMove: function (e) {
                // if no register then do not fire
                var t = e.target,
                    doc = t.ownerDocument || t;
                if (doc.__ks__pointer_events_count) {
                    DomEvent.fire(t, moveEvent, e);
                }
            }
        }
    };

    eventHandleMap[endEvent] = {
        handle: {
            // always fire
            isActive: 1,
            onTouchEnd: function (e) {
                DomEvent.fire(e.target, endEvent, e);
            }
        }
    };

    function setupExtra(event) {
        setup.call(this, event);
        eventHandleMap[event].setup.apply(this, arguments);
    }

    function tearDownExtra(event) {
        tearDown.call(this, event);
        eventHandleMap[event].tearDown.apply(this, arguments);
    }

    function setup(event) {
        var self = this,
            style = self.style;
        if (isMsPointerSupported && style) {
            if (!self.__ks_touch_action) {
                self.__ks_touch_action = style.msTouchAction;
                self.__ks_user_select = style.msUserSelect;
                style.msTouchAction = style.msUserSelect = 'none';
            }
            if (!self.__ks_touch_action_count) {
                self.__ks_touch_action_count = 1;
            } else {
                self.__ks_touch_action_count++;
            }
        }
        eventHandle.addDocumentHandle(this, event);
    }

    function tearDown(event) {
        var self = this,
            style = self.style;
        if (isMsPointerSupported && style) {
            if (!self.__ks_touch_action_count) {
                S.error('touch event error for ie');
            }
            self.__ks_touch_action_count--;
            if (!self.__ks_touch_action_count) {
                style.msUserSelect = self.__ks_user_select;
                style.msTouchAction = self.__ks_touch_action;
                self.__ks_touch_action = '';
            }
        }
        eventHandle.removeDocumentHandle(this, event);
    }

    var Special = DomEvent.Special,
        specialEvent, e, eventHandleValue;

    for (e in eventHandleMap) {
        specialEvent = {};
        eventHandleValue = eventHandleMap[e];
        if (eventHandleValue.setup) {
            specialEvent.setup = setupExtra;
        } else {
            specialEvent.setup = setup;
        }
        if (eventHandleValue.tearDown) {
            specialEvent.tearDown = tearDownExtra;
        } else {
            specialEvent.tearDown = tearDown;
        }
        if (eventHandleValue.add) {
            specialEvent.add = eventHandleValue.add;
        }
        if (eventHandleValue.remove) {
            specialEvent.remove = eventHandleValue.remove;
        }
        Special[e] = specialEvent;
    }
}, {
    requires: ['event/dom/base', './touch/handle-map', './touch/handle']
});