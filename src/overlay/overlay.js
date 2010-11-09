/**
 * KISSY Overlay
 * @author 玉伯<lifesinger@gmail.com>, 乔花<qiaohua@taobao.com>,yiminghe@gmail.com
 */
KISSY.add("overlay", function(S, undefined) {

    var Base = S.Base,
        EL = "el",
        TRIGGERTYPE = "triggerType",
        MOUSE = "mouse",
        MOUSEENTER = MOUSE + "enter",
        MOUSELEAVE = MOUSE + "leave",
        CLICK = "click";


    /*
     * DOM 结构
     *  <div class="ks-overlay">
     *  </div>
     */

    var Overlay = Base.create([S.Ext.Box,S.Ext.InnerBox,S.Ext.Position], {

        init:function() {
            var self = this,trigger = self.get("trigger");
            if (trigger &&
                trigger.length > 0) {
                self._bindTrigger();
            }
            self.on("bindUI", self._bindUIOverlay, self);
        },

        /**
         * bindUI
         * 注册dom事件以及属性事件
         * @override
         */
        _bindUIOverlay: function() {
            var self = this;
            if (self.get(TRIGGERTYPE) === MOUSE)
                self._bindElMouse();
        },


        /**
         * 绑定触发器上的响应事件
         */
        _bindTrigger: function() {
            var self = this;
            if (self.get(TRIGGERTYPE) === MOUSE) {
                self._bindTriggerMouse();
            } else {
                self._bindTriggerClick();
            }
        },

        /**
         * 触发器的鼠标移动事件
         */
        _bindTriggerMouse: function() {
            var self = this;

            self.get("trigger").each(function(trigger) {
                var timer;
                trigger.on(MOUSEENTER, function() {
                    self._clearHiddenTimer();
                    timer = S.later(function() {
                        self.show();
                        timer = undefined;
                    }, 100);
                });
                trigger.on(MOUSELEAVE, function() {
                    if (timer) {
                        timer.cancel();
                        timer = undefined;
                    }
                    self._setHiddenTimer();
                });
            });
        },

        /**
         * 下面三个函数, 用于处理鼠标快速移出容器时是否需要隐藏的延时
         */
        _bindElMouse: function() {
            var self = this,
                el = self.get(EL);
            el.detach(MOUSEENTER + " " + MOUSELEAVE);
            el.on(MOUSELEAVE, self._setHiddenTimer, self);
            el.on(MOUSEENTER, self._clearHiddenTimer, self);
        },

        _setHiddenTimer: function() {
            var self = this;
            self._hiddenTimer = S.later(self.hide, 120, false, self);
        },

        _clearHiddenTimer: function() {
            var self = this;
            if (self._hiddenTimer) {
                self._hiddenTimer.cancel();
                self._hiddenTimer = undefined;
            }
        },

        /**
         * 触发器点击事件
         */
        _bindTriggerClick: function() {
            var self = this;
            self.get("trigger").each(function(trigger) {
                trigger.on(CLICK, function(e) {
                    e.halt();
                    self.show();
                });
            });
        },

        /**
         * 删除自己, mask 删不了
         */
        destroy: function() {
            var self = this,
                trigger = self.get("trigger");
            trigger && trigger.detach(MOUSEENTER +
                " " +
                MOUSELEAVE +
                " " +
                CLICK);
            Overlay.superclass.constructor.call(self);
        }

    }, {
        ATTRS : {
            trigger: {
                // 触发器, 可以是多个
                setter:function(v) {
                    if (S.isString(v)) {
                        return S.all(v);
                    }
                }
            },
            triggerType: {
                // 触发类型
                value: CLICK
            },

            //重定义最外层css默认值
            elCls:{
                value:"ks-overlay"
            }

        }
    });


    S.Overlay = Overlay;

}, {
    requires: ["core"]
});

/**
 * 2010-11-09 yiminghe 重构，attribute-base-Overlay ，采用 Base.create
 *
 * TODO:
 *  - stackable ?
 *  - effect
 */
