/**
 * gesture normalization for pc and touch.
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/gesture', function (S) {

    return {
        start: 'mousedown',
        move: 'mousemove',
        end: 'mouseup',
        tap: 'click'
    };

});