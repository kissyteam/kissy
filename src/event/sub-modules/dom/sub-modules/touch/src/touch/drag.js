/**
 * @ignore
 * gesture drag
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var eventHandleMap = require('./handle-map');
    var DomEvent = require('event/dom/base');
    var SingleTouch = require('./single-touch');
    var dragStartEvent = 'dragStart',
        dragEndEvent = 'dragEnd',
        dragEvent = 'drag',
        SAMPLE_INTERVAL = 300,
        MIN_DISTANCE = 3;

    function getDistance(p1, p2) {
        var deltaX = p1.pageX - p2.pageX,
            deltaY = p1.pageY - p2.pageY;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    function startDrag(self, e) {
        var currentTouch = self.lastTouches[0];
        var startPos = self.startPos;
        // fire dragstart after moving at least 3px
        if (getDistance(currentTouch, startPos) > MIN_DISTANCE) {
            self.isStarted = true;
            sample(self, e);
            DomEvent.fire(currentTouch.target, dragStartEvent, getEventObject(self, e));
        }
    }

    function sample(self, e) {
        var currentTouch = self.lastTouches[0];
        var currentTime = e.timeStamp;
        if (currentTime - self.lastTime > SAMPLE_INTERVAL) {
            self.lastPos = {
                pageX: currentTouch.pageX,
                pageY: currentTouch.pageY
            };
            self.lastTime = currentTime;
        }
    }

    function getEventObject(self, e, ret) {
        var startPos = self.startPos;
        ret = ret || {};
        var currentTouch = self.lastTouches[0];
        ret.pageX = currentTouch.pageX;
        ret.pageY = currentTouch.pageY;
        ret.originalEvent = e.originalEvent;
        ret.deltaX = currentTouch.pageX - startPos.pageX;
        ret.deltaY = currentTouch.pageY - startPos.pageY;
        ret.startTime = self.startTime;
        ret.startPos = self.startPos;
        ret.isTouch = e.isTouch;
        ret.touch = currentTouch;
        return ret;
    }

    function Drag() {
    }

    S.extend(Drag, SingleTouch, {
        start: function () {
            var self = this;
            Drag.superclass.start.apply(self, arguments);
            var touch = self.lastTouches[0];
            self.lastTime = self.startTime;
            self.startPos = self.lastPos = {
                pageX: touch.pageX,
                pageY: touch.pageY
            };
        },

        move: function (e) {
            var self = this;
            Drag.superclass.move.apply(self, arguments);
            if (!self.isStarted) {
                startDrag(self, e);
            } else {
                sample(self, e);
                DomEvent.fire(self.lastTouches[0].target, dragEvent, getEventObject(self, e));
            }
        },

        end: function (e) {
            var self = this;
            var currentTouch = self.lastTouches[0];
            var currentTime = e.timeStamp;
            var velocityX = (currentTouch.pageX - self.lastPos.pageX) / (currentTime - self.lastTime);
            var velocityY = (currentTouch.pageY - self.lastPos.pageY) / (currentTime - self.lastTime);
            DomEvent.fire(currentTouch.target, dragEndEvent, getEventObject(self, e, {
                velocityX: velocityX,
                velocityY: velocityY
            }));
        }
    });

    eventHandleMap[dragStartEvent] = eventHandleMap[dragEvent] = eventHandleMap[dragEndEvent] = {
        handle: new Drag()
    };

    return Drag;
});