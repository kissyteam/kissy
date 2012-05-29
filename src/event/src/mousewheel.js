/**
 * @fileOverview normalize mousewheel in gecko
 * @author yiminghe@gmail.com
 */
KISSY.add("event/mousewheel", function (S, Event, UA, Utils, EventObject, handle, _data, special) {

    var MOUSE_WHEEL = UA.gecko ? 'DOMMouseScroll' : 'mousewheel',
        simpleRemove = Utils.simpleRemove,
        simpleAdd = Utils.simpleAdd,
        MOUSE_WHEEL_HANDLER = "mousewheelHandler";

    function handler(e) {
        var deltaX,
            currentTarget = this,
            deltaY,
            delta,
            detail = e.detail;

        if (e.wheelDelta) {
            delta = e.wheelDelta / 120;
        }
        if (e.detail) {
            // press control e.detail == 1 else e.detail == 3
            delta = -(detail % 3 == 0 ? detail / 3 : detail);
        }

        // Gecko
        if (e.axis !== undefined) {
            if (e.axis === e['HORIZONTAL_AXIS']) {
                deltaY = 0;
                deltaX = -1 * delta;
            } else if (e.axis === e['VERTICAL_AXIS']) {
                deltaX = 0;
                deltaY = delta;
            }
        }

        // Webkit
        if (e['wheelDeltaY'] !== undefined) {
            deltaY = e['wheelDeltaY'] / 120;
        }
        if (e['wheelDeltaX'] !== undefined) {
            deltaX = -1 * e['wheelDeltaX'] / 120;
        }

        // 默认 deltaY ( ie )
        if (!deltaX && !deltaY) {
            deltaY = delta;
        }

        // can not invoke eventDesc.handler , it will protect type
        // but here in firefox , we want to change type really
        e = new EventObject(currentTarget, e);

        S.mix(e, {
            deltaY:deltaY,
            delta:delta,
            deltaX:deltaX,
            type:'mousewheel'
        });

        return  handle(currentTarget, e);
    }

    special['mousewheel'] = {
        setup:function () {
            var el = this,
                mousewheelHandler,
                eventDesc = _data._data(el);
            // solve this in ie
            mousewheelHandler = eventDesc[MOUSE_WHEEL_HANDLER] = S.bind(handler, el);
            simpleAdd(this, MOUSE_WHEEL, mousewheelHandler);
        },
        tearDown:function () {
            var el = this,
                mousewheelHandler,
                eventDesc = _data._data(el);
            mousewheelHandler = eventDesc[MOUSE_WHEEL_HANDLER];
            simpleRemove(this, MOUSE_WHEEL, mousewheelHandler);
            delete eventDesc[mousewheelHandler];
        }
    };

}, {
    requires:['./base', 'ua', './utils',
        './object', './handle',
        './data', "./special"]
});

/**
 note:
 not perfect in osx : accelerated scroll
 refer:
 https://github.com/brandonaaron/jquery-mousewheel/blob/master/jquery.mousewheel.js
 http://www.planabc.net/2010/08/12/mousewheel_event_in_javascript/
 http://www.switchonthecode.com/tutorials/javascript-tutorial-the-scroll-wheel
 http://stackoverflow.com/questions/5527601/normalizing-mousewheel-speed-across-browsers/5542105#5542105
 http://www.javascriptkit.com/javatutors/onmousewheel.shtml
 http://www.adomas.org/javascript-mouse-wheel/
 http://plugins.jquery.com/project/mousewheel
 http://www.cnblogs.com/aiyuchen/archive/2011/04/19/2020843.html
 http://www.w3.org/TR/DOM-Level-3-Events/#events-mousewheelevents
 **/