/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 19:20
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 event/dom/touch/handle-map
 event/dom/touch/gesture
 event/dom/touch/single-touch
 event/dom/touch/tap
 event/dom/touch/swipe
 event/dom/touch/double-tap
 event/dom/touch/multi-touch
 event/dom/touch/pinch
 event/dom/touch/tap-hold
 event/dom/touch/rotate
 event/dom/touch/single-touch-start
 event/dom/touch/handle
 event/dom/touch
*/

/**
 * @ignore
 * handles for gesture events
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/handle-map', function () {

    return {

    };

});
/**
 * @ignore
 * patch gesture for touch
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/gesture', function (S, DomEvent) {

    var Gesture = DomEvent.Gesture,
        Features = S.Features,
        startEvent,
        moveEvent,
        cancelEvent,
        endEvent;

    // 不能同时绑定 touchstart 与 mousedown 会导致 ios 不能选择文本
    // bind mousedown to turn element into clickable element
    if (Features.isTouchEventSupported()) {
        startEvent = 'touchstart';
        moveEvent = 'touchmove';
        endEvent = 'touchend';
        cancelEvent = 'touchcancel';
    }


    else if (Features.isMsPointerSupported()) {
        startEvent = 'MSPointerDown';
        moveEvent = 'MSPointerMove';
        endEvent = 'MSPointerUp';
        cancelEvent = 'MSPointerCancel';
    }

    // force to load event/dom/touch in pc to use mouse to simulate touch
    if (startEvent) {
        Gesture.start = startEvent;
        Gesture.move = moveEvent;
        Gesture.end = endEvent;
        Gesture.cancel = cancelEvent;
        Gesture.tap = 'tap';
        Gesture.doubleTap = 'doubleTap';
        Gesture.singleTouchStart = 'singleTouchStart';
    }

    return Gesture;

}, {
    requires: ['event/dom/base']
});
/**
 * @ignore
 * touch count guard
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/single-touch', function (S) {

    function SingleTouch() {
    }

    SingleTouch.prototype = {
        constructor: SingleTouch,
        requiredTouchCount: 1,
        onTouchStart: function (e) {
            var self = this;
            if (e.touches.length != self.requiredTouchCount) {
                return false;
            }
            self.lastTouches = e.touches;
            return undefined;
        },
        onTouchMove: S.noop,
        onTouchEnd: S.noop
    };

    return SingleTouch;

});
/**
 * @ignore
 * gesture tap
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/tap', function (S, eventHandleMap, DomEvent, SingleTouch) {

    var event = 'tap';

    function Tap() {
    }

    S.extend(Tap, SingleTouch, {

        onTouchMove: function () {
            return false;
        },

        onTouchEnd: function (e) {
            var touch = e.changedTouches[0];
            DomEvent.fire(e.target, event, {
                pageX: touch.pageX,
                pageY: touch.pageY,
                which: 1,
                touch: touch
            });
        }

    });

    eventHandleMap[event] = {
        handle: new Tap()
    };

    return Tap;

}, {
    requires: ['./handle-map', 'event/dom/base', './single-touch']
});
/**
 * @ignore
 *
 * yiminghe@gmail.com 2012-10-31
 *
 * 页面改动必须先用桌面 chrome 刷新下，再用 ios 刷新，否则很可能不生效??
 *
 * why to implement tap:
 * 1.   click 造成 clickable element 有 -webkit-tap-highlight-color 其内不能选择文字
 * 2.   touchstart touchdown 时间间隔非常短不会触发 click (touchstart)
 * 3.   click 在touchmove 到其他地方后仍然会触发（如果没有组织touchmove默认行为导致的屏幕移动）
 *
 * tap:
 * 1.   长按可以选择文字，
 *      可以选择阻止 document 的 touchstart 来阻止整个程序的文字选择功能:
 *      同时阻止了touch 的 mouse/click 相关事件触发
 * 2.   反应更灵敏
 *
 * https://developers.google.com/mobile/articles/fast_buttons
 */
/**
 * @ignore
 * gesture swipe
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/swipe', function (S, eventHandleMap, DomEvent, SingleTouch) {

    var event = 'swipe',
        ingEvent = 'swiping',
        MAX_DURATION = 1000,
        MAX_OFFSET = 35,
        MIN_DISTANCE = 50;

    function fire(self, e, ing) {
        var touches = e.changedTouches,
            touch = touches[0],
            x = touch.pageX,
            y = touch.pageY,
            deltaX = x - self.startX,
            deltaY = y - self.startY,
            absDeltaX = Math.abs(deltaX),
            absDeltaY = Math.abs(deltaY),
            distance,
            direction;

        if (ing) {
            if (self.isVertical && self.isHorizontal) {
                if (absDeltaY > absDeltaX) {
                    self.isHorizontal = 0;
                } else {
                    self.isVertical = 0;
                }
            }
        } else {
            if (self.isVertical && absDeltaY < MIN_DISTANCE) {
                self.isVertical = 0;
            }

            if (self.isHorizontal && absDeltaX < MIN_DISTANCE) {
                self.isHorizontal = 0;
            }
        }

        if (self.isHorizontal) {
            direction = deltaX < 0 ? 'left' : 'right';
            distance = absDeltaX;
        } else if (self.isVertical) {
            direction = deltaY < 0 ? 'up' : 'down';
            distance = absDeltaY;
        } else {
            return false;
        }

        DomEvent.fire(e.target, ing ? ingEvent : event, {
            originalEvent: e.originalEvent,
            pageX:touch.pageX,
            pageY:touch.pageY,
            which: 1,
            /**
             *
             * native touch property **only for touch event**.
             *
             * @property touch
             * @member KISSY.DomEvent.DomEventObject
             */
            touch: touch,
            /**
             *
             * direction property **only for event swipe/singleTap/doubleTap**.
             *
             * can be one of 'up' 'down' 'left' 'right'
             * @property {String} direction
             * @member KISSY.DomEvent.DomEventObject
             */
            direction: direction,
            /**
             *
             * distance property **only for event swipe**.
             *
             * the distance swipe gesture costs
             * @property {Number} distance
             * @member KISSY.DomEvent.DomEventObject
             */
            distance: distance,
            /**
             *
             * duration property **only for touch event**.
             *
             * the duration swipe gesture costs
             * @property {Number} duration
             * @member KISSY.DomEvent.DomEventObject
             */
            duration: (e.timeStamp - self.startTime) / 1000
        });

        return undefined;
    }

    function Swipe() {
    }

    S.extend(Swipe, SingleTouch, {

        onTouchStart: function (e) {
            var self = this;
            if (Swipe.superclass.onTouchStart.apply(self, arguments) === false) {
                return false;
            }
            var touch = e.touches[0];
            self.startTime = e.timeStamp;

            self.isHorizontal = 1;
            self.isVertical = 1;

            self.startX = touch.pageX;
            this.startY = touch.pageY;

            if (e.type.indexOf('mouse') != -1) {
                e.preventDefault();
            }
            return undefined;
        },

        onTouchMove: function (e) {
            var self = this,
                touch = e.changedTouches[0],
                x = touch.pageX,
                y = touch.pageY,
                deltaX = x - self.startX,
                deltaY = y - self.startY,
                absDeltaX = Math.abs(deltaX),
                absDeltaY = Math.abs(deltaY),
                time = e.timeStamp;

            if (time - self.startTime > MAX_DURATION) {
                return false;
            }

            if (self.isVertical && absDeltaX > MAX_OFFSET) {
                self.isVertical = 0;
            }

            if (self.isHorizontal && absDeltaY > MAX_OFFSET) {
                self.isHorizontal = 0;
            }

            return fire(self, e, 1);
        },

        onTouchEnd: function (e) {
            var self = this;
            if (self.onTouchMove(e) === false) {
                return false;
            }
            return fire(self, e, 0);
        }

    });

    eventHandleMap[event] = eventHandleMap[ingEvent] = {
        handle: new Swipe()
    };

    return Swipe;

}, {
    requires: ['./handle-map', 'event/dom/base', './single-touch']
});
/**
 * @ignore
 * gesture single tap double tap
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/double-tap',
    function (S, eventHandleMap, DomEvent, SingleTouch) {

        var SINGLE_TAP = 'singleTap',
            DOUBLE_TAP = 'doubleTap',
        // same with native click delay
            MAX_DURATION = 300;

        function DoubleTap() {
        }

        S.extend(DoubleTap, SingleTouch, {

            onTouchStart: function (e) {
                var self = this;
                if (DoubleTap.superclass.onTouchStart.apply(self, arguments) === false) {
                    return false;
                }
                self.startTime = e.timeStamp;
                if (self.singleTapTimer) {
                    clearTimeout(self.singleTapTimer);
                    self.singleTapTimer = 0;
                }
            },

            onTouchMove: function () {
                return false;
            },

            onTouchEnd: function (e) {
                var self = this,
                    lastEndTime = self.lastEndTime,
                    time = e.timeStamp,
                    target = e.target,
                    touch = e.changedTouches[0],
                    duration = time - self.startTime;
                self.lastEndTime = time;
                // second touch end
                if (lastEndTime) {
                    // time between current up and last up
                    duration = time - lastEndTime;
                    // a double tap
                    if (duration < MAX_DURATION) {
                        // a new double tap cycle
                        self.lastEndTime = 0;

                        DomEvent.fire(target, DOUBLE_TAP, {
                            touch: touch,
                            duration: duration / 1000
                        });
                        return;
                    }
                    // else treat as the first tap cycle
                }

                // time between down and up is long enough
                // then a singleTap
                duration = time - self.startTime;
                if (duration > MAX_DURATION) {
                    DomEvent.fire(target, SINGLE_TAP, {
                        touch: touch,
                        pageX:touch.pageX,
                        which: 1,
                        pageY:touch.pageY,
                        duration: duration / 1000
                    })
                } else {
                    // buffer singleTap
                    // wait for a second tap
                    self.singleTapTimer = setTimeout(function () {
                        DomEvent.fire(target, SINGLE_TAP, {
                            touch: touch,
                            pageX:touch.pageX,
                            which: 1,
                            pageY:touch.pageY,
                            duration: duration / 1000
                        });
                    }, MAX_DURATION);
                }

            }
        });

        eventHandleMap[SINGLE_TAP] = eventHandleMap[DOUBLE_TAP] = {
            handle: new DoubleTap()
        };

        return DoubleTap;

    }, {
        requires: ['./handle-map', 'event/dom/base', './single-touch']
    });
/**
 * @ignore
 * multi-touch base
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/multi-touch', function (S, Dom) {

    function MultiTouch() {}

    MultiTouch.prototype = {

        constructor: MultiTouch,

        requiredTouchCount: 2,

        onTouchStart: function (e) {
            var self = this,
                requiredTouchesCount = self.requiredTouchCount,
                touches = e.touches,
                touchesCount = touches.length;

            if (touchesCount === requiredTouchesCount) {
                self.start();
            }
            else if (touchesCount > requiredTouchesCount) {
                self.end(e);
            }
        },

        onTouchEnd: function (e) {
            this.end(e);
        },

        start: function () {
            var self = this;
            if (!self.isTracking) {
                self.isTracking = true;
                self.isStarted = false;
            }
        },

        fireEnd: S.noop,

        getCommonTarget: function (e) {
            var touches = e.touches,
                t1 = touches[0].target,
                t2 = touches[1].target;
            if (t1 == t2) {
                return t1;
            }
            if (Dom.contains(t1, t2)) {
                return t1;
            }

            while (1) {
                if (Dom.contains(t2, t1)) {
                    return t2;
                }
                t2 = t2.parentNode;
            }
            S.error('getCommonTarget error!');
            return undefined;
        },

        end: function (e) {
            var self = this;
            // finger1 down, finger2 down -> start multi touch
            // move finger1 or finger2 -> multi-touch move
            // finger2 up -> end multi touch
            // finger1 move -> ignore
            if (self.isTracking) {
                self.isTracking = false;

                if (self.isStarted) {
                    self.isStarted = false;
                    self.fireEnd(e);
                }
            }
        }
    };

    return MultiTouch;

}, {
    requires: ['dom']
});
/**
 * @ignore
 * gesture pinch
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/pinch', function (S, eventHandleMap, DomEvent, MultiTouch, Gesture) {

    var PINCH = 'pinch',
        PINCH_START = 'pinchStart',
        PINCH_END = 'pinchEnd';

    function getDistance(p1, p2) {
        var deltaX = p1.pageX - p2.pageX,
            deltaY = p1.pageY - p2.pageY;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    function Pinch() {
    }

    S.extend(Pinch, MultiTouch, {

        onTouchMove: function (e) {
            var self = this;

            if (!self.isTracking) {
                return;
            }

            var touches = e.touches;
            var distance = getDistance(touches[0], touches[1]);

            self.lastTouches = touches;

            if (!self.isStarted) {
                self.isStarted = true;
                self.startDistance = distance;
                var target = self.target = self.getCommonTarget(e);

                DomEvent.fire(target,
                    PINCH_START, S.mix(e, {
                        distance: distance,
                        scale: 1
                    }));
            } else {
                DomEvent.fire(self.target,
                    PINCH, S.mix(e, {
                        distance: distance,
                        scale: distance / self.startDistance
                    }));
            }
        },

        fireEnd: function (e) {
            var self = this;
            DomEvent.fire(self.target, PINCH_END, S.mix(e, {
                touches: self.lastTouches
            }));
        }

    });

    var p = new Pinch();

    eventHandleMap[PINCH_START] =
        eventHandleMap[PINCH_END] = {
            handle: p
        };

    function prevent(e) {
        // android can not throttle
        // need preventDefault always
        if (!e.touches || e.touches.length == 2) {
            e.preventDefault();
        }
    }

    eventHandleMap[PINCH] = {
        handle: p,
        add: function () {
            DomEvent.on(this, Gesture.move, prevent);
        },
        remove: function () {
            DomEvent.detach(this, Gesture.move, prevent);
        }
    };

    return Pinch;

}, {
    requires: ['./handle-map', 'event/dom/base', './multi-touch', './gesture']
});
/**
 * @ignore
 * fired when tap and hold for more than 1s
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/tap-hold', function (S, eventHandleMap, SingleTouch, DomEvent, Gesture) {
    var event = 'tapHold';

    var duration = 1000;

    function TapHold() {
    }

    S.extend(TapHold, SingleTouch, {
        onTouchStart: function (e) {
            var self = this;
            if (TapHold.superclass.onTouchStart.call(self, e) === false) {
                return false;
            }
            self.timer = setTimeout(function () {
                var touch= e.touches[0];
                DomEvent.fire(e.target, event, {
                    touch: touch,
                    pageX:touch.pageX,
                    pageY:touch.pageY,
                    which: 1,
                    duration: (S.now() - e.timeStamp) / 1000
                });
            }, duration);
        },

        onTouchMove: function () {
            clearTimeout(this.timer);
            return false;
        },

        onTouchEnd: function () {
            clearTimeout(this.timer);
        }
    });

    function prevent(e) {
        if (!e.touches || e.touches.length == 1) {
            e.preventDefault();
        }
    }

    eventHandleMap[event] = {
        setup: function () {
            // prevent native scroll
            DomEvent.on(this, Gesture.start, prevent);
        },
        tearDown: function () {
            DomEvent.detach(this, Gesture.start, prevent);
        },
        handle: new TapHold()
    };

    return TapHold;

}, {
    requires: ['./handle-map', './single-touch', 'event/dom/base', './gesture']
});
/**
 * @ignore
 * fired when rotate using two fingers
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/rotate', function (S, eventHandleMap, MultiTouch, DomEvent, Gesture, undefined) {
    var ROTATE_START = 'rotateStart',
        ROTATE = 'rotate',
        RAD_2_DEG = 180 / Math.PI,
        ROTATE_END = 'rotateEnd';

    function Rotate() {
    }

    S.extend(Rotate, MultiTouch, {

        onTouchMove: function (e) {
            var self = this;

            if (!self.isTracking) {
                return;
            }

            var touches = e.touches,
                one = touches[0],
                two = touches[1],
                lastAngle = self.lastAngle,
                angle = Math.atan2(two.pageY - one.pageY,
                    two.pageX - one.pageX) * RAD_2_DEG;

            if (lastAngle !== undefined) {
                // more smooth
                // 5 4 3 2 1 -1 -2 -3 -4
                // 170 180 190 200
                var diff = Math.abs(angle - lastAngle);
                var positiveAngle = (angle + 360) % 360;
                var negativeAngle = (angle - 360) % 360;

                // process '>' scenario: top -> bottom
                if (Math.abs(positiveAngle - lastAngle) < diff) {
                    angle = positiveAngle;
                }
                // process '>' scenario: bottom -> top
                else if (Math.abs(negativeAngle - lastAngle) < diff) {
                    angle = negativeAngle;
                }
            }

            self.lastTouches = touches;
            self.lastAngle = angle;

            if (!self.isStarted) {
                self.isStarted = true;

                self.startAngle = angle;

                self.target = self.getCommonTarget(e);

                DomEvent.fire(self.target, ROTATE_START, S.mix(e, {
                    angle: angle,
                    rotation: 0
                }));

            } else {
                DomEvent.fire(self.target, ROTATE, S.mix(e, {
                    angle: angle,
                    rotation: angle - self.startAngle
                }));
            }
        },

        end: function () {
            var self = this;
            self.lastAngle = undefined;
            Rotate.superclass.end.apply(self, arguments);
        },

        fireEnd: function (e) {
            var self = this;
            DomEvent.fire(self.target, ROTATE_END, S.mix(e, {
                touches: self.lastTouches
            }));
        }
    });

    function prevent(e) {
        // android can not throttle
        // need preventDefault always
        if (!e.touches || e.touches.length == 2) {
            e.preventDefault();
        }
    }

    var r = new Rotate();

    eventHandleMap[ROTATE_END] =
        eventHandleMap[ROTATE_START] = {
            handle: r
        };

    eventHandleMap[ROTATE] = {
        handle: r,
        add: function () {
            DomEvent.on(this, Gesture.move, prevent);
        },
        remove: function () {
            DomEvent.detach(this, Gesture.move, prevent);
        }
    };

    return Rotate;

}, {
    requires: ['./handle-map', './multi-touch', 'event/dom/base', './gesture']
});
/**
 * @ignore
 * singleTouchStart event
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/single-touch-start', function (S, eventHandleMap, DomEvent, SingleTouch) {

    var event = 'singleTouchStart';

    function SingleTouchStart() {
    }

    S.extend(SingleTouchStart, SingleTouch, {

        onTouchStart: function (e) {
            if (SingleTouchStart.superclass.onTouchStart.apply(this, arguments) !== false) {
                var touch= e.touches[0];
                DomEvent.fire(e.target, event, {
                    touch: touch[0],
                    pageX:touch.pageX,
                    pageY:touch.pageY,
                    which: 1,
                    touches: e.touches
                });
                return undefined;
            }
            return false;
        }

    });

    eventHandleMap[event] = {
        handle: new SingleTouchStart()
    };

    return SingleTouchStart;

}, {
    requires: ['./handle-map', 'event/dom/base', './single-touch']
});

/**
 * for draggable:
 * listen singleTouchStart insteadof native touchstart in case inner element call stopPropagation
 */
/**
 * @ignore
 * base handle for touch gesture
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/handle', function (S, Dom, eventHandleMap, DomEvent, Gesture) {

    var key = S.guid('touch-handle'),
        Features = S.Features,
        isMsPointerSupported = Features.isMsPointerSupported(),
        touchEvents = {};

    touchEvents[Gesture.start] = 'onTouchStart';
    touchEvents[Gesture.move] = 'onTouchMove';
    touchEvents[Gesture.end] = 'onTouchEnd';
    if (Gesture.cancel) {
        touchEvents[Gesture.cancel] = 'onTouchEnd';
    }

    function DocumentHandler(doc) {

        var self = this;

        self.doc = doc;

        self.eventHandle = {
        };

        self.init();

        // normalize pointer event to touch event
        self.touches = [];

    }

    DocumentHandler.prototype = {

        constructor: DocumentHandler,

        addTouch: function (t) {
            this.touches.push(t);
        },

        removeTouch: function (t) {
            var touches = this.touches;
            S.each(touches, function (tt, index) {
                if (tt.pointerId == t.pointerId) {
                    touches.splice(index, 1);
                    return false;
                }
                return undefined;
            });
        },

        updateTouch: function (t) {
            var touches = this.touches;
            S.each(touches, function (tt, index) {
                if (tt.pointerId == t.pointerId) {
                    touches[index] = t;
                    return false;
                }
                return undefined;
            });
        },

        init: function () {
            var self = this,
                doc = self.doc,
                e, h;

            for (e in touchEvents) {
                h = touchEvents[e];
                DomEvent.on(doc, e, self[h], self);
            }
        },

        normalize: function (e) {
            var type = e.type,
                notUp,
                touchList;
            if (Features.isTouchEventSupported()) {
                touchList = (type == 'touchend' || type == 'touchcancel') ?
                    e.changedTouches :
                    e.touches;
                if (touchList.length == 1) {
                    e.which = 1;
                    e.pageX = touchList.pageX;
                    e.pageY = touchList.pageY;
                }
                return e;
            }
            else if (isMsPointerSupported) {
                touchList = this.touches;
            } else {
                if (type.indexOf('mouse') != -1 && e.which != 1) {
                    return undefined;
                }
                touchList = [e];
            }
            notUp = !type.match(/(up|cancel)$/i);
            e.touches = notUp ? touchList : [];
            e.targetTouches = notUp ? touchList : [];
            e.changedTouches = touchList;
            return e;
        },

        onTouchMove: function (e) {
            if (isMsPointerSupported) {
                this.updateTouch(e.originalEvent);
            }
            // no throttle! to allow preventDefault
            this.callEventHandle('onTouchMove', e);
        },

        onTouchStart: function (event) {
            var e, h,
                self = this,
                eventHandle = self.eventHandle;
            for (e in eventHandle) {
                h = eventHandle[e].handle;
                h.isActive = 1;
            }
            if (isMsPointerSupported) {
                self.addTouch(event.originalEvent);
            }
            self.callEventHandle('onTouchStart', event);
        },

        onTouchEnd: function (event) {
            this.callEventHandle('onTouchEnd', event);
            if (isMsPointerSupported) {
                this.removeTouch(event.originalEvent);
            }
        },

        callEventHandle: function (method, event) {
            var self = this,
                eventHandle = self.eventHandle,
                e, h;
            event = self.normalize(event);
            if (event) {
                for (e in eventHandle) {
                    // event processor shared by multiple events
                    h = eventHandle[e].handle;
                    if (h.processed) {
                        continue;
                    }
                    h.processed = 1;
                    if (h.isActive && h[method](event) === false) {
                        h.isActive = 0;
                    }
                }

                for (e in eventHandle) {
                    h = eventHandle[e].handle;
                    h.processed = 0;
                }
            }
        },

        addEventHandle: function (event) {
            var self = this,
                eventHandle = self.eventHandle,
                handle = eventHandleMap[event].handle;
            if (eventHandle[event]) {
                eventHandle[event].count++;
            } else {
                eventHandle[event] = {
                    count: 1,
                    handle: handle
                };
            }
        },

        'removeEventHandle': function (event) {
            var eventHandle = this.eventHandle;
            if (eventHandle[event]) {
                eventHandle[event].count--;
                if (!eventHandle[event].count) {
                    delete eventHandle[event];
                }
            }

        },

        destroy: function () {
            var self = this,
                doc = self.doc,
                e, h;
            for (e in touchEvents) {
                h = touchEvents[e];
                DomEvent.detach(doc, e, self[h], self);
            }
        }

    };

    return {

        addDocumentHandle: function (el, event) {
            var doc = Dom.getDocument(el),
                handle = Dom.data(doc, key);
            if (!handle) {
                Dom.data(doc, key, handle = new DocumentHandler(doc));
            }
            handle.addEventHandle(event);
        },

        removeDocumentHandle: function (el, event) {
            var doc = Dom.getDocument(el),
                handle = Dom.data(doc, key);
            if (handle) {
                handle.removeEventHandle(event);
                if (S.isEmptyObject(handle.eventHandle)) {
                    handle.destroy();
                    Dom.removeData(doc, key);
                }
            }
        }

    };

}, {
    requires: [
        'dom',
        './handle-map',
        'event/dom/base',
        './gesture',
        './tap',
        './swipe',
        './double-tap',
        './pinch',
        './tap-hold',
        './rotate',
        './single-touch-start'
    ]
});
/**
 * in order to make tap/doubleTap bubbling same with native event.
 * register event on document and then bubble programmatically!
 */
/**
 * @ignore
 * touch event logic module
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch', function (S, DomEvent, eventHandleMap, eventHandle) {

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

