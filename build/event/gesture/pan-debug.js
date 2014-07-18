/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:02
*/
/*
combined modules:
event/gesture/pan
*/
KISSY.add('event/gesture/pan', [
    'event/gesture/util',
    'event/dom/base',
    'util'
], function (S, require, exports, module) {
    /**
 * @ignore
 * gesture drag
 * @author yiminghe@gmail.com
 */
    var GestureUtil = require('event/gesture/util');
    var addGestureEvent = GestureUtil.addEvent;
    var DomEvent = require('event/dom/base');
    var SingleTouch = GestureUtil.SingleTouch;    /**
 * fired when drag started
 * @event PAN_START
 * @member KISSY.Event.Gesture.Drag
 * @param {KISSY.Event.DomEvent.Object} e
 * @param {Number} e.pageX drag point pageX
 * @param {Number} e.pageY drag point pageY
 * @param {Number} e.deltaX deltaX between current pageX and drag start pageX
 * @param {Number} e.deltaY deltaY between current pageY and drag start pageY
 * @param {Number} e.startTime drag start time
 * @param {String} e.gestureType 'mouse' or 'touch'
 * @param {String} e.direction drag start direction 'up' or 'down' or 'left' or 'right'
 */
                                                  /**
 * fired when drag.
 * preventDefault this event to prevent native behavior
 * @event PAN
 * @member KISSY.Event.Gesture.Drag
 * @param {KISSY.Event.DomEvent.Object} e
 * @param {Number} e.pageX drag point pageX
 * @param {Number} e.pageY drag point pageY
 * @param {Number} e.deltaX deltaX between current pageX and drag start pageX
 * @param {Number} e.deltaY deltaY between current pageY and drag start pageY
 * @param {Number} e.startTime drag start time
 * @param {String} e.gestureType 'mouse' or 'touch'
 * @param {String} e.direction drag start direction 'up' or 'down' or 'left' or 'right'
 */
                                                  /**
 * fired when drag gesture is finished
 * @event PAN_END
 * @member KISSY.Event.Gesture.Drag
 * @param {KISSY.Event.DomEvent.Object} e
 * @param {Number} e.pageX drag point pageX
 * @param {Number} e.pageY drag point pageY
 * @param {Number} e.deltaX deltaX between current pageX and drag start pageX
 * @param {Number} e.deltaY deltaY between current pageY and drag start pageY
 * @param {Number} e.startTime drag start time
 * @param {String} e.gestureType 'mouse' or 'touch'
 * @param {String} e.direction drag start direction 'up' or 'down' or 'left' or 'right'
 */
    /**
 * fired when drag started
 * @event PAN_START
 * @member KISSY.Event.Gesture.Drag
 * @param {KISSY.Event.DomEvent.Object} e
 * @param {Number} e.pageX drag point pageX
 * @param {Number} e.pageY drag point pageY
 * @param {Number} e.deltaX deltaX between current pageX and drag start pageX
 * @param {Number} e.deltaY deltaY between current pageY and drag start pageY
 * @param {Number} e.startTime drag start time
 * @param {String} e.gestureType 'mouse' or 'touch'
 * @param {String} e.direction drag start direction 'up' or 'down' or 'left' or 'right'
 */
    /**
 * fired when drag.
 * preventDefault this event to prevent native behavior
 * @event PAN
 * @member KISSY.Event.Gesture.Drag
 * @param {KISSY.Event.DomEvent.Object} e
 * @param {Number} e.pageX drag point pageX
 * @param {Number} e.pageY drag point pageY
 * @param {Number} e.deltaX deltaX between current pageX and drag start pageX
 * @param {Number} e.deltaY deltaY between current pageY and drag start pageY
 * @param {Number} e.startTime drag start time
 * @param {String} e.gestureType 'mouse' or 'touch'
 * @param {String} e.direction drag start direction 'up' or 'down' or 'left' or 'right'
 */
    /**
 * fired when drag gesture is finished
 * @event PAN_END
 * @member KISSY.Event.Gesture.Drag
 * @param {KISSY.Event.DomEvent.Object} e
 * @param {Number} e.pageX drag point pageX
 * @param {Number} e.pageY drag point pageY
 * @param {Number} e.deltaX deltaX between current pageX and drag start pageX
 * @param {Number} e.deltaY deltaY between current pageY and drag start pageY
 * @param {Number} e.startTime drag start time
 * @param {String} e.gestureType 'mouse' or 'touch'
 * @param {String} e.direction drag start direction 'up' or 'down' or 'left' or 'right'
 */
    var PAN_START = 'panStart', PAN_END = 'panEnd',
        //DRAG_PRE = 'ksDragging',
        PAN = 'pan', SAMPLE_INTERVAL = 300, MIN_DISTANCE = 3;
    var doc = document;
    var util = require('util');
    function getDistance(p1, p2) {
        var deltaX = p1.pageX - p2.pageX, deltaY = p1.pageY - p2.pageY;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }
    function startDrag(self, e) {
        var currentTouch = self.lastTouches[0];
        var startPos = self.startPos;
        if (!self.direction) {
            var deltaX = e.pageX - self.startPos.pageX, deltaY = e.pageY - self.startPos.pageY, absDeltaX = Math.abs(deltaX), absDeltaY = Math.abs(deltaY);
            if (absDeltaX > absDeltaY) {
                self.direction = deltaX < 0 ? 'left' : 'right';
            } else {
                self.direction = deltaY < 0 ? 'up' : 'down';
            }
        }    // fire dragstart after moving at least 3px
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
            }    // call e.preventDefault() to prevent native browser behavior
                 // PAN_START is fired in touchmove!
            // call e.preventDefault() to prevent native browser behavior
            // PAN_START is fired in touchmove!
            DomEvent.fire(self.dragTarget, PAN_START, getEventObject(self, e));
        } else {
        }
    }
    // call e.preventDefault() to prevent native browser behavior
    //DomEvent.fire(self.dragTarget, DRAG_PRE, getEventObject(self, e));
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
        ret.which = 1;
        ret.pageX = currentTouch.pageX;
        ret.pageY = currentTouch.pageY;
        ret.originalEvent = e.originalEvent;
        ret.deltaX = currentTouch.pageX - startPos.pageX;
        ret.deltaY = currentTouch.pageY - startPos.pageY;
        ret.startTime = self.startTime;
        ret.startPos = self.startPos;
        ret.gestureType = e.gestureType;
        ret.direction = self.direction;
        return ret;
    }
    function Drag() {
    }
    util.extend(Drag, SingleTouch, {
        start: function () {
            var self = this;    // var e = arguments[0];
                                //if (e.touches[0].target.nodeName.match(/^(A|INPUT|TEXTAREA|BUTTON|SELECT)$/i)) {
                                //return false;
                                //}
            // var e = arguments[0];
            //if (e.touches[0].target.nodeName.match(/^(A|INPUT|TEXTAREA|BUTTON|SELECT)$/i)) {
            //return false;
            //}
            Drag.superclass.start.apply(self, arguments);
            var touch = self.lastTouches[0];
            self.lastTime = self.startTime;    // dragTarget will change on mousemove for mouse event
            // dragTarget will change on mousemove for mouse event
            self.dragTarget = touch.target;
            self.startPos = self.lastPos = {
                pageX: touch.pageX,
                pageY: touch.pageY
            };
            self.direction = null;    // call e.preventDefault() to prevent native browser behavior
                                      // DomEvent.fire(self.dragTarget, DRAG_PRE, getEventObject(self, e));
        },
        // call e.preventDefault() to prevent native browser behavior
        // DomEvent.fire(self.dragTarget, DRAG_PRE, getEventObject(self, e));
        move: function (e) {
            var self = this;
            Drag.superclass.move.apply(self, arguments);
            if (!self.isStarted) {
                startDrag(self, e);
            } else {
                sample(self, e);
                DomEvent.fire(self.dragTarget, PAN, getEventObject(self, e));
            }
        },
        end: function (e) {
            var self = this;
            var currentTouch = self.lastTouches[0];
            var currentTime = e.timeStamp;
            var velocityX = (currentTouch.pageX - self.lastPos.pageX) / (currentTime - self.lastTime);
            var velocityY = (currentTouch.pageY - self.lastPos.pageY) / (currentTime - self.lastTime);
            DomEvent.fire(self.dragTarget, PAN_END, getEventObject(self, e, {
                velocityX: velocityX || 0,
                velocityY: velocityY || 0
            }));
            if (doc.body.releaseCapture) {
                doc.body.releaseCapture();
            }
        }
    });
    addGestureEvent([
        PAN_START,
        PAN,
        PAN_END
    ], { handle: new Drag() });
    module.exports = {
        //DRAG_PRE: DRAG_PRE,
        PAN_START: PAN_START,
        PAN: PAN,
        PAN_END: PAN_END
    };
});


