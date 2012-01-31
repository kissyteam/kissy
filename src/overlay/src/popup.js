/**
 * @fileOverview KISSY.Popup
 * @author  乔花<qiaohua@taobao.com> , yiminghe@gmail.com
 */
KISSY.add('overlay/popup', function(S, Component, Overlay, undefined) {
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
        trigger: {                          // 触发器
            setter:function(v) {
                if (S.isString(v)) v = S.all(v);
                return v;
            }
        },
        triggerType: {value:'click'},       // 触发类型
        currentTrigger: {
        },
        mouseDelay: {
            value: 100                      // triggerType 为 mouse 时, Popup 显示的延迟时间, 默认为 100ms
        },
		toggle :{
			value:false                     // triggerType 为 click 时, Popup 是否有toggle功能
		}
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

            self.__mouseEnterPopup = function(ev) {
                self._clearHiddenTimer();

                timer = S.later(function() {
                    self._showing(ev);
                    timer = undefined;
                }, self.get('mouseDelay'));
            };

            S.each(trigger, function(el) {
                S.one(el).on('mouseenter', self.__mouseEnterPopup);
            });

            self._mouseLeavePopup = function() {
                if (timer) {
                    timer.cancel();
                    timer = undefined;
                }

                self._setHiddenTimer();
            };

            S.each(trigger, function(el) {
                S.one(el).on('mouseleave', self._mouseLeavePopup);
            });
        },

        _bindContainerMouse: function() {
            var self = this;

            self.get('el').on('mouseleave', self._setHiddenTimer, self)
                .on('mouseenter', self._clearHiddenTimer, self);
        },

        _setHiddenTimer: function(ev) {
            var self = this;
            self._hiddenTimer = S.later(function() {
                self._hiding(ev);
            }, self.get('mouseDelay'));
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
            self.__clickPopup = function(ev) {
                ev.halt();
				if(self.get('toggle')){
                    self[self.get('visible')?'_hiding':'_showing'](ev);
				}
				else  self._showing(ev);
            };
            S.each(self.get("trigger"), function(el) {
                S.one(el).on('click', self.__clickPopup);
            });
        },
        _showing: function(ev) {
            this.set('currentTrigger', S.one(ev.target));
            this.show();
        },
        _hiding: function(ev) {
            this.set('currentTrigger', undefined);
            this.hide();
        },

        destructor:function() {
            var self = this;
            var t = self.get("trigger");
            if (t) {
                if (self.__clickPopup) {
                    S.each(t, function(el) {
                        S.one(el).detach('click', self.__clickPopup);
                    });
                }
                if (self.__mouseEnterPopup) {
                    S.each(t, function(el) {
                        S.one(el).detach('mouseenter', self.__mouseEnterPopup);
                    });
                }

                if (self._mouseLeavePopup) {
                    S.each(t, function(el) {
                        S.one(el).detach('mouseleave', self._mouseLeavePopup);
                    });
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
    requires:[ "component","./base"]
});

/**
 * 2011-05-17
 *  - 承玉：利用 initializer , destructor ,ATTRS
 **/