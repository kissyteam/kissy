/**
 * @ignore
 * KISSY.Popup
 * @author qiaohua@taobao.com, yiminghe@gmail.com
 */

var Overlay = require('./control');
var util = require('util');
var $ = require('node');

function bindTriggerMouse() {
    var self = this,
        trigger = self.get('trigger'),
        timer;

    self.__mouseEnterPopup = function (ev) {
        clearHiddenTimer.call(self);
        timer = util.later(function () {
            showing.call(self, ev);
            timer = undefined;
        }, self.get('mouseDelay') * 1000);
    };

    trigger.on('mouseenter', self.__mouseEnterPopup);

    self._mouseLeavePopup = function () {
        if (timer) {
            timer.cancel();
            timer = undefined;
        }
        setHiddenTimer.call(self);
    };

    trigger.on('mouseleave', self._mouseLeavePopup);
}

function setHiddenTimer() {
    var self = this;
    var delay = self.get('mouseDelay') * 1000;
    self._hiddenTimer = util.later(function () {
        hiding.call(self);
    }, delay);
}

function clearHiddenTimer() {
    var self = this;
    if (self._hiddenTimer) {
        self._hiddenTimer.cancel();
        self._hiddenTimer = undefined;
    }
}

function bindTriggerClick() {
    var self = this;
    self.__clickPopup = function (ev) {
        ev.preventDefault();
        if (self.get('toggle')) {
            (self.get('visible') ? hiding : showing).call(self, ev);
        } else {
            showing.call(self, ev);
        }
    };

    self.get('trigger').on('click', self.__clickPopup);
}

function showing(ev) {
    var self = this;
    self.set('currentTrigger', $(ev.target));
    self.show();
}

function hiding() {
    this.set('currentTrigger', undefined);
    this.hide();
}

/**
 * @class KISSY.Overlay.Popup
 * KISSY Popup Component.
 * xclass: 'popup'.
 * @extends KISSY.Overlay
 */
module.exports = Overlay.extend({
    initializer: function () {
        var self = this,
        // 获取相关联的 Dom 节点
            trigger = self.get('trigger');
        if (trigger) {
            if (self.get('triggerType') === 'mouse') {
                bindTriggerMouse.call(self);
            } else {
                bindTriggerClick.call(self);
            }
        }
    },

    bindUI: function () {
        var self = this,
            trigger = self.get('trigger');
        if (trigger) {
            if (self.get('triggerType') === 'mouse') {
                self.$el.on('mouseleave', setHiddenTimer, self)
                    .on('mouseenter', clearHiddenTimer, self);
            }
        }
    },

    destructor: function () {
        var self = this,
            $el = self.$el,
            t = self.get('trigger');

        if (t) {
            if (self.__clickPopup) {
                t.detach('click', self.__clickPopup);
            }
            if (self.__mouseEnterPopup) {
                t.detach('mouseenter', self.__mouseEnterPopup);
            }
            if (self._mouseLeavePopup) {
                t.detach('mouseleave', self._mouseLeavePopup);
            }
        }

        if ($el) {
            $el.detach('mouseleave', setHiddenTimer, self)
                .detach('mouseenter', clearHiddenTimer, self);
        }

    }
}, {
    ATTRS: {
        /**
         * Trigger elements to show popup.
         * @cfg {KISSY.Node} trigger
         */
        /**
         * @ignore
         */
        trigger: {
            setter: function (v) {
                return $(v);
            }
        },
        /**
         * How to activate trigger element, 'click' or 'mouse'.
         *
         * Defaults to: 'click'.
         *
         * @cfg {String} triggerType
         */
        /**
         * @ignore
         */
        triggerType: {
            value: 'click'
        },
        currentTrigger: {},
        /**
         * When trigger type is mouse, the delayed time to show popup.
         *
         * Defaults to: 0.1, in seconds.
         *
         * @cfg {Number} mouseDelay
         */
        /**
         * @ignore
         */
        mouseDelay: {
            // triggerType 为 mouse 时, Popup 显示的延迟时间, 默认为 100ms
            value: 0.1
        },
        /**
         * When trigger type is click, whether support toggle.
         *
         * Defaults to: false
         *
         * @cfg {Boolean} toggle
         */
        /**
         * @ignore
         */
        toggle: {
            // triggerType 为 click 时, Popup 是否有toggle功能
            value: false
        }
    },
    xclass: 'popup'
});

/**
 * @ignore
 * 2011-05-17
 *  - yiminghe@gmail.com：利用 initializer , destructor ,ATTRS
 **/