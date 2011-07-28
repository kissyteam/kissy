/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Jul 20 21:14
*/
/**
 * KISSY Overlay
 * @author: 玉伯<lifesinger@gmail.com>, 承玉<yiminghe@gmail.com>,乔花<qiaohua@taobao.com>
 */
KISSY.add("overlay/overlayrender", function(S, UA, UIBase, Component) {

    function require(s) {
        return S.require("uibase/" + s);
    }

    return UIBase.create(Component.Render, [
        require("contentboxrender"),
        require("positionrender"),
        require("loadingrender"),
        UA['ie'] == 6 ? require("shimrender") : null,
        require("maskrender")
    ], {

        renderUI:function() {
            this.get("el").addClass(this.get("prefixCls") + "overlay");
        }

    }, {
        ATTRS:{
            elBefore:{
                valueFn:function() {
                    return S.one(this.get("render")[0].firstChild);
                }
            },
            // 是否支持焦点处理
            focusable:{
                value:false
            },
            visibleMode:{
                value:"visibility"
            }
        }
    });
}, {
    requires: ["ua","uibase","component"]
});

/**
 * 2010-11-09 2010-11-10 承玉<yiminghe@gmail.com>重构，attribute-base-uibase-Overlay ，采用 UIBase.create
 */
/**
 * http://www.w3.org/TR/wai-aria-practices/#trap_focus
 * @author:yiminghe@gmail.com
 */
KISSY.add("overlay/ariarender", function(S, Node) {

    var $ = Node.all;

    function Aria() {

    }

//    Aria.ATTRS={
//      aria:{
//          value:false
//      }
//    };


    var KEY_TAB = 9;

    function _onKey(/*Normalized Event*/ evt) {

        var self = this,
            keyCode = evt.keyCode,
            firstFocusItem = self.get("el");
        if (keyCode != KEY_TAB) return;
        // summary:
        // Handles the keyboard events for accessibility reasons

        var node = $(evt.target); // get the target node of the keypress event

        // find the first and last tab focusable items in the hierarchy of the dialog container node
        // do this every time if the items may be added / removed from the the dialog may change visibility or state

        var lastFocusItem = self.__ariaArchor;

        // assumes firstFocusItem and lastFocusItem maintained by dialog object

        // see if we are shift-tabbing from first focusable item on dialog
        if (node.equals(firstFocusItem) && evt.shiftKey) {
            lastFocusItem[0].focus(); // send focus to last item in dialog
            evt.halt(); //stop the tab keypress event
        }
        // see if we are tabbing from the last focusable item
        else if (node.equals(lastFocusItem) && !evt.shiftKey) {
            firstFocusItem[0].focus(); // send focus to first item in dialog
            evt.halt(); //stop the tab keypress event
        }
        else {
            // see if the key is for the dialog
            if (node.equals(firstFocusItem) ||
                firstFocusItem.contains(node)) {
                return;
            }
        }
        // this key is for the document window
        // allow tabbing into the dialog
        evt.halt();//stop the event if not a tab keypress
    } // end of function


    Aria.prototype = {

        __renderUI:function() {
            var self = this,
                el = self.get("el"),
                header = self.get("header");
            if (self.get("aria")) {
                el.attr("role", "dialog");
                el.attr("tabindex", 0);
                if (!header.attr("id")) {
                    header.attr("id", S.guid("ks-dialog-header"));
                }
                el.attr("aria-labelledby", header.attr("id"));
                // 哨兵元素，从这里 tab 出去到弹窗根节点
                // 从根节点 shift tab 出去到这里
                self.__ariaArchor = $("<div tabindex='0'></div>").appendTo(el);
            }
        },

        __bindUI:function() {

            var self = this;
            if (self.get("aria")) {
                var el = self.get("el"),
                    lastActive;
                self.on("afterVisibleChange", function(ev) {
                    if (ev.newVal) {
                        lastActive = document.activeElement;
                        el[0].focus();
                        el.attr("aria-hidden", "false");
                        el.on("keydown", _onKey, self);
                    } else {
                        el.attr("aria-hidden", "true");
                        el.detach("keydown", _onKey, self);
                        lastActive && lastActive.focus();
                    }
                });
            }
        }
    };

    return Aria;
}, {
        requires:["node"]
    });/**
 * http://www.w3.org/TR/wai-aria-practices/#trap_focus
 * @author:yiminghe@gmail.com
 */
KISSY.add("overlay/aria", function() {
    function Aria() {
    }

    Aria.ATTRS = {
        aria:{
            view:true
        }
    };

    Aria.prototype = {

        __bindUI:function() {
            var self = this,el = self.get("el");
            if (self.get("aria")) {
                el.on("keydown", function(e) {
                    if (e.keyCode === 27) {
                        self.hide();
                        e.halt();
                    }
                });
            }
        }
    };
    return Aria;
});KISSY.add("overlay/effect", function(S) {
    var NONE = 'none';
    var effects = {fade:["Out","In"],slide:["Up","Down"]};

    function Effect() {
    }

    Effect.ATTRS = {
        effect:{
            value:{
                effect:NONE,
                duration:0.5,
                easing:'easeOut'
            },
            setter:function(v) {
                var effect = v.effect;
                if (S.isString(effect) && !effects[effect]) {
                    v.effect = NONE;
                }
            }

        }
    };

    Effect.prototype = {

        __bindUI:function() {
            var self = this;
            self.on("afterVisibleChange", function(ev) {
                var effect = self.get("effect").effect;
                if (effect == NONE) {
                    return;
                }
                var v = ev.newVal,
                    el = self.get("el");
                el.stop(true);
                el.css("visibility", "visible");
                var m = effect + effects[effect][Number(v)];
                el[m](self.get("effect").duration, function() {
                    el.css("display", "block");
                    el.css("visibility", v ? "visible" : "hidden");
                }, self.get("effect").easing, false);

            });
        }
    };

    return Effect;
}, {
    requires:['anim']
});/**
 * model and control for overlay
 * @author:yiminghe@gmail.com
 */
KISSY.add("overlay/overlay", function(S, UIBase, Component, OverlayRender, Effect) {
    function require(s) {
        return S.require("uibase/" + s);
    }

    var Overlay = UIBase.create(Component.ModelControl, [
        require("contentbox"),
        require("position"),
        require("loading"),
        require("align"),
        require("resize"),
        require("mask"),
        Effect
    ], {
        ATTRS:{
            // 是否绑定鼠标事件
            handleMouseEvents:{
                value:false
            }
        }
    });

    Overlay.DefaultRender = OverlayRender;

    return Overlay;
}, {
    requires:['uibase','component','./overlayrender','./effect']
});KISSY.add("overlay/dialogrender", function(S, UIBase, OverlayRender, AriaRender) {
    function require(s) {
        return S.require("uibase/" + s);
    }

    return UIBase.create(OverlayRender, [
        require("stdmodrender"),
        require("closerender"),
        AriaRender
    ]);
}, {
    requires:['uibase','./overlayrender','./ariarender']
});/**
 * KISSY.Dialog
 * @author: 承玉<yiminghe@gmail.com>, 乔花<qiaohua@taobao.com>
 */
KISSY.add('overlay/dialog', function(S, Overlay, UIBase, DialogRender,Aria) {

    function require(s) {
        return S.require("uibase/" + s);
    }

    var Dialog = UIBase.create(Overlay, [
        require("stdmod"),
        require("close"),
        require("drag"),
        require("constrain"),
        Aria
    ], {
        renderUI:function() {
            var self = this;
            self.get("el").addClass(this.get("prefixCls")+"dialog");
            //设置值，drag-ext 绑定时用到
            self.set("handlers", [self.get("header")]);
        }
    });

    Dialog.DefaultRender = DialogRender;

    return Dialog;

}, {
    requires:[ "overlay/overlay","uibase",'overlay/dialogrender','./aria']
});

/**
 * 2010-11-10 承玉<yiminghe@gmail.com>重构，使用扩展类
 */



/**
 * KISSY.Popup
 * @author: 乔花<qiaohua@taobao.com> , 承玉<yiminghe@gmail.com>
 */
KISSY.add('overlay/popup', function(S, Overlay, undefined) {

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
        trigger: null,          // 触发器
        triggerType: {value:'click'}    // 触发类型
    };

    S.extend(Popup, Overlay, {
            initializer: function() {
                var self = this;
                // 获取相关联的 DOM 节点
                if (self.get("trigger")) {
                    self.trigger = S.one(self.get("trigger"));
                }
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

            destructor:function() {
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


    return Popup;
}, {
        requires:[ "overlay/overlay"]
    });

/**
 * 2011-05-17
 *  - 承玉：利用 initializer , destructor ,ATTRS
 **/KISSY.add("overlay", function(S, O, OR, D, DR, P) {
    O.Render = OR;
    D.Render = DR;
    O.Dialog = D;
    S.Overlay = O;
    S.Dialog = D;
    O.Popup = S.Popup = P;

    return O;
}, {
    requires:["overlay/overlay","overlay/overlayrender","overlay/dialog","overlay/dialogrender", "overlay/popup"]
});
