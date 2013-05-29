/**
 * @ignore
 * gesture normalization for pc and touch.
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/gesture', function (S) {

    /**
     * gesture for event
     * @enum {String} KISSY.Event.Gesture
     */
    return {
        /**
         * start gesture
         */
        start: 'mousedown',
        /**
         * move gesture
         */
        move: 'mousemove',
        /**
         * end gesture
         */
        end: 'mouseup',
        /**
         * tap gesture
         */
        tap: 'click',
        /**
         * doubleTap gesture, it is not same with dblclick
         */
        doubleTap:'dblclick'
    };

});