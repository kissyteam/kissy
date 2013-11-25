/**
 * @ignore
 * gesture normalization for pc and touch.
 * @author yiminghe@gmail.com
 */
KISSY.add(function () {

    /**
     * gesture for event
     * @enum {String} KISSY.Event.DomEvent.Gesture
     * @alias KISSY.Event.Gesture
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
         * singleTap gesture, it is  same with click on pc
         */
        singleTap: 'click',
        /**
         * doubleTap gesture, it is  same with dblclick on pc
         */
        doubleTap: 'dblclick'
    };

});