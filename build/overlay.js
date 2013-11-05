/*
Copyright 2013, KISSY v1.40
MIT Licensed
build time: Nov 5 20:38
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 overlay/extension/loading
 overlay/extension/mask
 overlay/overlay-xtpl
 overlay/close-xtpl
 overlay/overlay-render
 overlay/extension/overlay-effect
 overlay/control
 overlay/dialog-xtpl
 overlay/dialog-render
 overlay/dialog
 overlay/popup
 overlay
*/

/**
 * @ignore
 * loading mask support for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/extension/loading", function (S, Node) {

    /**
     * @class KISSY.Overlay.Extension.Loading
     * Loading extension class. Make component to be able to mask loading.
     */
    function Loading() {
    }

    Loading.prototype = {
        /**
         * mask component as loading
         * @chainable
         */
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
                    .appendTo(self.$el);
            }
            self._loadingExtEl.show();
        },

        /**
         * unmask component as loading
         * @chainable
         */
        unloading: function () {
            var lel = this._loadingExtEl;
            lel && lel.hide();
        }
    };

    return Loading;

}, {
    requires: ['node']
});
/**
 * @ignore
 * mask extension for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/extension/mask", function (S, Node) {
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
        var maskCls = self.view.getBaseCssClasses('mask'),
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
            value: false
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
        }
    };

    var NONE = 'none',
        effects = {fade: ["Out", "In"], slide: ["Up", "Down"]};

    function setMaskVisible(self, shown) {
        var maskNode = self.get('maskNode'),
            hiddenCls = self.view.getBaseCssClasses('mask-hidden');
        if (shown) {
            maskNode.removeClass(hiddenCls);
        } else {
            maskNode.addClass(hiddenCls);
        }
    }

    function processMask(mask, el, show, self) {

        var effect = mask.effect || NONE;

        setMaskVisible(self, show);

        if (effect == NONE) {
            return;
        }

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

    function afterVisibleChange(e) {
        var v,
            self = this,
            maskNode = self.get('maskNode');
        if (v = e.newVal) {
            var elZIndex = Number(self.$el.css('z-index'));
            if (!isNaN(elZIndex)) {
                maskNode.css('z-index', elZIndex);
            }
        }
        processMask(self.get('mask'), maskNode, v, self);
    }

    Mask.prototype = {
        __renderUI: function () {
            var self = this;
            if (self.get('mask')) {
                self.set('maskNode', initMask(self));
            }
        },

        __bindUI: function () {
            var self = this,
                maskNode,
                mask;
            if (mask = self.get("mask")) {
                maskNode = self.get('maskNode');
                if (mask['closeOnClick']) {
                    maskNode.on(Node.Gesture.tap, self.close, self);
                }
                self.on('afterVisibleChange', afterVisibleChange);
            }
        },

        __destructor: function () {
            var mask;
            if (mask = this.get("maskNode")) {
                mask.remove();
            }
        }
    };

    return Mask;
}, {
    requires: ["node"]
});
/*
  Generated by kissy-xtemplate.*/
KISSY.add('overlay/overlay-xtpl', function () {
    return function (scopes, S, undefined) {
        var buffer = "",
            config = this.config,
            engine = this,
            utils = config.utils;
        var runBlockCommandUtil = utils["runBlockCommand"],
            getExpressionUtil = utils["getExpression"],
            getPropertyOrRunCommandUtil = utils["getPropertyOrRunCommand"];
        buffer += '';
        var config1 = {};
        var params2 = [];
        params2.push('overlay/close-xtpl');
        config1.params = params2;
        var id0 = getPropertyOrRunCommandUtil(engine, scopes, config1, "include", 0, 1, false, undefined);
        buffer += id0;
        buffer += '\r\n';
        var config4 = {};
        var params5 = [];
        params5.push('component/extension/content-render/content-xtpl');
        config4.params = params5;
        var id3 = getPropertyOrRunCommandUtil(engine, scopes, config4, "include", 0, 2, false, undefined);
        buffer += id3;
        return buffer;
    }
});
/*
  Generated by kissy-xtemplate.*/
KISSY.add('overlay/close-xtpl', function () {
    return function (scopes, S, undefined) {
        var buffer = "",
            config = this.config,
            engine = this,
            utils = config.utils;
        var runBlockCommandUtil = utils["runBlockCommand"],
            getExpressionUtil = utils["getExpression"],
            getPropertyOrRunCommandUtil = utils["getPropertyOrRunCommand"];
        buffer += '';
        var config0 = {};
        var params1 = [];
        var id2 = getPropertyOrRunCommandUtil(engine, scopes, {}, "closable", 0, 1, undefined, true);
        params1.push(id2);
        config0.params = params1;
        config0.fn = function (scopes) {
            var buffer = "";
            buffer += '\r\n<a href="javascript:void(\'close\')"\r\n   id="ks-overlay-close-';
            var id3 = getPropertyOrRunCommandUtil(engine, scopes, {}, "id", 0, 3, undefined, false);
            buffer += getExpressionUtil(id3, true);
            buffer += '"\r\n   class="';
            var config5 = {};
            var params6 = [];
            params6.push('close');
            config5.params = params6;
            var id4 = getPropertyOrRunCommandUtil(engine, scopes, config5, "getBaseCssClasses", 0, 4, true, undefined);
            buffer += id4;
            buffer += '"\r\n   role=\'button\'>\r\n    <span class="';
            var config8 = {};
            var params9 = [];
            params9.push('close-x');
            config8.params = params9;
            var id7 = getPropertyOrRunCommandUtil(engine, scopes, config8, "getBaseCssClasses", 0, 6, true, undefined);
            buffer += id7;
            buffer += '">close</span>\r\n</a>\r\n';
            return buffer;
        };
        buffer += runBlockCommandUtil(engine, scopes, config0, "if", 1);
        buffer += '\r\n';
        return buffer;
    }
});
/**
 * @ignore
 * KISSY Overlay
 * @author yiminghe@gmail.com
 */
KISSY.add('overlay/overlay-render', function (S, Container,OverlayTpl, ContentRenderExtension) {
    return Container.getDefaultRender().extend([
        ContentRenderExtension
    ], {
        createDom: function () {
            this.fillChildrenElsBySelectors({
                closeBtn: '#ks-overlay-close-{id}'
            });
        }
    }, {
        ATTRS:{
          contentTpl:{
              value:OverlayTpl
          }
        },
        HTML_PARSER: {
            closeBtn: function (el) {
                return el.one("." + this.getBaseCssClass('close'));
            }
        }
    });
}, {
    requires: [
        'component/container',
        './overlay-xtpl',
        'component/extension/content-render',
        './close-xtpl'
    ]
});

/**
 * @ignore
 * 2010-11-09 2010-11-10 yiminghe@gmail.com重构，attribute-base-uibase-Overlay ，采用 UIBase.create
 */
/**
 * @ignore
 * effect for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add('overlay/extension/overlay-effect', function (S) {
    var effects = {fade: ["Out", "In"], slide: ["Up", "Down"]};

    function getGhost(self) {
        var el = self.$el,
            ghost = el.clone(true);

        ghost.css({
            visibility: 'visible',
            overflow: 'hidden'
        }).addClass(self.get('prefixCls') + 'overlay-ghost');

        return self.__afterCreateEffectGhost(ghost);
    }

    function processTarget(self, show, callback) {
        if (self.__effectGhost) {
            self.__effectGhost.stop(1, 1);
        }

        var el = self.$el,
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

        if (show) {
            from = targetBox;
            to = elBox;
        } else {
            from = elBox;
            to = targetBox;
        }

        el.css('visibility', 'hidden');
        ghost.css(from);

        self.__effectGhost = ghost;

        ghost.animate(to, {
            duration: duration,
            easing: easing,
            complete: function () {
                self.__effectGhost = null;
                ghost.remove();
                el.css('visibility', '');
                callback();
            }
        });
    }

    function processEffect(self, show, callback) {
        var el = self.$el,
            effectCfg = self.get("effect"),
            effect = effectCfg.effect || 'none',
            target = effectCfg.target;
        if (effect == 'none' && !target) {
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
            "visibility": 'visible',
            // fadeIn need display none, fadeOut need display block
            "display": show ? 'none' : 'block'
        });
        var m = effect + effects[effect][index];
        el[m](duration, function () {
            el.css({
                // need compute coordinates when show, so do not use display none for hide
                "display": 'block',
                // restore to box-render _onSetVisible
                "visibility": ''
            });
            callback();
        }, easing);
    }

    /**
     * effect extension for overlay
     * @class KISSY.Overlay.Extension.Effect
     */
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
                duration: 0.5,
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
            // delay show and hide event after anim
            processEffect(self, v, function () {
                self.fire(v ? 'show' : 'hide');
            });
        }
    };

    return OverlayEffect;
});
/**
 * @ignore
 * control for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/control", function (S, Container,Shim, AlignExtension,
                                    Loading, Mask, OverlayRender, OverlayEffect) {
    var HIDE = "hide",
        actions = {
            hide: HIDE,
            destroy: "destroy"
        };
    /**
     * KISSY Overlay Component.
     * xclass: 'overlay'.
     * @class KISSY.Overlay
     * @extends KISSY.Component.Container
     * @mixins KISSY.Component.Extension.Shim
     * @mixins KISSY.Overlay.Extension.Effect
     * @mixins KISSY.Overlay.Extension.Loading
     * @mixins KISSY.Component.Extension.Align
     * @mixins KISSY.Overlay.Extension.Mask
     */
    return Container.extend([
        Shim,
        Loading,
        AlignExtension,
        Mask,
        OverlayEffect
    ], {
        bindUI: function () {
            var self = this,
                closeBtn = self.get("closeBtn");
            if (closeBtn) {
                closeBtn.on("click", function (ev) {
                    self.close();
                    ev.preventDefault();
                });
            }
        },
        /**
         * hide or destroy according to {@link KISSY.Overlay#closeAction}
         * @chainable
         */
        close: function () {
            var self = this;
            self[actions[self.get("closeAction")] || HIDE]();
            return self;
        }
    }, {
        ATTRS: {
            contentEl: {
            },

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
            closable: {
                value: false,
                view: 1
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
            closeBtn: {
                view: 1
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
            closeAction: {
                value: HIDE
            },

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

            visible: {
                value: false
            },

            xrender: {
                value: OverlayRender
            }
        },
        xclass: 'overlay'
    });
}, {
    requires: [
        'component/container',
        'component/extension/shim',
        'component/extension/align',
        "./extension/loading",
        "./extension/mask",
        './overlay-render',
        './extension/overlay-effect'
    ]
});
/*
  Generated by kissy-xtemplate.*/
KISSY.add('overlay/dialog-xtpl', function () {
    return function (scopes, S, undefined) {
        var buffer = "",
            config = this.config,
            engine = this,
            utils = config.utils;
        var runBlockCommandUtil = utils["runBlockCommand"],
            getExpressionUtil = utils["getExpression"],
            getPropertyOrRunCommandUtil = utils["getPropertyOrRunCommand"];
        buffer += '';
        var config1 = {};
        var params2 = [];
        params2.push('overlay/close-xtpl');
        config1.params = params2;
        var id0 = getPropertyOrRunCommandUtil(engine, scopes, config1, "include", 0, 1, false, undefined);
        buffer += id0;
        buffer += '\r\n<div id="ks-content-';
        var id3 = getPropertyOrRunCommandUtil(engine, scopes, {}, "id", 0, 2, undefined, false);
        buffer += getExpressionUtil(id3, true);
        buffer += '"\r\n     class="';
        var config5 = {};
        var params6 = [];
        params6.push('content');
        config5.params = params6;
        var id4 = getPropertyOrRunCommandUtil(engine, scopes, config5, "getBaseCssClasses", 0, 3, true, undefined);
        buffer += id4;
        buffer += '">\r\n    <div class="';
        var config8 = {};
        var params9 = [];
        params9.push('header');
        config8.params = params9;
        var id7 = getPropertyOrRunCommandUtil(engine, scopes, config8, "getBaseCssClasses", 0, 4, true, undefined);
        buffer += id7;
        buffer += '"\r\n         style="\r\n';
        var config10 = {};
        var params11 = [];
        var id12 = getPropertyOrRunCommandUtil(engine, scopes, {}, "headerStyle", 0, 6, undefined, true);
        params11.push(id12);
        config10.params = params11;
        config10.fn = function (scopes) {
            var buffer = "";
            buffer += ' \r\n ';
            var id13 = getPropertyOrRunCommandUtil(engine, scopes, {}, "xindex", 0, 7, undefined, false);
            buffer += getExpressionUtil(id13, true);
            buffer += ':';
            var id14 = getPropertyOrRunCommandUtil(engine, scopes, {}, ".", 0, 7, undefined, false);
            buffer += getExpressionUtil(id14, true);
            buffer += ';\r\n';
            return buffer;
        };
        buffer += runBlockCommandUtil(engine, scopes, config10, "each", 6);
        buffer += '\r\n"\r\n         id="ks-stdmod-header-';
        var id15 = getPropertyOrRunCommandUtil(engine, scopes, {}, "id", 0, 10, undefined, false);
        buffer += getExpressionUtil(id15, true);
        buffer += '">';
        var id16 = getPropertyOrRunCommandUtil(engine, scopes, {}, "headerContent", 0, 10, undefined, false);
        buffer += getExpressionUtil(id16, false);
        buffer += '</div>\r\n\r\n    <div class="';
        var config18 = {};
        var params19 = [];
        params19.push('body');
        config18.params = params19;
        var id17 = getPropertyOrRunCommandUtil(engine, scopes, config18, "getBaseCssClasses", 0, 12, true, undefined);
        buffer += id17;
        buffer += '"\r\n         style="\r\n';
        var config20 = {};
        var params21 = [];
        var id22 = getPropertyOrRunCommandUtil(engine, scopes, {}, "bodyStyle", 0, 14, undefined, true);
        params21.push(id22);
        config20.params = params21;
        config20.fn = function (scopes) {
            var buffer = "";
            buffer += ' \r\n ';
            var id23 = getPropertyOrRunCommandUtil(engine, scopes, {}, "xindex", 0, 15, undefined, false);
            buffer += getExpressionUtil(id23, true);
            buffer += ':';
            var id24 = getPropertyOrRunCommandUtil(engine, scopes, {}, ".", 0, 15, undefined, false);
            buffer += getExpressionUtil(id24, true);
            buffer += ';\r\n';
            return buffer;
        };
        buffer += runBlockCommandUtil(engine, scopes, config20, "each", 14);
        buffer += '\r\n"\r\n         id="ks-stdmod-body-';
        var id25 = getPropertyOrRunCommandUtil(engine, scopes, {}, "id", 0, 18, undefined, false);
        buffer += getExpressionUtil(id25, true);
        buffer += '">';
        var id26 = getPropertyOrRunCommandUtil(engine, scopes, {}, "bodyContent", 0, 18, undefined, false);
        buffer += getExpressionUtil(id26, false);
        buffer += '</div>\r\n\r\n    <div class="';
        var config28 = {};
        var params29 = [];
        params29.push('footer');
        config28.params = params29;
        var id27 = getPropertyOrRunCommandUtil(engine, scopes, config28, "getBaseCssClasses", 0, 20, true, undefined);
        buffer += id27;
        buffer += '"\r\n         style="\r\n';
        var config30 = {};
        var params31 = [];
        var id32 = getPropertyOrRunCommandUtil(engine, scopes, {}, "footerStyle", 0, 22, undefined, true);
        params31.push(id32);
        config30.params = params31;
        config30.fn = function (scopes) {
            var buffer = "";
            buffer += ' \r\n ';
            var id33 = getPropertyOrRunCommandUtil(engine, scopes, {}, "xindex", 0, 23, undefined, false);
            buffer += getExpressionUtil(id33, true);
            buffer += ':';
            var id34 = getPropertyOrRunCommandUtil(engine, scopes, {}, ".", 0, 23, undefined, false);
            buffer += getExpressionUtil(id34, true);
            buffer += ';\r\n';
            return buffer;
        };
        buffer += runBlockCommandUtil(engine, scopes, config30, "each", 22);
        buffer += '\r\n"\r\n         id="ks-stdmod-footer-';
        var id35 = getPropertyOrRunCommandUtil(engine, scopes, {}, "id", 0, 26, undefined, false);
        buffer += getExpressionUtil(id35, true);
        buffer += '">';
        var id36 = getPropertyOrRunCommandUtil(engine, scopes, {}, "footerContent", 0, 26, undefined, false);
        buffer += getExpressionUtil(id36, false);
        buffer += '</div>\r\n</div>\r\n<div tabindex="0"></div>';
        return buffer;
    }
});
/**
 * @ignore
 * render for dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/dialog-render", function (S, OverlayRender, DialogTpl) {
    function _setStdModRenderContent(self, part, v) {
        part = self.control.get(part);
        part.html(v);
    }

    return OverlayRender.extend({
        beforeCreateDom: function (renderData) {
            S.mix(renderData.elAttrs, {
                role: 'dialog',
                'aria-labelledby': 'ks-stdmod-header-' + this.control.get('id')
            });
        },

        createDom: function () {
            this.fillChildrenElsBySelectors({
                header: '#ks-stdmod-header-{id}',
                body: '#ks-stdmod-body-{id}',
                footer: '#ks-stdmod-footer-{id}'
            });
        },

        getChildrenContainerEl: function () {
            return this.control.get('body');
        },

        '_onSetBodyStyle': function (v) {
            this.control.get("body").css(v);
        },

        '_onSetHeaderStyle': function (v) {
            this.control.get("header").css(v);
        },
        '_onSetFooterStyle': function (v) {
            this.control.get("footer").css(v);
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
    }, {
        ATTRS: {
            contentTpl: {
                value: DialogTpl
            }
        },
        HTML_PARSER: {
            header: function (el) {
                return el.one("." + this.getBaseCssClass('header'));
            },
            body: function (el) {
                return el.one("." + this.getBaseCssClass('body'));
            },
            footer: function (el) {
                return el.one("." + this.getBaseCssClass('footer'));
            },
            headerContent: function (el) {
                return el.one("." + this.getBaseCssClass('header')).html();
            },
            bodyContent: function (el) {
                return el.one("." + this.getBaseCssClass('body')).html();
            },
            footerContent: function (el) {
                var footer = el.one("." + this.getBaseCssClass('footer'));
                return footer && footer.html();
            }
        }
    });
}, {
    requires: ['./overlay-render', './dialog-xtpl']
});
/**
 * @ignore
 * KISSY.Dialog
 * @author yiminghe@gmail.com
 */
KISSY.add('overlay/dialog', function (S, Overlay, DialogRender, Node) {

    /**
     * @class KISSY.Overlay.Dialog
     * KISSY Dialog Component. xclass: 'dialog'.
     * @extends KISSY.Overlay
     */
    var Dialog = Overlay.extend({
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
            },

            handleKeyDownInternal: function (e) {
                if (this.get('escapeToClose') &&
                    e.keyCode === Node.KeyCode.ESC) {
                    if (e.target.nodeName.toLowerCase() == 'select' &&
                        !e.target.disabled) {
                        // escape at select
                    } else {
                        this.close();
                        e.halt();
                    }
                    return;
                }
                trapFocus.call(this, e);
            },

            _onSetVisible: function (v,e) {
                var self = this,
                    el = self.el;
                if (v) {
                    self.__lastActive = el.ownerDocument.activeElement;
                    self.focus();
                    // if d.show(); d.hide();
                    // async -> focus event -> handleFocusInternal
                    // -> set('focused') -> el.focus() -> ie error
                    // el[0].focus && el[0].focus();
                    el.setAttribute("aria-hidden", "false");
                } else {
                    el.setAttribute("aria-hidden", "true");
                    try {
                        self.__lastActive && self.__lastActive.focus();
                    } catch (e) {
                        // ie can not be focused if lastActive is invisible
                    }
                }
                // prevent display none for effect
                self.callSuper(v,e);
            }
        },

        {
            ATTRS: {

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
                    value:{},
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
                    value:{},
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
                    value:{},
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
                    value:'',
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
                    value:'',
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
                    value:'',
                    view:1
                },

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
            },
            xclass: 'dialog'
        });


    var KEY_TAB = Node.KeyCode.TAB;

    // 不完美的方案，窗体末尾空白 tab 占位符，多了 tab 操作一次
    function trapFocus(e) {

        var self = this,
            keyCode = e.keyCode;

        if (keyCode != KEY_TAB) {
            return;
        }
        var $el = self.$el;
        // summary:
        // Handles the keyboard events for accessibility reasons

        var node = Node.all(e.target); // get the target node of the keypress event

        // find the first and last tab focusable items in the hierarchy of the dialog container node
        // do this every time if the items may be added / removed from the the dialog may change visibility or state

        var lastFocusItem = $el.last();

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
            if (node.equals($el) || $el.contains(node)) {
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
        "./control",
        './dialog-render',
        'node'
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
 */
/**
 * @ignore
 * KISSY.Popup
 * @author qiaohua@taobao.com, yiminghe@gmail.com
 */
KISSY.add('overlay/popup', function (S, Overlay, undefined) {
    /**
     * @class KISSY.Overlay.Popup
     * KISSY Popup Component.
     * xclass: 'popup'.
     * @extends KISSY.Overlay
     */
    return Overlay.extend({
        initializer: function () {
            var self = this,
            // 获取相关联的 Dom 节点
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
            self.$el
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
                ev.preventDefault();
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
                $el = self.$el,
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

            $el.detach('mouseleave', self._setHiddenTimer, self)
                .detach('mouseenter', self._clearHiddenTimer, self);

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
            trigger: {
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
        },
        xclass: 'popup'
    });
}, {
    requires: ["./control"]
});

/**
 * @ignore
 * 2011-05-17
 *  - yiminghe@gmail.com：利用 initializer , destructor ,ATTRS
 **/
/**
 * @ignore
 * overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay", function (S, O, D, P) {
    O.Dialog = D;
    S.Dialog = D;
    O.Popup = P;
    S.Overlay = O;
    return O;
}, {
    requires:[
        "overlay/control",
        "overlay/dialog",
        "overlay/popup"
    ]
});

