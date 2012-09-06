/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Sep 6 21:55
*/
/**
 * @fileOverview model and control for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/base", function (S, Component, OverlayRender, Effect) {

    function require(s) {
        return S.require("component/uibase/" + s);
    }

    /**
     * KISSY Overlay Component.
     * xclass: 'overlay'.
     * @class Overlay
     * @extends Component.Controller
     * @extends Component.UIBase.ContentBox
     * @extends Component.UIBase.Position
     * @extends Component.UIBase.Loading
     * @extends Component.UIBase.Align
     * @extends Component.UIBase.Close
     * @extends Component.UIBase.Resize
     * @extends Component.UIBase.Mask
     */
    var Overlay = Component.Controller.extend([
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
             * see {@link Component.UIBase.Box#show}
             * @method
             * @name Overlay#show
             */
        }, {
            ATTRS:/**
             * @lends Overlay#
             */
            {

                // do not has focus
                focusable:{
                    value:false
                },

                // allowTextSelection
                allowTextSelection:{
                    value:true
                },

                /**
                 * whether this component can be closed.
                 * @default false
                 * @type {Boolean}
                 */
                closable:{
                    value:false
                },

                /**
                 * whether this component can be responsive to mouse.
                 * @default false
                 * @type {Boolean}
                 */
                handleMouseEvents:{
                    value:false
                },
                xrender:{
                    value:OverlayRender
                }
            }
        }, {
            xclass:'overlay',
            priority:10
        });

    return Overlay;
}, {
    requires:['component', './overlay-render', './effect']
});/**
 * @fileOverview render for dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/dialog-render", function (S, OverlayRender) {
    function require(s) {
        return S.require("component/uibase/" + s);
    }

    return OverlayRender.extend([
        require("stdmodrender")
    ], {
        createDom: function () {
            var self = this,
                el = self.get("el"),
                id,
                header = self.get("header");
            if (!(id = header.attr("id"))) {
                header.attr("id", id = S.guid("ks-dialog-header"));
            }
            el.attr("role", "dialog")
                .attr("aria-labelledby", id);
            // 哨兵元素，从这里 tab 出去到弹窗根节点
            // 从根节点 shift tab 出去到这里
            el.append("<div " + "t" + "ab" + "index='0'></div>");
        }
    });
}, {
    requires: ['./overlay-render']
});/**
 * @fileOverview KISSY.Dialog
 * @author yiminghe@gmail.com, qiaohua@taobao.com
 */
KISSY.add('overlay/dialog', function (S, Overlay, DialogRender, Node) {

    var $ = Node.all;

    function require(s) {
        return S.require("component/uibase/" + s);
    }

    /**
     * @class
     * KISSY Dialog Component.
     * xclass: 'dialog'.
     * @name Dialog
     * @memberOf Overlay
     * @extends Overlay
     * @extends Component.UIBase.StdMod
     * @extends Component.UIBase.Drag
     */
    var Dialog = Overlay.extend([
        require("stdmod"),
        require("drag")
    ],
        /**
         * @lends Overlay.Dialog#
         */
        {
            initializer: function () {
                var self = this, draggable;
                if (draggable = self.get("draggable")) {
                    if (!draggable.handlers) {
                        // default to drag header
                        draggable.handlers = [self.get("header")];
                    }
                }
            },
            handleKeyEventInternal: function (e) {
                if (e.keyCode === Node.KeyCodes.ESC) {
                    this.hide();
                    e.halt();
                    return;
                }
                trapFocus.call(this, e);
            },

            _uiSetVisible: function (v) {
                Dialog.superclass._uiSetVisible.apply(this, arguments);
                var el = this.get('el');
                if (v) {
                    this.__lastActive = el[0].ownerDocument.activeElement;
                    el[0].focus();
                    el.attr("aria-hidden", "false");
                } else {
                    el.attr("aria-hidden", "true");
                    this.__lastActive && this.__lastActive.focus();
                }
            }
        },

        {
            ATTRS: /**
             * @lends Overlay.Dialog#
             */
            {

                /**
                 * whether this component can be closed.
                 * @default true
                 * @type {Boolean}
                 */
                closable: {
                    value: true
                },

                xrender: {
                    value: DialogRender
                },

                focusable: {
                    value: true
                }
            }
        }, {
            xclass: 'dialog',
            priority: 20
        });


    var KEY_TAB = Node.KeyCodes.TAB;

    function trapFocus(e) {

        var self = this,
            keyCode = e.keyCode,
            firstFocusItem = self.get("el");
        if (keyCode != KEY_TAB) {
            return;
        }
        // summary:
        // Handles the keyboard events for accessibility reasons

        var node = $(e.target); // get the target node of the keypress event

        // find the first and last tab focusable items in the hierarchy of the dialog container node
        // do this every time if the items may be added / removed from the the dialog may change visibility or state

        var lastFocusItem = firstFocusItem.last();

        // assumes firstFocusItem and lastFocusItem maintained by dialog object

        // see if we are shift-tabbing from first focusable item on dialog
        if (node.equals(firstFocusItem) && e.shiftKey) {
            lastFocusItem[0].focus(); // send focus to last item in dialog
            e.halt(); //stop the tab keypress event
        }
        // see if we are tabbing from the last focusable item
        else if (node.equals(lastFocusItem) && !e.shiftKey) {
            firstFocusItem[0].focus(); // send focus to first item in dialog
            e.halt(); //stop the tab keypress event
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
        e.halt();//stop the event if not a tab keypress
    } // end of function
    return Dialog;

}, {
    requires: [ "./base", './dialog-render', 'node']
});

/**
 * 2012-09-06 yiminghe@gmail.com
 *  merge aria with dialog
 *  http://www.w3.org/TR/wai-aria-practices/#trap_focus
 *
 * 2010-11-10 yiminghe@gmail.com
 *  重构，使用扩展类
 */



/**
 * @fileOverview effect applied when overlay shows or hides
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/effect", function (S, Anim, DOM) {
    var NONE = 'none'       ,
        DURATION = 0.5,
        effects = {fade:["Out", "In"], slide:["Up", "Down"]},
        displays = ['block', NONE];

    function Effect() {
    }

    Effect.ATTRS =
    /**
     * @leads Overlay#
     */
    {
        /**
         * Set v as overlay 's show effect <br>
         * v.effect (String): Default:none. can be set as "fade" or "slide" <br>
         * v.target (String|KISS.Node): The target node from which overlay should animate from while showing. Since KISSY 1.3.<br>
         * v.duration (Number): in seconds. Default:0.5. <br>
         * v.easing (String): see {@link KISSY.Anim.Easing} <br>
         * @type {Object}
         */
        effect:{
            value:{
                effect:'',
                target:null,
                duration:DURATION,
                easing:'easeOut'
            },
            setter:function (v) {
                var effect = v.effect;
                if (S.isString(effect) && !effects[effect]) {
                    v.effect = '';
                }
            }

        }
    };

    function getGhost(self) {
        var el = self.get("el"), $ = S.all;
        var ghost = el[0].cloneNode(true);
        ghost.style.visibility = "";
        ghost.style.overflow = "hidden";
        ghost.className += " " + self.get("prefixCls") + "overlay-ghost";
        var body,elBody;
        if (elBody = self.get("body")) {
            body = DOM.get('.'+self.get('prefixCls')+'-stdmod-body', ghost);
            $(body).css({
                height:elBody.height(),
                width:elBody.width()
            });
            body.innerHTML = "";
        }
        return $(ghost);
    }

    function processTarget(self, show) {

        if (self.__effectGhost) {
            self.__effectGhost.stop(1);
        }

        var el = self.get("el"),
            $ = S.all,
            effectCfg = self.get("effect"),
            target = $(effectCfg.target),
            duration = effectCfg.duration,
            targetBox = S.mix(target.offset(), {
                width:target.width(),
                height:target.height()
            }),
            elBox = S.mix(el.offset(), {
                width:el.width(),
                height:el.height()
            }),
            from, to,
            ghost = getGhost(self),
            easing = effectCfg.easing;


        ghost.insertAfter(el);

        el.hide();

        if (show) {
            from = targetBox;
            to = elBox;
        } else {
            from = elBox;
            to = targetBox;
        }

        ghost.css(from);

        self.__effectGhost = ghost;

        ghost.animate(to, {
            duration:duration,
            easing:easing,
            complete:function () {
                self.__effectGhost = null;
                ghost[0].parentNode.removeChild(ghost[0]);
                el.show();
            }
        });

    }

    function processEffect(self, show) {
        var el = self.get("el"),
            effectCfg = self.get("effect"),
            effect = effectCfg.effect || NONE,
            target = effectCfg.target;

        if (effect == NONE && !target) {
            return;
        }
        if (target) {
            processTarget(self, show);
            return;
        }
        var duration = effectCfg.duration,
            easing = effectCfg.easing,
            v = show,
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
            var self = this;
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
    requires:['anim', 'dom']
});/**
 * @fileOverview KISSY Overlay
 * @author yiminghe@gmail.com, qiaohua@taobao.com
 */
KISSY.add("overlay/overlay-render", function (S, UA, Component) {

    function require(s) {
        return S.require("component/uibase/" + s);
    }

    return Component.Render.extend([
        require("contentboxrender"),
        require("positionrender"),
        require("loadingrender"),
        UA['ie'] === 6 ? require("shimrender") : null,
        require("closerender"),
        require("maskrender")
    ]);
}, {
    requires:["ua", "component"]
});

/**
 * 2010-11-09 2010-11-10 yiminghe@gmail.com重构，attribute-base-uibase-Overlay ，采用 UIBase.create
 */
/**
 * @fileOverview overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay", function (S, O, OR, D, DR, P) {
    O.Render = OR;
    D.Render = DR;
    O.Dialog = D;
    S.Dialog = D;
    O.Popup = P;
    S.Overlay = O;
    return O;
}, {
    requires:[
        "overlay/base",
        "overlay/overlay-render",
        "overlay/dialog",
        "overlay/dialog-render",
        "overlay/popup"
    ]
});/**
 * @fileOverview KISSY.Popup
 * @author qiaohua@taobao.com, yiminghe@gmail.com
 */
KISSY.add('overlay/popup', function (S, Overlay, undefined) {

    /**
     * @class
     * KISSY Popup Component.
     * xclass: 'popup'.
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
             * @method
             */



            initializer:function () {
                var self = this,
                // 获取相关联的 DOM 节点
                    trigger = self.get("trigger");
                if (trigger) {
                    if (self.get("triggerType") === 'mouse') {
                        self._bindTriggerMouse();
                        self.on('afterRenderUI', function () {
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
                 * @type {KISSY.NodeList}
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
                 * How to activate trigger element, "click" or "mouse",
                 * @default "click".
                 * @type {String}
                 */
                triggerType:{
                    // 触发类型
                    value:'click'
                },
                currentTrigger:{},
                /**
                 * When trigger type is mouse, the delayed time to show popup.
                 * @default 0.1, in seconds.
                 * @type {Number}
                 */
                mouseDelay:{
                    // triggerType 为 mouse 时, Popup 显示的延迟时间, 默认为 100ms
                    value:0.1
                },
                /**
                 * When trigger type is click, whether support toggle.
                 * @default false
                 * @type {Boolean}
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
    requires:["./base"]
});

/**
 * 2011-05-17
 *  - 承玉：利用 initializer , destructor ,ATTRS
 **/
