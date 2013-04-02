/**
 * @ignore
 * touch event logic module
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch', function (S, EventDomBase, eventHandleMap, eventHandle) {

    function setupExtra(event) {
        setup.call(this, event);
        eventHandleMap[event].setup.apply(this, arguments);
    }

    function setup(event) {
        eventHandle.addDocumentHandle(this, event);
    }

    function tearDownExtra(event) {
        tearDown.call(this, event);
        eventHandleMap[event].tearDown.apply(this, arguments);
    }

    function tearDown(event) {
        eventHandle.removeDocumentHandle(this, event);
    }

    var Special = EventDomBase._Special,
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