/**
 * @ignore
 * touch count guard
 * @author yiminghe@gmail.com
 */
var Touch = require('./touch');
var util = require('util');

function SingleTouch() {
}

util.extend(SingleTouch, Touch, {
    requiredTouchCount: 1,

    start: function () {
        SingleTouch.superclass.start.apply(this, arguments);
        var self = this,
            touches = self.lastTouches;
        // ios will share touches with touchmove...
        self.lastXY = {
            pageX: touches[0].pageX,
            pageY: touches[0].pageY
        };
    }
});

module.exports = SingleTouch;