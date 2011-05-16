/**
 * KISSY.Dialog
 * @author: 承玉<yiminghe@gmail.com>, 乔花<qiaohua@taobao.com>
 */
KISSY.add('dialog', function(S) {

    S._Dialog = S.UIBase.create(S.Overlay,
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



    S._Dialog._t = {
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
    };

    /**
     * 默认设置
     */
    S._Dialog._defaultConfig = {
        trigger: null,          // 触发器
        triggerType: 'click'    // 触发类型
    };

    function Dialog(container, config) {
        var self = this;

        if (!(self instanceof Dialog)) {
            return new Dialog(container, config);
        }

        // 支持 Popup(config)
        if (S.isUndefined(config)) {
            config = container;
        } else {
            config.srcNode = container;
        }
        config = config || { };

        self.config = config = S.merge(S._Dialog._defaultConfig, config);

        // 获取相关联的 DOM 节点
        self.trigger = S.one(config.trigger);

        Dialog.superclass.constructor.call(self, config);

        self._init();


        self.manager = S.DialogManager;
        self.manager.register(self);
    }
    S.extend(Dialog, S._Dialog);
    S.Dialog = Dialog;

    S.augment(Dialog, S.EventTarget, S._Dialog._t);


    S.DialogManager = {

        register: function(dlg) {
            if (dlg instanceof Dialog) {
                this._dialog.push(dlg);
            }
        },

        _dialog: [],

        hideAll: function() {
            S.each(this._dialog, function(dlg) {
                dlg && dlg.hide();
            })
        }
    };
}, { host: 'overlay' });

/**
 * 2010-11-10 承玉<yiminghe@gmail.com>重构，使用扩展类
 */



