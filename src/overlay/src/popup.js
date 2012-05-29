/**
 * @fileOverview KISSY.Popup
 * @author qiaohua@taobao.com, yiminghe@gmail.com
 */
KISSY.add('overlay/popup', function (S, Overlay, undefined) {

    /**
     * KISSY Popup Component
     * @class
     * @memberOf Overlay
     * @extends Overlay
     * @name Popup
     */
    var Popup = Overlay.extend(
        /**
         * @lends Overlay.Popup#
         */
        {
            /**
             * see {@link Component.UIBase.Box#show}
             * @name Overlay.Popup#show
             * @function
             */



            initializer:function () {
                var self = this,
                // 获取相关联的 DOM 节点
                    trigger = self.get("trigger");
                if (trigger) {
                    if (self.get("triggerType") === 'mouse') {
                        self._bindTriggerMouse();
                        self.on('bindUI', function () {
                            self._bindContainerMouse();
                        });
                    } else {
                        self._bindTriggerClick();
                    }
                }
            },

            _bindTriggerMouse:function () {
                var self = this,
                    trigger = self.get("trigger"),
                    timer;

                self.__mouseEnterPopup = function (ev) {
                    self._clearHiddenTimer();
                    timer = S.later(function () {
                        self._showing(ev);
                        timer = undefined;
                    }, self.get('mouseDelay') * 1000);
                };

                S.each(trigger, function (el) {
                    S.one(el).on('mouseenter', self.__mouseEnterPopup);
                });

                self._mouseLeavePopup = function () {
                    if (timer) {
                        timer.cancel();
                        timer = undefined;
                    }

                    self._setHiddenTimer();
                };

                S.each(trigger, function (el) {
                    S.one(el).on('mouseleave', self._mouseLeavePopup);
                });
            },

            _bindContainerMouse:function () {
                var self = this;
                self.get('el')
                    .on('mouseleave', self._setHiddenTimer, self)
                    .on('mouseenter', self._clearHiddenTimer, self);
            },

            _setHiddenTimer:function () {
                var self = this;
                self._hiddenTimer = S.later(function () {
                    self._hiding();
                }, self.get('mouseDelay') * 1000);
            },

            _clearHiddenTimer:function () {
                var self = this;
                if (self._hiddenTimer) {
                    self._hiddenTimer.cancel();
                    self._hiddenTimer = undefined;
                }
            },

            _bindTriggerClick:function () {
                var self = this;
                self.__clickPopup = function (ev) {
                    ev.halt();
                    if (self.get('toggle')) {
                        self[self.get('visible') ? '_hiding' : '_showing'](ev);
                    } else {
                        self._showing(ev);
                    }
                };
                S.each(self.get("trigger"), function (el) {
                    S.one(el).on('click', self.__clickPopup);
                });
            },

            _showing:function (ev) {
                var self = this;
                self.set('currentTrigger', S.one(ev.target));
                self.show();
            },

            _hiding:function () {
                this.set('currentTrigger', undefined);
                this.hide();
            },

            destructor:function () {
                var self = this,
                    root,
                    t = self.get("trigger");
                if (t) {
                    if (self.__clickPopup) {
                        t.each(function (el) {
                            el.detach('click', self.__clickPopup);
                        });
                    }
                    if (self.__mouseEnterPopup) {
                        t.each(function (el) {
                            el.detach('mouseenter', self.__mouseEnterPopup);
                        });
                    }

                    if (self._mouseLeavePopup) {
                        t.each(function (el) {
                            el.detach('mouseleave', self._mouseLeavePopup);
                        });
                    }
                }
                if (root = self.get('el')) {
                    root.detach('mouseleave', self._setHiddenTimer, self)
                        .detach('mouseenter', self._clearHiddenTimer, self);
                }
            }
        }, {
            ATTRS:/**
             * @lends Overlay.Popup#
             */
            {
                /**
                 * Trigger elements to show popup.
                 * @type NodeList
                 */
                trigger:{                          // 触发器
                    setter:function (v) {
                        if (S.isString(v)) {
                            v = S.all(v);
                        }
                        return v;
                    }
                },
                /**
                 * How to activate trigger element.
                 * "click" or "mouse",Default:"click".
                 * @type String
                 */
                triggerType:{
                    // 触发类型
                    value:'click'
                },
                currentTrigger:{},
                /**
                 * When trigger type is mouse, the delayed time to show popup.
                 * Default:0.1, in seconds.
                 * @type Number
                 */
                mouseDelay:{
                    // triggerType 为 mouse 时, Popup 显示的延迟时间, 默认为 100ms
                    value:0.1
                },
                /**
                 * When trigger type is click, whether support toggle. Default:false
                 * @type Boolean
                 */
                toggle:{
                    // triggerType 为 click 时, Popup 是否有toggle功能
                    value:false
                }
            }
        }, {
            xclass:'popup',
            priority:20
        });

    return Popup;
}, {
    requires:["component", "./base"]
});

/**
 * 2011-05-17
 *  - 承玉：利用 initializer , destructor ,ATTRS
 **/