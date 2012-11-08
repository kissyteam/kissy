/**
 * @ignore
 * gesture pinch
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/pinch', function (S, eventHandleMap, Event, BaseTouch, DOM) {

    var PINCH = 'pinch',
        PINCH_START = 'pinchStart',
        PINCH_END = 'pinchEnd';

    function getDistance(p1, p2) {
        var deltaX = p1.pageX - p2.pageX,
            deltaY = p1.pageY - p2.pageY;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    function getCommonTarget(t1, t2) {
        if (t1 == t2) {
            return t1;
        }
        if (DOM.contains(t1, t2)) {
            return t1;
        }

        while (1) {
            if (DOM.contains(t2, t1)) {
                return t2;
            }
            t2 = t2.parentNode;
        }
        S.error('getCommonTarget error!');
        return undefined;
    }

    function Pinch() {
        this.requiredTouchCount = 2;
        this.event = event;
    }

    S.extend(Pinch, BaseTouch, {

        onTouchStart: function (e) {
            //S.log('onTouchStart'+ e.touches.length);
            if (Pinch.superclass.onTouchStart.apply(this, arguments) === false) {
                return false;
            }
            var touches = e.touches,
                distance = getDistance(touches[0], touches[1]);

            this.startDistance = distance;

            var target = this.target = getCommonTarget(touches[0].target, touches[1].target);

            Event.fire(target,
                PINCH_START, {
                    touches: touches,
                    distance: distance,
                    scale: 1
                });
        },

        onTouchMove: function (e) {
            //S.log('onTouchMove'+' : ' +e.touches.length+' : '+ e.changedTouches.length);
            var r = Pinch.superclass.onTouchMove.apply(this, arguments);
            if (r === false) {
                return false;
            }
            if (r === true) {
                return;
            }
            var touches = e.touches,
                distance = getDistance(touches[0], touches[1]);

            Event.fire(this.target,
                PINCH, {
                    touches: touches,
                    distance: distance,
                    scale: distance / this.startDistance
                });

            this.lastTouches = touches;
        },

        onTouchEnd: function () {
            //S.log('touchend');
            Event.fire(this.target, PINCH_END, {
                touches: this.lastTouches
            });
        }

    });

    eventHandleMap[PINCH] =
        eventHandleMap[PINCH_END] =
            eventHandleMap[PINCH_END] = Pinch;

    return Pinch;

}, {
    requires: ['./handle-map', 'event/dom/base', './base-touch', 'dom']
});