/**
 * @ignore
 * touch event logic module
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch', function (S, DOMEvent, eventHandleMap, eventHandle) {

    var Features = S.Features;

    function setupExtra(event) {
        setup.call(this, event);
        eventHandleMap[event].setup.apply(this, arguments);
    }

    function setup(event) {
        var self = this,
            style = self.style;
        if (Features.isMsPointerSupported() && style) {
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

    function tearDownExtra(event) {
        tearDown.call(this, event);
        eventHandleMap[event].tearDown.apply(this, arguments);
    }

    function tearDown(event) {
        var self = this,
            style = self.style;
        if (Features.isMsPointerSupported() && style) {
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

    var Special = DOMEvent.Special,
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