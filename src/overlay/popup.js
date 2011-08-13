/**
 * KISSY.Popup
 * @author  乔花<qiaohua@taobao.com> , 承玉<yiminghe@gmail.com>
 */
KISSY.add('overlay/popup', function(S, Component, Overlay, undefined) {

    var POPUP_DELAY = 100;

    function Popup(container, config) {
        var self = this;

        // 支持 Popup(config)
        if (S.isUndefined(config)) {
            config = container;
        } else {
            config.srcNode = container;
        }

        Popup.superclass.constructor.call(self, config);
    }

    Popup.ATTRS = {
        trigger: {
            setter:function(v) {
                return S.one(v);
            }
        },          // 触发器
        triggerType: {value:'click'}    // 触发类型
    };

    S.extend(Popup, Overlay, {
        initializer: function() {
            var self = this;
            // 获取相关联的 DOM 节点
            var trigger = self.get("trigger");
            if (trigger) {
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
                trigger = self.get("trigger"),
                timer;

            self.__mouseEnterPopup = function() {
                self._clearHiddenTimer();

                timer = S.later(function() {
                    self.show();
                    timer = undefined;
                }, POPUP_DELAY);
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
            }, POPUP_DELAY);
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
            self.get("trigger").on('click', self.__clickPopup);
        },

        destructor:function() {
            var self = this;
            var t = self.get("trigger");
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
            if (self.get('el')) {
                self.get('el').detach('mouseleave', self._setHiddenTimer, self)
                    .detach('mouseenter', self._clearHiddenTimer, self);
            }
        }
    });


    Component.UIStore.setUIByClass("popup", {
        priority:Component.UIStore.PRIORITY.LEVEL1,
        ui:Popup
    });

    return Popup;
}, {
    requires:[ "component","./overlay"]
});

/**
 * 2011-05-17
 *  - 承玉：利用 initializer , destructor ,ATTRS
 **/