/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Mar 23 12:19
*/
/**
 * @fileOverview http://www.w3.org/TR/wai-aria-practices/#trap_focus
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/aria", function(S,Event) {
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
                    if (e.keyCode === Event.KeyCodes.ESC) {
                        self.hide();
                        e.halt();
                    }
                });
            }
        }
    };
    return Aria;
},{
    requires:['event']
});/**
 * @fileOverview http://www.w3.org/TR/wai-aria-practices/#trap_focus
 * @author yiminghe@gmail.com
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


    var KEY_TAB = Node.KeyCodes.TAB;

    function _onKey(/*Normalized Event*/ evt) {

        var self = this,
            keyCode = evt.keyCode,
            firstFocusItem = self.get("el");
        if (keyCode != KEY_TAB) {
            return;
        }
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
                        lastActive = el[0].ownerDocument.activeElement;
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
 * @fileOverview model and control for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/base", function (S, UIBase, Component, OverlayRender, Effect) {

    function require(s) {
        return S.require("uibase/" + s);
    }

    /**
     * KISSY Overlay Component
     * @class
     * @namespace
     * @name Overlay
     * @extends Component.Controller
     * @extends UIBase.ContentBox
     * @extends UIBase.Position
     * @extends UIBase.Loading
     * @extends UIBase.Align
     * @extends UIBase.Close
     * @extends UIBase.Resize
     * @extends UIBase.Mask
     * @param {Object} config config object to set properties of its parent class
     */
    var Overlay = UIBase.create(Component.Controller, [
        require("contentbox"),
        require("position"),
        require("loading"),
        require("align"),
        require("close"),
        require("resize"),
        require("mask"),
        Effect
    ],
        /**
         * @lends Overlay#
         */
        {
            /**
             * see {@link UIBase.Box#show}
             * @function
             * @name Overlay#show
             */
        }, {
            ATTRS:/**
             * @lends Overlay#
             */
            {
                /**
                 * whether this component can be focused. Default:false
                 * @type Boolean
                 */
                focusable:{
                    value:false
                },

                /**
                 * whether this component can be closed. Default:false
                 * @type Boolean
                 */
                closable:{
                    value:false
                },

                /**
                 * whether this component can be responsive to mouse. Default:false
                 * @type Boolean
                 */
                handleMouseEvents:{
                    value:false
                },

                /**
                 * whether this component's text content can be selected. Default:true
                 * @type Boolean
                 */
                allowTextSelection_:{
                    value:true
                },

                /**
                 * see {@linl UIBase.Box#visibleMode}. Default:"visibility"
                 */
                visibleMode:{
                    value:"visibility"
                }
            }
        });

    Overlay.DefaultRender = OverlayRender;

    Component.UIStore.setUIByClass("overlay", {
        priority:Component.UIStore.PRIORITY.LEVEL1,
        ui:Overlay
    });

    return Overlay;
}, {
    requires:['uibase', 'component', './overlayrender', './effect']
});/**
 * @fileOverview KISSY.Dialog
 * @author  yiminghe@gmail.com, 乔花<qiaohua@taobao.com>
 */
KISSY.add('overlay/dialog', function (S, Component, Overlay, UIBase, DialogRender, Aria) {

    function require(s) {
        return S.require("uibase/" + s);
    }

    /**
     * KISSY Dialog Component
     * @class
     * @name Dialog
     * @memberOf Overlay
     * @extends Overlay
     * @extends UIBase.StdMod
     * @extends UIBase.Drag
     * @extends UIBase.Constrain
     */
    var Dialog = UIBase.create(Overlay, [
        require("stdmod"),
        require("drag"),
        require("constrain"),
        Aria
    ],
        /**
         * @lends Overlay.Dialog#
         */
        {
            /**
             * see {@link UIBase.Box#show}
             * @name Overlay.Dialog#show
             * @function
             */
        },

        {
            ATTRS:/**
             * @lends Overlay.Dialog#
             */
            {

                /**
                 * whether this component can be closed. Default:true
                 * @type Boolean
                 */
                closable:{
                    value:true
                },

                /**
                 * Default: Dialog's header element
                 * see {@link DD.Draggable#handlers}
                 */
                handlers:{
                    valueFn:function () {
                        var self = this;
                        return [
                            // 运行时取得拖放头
                            function () {
                                return self.get("view").get("header");
                            }
                        ];
                    }
                }
            }
        });

    Dialog.DefaultRender = DialogRender;

    Component.UIStore.setUIByClass("dialog", {
        priority:Component.UIStore.PRIORITY.LEVEL2,
        ui:Dialog
    });

    return Dialog;

}, {
    requires:[ "component", "overlay/base", "uibase", 'overlay/dialogrender', './aria']
});

/**
 * 2010-11-10 yiminghe@gmail.com重构，使用扩展类
 */



/**
 * @fileOverview render for dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/dialogrender", function(S, UIBase, OverlayRender, AriaRender) {
    function require(s) {
        return S.require("uibase/" + s);
    }

    return UIBase.create(OverlayRender, [
        require("stdmodrender"),
        AriaRender
    ]);
}, {
    requires:['uibase','./overlayrender','./ariarender']
});/**
 * @fileOverview effect applied when overlay shows or hides
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/effect", function (S) {
    var NONE = 'none',
        DURATION = 0.5,
        effects = {fade:["Out", "In"], slide:["Up", "Down"]},
        displays = ['block', 'none'];

    function Effect() {
    }

    Effect.ATTRS =
    /**
     * @leads Overlay#
     */
    {
        /**
         * set v as overlay's show effect <br>
         * v.effect (String): Default:none. can be set as "fade" or "slide" <br>
         * v.duration (Number): in seconds. Default:0.5. <br>
         * v.easing (String): see {@link Anim.Easing} <br>
         * @type Object
         */
        effect:{
            value:{
                effect:NONE,
                duration:DURATION,
                easing:'easeOut'
            },
            setter:function (v) {
                var effect = v.effect;
                if (S.isString(effect) && !effects[effect]) {
                    v.effect = NONE;
                }
            }

        }
    };

    function processEffect(self, show) {
        var el = self.get("el"),
            effectCfg = self.get("effect"),
            effect = effectCfg.effect,
            duration = effectCfg.duration,
            easing = effectCfg.easing;
        if (effect == NONE) {
            return;
        }
        var v = show,
            index = v ? 1 : 0;
        // 队列中的也要移去
        // run complete fn to restore window's original height
        el.stop(1, 1);
        var restore = {
            "visibility":"visible",
            "display":displays[index]
        };
        el.css(restore);
        var m = effect + effects[effect][index];
        el[m](duration, function () {
            var r2 = {
                "display":displays[0],
                "visibility":v ? "visible" : "hidden"
            };
            el.css(r2);
        }, easing);
    }

    Effect.prototype = {

        __bindUI:function () {
            var self = this
            self.on("hide", function () {
                processEffect(self, 0);
            });
            self.on("show", function () {
                processEffect(self, 1);
            });
        }
    };

    return Effect;
}, {
    requires:['anim']
});/**
 * @fileOverview overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay", function(S, O, OR, D, DR, P) {
    O.Render = OR;
    D.Render = DR;
    O.Dialog = D;
    S.Dialog = D;
    O.Popup = S.Popup = P;
    return O;
}, {
    requires:["overlay/base","overlay/overlayrender",
        "overlay/dialog","overlay/dialogrender", "overlay/popup"]
});/**
 * @fileOverview KISSY Overlay
 * @author  yiminghe@gmail.com,乔花<qiaohua@taobao.com>
 */
KISSY.add("overlay/overlayrender", function(S, UA, UIBase, Component) {

    function require(s) {
        return S.require("uibase/" + s);
    }

    return UIBase.create(Component.Render, [
        require("contentboxrender"),
        require("positionrender"),
        require("loadingrender"),
        UA['ie'] === 6 ? require("shimrender") : null,
        require("closerender"),
        require("maskrender")
    ]);
}, {
    requires: ["ua","uibase","component"]
});

/**
 * 2010-11-09 2010-11-10 yiminghe@gmail.com重构，attribute-base-uibase-Overlay ，采用 UIBase.create
 */
/**
 * @fileOverview KISSY.Popup
 * @author  乔花<qiaohua@taobao.com> , yiminghe@gmail.com
 */
KISSY.add('overlay/popup', function (S, Component, Overlay, undefined) {

    /**
     * KISSY Popup Component
     * @class
     * @memberOf Overlay
     * @extends Overlay
     * @param {NodeList} [container] existing dom node
     * @param {Object} config see {@link Overlay}
     */
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

    Popup.ATTRS =
    /**
     * @lends Overlay.Popup#
     */
    {
        /**
         * trigger element to show popup
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
         * how do activate trigger element. "click" or "mouse",Default:"click"
         * @type String
         */
        triggerType:{value:'click'}, // 触发类型
        currentTrigger:{},
        /**
         * when trigger type is mouse, the delayed time to show popup. Default:100,in milliseconds
         * @type Number
         */
        mouseDelay:{
            value:100                      // triggerType 为 mouse 时, Popup 显示的延迟时间, 默认为 100ms
        },
        /**
         * when trigger type is click, whether support toggle. Default:false
         * @type Boolean
         */
        toggle:{
            value:false                     // triggerType 为 click 时, Popup 是否有toggle功能
        }
    };

    S.extend(Popup, Overlay,
        /**
         * @lends Overlay.Popup#
         */
        {
            /**
             * see {@link UIBase.Box#show}
             * @name Overlay.Popup#show
             * @function
             */



            initializer:function () {
                var self = this;
                // 获取相关联的 DOM 节点
                var trigger = self.get("trigger");
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
                    }, self.get('mouseDelay'));
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

                self.get('el').on('mouseleave', self._setHiddenTimer, self)
                    .on('mouseenter', self._clearHiddenTimer, self);
            },

            _setHiddenTimer:function () {
                var self = this;
                self._hiddenTimer = S.later(function () {
                    self._hiding();
                }, self.get('mouseDelay'));
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
                    }
                    else  self._showing(ev);
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
                var self = this;
                var t = self.get("trigger");
                if (t) {
                    if (self.__clickPopup) {
                        S.each(t, function (el) {
                            S.one(el).detach('click', self.__clickPopup);
                        });
                    }
                    if (self.__mouseEnterPopup) {
                        S.each(t, function (el) {
                            S.one(el).detach('mouseenter', self.__mouseEnterPopup);
                        });
                    }

                    if (self._mouseLeavePopup) {
                        S.each(t, function (el) {
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
    requires:[ "component", "./base"]
});

/**
 * 2011-05-17
 *  - 承玉：利用 initializer , destructor ,ATTRS
 **/
