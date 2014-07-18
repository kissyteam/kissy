/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:04
*/
/*
combined modules:
overlay
overlay/control
overlay/extension/loading
overlay/extension/mask
overlay/extension/overlay-effect
overlay/overlay-xtpl
overlay/dialog
overlay/dialog-xtpl
overlay/popup
*/
KISSY.add('overlay', [
    'overlay/control',
    'overlay/dialog',
    'overlay/popup'
], function (S, require, exports, module) {
    /**
 * @ignore
 * overlay
 * @author yiminghe@gmail.com
 */
    var O = require('overlay/control');
    var D = require('overlay/dialog');
    var P = require('overlay/popup');
    O.Dialog = D;
    O.Popup = P;
    module.exports = O;
});
KISSY.add('overlay/control', [
    'component/container',
    'component/extension/shim',
    'component/extension/align',
    './extension/loading',
    './extension/mask',
    './extension/overlay-effect',
    'component/extension/content-box',
    './overlay-xtpl'
], function (S, require, exports, module) {
    /**
 * @ignore
 * control for overlay
 * @author yiminghe@gmail.com
 */
    var Container = require('component/container');
    var Shim = require('component/extension/shim');
    var AlignExtension = require('component/extension/align');
    var Loading = require('./extension/loading');
    var Mask = require('./extension/mask');
    var OverlayEffect = require('./extension/overlay-effect');
    var ContentBox = require('component/extension/content-box');
    var OverlayTpl = require('./overlay-xtpl');
    var HIDE = 'hide', actions = {
            hide: HIDE,
            destroy: 'destroy'
        };    /**
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
    module.exports = Container.extend([
        ContentBox,
        Shim,
        Loading,
        AlignExtension,
        Mask,
        OverlayEffect
    ], {
        bindUI: function () {
            var self = this, closeBtn = self.get('closeBtn');
            if (closeBtn) {
                closeBtn.on('click', function (ev) {
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
            self[actions[self.get('closeAction')] || HIDE]();
            return self;
        }
    }, {
        ATTRS: {
            handleGestureEvents: { value: false },
            focusable: { value: false },
            allowTextSelection: { value: true },
            contentTpl: { value: OverlayTpl },
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
                sync: 0,
                render: 1,
                parse: function () {
                    return !!this.get('closeBtn');
                }
            },
            /**
         * close button element.
         * @type {KISSY.Node}
         * @property closeBtn
         * @readonly
         */
            /**
         * @ignore
         */
            closeBtn: {
                selector: function () {
                    return '.' + this.getBaseCssClass('close');
                }
            },
            /**
         * Whether to destroy or hide current element when click close button.
         * Can set 'destroy' to destroy it when click close button.
         *
         * Defaults to: 'hide'.
         *
         * @cfg {String} closeAction
         */
            /**
         * @ignore
         */
            closeAction: { value: HIDE },
            closeText: {
                value: 'close',
                render: 1
            },
            visible: { value: false }
        },
        xclass: 'overlay'
    });
});



KISSY.add('overlay/extension/loading', ['node'], function (S, require, exports, module) {
    /**
 * @ignore
 * loading mask support for overlay
 * @author yiminghe@gmail.com
 */
    var $ = require('node');    /**
 * @class KISSY.Overlay.Extension.Loading
 * Loading extension class. Make component to be able to mask loading.
 */
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
                self._loadingExtEl = $('<div ' + 'class="' + self.get('prefixCls') + 'ext-loading"' + ' style="position: absolute;' + 'border: none;' + 'width: 100%;' + 'top: 0;' + 'left: 0;' + 'z-index: 99999;' + 'height:100%;' + '*height: expression(this.parentNode.offsetHeight);' + '"/>').appendTo(self.$el);
            }
            self._loadingExtEl.show();
        },
        /**
     * unmask component as loading
     * @chainable
     */
        unloading: function () {
            if (this._loadingExtEl) {
                this._loadingExtEl.hide();
            }
        }
    };
    module.exports = Loading;
});

KISSY.add('overlay/extension/mask', [
    'ua',
    'node',
    'event/gesture/tap'
], function (S, require, exports, module) {
    /**
 * @ignore
 * mask extension for kissy
 * @author yiminghe@gmail.com
 */
    var UA = require('ua'), ie6 = UA.ie === 6, $ = require('node');
    var TapGesture = require('event/gesture/tap');
    var tap = TapGesture.TAP;
    function docWidth() {
        return ie6 ? 'expression(KISSY.DOM.docWidth())' : '100%';
    }
    function docHeight() {
        return ie6 ? 'expression(KISSY.DOM.docHeight())' : '100%';
    }
    function initMask(self, hiddenCls) {
        var maskCls = self.getBaseCssClasses('mask'), mask = $('<div ' + ' style="width:' + docWidth() + ';' + 'left:0;' + 'top:0;' + 'height:' + docHeight() + ';' + 'position:' + (ie6 ? 'absolute' : 'fixed') + ';"' + ' class="' + maskCls + ' ' + hiddenCls + '">' + (ie6 ? '<' + 'iframe ' + 'style="position:absolute;' + 'left:' + '0' + ';' + 'top:' + '0' + ';' + 'background:red;' + 'width: expression(this.parentNode.offsetWidth);' + 'height: expression(this.parentNode.offsetHeight);' + 'filter:alpha(opacity=0);' + 'z-index:-1;"></iframe>' : '') + '</div>').prependTo('body');    /*
     点 mask 焦点不转移
     */
        /*
     点 mask 焦点不转移
     */
        mask.unselectable();
        mask.on('mousedown', function (e) {
            e.preventDefault();
        });
        return mask;
    }    /**
 * @class KISSY.Overlay.Extension.Mask
 * Mask extension class. Make component to be able to show with mask.
 */
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
        mask: { value: false },
        /**
     * Mask node of current component.
     * @type {KISSY.Node}
     * @property maskNode
     * @readonly
     */
        /**
     * @ignore
     */
        maskNode: {}
    };
    var NONE = 'none', effects = {
            fade: [
                'Out',
                'In'
            ],
            slide: [
                'Up',
                'Down'
            ]
        };
    function setMaskVisible(self, shown) {
        var maskNode = self.get('maskNode'), hiddenCls = self.getBaseCssClasses('mask-hidden');
        if (shown) {
            maskNode.removeClass(hiddenCls);
        } else {
            maskNode.addClass(hiddenCls);
        }
    }
    function processMask(mask, el, show, self) {
        var effect = mask.effect || NONE;
        setMaskVisible(self, show);
        if (effect === NONE) {
            return;
        }
        var duration = mask.duration, easing = mask.easing, m, index = show ? 1 : 0;    // run complete fn to restore window's original height
        // run complete fn to restore window's original height
        el.stop(1, 1);
        el.css('display', show ? NONE : 'block');
        m = effect + effects[effect][index];
        el[m](duration, function () {
            el.css('display', '');
        }, easing);
    }
    function afterVisibleChange(e) {
        var v, self = this, maskNode = self.get('maskNode');
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
                self.set('maskNode', initMask(self, self.get('visible') ? '' : self.getBaseCssClasses('mask-hidden')));
            }
        },
        __bindUI: function () {
            var self = this, maskNode, mask;
            if (mask = self.get('mask')) {
                maskNode = self.get('maskNode');
                if (mask.closeOnClick) {
                    maskNode.on(tap, self.close, self);
                }
                self.on('afterVisibleChange', afterVisibleChange);
            }
        },
        __destructor: function () {
            var mask;
            if (mask = this.get('maskNode')) {
                mask.remove();
            }
        }
    };
    module.exports = Mask;
});


KISSY.add('overlay/extension/overlay-effect', [
    'util',
    'node'
], function (S, require, exports, module) {
    /**
 * @ignore
 * effect for overlay
 * @author yiminghe@gmail.com
 */
    var effects = {
            fade: [
                'Out',
                'In'
            ],
            slide: [
                'Up',
                'Down'
            ]
        };
    var util = require('util');
    function getGhost(self) {
        var el = self.$el, ghost = el.clone(true);
        ghost.css({
            visibility: 'hidden',
            overflow: 'hidden'
        }).addClass(self.get('prefixCls') + 'overlay-ghost');
        return self.__afterCreateEffectGhost(ghost);
    }
    function processTarget(self, show) {
        if (self.__effectGhost) {
            self.__effectGhost.stop(1, 1);
        }
        var el = self.$el, $ = require('node'), effectCfg = self.get('effect'), target = $(effectCfg.target), duration = effectCfg.duration, targetBox = {
                width: target.width(),
                height: target.height()
            }, targetOffset = target.offset(), elBox = {
                width: el.width(),
                height: el.height()
            }, elOffset = el.offset(), from, to, fromOffset, toOffset, ghost = getGhost(self), easing = effectCfg.easing;
        ghost.insertAfter(el);
        if (show) {
            from = targetBox;
            fromOffset = targetOffset;
            to = elBox;
            toOffset = elOffset;
        } else {
            from = elBox;
            fromOffset = elOffset;
            to = targetBox;
            toOffset = targetOffset;
        }    // get css left top value
             // in case overlay is inside a relative container
        // get css left top value
        // in case overlay is inside a relative container
        ghost.offset(toOffset);
        util.mix(to, {
            left: ghost.css('left'),
            top: ghost.css('top')
        });
        el.css('visibility', 'hidden');
        ghost.css(from);
        ghost.offset(fromOffset);
        self.__effectGhost = ghost;
        ghost.css('visibility', 'visible');
        ghost.animate(to, {
            Anim: effectCfg.Anim,
            duration: duration,
            easing: easing,
            complete: function () {
                self.__effectGhost = null;
                ghost.remove();
                el.css('visibility', '');
            }
        });
    }
    function processEffect(self, show) {
        var el = self.$el, effectCfg = self.get('effect'), effect = effectCfg.effect || 'none', target = effectCfg.target;
        if (effect === 'none' && !target) {
            return;
        }
        if (target) {
            processTarget(self, show);
            return;
        }
        var duration = effectCfg.duration, easing = effectCfg.easing, index = show ? 1 : 0;    // 队列中的也要移去
                                                                                               // run complete fn to restore window's original height
        // 队列中的也要移去
        // run complete fn to restore window's original height
        el.stop(1, 1);
        el.css({
            // must show, override box-render _onSetVisible
            visibility: 'visible',
            // fadeIn need display none, fadeOut need display block
            display: show ? 'none' : 'block'
        });
        var m = effect + effects[effect][index];
        el[m]({
            duration: duration,
            Anim: effectCfg.Anim,
            complete: function () {
                el.css({
                    // need compute coordinates when show, so do not use display none for hide
                    display: 'block',
                    // restore to box-render _onSetVisible
                    visibility: ''
                });
            },
            easing: easing
        });
    }
    function afterVisibleChange(e) {
        processEffect(this, e.newVal);
    }    /**
 * effect extension for overlay
 * @class KISSY.Overlay.Extension.Effect
 */
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
     * can be set as 'fade' or 'slide'
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
            valueFn: function () {
                return {
                    effect: '',
                    target: null,
                    duration: 0.5,
                    easing: 'easeOut'
                };
            },
            setter: function (v) {
                var effect = v.effect;
                if (typeof effect === 'string' && !effects[effect]) {
                    v.effect = '';
                }
            }
        }
    };
    OverlayEffect.prototype = {
        __afterCreateEffectGhost: function (ghost) {
            return ghost;
        },
        __bindUI: function () {
            this.on('afterVisibleChange', afterVisibleChange, this);
        }
    };
    module.exports = OverlayEffect;
});


KISSY.add('overlay/overlay-xtpl', [], function (S, require, exports, module) {
    /* Compiled By XTemplate */
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
    module.exports = function overlayXtpl(scope, buffer, undefined) {
        var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
        var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], rangeCommand = nativeCommands['range'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
        buffer.write('', 0);
        var option0 = { escape: 1 };
        var params1 = [];
        params1.push('ks-overlay-closable');
        option0.params = params1;
        option0.fn = function (scope, buffer) {
            buffer.write('\r\n    ', 0);
            var option2 = { escape: 1 };
            var params3 = [];
            var id4 = scope.resolve(['closable'], 0);
            params3.push(id4);
            option2.params = params3;
            option2.fn = function (scope, buffer) {
                buffer.write('\r\n        <a href="javascript:void(\'close\')"\r\n           aria-label="Close"\r\n           class="', 0);
                var option5 = { escape: 1 };
                var params6 = [];
                params6.push('close');
                option5.params = params6;
                var callRet7;
                callRet7 = callFnUtil(tpl, scope, option5, buffer, ['getBaseCssClasses'], 0, 5);
                if (callRet7 && callRet7.isBuffer) {
                    buffer = callRet7;
                    callRet7 = undefined;
                }
                buffer.write(callRet7, true);
                buffer.write('"\r\n           role=\'button\'>\r\n            <span class="', 0);
                var option8 = { escape: 1 };
                var params9 = [];
                params9.push('close-x');
                option8.params = params9;
                var callRet10;
                callRet10 = callFnUtil(tpl, scope, option8, buffer, ['getBaseCssClasses'], 0, 7);
                if (callRet10 && callRet10.isBuffer) {
                    buffer = callRet10;
                    callRet10 = undefined;
                }
                buffer.write(callRet10, true);
                buffer.write('">', 0);
                var id11 = scope.resolve(['closeText'], 0);
                buffer.write(id11, false);
                buffer.write('</span>\r\n        </a>\r\n    ', 0);
                return buffer;
            };
            buffer = ifCommand.call(tpl, scope, option2, buffer, 2);
            buffer.write('\r\n', 0);
            return buffer;
        };
        buffer = blockCommand.call(tpl, scope, option0, buffer, 1);
        buffer.write('\r\n\r\n<div class="', 0);
        var option12 = { escape: 1 };
        var params13 = [];
        params13.push('content');
        option12.params = params13;
        var callRet14;
        callRet14 = callFnUtil(tpl, scope, option12, buffer, ['getBaseCssClasses'], 0, 12);
        if (callRet14 && callRet14.isBuffer) {
            buffer = callRet14;
            callRet14 = undefined;
        }
        buffer.write(callRet14, true);
        buffer.write('">\r\n    ', 0);
        var option15 = { escape: 1 };
        var params16 = [];
        params16.push('ks-overlay-content');
        option15.params = params16;
        option15.fn = function (scope, buffer) {
            buffer.write('\r\n        ', 0);
            var id17 = scope.resolve(['content'], 0);
            buffer.write(id17, false);
            buffer.write('\r\n    ', 0);
            return buffer;
        };
        buffer = blockCommand.call(tpl, scope, option15, buffer, 13);
        buffer.write('\r\n</div>', 0);
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});
KISSY.add('overlay/dialog', [
    'util',
    './control',
    'node',
    './dialog-xtpl'
], function (S, require, exports, module) {
    /**
 * @ignore
 * KISSY.Dialog
 * @author yiminghe@gmail.com
 */
    var util = require('util');
    var Overlay = require('./control');
    var $ = require('node');
    var DialogTpl = require('./dialog-xtpl');
    function _setStdModRenderContent(self, part, v) {
        part = self.get(part);
        part.html(v);
    }    /**
 * @class KISSY.Overlay.Dialog
 * KISSY Dialog Component. xclass: 'dialog'.
 * @extends KISSY.Overlay
 */
    /**
 * @class KISSY.Overlay.Dialog
 * KISSY Dialog Component. xclass: 'dialog'.
 * @extends KISSY.Overlay
 */
    var Dialog = Overlay.extend({
            beforeCreateDom: function (renderData) {
                util.mix(renderData.elAttrs, {
                    role: 'dialog',
                    'aria-labelledby': 'ks-stdmod-header-' + this.get('id')
                });
            },
            getChildrenContainerEl: function () {
                return this.get('body');
            },
            // also simplify body
            __afterCreateEffectGhost: function (ghost) {
                var self = this, elBody = self.get('body');
                ghost.all('.' + self.get('prefixCls') + 'stdmod-body').css({
                    height: elBody.height(),
                    width: elBody.width()
                }).html('');
                return ghost;
            },
            handleKeyDownInternal: function (e) {
                if (this.get('escapeToClose') && e.keyCode === $.Event.KeyCode.ESC) {
                    if (!(e.target.nodeName.toLowerCase() === 'select' && !e.target.disabled)) {
                        // escape at select
                        this.close();
                        e.halt();
                    }
                    return;
                }
                trapFocus.call(this, e);
            },
            _onSetVisible: function (v, e) {
                var self = this, el = self.el;
                self.callSuper(v, e);
                if (v) {
                    self.__lastActive = el.ownerDocument.activeElement;
                    self.focus();    // if d.show(); d.hide();
                                     // async -> focus event -> handleFocusInternal
                                     // -> set('focused') -> el.focus() -> ie error
                                     // el[0].focus && el[0].focus();
                    // if d.show(); d.hide();
                    // async -> focus event -> handleFocusInternal
                    // -> set('focused') -> el.focus() -> ie error
                    // el[0].focus && el[0].focus();
                    el.setAttribute('aria-hidden', 'false');
                } else {
                    el.setAttribute('aria-hidden', 'true');
                    try {
                        if (self.__lastActive) {
                            self.__lastActive.focus();
                        }
                    } catch (ee) {
                    }
                }
            },
            // ie can not be focused if lastActive is invisible
            _onSetBodyContent: function (v) {
                _setStdModRenderContent(this, 'body', v);
            },
            _onSetHeaderContent: function (v) {
                _setStdModRenderContent(this, 'header', v);
            },
            _onSetFooterContent: function (v) {
                _setStdModRenderContent(this, 'footer', v);
            }
        }, {
            ATTRS: {
                focusable: { value: true },
                contentTpl: { value: DialogTpl },
                /**
         * Header element of dialog.
         * @type {KISSY.Node}
         * @property header
         * @readonly
         */
                /**
         * @ignore
         */
                header: {
                    selector: function () {
                        return '.' + this.getBaseCssClass('header');
                    }
                },
                /**
         * Body element of dialog.
         * @type {KISSY.Node}
         * @property body
         * @readonly
         */
                /**
         * @ignore
         */
                body: {
                    selector: function () {
                        return '.' + this.getBaseCssClass('body');
                    }
                },
                /**
         * Footer element of dialog.
         * @type {KISSY.Node}
         * @property footer
         * @readonly
         */
                /**
         * @ignore
         */
                footer: {
                    selector: function () {
                        return '.' + this.getBaseCssClass('footer');
                    }
                },
                /**
         * Key-value map of body element's style.
         * @cfg {Object} bodyStyle
         */
                /**
         * @ignore
         */
                bodyStyle: { sync: 0 },
                /**
         * Key-value map of footer element's style.
         * @cfg {Object} footerStyle
         */
                /**
         * @ignore
         */
                footerStyle: { render: 1 },
                /**
         * Key-value map of header element's style.
         * @cfg {Object} headerStyle
         */
                /**
         * @ignore
         */
                headerStyle: { render: 1 },
                /**
         * html content of header element.
         * @cfg {KISSY.Node|String} headerContent
         */
                /**
         * @ignore
         */
                headerContent: {
                    value: '',
                    sync: 0,
                    render: 1,
                    parse: function () {
                        return this.get('header').html();
                    }
                },
                /**
         * html content of body element.
         * @cfg {KISSY.Node|String} bodyContent
         */
                /**
         * @ignore
         */
                bodyContent: {
                    value: '',
                    sync: 0,
                    render: 1,
                    parse: function () {
                        return this.get('body').html();
                    }
                },
                /**
         * html content of footer element.
         * @cfg {KISSY.Node|String} footerContent
         */
                /**
         * @ignore
         */
                footerContent: {
                    value: '',
                    sync: 0,
                    render: 1,
                    parse: function () {
                        return this.get('footer').html();
                    }
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
                closable: { value: true },
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
                escapeToClose: { value: true }
            },
            xclass: 'dialog'
        });
    var KEY_TAB = $.Event.KeyCode.TAB;    // 不完美的方案，窗体末尾空白 tab 占位符，多了 tab 操作一次
    // 不完美的方案，窗体末尾空白 tab 占位符，多了 tab 操作一次
    function trapFocus(e) {
        var self = this, keyCode = e.keyCode;
        if (keyCode !== KEY_TAB) {
            return;
        }
        var $el = self.$el;    // summary:
                               // Handles the keyboard events for accessibility reasons
        // summary:
        // Handles the keyboard events for accessibility reasons
        var node = $(e.target);    // get the target node of the keypress event
                                   // find the first and last tab focusable items in the hierarchy of the dialog container node
                                   // do this every time if the items may be added / removed from the the dialog may change visibility or state
        // get the target node of the keypress event
        // find the first and last tab focusable items in the hierarchy of the dialog container node
        // do this every time if the items may be added / removed from the the dialog may change visibility or state
        var lastFocusItem = $el.last();    // assumes el and lastFocusItem maintained by dialog object
                                           // see if we are shift-tabbing from first focusable item on dialog
        // assumes el and lastFocusItem maintained by dialog object
        // see if we are shift-tabbing from first focusable item on dialog
        if (node.equals($el) && e.shiftKey) {
            lastFocusItem[0].focus();    // send focus to last item in dialog
            // send focus to last item in dialog
            e.halt();    //stop the tab keypress event
        } else //stop the tab keypress event
        if (node.equals(lastFocusItem) && !e.shiftKey) {
            // see if we are tabbing from the last focusable item
            self.focus();    // send focus to first item in dialog
            // send focus to first item in dialog
            e.halt();    //stop the tab keypress event
        } else
            //stop the tab keypress event
            {
                // see if the key is for the dialog
                if (node.equals($el) || $el.contains(node)) {
                    return;
                }
            }    // this key is for the document window
                 // allow tabbing into the dialog
        // this key is for the document window
        // allow tabbing into the dialog
        e.halt();    //stop the event if not a tab keypress
    }    // end of function
    //stop the event if not a tab keypress
    // end of function
    module.exports = Dialog;    /**
 * @ignore
 *
 * 2012-09-06 yiminghe@gmail.com
 *  merge aria with dialog
 *  http://www.w3.org/TR/wai-aria-practices/#trap_focus
 *
 * 2010-11-10 yiminghe@gmail.com
 *  重构，使用扩展类
 */
});
KISSY.add('overlay/dialog-xtpl', ['./overlay-xtpl'], function (S, require, exports, module) {
    /* Compiled By XTemplate */
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
    module.exports = function dialogXtpl(scope, buffer, undefined) {
        var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
        var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], rangeCommand = nativeCommands['range'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
        buffer.write('', 0);
        var option0 = {};
        var params1 = [];
        params1.push('./overlay-xtpl');
        option0.params = params1;
        require('./overlay-xtpl');
        var callRet2;
        callRet2 = extendCommand.call(tpl, scope, option0, buffer, 1);
        if (callRet2 && callRet2.isBuffer) {
            buffer = callRet2;
            callRet2 = undefined;
        }
        buffer.write(callRet2, false);
        buffer.write('\r\n', 0);
        var option3 = { escape: 1 };
        var params4 = [];
        params4.push('ks-overlay-content');
        option3.params = params4;
        option3.fn = function (scope, buffer) {
            buffer.write('\r\n    <div class="', 0);
            var option5 = { escape: 1 };
            var params6 = [];
            params6.push('header');
            option5.params = params6;
            var callRet7;
            callRet7 = callFnUtil(tpl, scope, option5, buffer, ['getBaseCssClasses'], 0, 3);
            if (callRet7 && callRet7.isBuffer) {
                buffer = callRet7;
                callRet7 = undefined;
            }
            buffer.write(callRet7, true);
            buffer.write('"\r\n         style="\r\n', 0);
            var option8 = { escape: 1 };
            var params9 = [];
            var id10 = scope.resolve(['headerStyle'], 0);
            params9.push(id10);
            option8.params = params9;
            option8.fn = function (scope, buffer) {
                buffer.write('\r\n ', 0);
                var id11 = scope.resolve(['xindex'], 0);
                buffer.write(id11, true);
                buffer.write(':', 0);
                var id12 = scope.resolve(['this'], 0);
                buffer.write(id12, true);
                buffer.write(';\r\n', 0);
                return buffer;
            };
            buffer = eachCommand.call(tpl, scope, option8, buffer, 5);
            buffer.write('\r\n">', 0);
            var id13 = scope.resolve(['headerContent'], 0);
            buffer.write(id13, false);
            buffer.write('</div>\r\n\r\n    <div class="', 0);
            var option14 = { escape: 1 };
            var params15 = [];
            params15.push('body');
            option14.params = params15;
            var callRet16;
            callRet16 = callFnUtil(tpl, scope, option14, buffer, ['getBaseCssClasses'], 0, 10);
            if (callRet16 && callRet16.isBuffer) {
                buffer = callRet16;
                callRet16 = undefined;
            }
            buffer.write(callRet16, true);
            buffer.write('"\r\n         style="\r\n', 0);
            var option17 = { escape: 1 };
            var params18 = [];
            var id19 = scope.resolve(['bodyStyle'], 0);
            params18.push(id19);
            option17.params = params18;
            option17.fn = function (scope, buffer) {
                buffer.write('\r\n ', 0);
                var id20 = scope.resolve(['xindex'], 0);
                buffer.write(id20, true);
                buffer.write(':', 0);
                var id21 = scope.resolve(['this'], 0);
                buffer.write(id21, true);
                buffer.write(';\r\n', 0);
                return buffer;
            };
            buffer = eachCommand.call(tpl, scope, option17, buffer, 12);
            buffer.write('\r\n">', 0);
            var id22 = scope.resolve(['bodyContent'], 0);
            buffer.write(id22, false);
            buffer.write('</div>\r\n\r\n    <div class="', 0);
            var option23 = { escape: 1 };
            var params24 = [];
            params24.push('footer');
            option23.params = params24;
            var callRet25;
            callRet25 = callFnUtil(tpl, scope, option23, buffer, ['getBaseCssClasses'], 0, 17);
            if (callRet25 && callRet25.isBuffer) {
                buffer = callRet25;
                callRet25 = undefined;
            }
            buffer.write(callRet25, true);
            buffer.write('"\r\n         style="\r\n', 0);
            var option26 = { escape: 1 };
            var params27 = [];
            var id28 = scope.resolve(['footerStyle'], 0);
            params27.push(id28);
            option26.params = params27;
            option26.fn = function (scope, buffer) {
                buffer.write('\r\n ', 0);
                var id29 = scope.resolve(['xindex'], 0);
                buffer.write(id29, true);
                buffer.write(':', 0);
                var id30 = scope.resolve(['this'], 0);
                buffer.write(id30, true);
                buffer.write(';\r\n', 0);
                return buffer;
            };
            buffer = eachCommand.call(tpl, scope, option26, buffer, 19);
            buffer.write('\r\n">', 0);
            var id31 = scope.resolve(['footerContent'], 0);
            buffer.write(id31, false);
            buffer.write('</div>\r\n    <div tabindex="0"></div>\r\n', 0);
            return buffer;
        };
        buffer = blockCommand.call(tpl, scope, option3, buffer, 2);
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});
KISSY.add('overlay/popup', [
    './control',
    'util',
    'node'
], function (S, require, exports, module) {
    /**
 * @ignore
 * KISSY.Popup
 * @author qiaohua@taobao.com, yiminghe@gmail.com
 */
    var Overlay = require('./control');
    var util = require('util');
    var $ = require('node');
    function bindTriggerMouse() {
        var self = this, trigger = self.get('trigger'), timer;
        self.__mouseEnterPopup = function (ev) {
            clearHiddenTimer.call(self);
            timer = util.later(function () {
                showing.call(self, ev);
                timer = undefined;
            }, self.get('mouseDelay') * 1000);
        };
        trigger.on('mouseenter', self.__mouseEnterPopup);
        self._mouseLeavePopup = function () {
            if (timer) {
                timer.cancel();
                timer = undefined;
            }
            setHiddenTimer.call(self);
        };
        trigger.on('mouseleave', self._mouseLeavePopup);
    }
    function setHiddenTimer() {
        var self = this;
        var delay = self.get('mouseDelay') * 1000;
        self._hiddenTimer = util.later(function () {
            hiding.call(self);
        }, delay);
    }
    function clearHiddenTimer() {
        var self = this;
        if (self._hiddenTimer) {
            self._hiddenTimer.cancel();
            self._hiddenTimer = undefined;
        }
    }
    function bindTriggerClick() {
        var self = this;
        self.__clickPopup = function (ev) {
            ev.preventDefault();
            if (self.get('toggle')) {
                (self.get('visible') ? hiding : showing).call(self, ev);
            } else {
                showing.call(self, ev);
            }
        };
        self.get('trigger').on('click', self.__clickPopup);
    }
    function showing(ev) {
        var self = this;
        self.set('currentTrigger', $(ev.target));
        self.show();
    }
    function hiding() {
        this.set('currentTrigger', undefined);
        this.hide();
    }    /**
 * @class KISSY.Overlay.Popup
 * KISSY Popup Component.
 * xclass: 'popup'.
 * @extends KISSY.Overlay
 */
    /**
 * @class KISSY.Overlay.Popup
 * KISSY Popup Component.
 * xclass: 'popup'.
 * @extends KISSY.Overlay
 */
    module.exports = Overlay.extend({
        initializer: function () {
            var self = this,
                // 获取相关联的 Dom 节点
                trigger = self.get('trigger');
            if (trigger) {
                if (self.get('triggerType') === 'mouse') {
                    bindTriggerMouse.call(self);
                } else {
                    bindTriggerClick.call(self);
                }
            }
        },
        bindUI: function () {
            var self = this, trigger = self.get('trigger');
            if (trigger) {
                if (self.get('triggerType') === 'mouse') {
                    self.$el.on('mouseleave', setHiddenTimer, self).on('mouseenter', clearHiddenTimer, self);
                }
            }
        },
        destructor: function () {
            var self = this, $el = self.$el, t = self.get('trigger');
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
            if ($el) {
                $el.detach('mouseleave', setHiddenTimer, self).detach('mouseenter', clearHiddenTimer, self);
            }
        }
    }, {
        ATTRS: {
            /**
         * Trigger elements to show popup.
         * @cfg {KISSY.Node} trigger
         */
            /**
         * @ignore
         */
            trigger: {
                setter: function (v) {
                    return $(v);
                }
            },
            /**
         * How to activate trigger element, 'click' or 'mouse'.
         *
         * Defaults to: 'click'.
         *
         * @cfg {String} triggerType
         */
            /**
         * @ignore
         */
            triggerType: { value: 'click' },
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
    });    /**
 * @ignore
 * 2011-05-17
 *  - yiminghe@gmail.com：利用 initializer , destructor ,ATTRS
 **/
});
