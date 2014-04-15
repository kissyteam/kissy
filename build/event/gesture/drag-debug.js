/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 15 17:52
*/
/*
combined files : 

event/gesture/drag

*/
/**
 * @ignore
 * gesture drag
 * @author yiminghe@gmail.com
 */
KISSY.add('event/gesture/drag',['event/gesture/util', 'event/dom/base'], function (S, require) {
    var GestureUtil = require('event/gesture/util');
    var addGestureEvent = GestureUtil.addEvent;
    var DomEvent = require('event/dom/base');
    var SingleTouch = GestureUtil.SingleTouch;
    var DRAG_START = 'ksDragStart',
        DRAG_END = 'ksDragEnd',
        DRAGGING = 'ksDragging',
        DRAG = 'ksDrag',
        SAMPLE_INTERVAL = 300,
        MIN_DISTANCE = 3;
    var doc = document;

    function getDistance(p1, p2) {
        var deltaX = p1.pageX - p2.pageX,
            deltaY = p1.pageY - p2.pageY;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    function startDrag(self, e) {
        var currentTouch = self.lastTouches[0];
        var startPos = self.startPos;
        if (!self.direction) {
            var deltaX = e.pageX - self.startPos.pageX,
                deltaY = e.pageY - self.startPos.pageY,
                absDeltaX = Math.abs(deltaX),
                absDeltaY = Math.abs(deltaY);
            if (absDeltaX > absDeltaY) {
                self.direction = deltaX < 0 ? 'left' : 'right';
            } else {
                self.direction = deltaY < 0 ? 'up' : 'down';
            }
        }
        // call e.preventDefault() to prevent native browser behavior for android chrome
        DomEvent.fire(self.dragTarget, DRAGGING, getEventObject(self, e));
        // fire dragstart after moving at least 3px
        if (getDistance(currentTouch, startPos) > MIN_DISTANCE) {
            if (self.isStarted) {
                sample(self, e);
            } else {
                // http://stackoverflow.com/questions/1685326/responding-to-the-onmousemove-event-outside-of-the-browser-window-in-ie
                // ie6 will not response to event when cursor is out of window.
                if (doc.body.setCapture) {
                    doc.body.setCapture();
                }
                self.isStarted = true;
            }
            DomEvent.fire(self.dragTarget, DRAG_START, getEventObject(self, e));
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
        ret.touch = currentTouch;
        ret.gestureType = e.gestureType;
        ret.direction = self.direction;
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
            // dragTarget will change on mousemove for mouse event
            self.dragTarget = touch.target;
            self.startPos = self.lastPos = {
                pageX: touch.pageX,
                pageY: touch.pageY
            };
            self.direction = null;
        },

        move: function (e) {
            var self = this;
            Drag.superclass.move.apply(self, arguments);
            if (!self.isStarted) {
                startDrag(self, e);
            } else {
                sample(self, e);
                DomEvent.fire(self.dragTarget, DRAG, getEventObject(self, e));
            }
        },

        end: function (e) {
            var self = this;
            var currentTouch = self.lastTouches[0];
            var currentTime = e.timeStamp;
            var velocityX = (currentTouch.pageX - self.lastPos.pageX) / (currentTime - self.lastTime);
            var velocityY = (currentTouch.pageY - self.lastPos.pageY) / (currentTime - self.lastTime);
            DomEvent.fire(self.dragTarget, DRAG_END, getEventObject(self, e, {
                velocityX: velocityX || 0,
                velocityY: velocityY || 0
            }));
            if (doc.body.releaseCapture) {
                doc.body.releaseCapture();
            }
        }
    });

    addGestureEvent([DRAG_START, DRAG, DRAG_END], {
        handle: new Drag()
    });

    return {
        DRAGGING: DRAGGING,
        DRAG_START: DRAG_START,
        DRAG: DRAG,
        DRAG_END: DRAG_END
    };
});
