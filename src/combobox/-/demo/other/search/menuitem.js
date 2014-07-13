var $ = require('node');
var util = require('util');
var Menu = require('menu');
var KeyCode = $.Event.KeyCode;
module.exports = Menu.Item.extend({
    handleKeyDownInternal: function (e) {
        if (e.keyCode === KeyCode.LEFT) {

        } else if (e.keyCode === KeyCode.RIGHT) {

        } else {
            this.callSuper(e);
        }
    },
    handleMouseEnterInternal: function (e) {
        var superCall = util.bind(this.callSuper, arguments.callee, this);
        this._lazyTimeout = setTimeout(function () {
            superCall(e);
        }, 100);
    },
    handleMouseLeaveInternal: function (e) {
        this.callSuper(e);
        if (this._lazyTimeout) {
            clearTimeout(this._lazyTimeout);
            this._lazyTimeout = 0;
        }
    }
}, {
    xclass: 'search-menuitem'
});