/**
 * Created by IntelliJ IDEA.
 * User: qiaohua
 * Date: 11-5-16
 * Time: 下午1:44
 * To change this template use File | Settings | File Templates.
 */
KISSY.add('overlay/popup', function(S, undefined) {
    /**
     * 默认设置
     */
    var defaultConfig = {
        trigger: null,          // 触发器
        triggerType: 'click'    // 触发类型
    };

    function Popup(container, config) {
        var self = this;

        if (!(self instanceof Popup)) {
            return new Popup(container, config);
        }

        // 支持 Popup(config)
        if (S.isUndefined(config)) {
            config = container;
        } else {
            config.srcNode = container;
        }
        config = config || { };

        self.config = config = S.merge(defaultConfig, config);

        // 获取相关联的 DOM 节点
        self.trigger = S.one(config.trigger);

        Popup.superclass.constructor.call(self, config);

        self._init();
    }

    S.extend(Popup, S.Overlay);
    S.Popup = Popup;


    S.augment(Popup, S.EventTarget, {
        _init: function() {
            var self = this;
            if (self.trigger) {
                if (self.config.triggerType === 'mouse') {
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

            trigger.on('mouseenter', function() {
                self._clearHiddenTimer();

                timer = S.later(function() {
                    self.show();
                    timer = undefined;
                }, 100);
            });

            trigger.on('mouseleave', function() {
                if (timer) {
                    timer.cancel();
                    timer = undefined;
                }

                self._setHiddenTimer();
            });
        },

        _bindContainerMouse: function() {
            var self = this;

            self.get('el').on('mouseleave', function() {
                self._setHiddenTimer();
            }).on('mouseenter', function() {
                self._clearHiddenTimer();
            });
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

            self.trigger.on('click', function(e) {
                e.halt();
                self.show();
            });
        }
    });

});