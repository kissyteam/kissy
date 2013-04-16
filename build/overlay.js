/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:22
*/
/**
 * @ignore
 * controller for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/base", function (S, Component, Extension, Loading, Close, Mask, OverlayRender, OverlayEffect) {

    /**
     * KISSY Overlay Component.
     * xclass: 'overlay'.
     * @class KISSY.Overlay
     * @extends KISSY.Component.Controller
     * @mixins KISSY.Component.Extension.ContentBox
     * @mixins KISSY.Component.Extension.Position
     * @mixins KISSY.Overlay.Extension.Loading
     * @mixins KISSY.Component.Extension.Align
     * @mixins KISSY.Overlay.Extension.Close
     * @mixins KISSY.Overlay.Extension.Mask
     */
    return Component.Controller.extend([
        Extension.Position,
        Loading,
        Extension.Align,
        Close,
        Mask,
        OverlayEffect
    ], {}, {
        ATTRS: {

            /**
             * overlay can not have focus.
             *
             * Defaults to: false.
             *
             * @cfg {Boolean} focusable
             * @protected
             */
            /**
             * @ignore
             */
            focusable: {
                value: false
            },

            /**
             * overlay can have text selection.
             *
             * Defaults to: true.
             *
             * @cfg {Boolean} allowTextSelection
             * @protected
             */
            /**
             * @ignore
             */
            allowTextSelection: {
                value: true
            },

            /**
             * whether this component can be closed.
             *
             * Defaults to: false
             *
             * @cfg {Boolean} closable
             */
            /**
             * @ignore
             */
            closable: {
                value: false
            },

            /**
             * whether this component can be responsive to mouse.
             *
             * Defaults to: false
             *
             * @cfg {Boolean} handleMouseEvents
             * @protected
             */
            /**
             * @ignore
             */
            handleMouseEvents: {
                value: false
            },
            xrender: {
                value: OverlayRender
            }
        }
    }, {
        xclass: 'overlay',
        priority: 10
    });
}, {
    requires: [
        'component/base',
        'component/extension',
        "./extension/loading",
        "./extension/close",
        "./extension/mask",
        './overlay-render',
        './extension/overlay-effect'
    ]
});/**
 * @ignore
 * render for dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/dialog-render", function (S, OverlayRender,StdMod) {
    return OverlayRender.extend([
        StdMod
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
            // tab catcher
            el.append("<div " + "t" + "ab" + "index='0' " +
                // do not mess with main dialog
                "style='position:absolute;'></div>");
        }
    });
}, {
    requires: ['./overlay-render','./extension/stdmod-render']
});/**
 * @ignore
 * KISSY.Dialog
 * @author yiminghe@gmail.com
 */
KISSY.add('overlay/dialog', function (S, Overlay, DialogRender, Node, StdMod, DialogEffect) {

    /**
     * @class KISSY.Overlay.Dialog
     * KISSY Dialog Component. xclass: 'dialog'.
     * @extends KISSY.Overlay
     * @mixins KISSY.Overlay.Extension.StdMod
     */
    var Dialog = Overlay.extend([
        StdMod,
        DialogEffect
    ], {
            handleKeyEventInternal: function (e) {
                if (this.get('escapeToClose') &&
                    e.keyCode === Node.KeyCodes.ESC) {
                    if (e.target.nodeName.toLowerCase() == 'select' && !e.target.disabled) {
                        // escape at select
                    } else {
                        this.close();
                        e.halt();
                    }
                    return;
                }
                trapFocus.call(this, e);
            },

            _onSetVisible: function (v) {
                var self = this,
                    el = self.get('el');
                if (v) {
                    self.__lastActive = el[0].ownerDocument.activeElement;
                    self.set('focused', true);
                    // if d.show(); d.hide();
                    // async -> focus event -> handleFocus
                    // -> set('focused') -> el.focus() -> ie error
                    // el[0].focus && el[0].focus();
                    el.attr("aria-hidden", "false");
                } else {
                    el.attr("aria-hidden", "true");
                    try {
                        self.__lastActive && self.__lastActive.focus();
                    } catch (e) {
                        // ie can not be focused if lastActive is invisible
                    }
                }
                // prevent display none for effect
                Dialog.superclass._onSetVisible.apply(self, arguments);
            }
        },

        {
            ATTRS: {

                /**
                 * whether this component can be closed.
                 *
                 * Defaults to: true
                 *
                 * @cfg {Boolean} closable
                 * @protected
                 */
                /**
                 * @ignore
                 */
                closable: {
                    value: true
                },

                xrender: {
                    value: DialogRender
                },

                /**
                 * whether this component can be focused.
                 *
                 * Defaults to: true
                 *
                 * @cfg {Boolean} focusable
                 * @protected
                 */
                /**
                 * @ignore
                 */
                focusable: {
                    value: true
                },


                /**
                 * whether this component can be closed by press escape key.
                 *
                 * Defaults to: true
                 *
                 * @cfg {Boolean} escapeToClose
                 * @since 1.3.0
                 */
                /**
                 * @ignore
                 */
                escapeToClose: {
                    value: true
                }
            }
        }, {
            xclass: 'dialog',
            priority: 20
        });


    var KEY_TAB = Node.KeyCodes.TAB;

    // 不完美的方案，窗体末尾空白 tab 占位符，多了 tab 操作一次
    function trapFocus(e) {

        var self = this,
            keyCode = e.keyCode;

        if (keyCode != KEY_TAB) {
            return;
        }
        var el = self.get("el");
        // summary:
        // Handles the keyboard events for accessibility reasons

        var node = Node.all(e.target); // get the target node of the keypress event

        // find the first and last tab focusable items in the hierarchy of the dialog container node
        // do this every time if the items may be added / removed from the the dialog may change visibility or state

        var lastFocusItem = el.last();

        // assumes el and lastFocusItem maintained by dialog object

        // see if we are shift-tabbing from first focusable item on dialog
        if (node.equals(el) && e.shiftKey) {
            lastFocusItem[0].focus(); // send focus to last item in dialog
            e.halt(); //stop the tab keypress event
        }
        // see if we are tabbing from the last focusable item
        else if (node.equals(lastFocusItem) && !e.shiftKey) {
            self.focus(); // send focus to first item in dialog
            e.halt(); //stop the tab keypress event
        }
        else {
            // see if the key is for the dialog
            if (node.equals(el) || el.contains(node)) {
                return;
            }
        }
        // this key is for the document window
        // allow tabbing into the dialog
        e.halt();//stop the event if not a tab keypress
    } // end of function
    return Dialog;

}, {
    requires: [
        "./base",
        './dialog-render',
        'node',
        './extension/stdmod',
        './extension/dialog-effect'
    ]
});

/**
 * @ignore
 *
 * 2012-09-06 yiminghe@gmail.com
 *  merge aria with dialog
 *  http://www.w3.org/TR/wai-aria-practices/#trap_focus
 *
 * 2010-11-10 yiminghe@gmail.com
 *  重构，使用扩展类
 *//**
 * @ignore
 * close extension for kissy dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/extension/close-render", function (S, Node) {

    var CLS_PREFIX = 'ext-';

    function getCloseRenderBtn(prefixCls) {
        return new Node("<a " +
            "tabindex='0' " +
            "href='javascript:void(\"关闭\")' " +
            "role='button' " +
            "style='z-index:9' " +
            "class='" + prefixCls + CLS_PREFIX + "close" + "'>" +
            "<span class='" +
            prefixCls + CLS_PREFIX + "close-x" +
            "'>关闭<" + "/span>" +
            "<" + "/a>");
    }

    function CloseRender() {
    }

    CloseRender.ATTRS = {
        closable: {
            value: true
        },
        closeBtn: {
        }
    };

    CloseRender.HTML_PARSER = {
        closeBtn: function (el) {
            return el.one("." + this.get('prefixCls') + CLS_PREFIX + 'close');
        }
    };

    // for augment, no need constructor
    CloseRender.prototype = {
        _onSetClosable: function (v) {
            var self = this,
                btn = self.get("closeBtn");
            if (v) {
                if (!btn) {
                    self.setInternal("closeBtn", btn = getCloseRenderBtn(self.get('prefixCls')));
                }
                self.get("el").prepend(btn);
            } else {
                if (btn) {
                    btn.remove();
                }
            }
        }
    };

    return CloseRender;

}, {
    requires: ["node"]
});/**
 * @ignore
 * close extension for kissy dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/extension/close", function () {

    /**
     * @class KISSY.Overlay.Extension.Close
     * Close extension class. Represent a close button.
     */
    function Close() {
    }

    var HIDE = "hide";

    Close.ATTRS =    {
        /**
         * Whether close button is visible.
         *
         * Defaults to: true.
         *
         * @cfg {Boolean} closable
         */
        /**
         * Whether close button is visible.
         * @type {Boolean}
         * @property closable
         */
        /**
         * @ignore
         */
        closable:{
            view:1
        },

        /**
         * close button element.
         * @type {KISSY.NodeList}
         * @property closeBtn
         * @readonly
         */
        /**
         * @ignore
         */
        closeBtn:{
            view:1
        },

        /**
         * Whether to destroy or hide current element when click close button.
         * Can set "destroy" to destroy it when click close button.
         *
         * Defaults to: "hide".
         *
         * @cfg {String} closeAction
         */
        /**
         * @ignore
         */
        closeAction:{
            value:HIDE
        }
    };

    var actions = {
        hide:HIDE,
        destroy:"destroy"
    };

    // for augment, no need constructor
    Close.prototype = {
        _onSetClosable:function (v) {
            var self = this;
            if (v && !self.__bindCloseEvent) {
                self.__bindCloseEvent = 1;
                self.get("closeBtn").on("click", function (ev) {
                    self.close();
                    ev.preventDefault();
                });
            }
        },
        /**
         * hide or destroy according to {@link KISSY.Overlay.Extension.Close#closeAction}
         * @chainable
         */
        close:function(){
            var self=this;
            self[actions[self.get("closeAction")] || HIDE]();
            return self;
        },
        __destructor:function () {
            var btn = this.get("closeBtn");
            btn && btn.detach();
        }
    };
    return Close;

});/**
 * @ignore
 * effect for dialog
 * @author yiminghe@gmail.com
 */
KISSY.add('overlay/extension/dialog-effect', function (S) {

    function DialogEffect() {

    }

    // for augment, no need constructor
    DialogEffect.prototype = {

        // also simplify body
        __afterCreateEffectGhost: function (ghost) {
            var self = this,
                body,
                elBody = self.get("body");

            ghost.all('.' + self.get('prefixCls') + 'stdmod-body')
                .css({
                    height: elBody.height(),
                    width: elBody.width()
                })
                .html('');

            return ghost;
        }

    };

    return DialogEffect;

});/**
 * @ignore
 * loading mask support for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/extension/loading-render", function (S, Node) {

    function Loading() {
    }

    // for augment, no need constructor
    Loading.prototype = {
        loading: function () {
            var self = this;
            if (!self._loadingExtEl) {
                self._loadingExtEl = new Node("<div " +
                    "class='" +
                    self.get('prefixCls') + "ext-loading'" +
                    " style='position: absolute;" +
                    "border: none;" +
                    "width: 100%;" +
                    "top: 0;" +
                    "left: 0;" +
                    "z-index: 99999;" +
                    "height:100%;" +
                    "*height: expression(this.parentNode.offsetHeight);" + "'/>")
                    .appendTo(self.get("el"));
            }
            self._loadingExtEl.show();
        },

        unloading: function () {
            var lel = this._loadingExtEl;
            lel && lel.hide();
        }
    };

    return Loading;

}, {
    requires: ['node']
});/**
 * @ignore
 * loading mask support for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/extension/loading", function () {

    /**
     * @class KISSY.Overlay.Extension.Loading
     * Loading extension class. Make component to be able to mask loading.
     */
    function Loading() {
    }

    // for augment, no need constructor
    Loading.prototype = {
        /**
         * mask component as loading
         * @chainable
         */
        loading: function () {
            var self=this;
            self.get("view").loading();
            return self;
        },

        /**
         * unmask component as loading
         * @chainable
         */
        unloading: function () {
            this.get("view").unloading();
            return this;
        }
    };

    return Loading;

});/**
 * @ignore
 * mask extension for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/extension/mask-render", function (S, Node) {

    var UA = S.UA,
        ie6 = (UA['ie'] === 6),
        $ = Node.all;

    function docWidth() {
        return  ie6 ? ("expression(KISSY.DOM.docWidth())") : "100%";
    }

    function docHeight() {
        return ie6 ? ("expression(KISSY.DOM.docHeight())") : "100%";
    }

    function initMask(self) {
        var maskCls = self.getCssClassWithPrefix('ext-mask')+' '+
                self.getCssClassWithState('mask'),
            mask = $("<div " +
                " style='width:" + docWidth() + ";" +
                "left:0;" +
                "top:0;" +
                "height:" + docHeight() + ";" +
                "position:" + (ie6 ? "absolute" : "fixed") + ";'" +
                " class='" +
                maskCls +
                "'>" +
                (ie6 ? "<" + "iframe " +
                    "style='position:absolute;" +
                    "left:" + "0" + ";" +
                    "top:" + "0" + ";" +
                    "background:red;" +
                    "width: expression(this.parentNode.offsetWidth);" +
                    "height: expression(this.parentNode.offsetHeight);" +
                    "filter:alpha(opacity=0);" +
                    "z-index:-1;'></iframe>" : "") +
                "</div>")
                .prependTo("body");
        /*
         点 mask 焦点不转移
         */
        mask['unselectable']();
        mask.on("mousedown", function (e) {
            e.preventDefault();
        });
        return mask;
    }

    function Mask() {
    }

    Mask.ATTRS = {

        mask: {
            value: false
        },
        maskNode: {

        }

    };

    // for augment, no need constructor
    Mask.prototype = {

        __renderUI: function () {
            var self = this;
            if (self.get('mask')) {
                self.set('maskNode', initMask(self));
            }
        },

        __syncUI: function () {
            var self = this;
            if (self.get('mask')) {
                self.ksSetMaskVisible(self.get('visible'));
            }
        },

        ksSetMaskVisible: function (shown) {
            var self = this,
                shownCls = self.getCssClassWithState('mask-shown'),
                maskNode = self.get('maskNode'),
                hiddenCls = self.getCssClassWithState('mask-hidden');
            if (shown) {
                maskNode.removeClass(hiddenCls).addClass(shownCls);
            } else {
                maskNode.removeClass(shownCls).addClass(hiddenCls);
            }
        },

        __destructor: function () {
            var self = this, mask;
            if (mask = self.get("maskNode")) {
                mask.remove();
            }
        }

    };

    return Mask;
}, {
    requires: ["node"]
});/**
 * @ignore
 * mask extension for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/extension/mask", function (S, Event) {

    /**
     * @class KISSY.Overlay.Extension.Mask
     * Mask extension class. Make component to be able to show with mask.
     */
    function Mask() {
    }

    Mask.ATTRS = {
        /**
         * Whether show mask layer when component shows and effect
         *
         * for example:
         *
         *      {
         *          // whether hide current component when click on mask
         *          closeOnClick: false,
         *          effect: 'fade', // slide
         *          duration: 0.5,
         *          easing: 'easingNone'
         *      }
         *
         * @cfg {Boolean|Object} mask
         */
        /**
         * @ignore
         */
        mask: {
            view: 1
        },
        /**
         * Mask node of current component.
         * @type {KISSY.NodeList}
         * @property maskNode
         * @readonly
         */
        /**
         * @ignore
         */
        maskNode: {
            view: 1
        }
    };

    var NONE = 'none',
        effects = {fade: ["Out", "In"], slide: ["Up", "Down"]};

    function processMask(mask, el, show, view) {

        var effect = mask.effect || NONE;

        if (effect == NONE) {
            view.ksSetMaskVisible(show);
            return;
        }

        // no inline style, leave it to anim(fadeIn/Out)
        view.ksSetMaskVisible(show);

        var duration = mask.duration,
            easing = mask.easing,
            m,
            index = show ? 1 : 0;

        // run complete fn to restore window's original height
        el.stop(1, 1);

        el.css('display', show ? NONE : 'block');

        m = effect + effects[effect][index];

        el[m](duration, function () {
            el.css('display', '');
        }, easing);
    }

    // for augment, no need constructor
    Mask.prototype = {

        __bindUI: function () {
            var self = this,
                maskNode,
                mask,
                el = self.get('el'),
                view = self.get("view");
            if (mask = self.get("mask")) {
                maskNode = self.get('maskNode');
                if (mask['closeOnClick']) {
                    maskNode.on(Event.Gesture.tap, self.close, self);
                }
                self.on('afterVisibleChange', function (e) {
                    var v;
                    if (v = e.newVal) {
                        var elZIndex = parseInt(el.css('z-index')) || 1;
                        maskNode.css('z-index', elZIndex - 1);
                    }
                    processMask(mask, maskNode, v, view)
                });
            }
        }
    };


    return Mask;
}, {requires: ["event"]});/**
 * @ignore
 * effect for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add('overlay/extension/overlay-effect', function (S) {

    var NONE = 'none',
        BLOCK = 'block',
        HIDDEN = 'hidden',
        VISIBLE = 'visible',
        DURATION = 0.5,
        effects = {fade: ["Out", "In"], slide: ["Up", "Down"]};

    function getGhost(self) {
        var el = self.get("el"),
            ghost = el.clone(true);

        ghost.css({
            visibility: 'visible',
            overflow: HIDDEN
        }).addClass(self.get('prefixCls') + 'overlay-ghost');

        return self.__afterCreateEffectGhost(ghost);
    }

    function processTarget(self, show, callback) {

        if (self.__effectGhost) {
            self.__effectGhost.stop(1, 1);
        }

        var el = self.get("el"),
            $ = S.all,
            effectCfg = self.get("effect"),
            target = $(effectCfg.target),
            duration = effectCfg.duration,
            targetBox = S.mix(target.offset(), {
                width: target.width(),
                height: target.height()
            }),
            elBox = S.mix(el.offset(), {
                width: el.width(),
                height: el.height()
            }),
            from, to,
            ghost = getGhost(self),
            easing = effectCfg.easing;


        ghost.insertAfter(el);

        el.css('visibility', HIDDEN);

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
            duration: duration,
            easing: easing,
            complete: function () {
                self.__effectGhost = null;
                ghost.remove();
                el.css('visibility','');
                callback();
            }
        });

    }

    function processEffect(self, show, callback) {
        var el = self.get("el"),
            effectCfg = self.get("effect"),
            effect = effectCfg.effect || NONE,
            target = effectCfg.target;
        if (effect == NONE && !target) {
            callback();
            return;
        }
        if (target) {
            processTarget(self, show, callback);
            return;
        }
        var duration = effectCfg.duration,
            easing = effectCfg.easing,
            index = show ? 1 : 0;
        // 队列中的也要移去
        // run complete fn to restore window's original height
        el.stop(1, 1);
        el.css({
            // must show, override box-render _onSetVisible
            "visibility": VISIBLE,
            // fadeIn need display none, fadeOut need display block
            "display": show ? NONE : BLOCK
        });
        var m = effect + effects[effect][index];
        el[m](duration, function () {
            el.css({
                // need compute coordinates when show, so do not use display none for hide
                "display": BLOCK,
                // restore to box-render _onSetVisible
                "visibility": ''
            });
            callback();
        }, easing);
    }

    function OverlayEffect() {

    }

    OverlayEffect.ATTRS = {
        /**
         * Set v as overlay 's show effect
         *
         * - v.effect (String): Default:none.
         * can be set as "fade" or "slide"
         *
         * - v.target (String|KISS.Node):
         * The target node from which overlay should animate from while showing.
         *
         * - v.duration (Number): in seconds.
         * Default:0.5.
         *
         * - v.easing (String|Function):
         * for string see {@link KISSY.Anim.Easing} 's method name.
         *
         * @cfg {Object} effect
         * @member KISSY.Overlay
         */
        /**
         * @ignore
         */
        effect: {
            value: {
                effect: '',
                target: null,
                duration: DURATION,
                easing: 'easeOut'
            },
            setter: function (v) {
                var effect = v.effect;
                if (typeof effect == 'string' && !effects[effect]) {
                    v.effect = '';
                }
            }

        }
    };

    // for augment, no need constructor
    OverlayEffect.prototype = {

        __afterCreateEffectGhost: function (ghost) {
            return ghost;
        },


        /**
         * For overlay with effect, it should listen show and hide instead of afterVisibleChange.
         * @protected
         * @member KISSY.Overlay
         */
        _onSetVisible: function (v) {
            var self = this;
            if (self.get('rendered')) {
                // delay show and hide event after anim
                processEffect(self, v, function () {
                    self.fire(v ? 'show' : 'hide');
                });
            }
        }

    };

    return OverlayEffect;

});/**
 * @ignore
 * support standard mod for component
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/extension/stdmod-render", function (S, Node) {


    var CLS_PREFIX = "stdmod-";

    function StdModRender() {
    }

    StdModRender.ATTRS = {
        header: {
        },
        body: {
        },
        footer: {
        },
        bodyStyle: {
        },
        footerStyle: {
        },
        headerStyle: {
        },
        headerContent: {
        },
        bodyContent: {
        },
        footerContent: {
        }
    };

    StdModRender.HTML_PARSER = {
        header: function (el) {
            return el.one("." + this.get('prefixCls') + CLS_PREFIX + "header");
        },
        body: function (el) {
            return el.one("." + this.get('prefixCls') + CLS_PREFIX + "body");
        },
        footer: function (el) {
            return el.one("." + this.get('prefixCls') + CLS_PREFIX + "footer");
        }
    };

    function createUI(self, part) {
        var el = self.get("contentEl"),
            partEl = self.get(part);
        if (!partEl) {
            partEl = new Node("<div class='" +
                self.get('prefixCls') + CLS_PREFIX + part + "'" +
                " " +
                " >" +
                "</div>");
            partEl.appendTo(el);
            self.setInternal(part, partEl);
        }
    }


    function _setStdModRenderContent(self, part, v) {
        part = self.get(part);
        if (typeof v == 'string') {
            part.html(v);
        } else {
            part.html("")
                .append(v);
        }
    }

    // for augment, no need constructor
    StdModRender.prototype = {

        __createDom: function () {
            createUI(this, "header");
            createUI(this, "body");
            createUI(this, "footer");
        },

        getContentElement: function () {
            return this.get('body');
        },

        '_onSetBodyStyle': function (v) {
            this.get("body").css(v);
        },

        '_onSetHeaderStyle': function (v) {
            this.get("header").css(v);
        },
        '_onSetFooterStyle': function (v) {
            this.get("footer").css(v);
        },

        '_onSetBodyContent': function (v) {
            _setStdModRenderContent(this, "body", v);
        },

        '_onSetHeaderContent': function (v) {
            _setStdModRenderContent(this, "header", v);
        },

        '_onSetFooterContent': function (v) {
            _setStdModRenderContent(this, "footer", v);
        }
    };

    return StdModRender;

}, {
    requires: ['node']
});/**
 * @ignore
 * support standard mod for component
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/extension/stdmod", function () {


    /**
     * @class KISSY.Overlay.Extension.StdMod
     * StdMod extension class. Generate head, body, foot for component.
     */
    function StdMod() {
    }

    StdMod.ATTRS = {
        /**
         * Header element of dialog.
         * @type {KISSY.NodeList}
         * @property header
         * @readonly
         */
        /**
         * @ignore
         */
        header:{
            view:1
        },
        /**
         * Body element of dialog.
         * @type {KISSY.NodeList}
         * @property body
         * @readonly
         */
        /**
         * @ignore
         */
        body:{
            view:1
        },
        /**
         * Footer element of dialog.
         * @type {KISSY.NodeList}
         * @property footer
         * @readonly
         */
        /**
         * @ignore
         */
        footer:{
            view:1
        },
        /**
         * Key-value map of body element's style.
         * @cfg {Object} bodyStyle
         */
        /**
         * @ignore
         */
        bodyStyle:{
            view:1
        },
        /**
         * Key-value map of footer element's style.
         * @cfg {Object} footerStyle
         */
        /**
         * @ignore
         */
        footerStyle:{
            view:1
        },
        /**
         * Key-value map of header element's style.
         * @cfg {Object} headerStyle
         */
        /**
         * @ignore
         */
        headerStyle:{
            view:1
        },
        /**
         * html content of header element.
         * @cfg {KISSY.NodeList|String} headerContent
         */
        /**
         * @ignore
         */
        headerContent:{
            view:1
        },
        /**
         * html content of body element.
         * @cfg {KISSY.NodeList|String} bodyContent
         */
        /**
         * @ignore
         */
        bodyContent:{
            view:1
        },
        /**
         * html content of footer element.
         * @cfg {KISSY.NodeList|String} footerContent
         */
        /**
         * @ignore
         */
        footerContent:{
            view:1
        }
    };

    return StdMod;

});/**
 * @ignore
 * KISSY Overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/overlay-render", function (S, Component, Extension, Loading, Close, Mask) {

    var UA = S.UA;

    return Component.Render.extend([
        Extension.ContentBox.Render,
        Extension.Position.Render,
        Loading,
        UA['ie'] === 6 ? Extension.Shim.Render : null,
        Close,
        Mask
    ]);

}, {
    requires: [
        "component/base",
        'component/extension',
        './extension/loading-render',
        './extension/close-render',
        './extension/mask-render'
    ]
});

/**
 * @ignore
 * 2010-11-09 2010-11-10 yiminghe@gmail.com重构，attribute-base-uibase-Overlay ，采用 UIBase.create
 */
/**
 * @ignore
 * overlay
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
 * @ignore
 * KISSY.Popup
 * @author qiaohua@taobao.com, yiminghe@gmail.com
 */
KISSY.add('overlay/popup', function (S, Overlay, undefined) {

    /**
     * @class KISSY.Overlay.Popup
     * KISSY Popup Component. xclass: 'popup'.
     * @extends KISSY.Overlay
     */
    return Overlay.extend({

        initializer: function () {
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

        _bindTriggerMouse: function () {
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

            trigger.on('mouseenter', self.__mouseEnterPopup);

            self._mouseLeavePopup = function () {
                if (timer) {
                    timer.cancel();
                    timer = undefined;
                }
                self._setHiddenTimer();
            };

            trigger.on('mouseleave', self._mouseLeavePopup);
        },

        _bindContainerMouse: function () {
            var self = this;
            self.get('el')
                .on('mouseleave', self._setHiddenTimer, self)
                .on('mouseenter', self._clearHiddenTimer, self);
        },

        _setHiddenTimer: function () {
            var self = this;
            self._hiddenTimer = S.later(function () {
                self._hiding();
            }, self.get('mouseDelay') * 1000);
        },

        _clearHiddenTimer: function () {
            var self = this;
            if (self._hiddenTimer) {
                self._hiddenTimer.cancel();
                self._hiddenTimer = undefined;
            }
        },

        _bindTriggerClick: function () {
            var self = this;
            self.__clickPopup = function (ev) {
                ev.halt();
                if (self.get('toggle')) {
                    self[self.get('visible') ? '_hiding' : '_showing'](ev);
                } else {
                    self._showing(ev);
                }
            };

            self.get("trigger").on('click', self.__clickPopup);
        },

        _showing: function (ev) {
            var self = this;
            self.set('currentTrigger', S.one(ev.target));
            self.show();
        },

        _hiding: function () {
            this.set('currentTrigger', undefined);
            this.hide();
        },

        destructor: function () {
            var self = this,
                root,
                t = self.get("trigger");
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
            if (root = self.get('el')) {
                root.detach('mouseleave', self._setHiddenTimer, self)
                    .detach('mouseenter', self._clearHiddenTimer, self);
            }
        }
    }, {
        ATTRS: {
            /**
             * Trigger elements to show popup.
             * @cfg {KISSY.NodeList} trigger
             */
            /**
             * @ignore
             */
            trigger: {                          // 触发器
                setter: function (v) {
                    return S.all(v);
                }
            },
            /**
             * How to activate trigger element, "click" or "mouse".
             *
             * Defaults to: "click".
             *
             * @cfg {String} triggerType
             */
            /**
             * @ignore
             */
            triggerType: {
                // 触发类型
                value: 'click'
            },
            currentTrigger: {},
            /**
             * When trigger type is mouse, the delayed time to show popup.
             *
             * Defaults to: 0.1, in seconds.
             *
             * @cfg {Number} mouseDelay
             */
            /**
             * @ignore
             */
            mouseDelay: {
                // triggerType 为 mouse 时, Popup 显示的延迟时间, 默认为 100ms
                value: 0.1
            },
            /**
             * When trigger type is click, whether support toggle.
             *
             * Defaults to: false
             *
             * @cfg {Boolean} toggle
             */
            /**
             * @ignore
             */
            toggle: {
                // triggerType 为 click 时, Popup 是否有toggle功能
                value: false
            }
        }
    }, {
        xclass: 'popup',
        priority: 20
    });
}, {
    requires: ["./base"]
});

/**
 * @ignore
 * 2011-05-17
 *  - yiminghe@gmail.com：利用 initializer , destructor ,ATTRS
 **/
