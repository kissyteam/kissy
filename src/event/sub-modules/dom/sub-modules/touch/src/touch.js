/**
 * @ignore
 * touch event logic module
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var DomEvent = require('event/dom/base');
    var eventHandleMap = require('./touch/handle-map');
    var eventHandle = require('./touch/handle');

    var Gesture = DomEvent.Gesture;
    var startEvent = Gesture.start = 'KSPointerDown';
    var moveEvent = Gesture.move = 'KSPointerMove';
    var endEvent = Gesture.end = 'KSPointerUp';
    Gesture.tap = 'tap';
    Gesture.singleTap = 'singleTap';
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
        handle: {
            // always fire
            isActive: 1,
            onTouchMove: function (e) {
                DomEvent.fire(e.target, moveEvent, e);
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
        eventHandle.addDocumentHandle(this, event);
    }

    function tearDown(event) {
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
});