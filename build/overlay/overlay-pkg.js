/*
Copyright 2011, KISSY UI Library v1.1.8dev
MIT Licensed
build time: ${build.time}
*/
/**
 * KISSY Overlay
 * @author: 玉伯<lifesinger@gmail.com>, 承玉<yiminghe@gmail.com>,乔花<qiaohua@taobao.com>
 */
KISSY.add("overlay", function(S) {

    var UIBase = S.UIBase,
        UA = S.UA;


    S.Overlay = UIBase.create([S.UIBase.Box,
        S.UIBase.ContentBox,
        S.UIBase.Position,
        S.UIBase.Loading,
        //ie6 支持,select bug
        UA.ie == 6 ? S.UIBase.Shim : null,
        S.UIBase.Align,
        S.UIBase.Mask,
        S.__OverlayEffect
    ], {

        initializer:function() {
            //S.log("Overlay init");
        },

        renderUI:function() {
            //S.log("_renderUIOverlay");
            this.get("el").addClass("ks-overlay");
        },

        syncUI:function() {
            //S.log("_syncUIOverlay");
        },
        /**
         * bindUI
         * 注册dom事件以及属性事件
         * @override
         */
        bindUI: function() {
            //S.log("_bindUIOverlay");
        },

        /**
         * 删除自己, mask 删不了
         */
        destructor: function() {
            //S.log("overlay destructor");
        }

    },{
        ATTRS:{
            elOrder:0
        }
    });
}, {
    requires: ["uibase"]
});

/**
 * 2010-11-09 2010-11-10 承玉<yiminghe@gmail.com>重构，attribute-base-Overlay ，采用 Base.create
 */
/**
 * KISSY.Dialog
 * @author: 承玉<yiminghe@gmail.com>, 乔花<qiaohua@taobao.com>
 */
KISSY.add('dialog', function(S) {

    S.Dialog = S.UIBase.create(S.Overlay,
        [
            S.UIBase.StdMod,
            S.UIBase.Close,
            S.UIBase.Drag,
            S.UIBase.Constrain
        ], {
        initializer:function() {
            //S.log("dialog init");
        },

        renderUI:function() {
            //S.log("_renderUIDialog");
            var self = this;
            self.get("el").addClass("ks-dialog");
            //设置值，drag-ext 绑定时用到
            self.set("handlers", [self.get("header")]);
        },
        bindUI:function() {
            //S.log("_bindUIDialog");
        },
        syncUI:function() {
            //S.log("_syncUIDialog");
        },
        destructor:function() {
            //S.log("Dialog destructor");
        }
    });


}, { host: 'overlay' });

/**
 * 2010-11-10 承玉<yiminghe@gmail.com>重构，使用扩展类
 */



/**
 * KISSY Popup
 * @author: 玉伯<lifesinger@gmail.com>, 承玉<yiminghe@gmail.com>,乔花<qiaohua@taobao.com>
 */
KISSY.add('overlay/popup', function(S, undefined) {
    function Popup(container, config) {
        var self = this;

        //if (!(self instanceof Popup)) {
        //    return new Popup(container, config);
        //}

        // 支持 Popup(config)
        if (S.isUndefined(config)) {
            config = container;
        } else {
            config.srcNode = container;
        }
        Popup.superclass.constructor.call(self, config);
    }

    Popup.ATTRS = {
        trigger: null,          // 触发器
        triggerType: {value:'click'}    // 触发类型
    };

    S.extend(Popup, S.Overlay, {
        initializer: function() {
            var self = this;

            // 获取相关联的 DOM 节点
            self.trigger = S.one(self.get("trigger"));

            if (self.trigger) {
                if (self.get("triggerType") === 'mouse') {
                    self._bindTriggerMouse();

                    self.on('bindUI', function() {
                        self._bindContainerMouse();
                    });
                } else {
                    self._bindTriggerClick();
                }
            }
        },

        _bindTriggerMouse: function() {
            var self = this,
                trigger = self.trigger, timer;

            self.__mouseEnterPopup = function() {
                self._clearHiddenTimer();

                timer = S.later(function() {
                    self.show();
                    timer = undefined;
                }, 100);
            };

            trigger.on('mouseenter', self.__mouseEnterPopup);


            self._mouseLeavePopup = function() {
                if (timer) {
                    timer.cancel();
                    timer = undefined;
                }

                self._setHiddenTimer();
            };

            trigger.on('mouseleave', self._mouseLeavePopup);
        },

        _bindContainerMouse: function() {
            var self = this;

            self.get('el').on('mouseleave', self._setHiddenTimer, self)
                .on('mouseenter', self._clearHiddenTimer, self);
        },

        _setHiddenTimer: function() {
            var self = this;
            self._hiddenTimer = S.later(function() {
                self.hide();
            }, 120);
        },

        _clearHiddenTimer: function() {
            var self = this;
            if (self._hiddenTimer) {
                self._hiddenTimer.cancel();
                self._hiddenTimer = undefined;
            }
        },

        _bindTriggerClick: function() {
            var self = this;
            self.__clickPopup = function(e) {
                e.halt();
                self.show();
            };
            self.trigger.on('click', self.__clickPopup);
        },
        destructor: function() {
            var self = this;
            if (self.trigger) {
                var t = self.trigger;
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
            if (self.get('el')) {
                self.get('el').detach('mouseleave', self._setHiddenTimer, self)
                    .detach('mouseenter', self._clearHiddenTimer, self);
            }
        }
    });

    S.Popup = Popup;


}, { host: 'overlay' });