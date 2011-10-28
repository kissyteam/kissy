/**
 * normalize mousewheel in gecko
 * @author yiminghe@gmail.com
 */
KISSY.add("event/mousewheel", function(S, Event, UA) {

    var MOUSE_WHEEL = UA.gecko ? 'DOMMouseScroll' : 'mousewheel',
        mousewheelHandler = "mousewheelHandler";

    function handler(e) {
        var eventDesc = Event._data(this),
            eventHandler = eventDesc.handler,
            deltaX,
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

        return eventHandler(e, {
            deltaY:deltaY,
            delta:delta,
            deltaX:deltaX,
            type:'mousewheel'
        });
    }

    Event.special['mousewheel'] = {
        setup: function() {
            var el = this,
                mousewheelHandler,
                eventDesc = Event._data(el);
            // solve this in ie
            mousewheelHandler = eventDesc[mousewheelHandler] = S.bind(handler, el);
            Event.__simpleAdd(this, MOUSE_WHEEL, mousewheelHandler);
        },
        tearDown:function() {
            var el = this,
                mousewheelHandler,
                eventDesc = Event._data(el);
            mousewheelHandler = eventDesc[mousewheelHandler];
            Event.__simpleRemove(this, MOUSE_WHEEL, mousewheelHandler);
            delete eventDesc[mousewheelHandler];
        }
    };

}, {
    requires:['./base','ua','./object']
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