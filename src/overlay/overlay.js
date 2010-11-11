/**
 * KISSY Overlay
 * @author 玉伯<lifesinger@gmail.com>, 承玉<yiminghe@gmail.com>,乔花<qiaohua@taobao.com>
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

    var Overlay = Base.create([S.Ext.Box,
        S.Ext.ContentBox,
        S.Ext.Position,
        S.Ext.Shim,
        S.Ext.Mask], {

        init:function() {
            S.log("Overlay init");
            var self = this,trigger = self.get("trigger");
            if (trigger &&
                trigger.length > 0) {
                self._bindTrigger();
            }
            self.on("bindUI", self._bindUIOverlay, self);
            self.on("renderUI", self._renderUIOverlay, self);
            self.on("syncUI", self._syncUIOverlay, self);
        },

        _renderUIOverlay:function() {
            S.log("_renderUIOverlay");
        },

        _syncUIOverlay:function() {
            S.log("_syncUIOverlay");
        },
        /**
         * bindUI
         * 注册dom事件以及属性事件
         * @override
         */
        _bindUIOverlay: function() {
            S.log("_bindUIOverlay");
            var self = this;
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
            var self = this,
                trigger = self.get("trigger");

            var timer;
            trigger.on(MOUSEENTER, function() {
                timer && timer.cancel();
                timer = S.later(function() {
                    self.show();
                    timer = undefined;
                }, 100);
            });
            trigger.on(MOUSELEAVE, function() {
                timer && timer.cancel();
                timer = undefined;
                self.hide();
            });
        },



        /**
         * 触发器点击事件
         */
        _bindTriggerClick: function() {
            var self = this,
                trigger = self.get("trigger");
            trigger.on(CLICK, function(e) {
                e.halt();
                self.show();
            });
        },

        /**
         * 删除自己, mask 删不了
         */
        destructor: function() {
            S.log("overlay destructor");
            var self = this,
                trigger = self.get("trigger");
            trigger && trigger.detach(MOUSEENTER +
                " " +
                MOUSELEAVE +
                " " +
                CLICK);
        }

    }, {
        ATTRS : {
            trigger: {
                // 触发器，可以是多个
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
            },
            elStyle:{
                value:{
                    position:"absolute"
                }
            }

        }
    });


    S.Overlay = Overlay;

}, {
    requires: ["core"]
});

/**
 * 2010-11-09 2010-11-10 承玉<yiminghe@gmail.com>重构，attribute-base-Overlay ，采用 Base.create
 *
 * TODO:
 *  - stackable ?
 *  - effect
 */
