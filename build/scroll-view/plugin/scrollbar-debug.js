/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:04
*/
/*
combined modules:
scroll-view/plugin/scrollbar
scroll-view/plugin/scrollbar/control
scroll-view/plugin/scrollbar/scrollbar-xtpl
*/
KISSY.add('scroll-view/plugin/scrollbar', [
    'base',
    './scrollbar/control'
], function (S, require, exports, module) {
    /**
 * @ignore
 * scrollbar plugin for KISSY scroll-view
 * @author yiminghe@gmail.com
 */
    var Base = require('base');
    var ScrollBar = require('./scrollbar/control');
    function onScrollViewReflow() {
        var self = this;
        var scrollView = self.scrollView;
        var minLength = self.get('minLength');
        var autoHideX = self.get('autoHideX');
        var autoHideY = self.get('autoHideY');
        var cfg;
        if (!self.scrollBarX && scrollView.allowScroll.left) {
            cfg = {
                axis: 'x',
                scrollView: scrollView,
                // render: scrollView.get('el') => ie7 bug
                elBefore: scrollView.$contentEl
            };
            if (minLength !== undefined) {
                cfg.minLength = minLength;
            }
            if (autoHideX !== undefined) {
                cfg.autoHide = autoHideX;
            }
            self.scrollBarX = new ScrollBar(cfg).render();
        }
        if (!self.scrollBarY && scrollView.allowScroll.top) {
            cfg = {
                axis: 'y',
                scrollView: scrollView,
                // render: scrollView.get('el') => ie7 bug
                elBefore: scrollView.$contentEl
            };
            if (minLength !== undefined) {
                cfg.minLength = minLength;
            }
            if (autoHideY !== undefined) {
                cfg.autoHide = autoHideY;
            }
            self.scrollBarY = new ScrollBar(cfg).render();
        }
    }    /**
 * ScrollBar plugin for ScrollView.
 * @class KISSY.ScrollView.Plugin.ScrollBar
 * @extend KISSY.Base
 */
    /**
 * ScrollBar plugin for ScrollView.
 * @class KISSY.ScrollView.Plugin.ScrollBar
 * @extend KISSY.Base
 */
    module.exports = Base.extend({
        pluginId: this.name,
        pluginBindUI: function (scrollView) {
            var self = this;
            self.scrollView = scrollView;
            scrollView.on('reflow', onScrollViewReflow, self);
        },
        pluginDestructor: function (scrollView) {
            var self = this;
            if (self.scrollBarX) {
                self.scrollBarX.destroy();
                self.scrollBarX = null;
            }
            if (self.scrollBarY) {
                self.scrollBarY.destroy();
                self.scrollBarY = null;
            }
            scrollView.detach('reflow', onScrollViewReflow, self);
        }
    }, {
        ATTRS: {
            /**
         * minimum scrollbar length.
         * Defaults to 20.
         * @cfg {Number} minLength
         */
            /**
         * @ignore
         */
            minLength: {},
            /**
         * whether auto hide x scrollbar like ios
         * @cfg {Boolean} autoHideX
         */
            /**
         * @ignore
         */
            autoHideX: {},
            /**
         * whether auto hide y scrollbar like ios
         * @cfg {Boolean} autoHideY
         */
            /**
         * @ignore
         */
            autoHideY: {}
        }
    });
});

KISSY.add('scroll-view/plugin/scrollbar/control', [
    'ua',
    'util',
    'component/control',
    'event/gesture/basic',
    'event/gesture/pan',
    './scrollbar-xtpl',
    'feature'
], function (S, require, exports, module) {
    /**
 * @ignore
 * scrollbar for KISSY scroll-view
 * @author yiminghe@gmail.com
 */
    var UA = require('ua');
    var util = require('util');
    var Control = require('component/control');
    var BasicGesture = require('event/gesture/basic');
    var PanGesture = require('event/gesture/pan');
    var ScrollBarTpl = require('./scrollbar-xtpl');
    var MIN_BAR_LENGTH = 20;
    var SCROLLBAR_EVENT_NS = '.ks-scrollbar';
    function preventDefault(e) {
        e.preventDefault();
    }
    function onDragStartHandler(e) {
        e.halt();
        var self = this;
        self.startScroll = self.scrollView.get(self.scrollProperty);
    }
    function onDragHandler(e) {
        var self = this, diff = self.pageXyProperty === 'pageX' ? e.deltaX : e.deltaY, scrollView = self.scrollView, scrollType = self.scrollType, scrollCfg = {};
        scrollCfg[scrollType] = self.startScroll + diff / self.trackElSize * self.scrollLength;
        scrollView.scrollToWithBounds(scrollCfg);
        e.halt();
    }
    function onScrollViewReflow() {
        var self = this, scrollView = self.scrollView, trackEl = self.trackEl, scrollWHProperty = self.scrollWHProperty, whProperty = self.whProperty, clientWHProperty = self.clientWHProperty, dragWHProperty = self.dragWHProperty, ratio, trackElSize, barSize;
        if (scrollView.allowScroll[self.scrollType]) {
            self.scrollLength = scrollView[scrollWHProperty];
            trackElSize = self.trackElSize = whProperty === 'width' ? trackEl.offsetWidth : trackEl.offsetHeight;
            ratio = scrollView[clientWHProperty] / self.scrollLength;
            barSize = ratio * trackElSize;
            self.set(dragWHProperty, barSize);
            self.barSize = barSize;
            syncOnScroll(self);
            self.set('visible', true);
        } else {
            self.set('visible', false);
        }
    }
    function onScrollViewDisabled(e) {
        this.set('disabled', e.newVal);
    }
    function onScrollEnd() {
        var self = this;
        if (self.hideFn) {
            startHideTimer(self);
        }
    }
    function afterScrollChange() {
        // only show when scroll
        var self = this;
        var scrollView = self.scrollView;
        if (!scrollView.allowScroll[self.scrollType]) {
            return;
        }
        clearHideTimer(self);
        self.set('visible', true);
        if (self.hideFn && !scrollView.isScrolling) {
            startHideTimer(self);
        }
        syncOnScroll(self);
    }
    function onUpDownBtnMouseDown(e) {
        e.halt();
        var self = this, scrollView = self.scrollView, scrollProperty = self.scrollProperty, scrollType = self.scrollType, step = scrollView.getScrollStep()[self.scrollType], target = e.target, direction = target === self.downBtn || self.$downBtn.contains(target) ? 1 : -1;
        clearInterval(self.mouseInterval);
        function doScroll() {
            var scrollCfg = {};
            scrollCfg[scrollType] = scrollView.get(scrollProperty) + direction * step;
            scrollView.scrollToWithBounds(scrollCfg);
        }
        self.mouseInterval = setInterval(doScroll, 100);
        doScroll();
    }
    function onTrackElMouseDown(e) {
        var self = this;
        var target = e.target;
        var dragEl = self.dragEl;
        var $dragEl = self.$dragEl;
        if (dragEl === target || $dragEl.contains(target)) {
            return;
        }
        var scrollType = self.scrollType, pageXy = self.pageXyProperty, trackEl = self.$trackEl, scrollView = self.scrollView,
            // align mouse with bar center
            per = Math.max(0, (e[pageXy] - trackEl.offset()[scrollType] - self.barSize / 2) / self.trackElSize), scrollCfg = {};
        scrollCfg[scrollType] = per * self.scrollLength;
        scrollView.scrollToWithBounds(scrollCfg);    // prevent drag
        // prevent drag
        e.halt();
    }
    function onUpDownBtnMouseUp() {
        clearInterval(this.mouseInterval);
    }
    function syncOnScroll(control) {
        var scrollType = control.scrollType, scrollView = control.scrollView, dragLTProperty = control.dragLTProperty, dragWHProperty = control.dragWHProperty, trackElSize = control.trackElSize, barSize = control.barSize, contentSize = control.scrollLength, val = scrollView.get(control.scrollProperty), maxScrollOffset = scrollView.maxScroll, minScrollOffset = scrollView.minScroll, minScroll = minScrollOffset[scrollType], maxScroll = maxScrollOffset[scrollType], dragVal;
        if (val > maxScroll) {
            dragVal = maxScroll / contentSize * trackElSize;
            control.set(dragWHProperty, barSize - (val - maxScroll));    // dragSizeAxis has minLength
            // dragSizeAxis has minLength
            control.set(dragLTProperty, dragVal + barSize - control.get(dragWHProperty));
        } else if (val < minScroll) {
            dragVal = minScroll / contentSize * trackElSize;
            control.set(dragWHProperty, barSize - (minScroll - val));
            control.set(dragLTProperty, dragVal);
        } else {
            dragVal = val / contentSize * trackElSize;
            control.set(dragLTProperty, dragVal);
            control.set(dragWHProperty, barSize);
        }
    }
    function startHideTimer(self) {
        clearHideTimer(self);
        self.hideTimer = setTimeout(self.hideFn, self.get('hideDelay') * 1000);
    }
    function clearHideTimer(self) {
        if (self.hideTimer) {
            clearTimeout(self.hideTimer);
            self.hideTimer = null;
        }
    }
    function halt(e) {
        e.halt();
    }
    function bindDrag(self, disabled) {
        var action = disabled ? 'detach' : 'on';
        if (!self.get('autoHide')) {
            self.$dragEl[action]([
                'dragstart',
                'mousedown'
            ], preventDefault)[action](PanGesture.PAN_END, halt, self)[action](PanGesture.PAN_START, onDragStartHandler, self)[action](PanGesture.PAN, onDragHandler, self);
            util.each([
                self.$downBtn,
                self.$upBtn
            ], function (b) {
                b[action](BasicGesture.START, onUpDownBtnMouseDown, self)[action](BasicGesture.END, onUpDownBtnMouseUp, self);
            });
            self.$trackEl[action](BasicGesture.START, onTrackElMouseDown, self);
        }
    }
    var Feature = require('feature');
    var isTransform3dSupported = Feature.isTransform3dSupported();
    var transformVendorInfo = Feature.getCssVendorInfo('transform');    // http://www.html5rocks.com/en/tutorials/speed/html5/
    // http://www.html5rocks.com/en/tutorials/speed/html5/
    var supportCss3 = !!transformVendorInfo;
    var methods = {
            initializer: function () {
                var self = this;
                var scrollType = self.scrollType = self.get('axis') === 'x' ? 'left' : 'top';
                var ucScrollType = util.ucfirst(scrollType);
                self.pageXyProperty = scrollType === 'left' ? 'pageX' : 'pageY';
                var wh = self.whProperty = scrollType === 'left' ? 'width' : 'height';
                var ucWH = util.ucfirst(wh);
                self.afterScrollChangeEvent = 'afterScroll' + ucScrollType + 'Change';
                self.scrollProperty = 'scroll' + ucScrollType;
                self.dragWHProperty = 'drag' + ucWH;
                self.dragLTProperty = 'drag' + ucScrollType;
                self.clientWHProperty = 'client' + ucWH;
                self.scrollWHProperty = 'scroll' + ucWH;
                self.scrollView = self.get('scrollView');
            },
            beforeCreateDom: function (renderData) {
                renderData.elCls.push(renderData.prefixCls + 'scrollbar-' + renderData.axis);
            },
            createDom: function () {
                var self = this;
                self.$dragEl = self.get('dragEl');
                self.$trackEl = self.get('trackEl');
                self.$downBtn = self.get('downBtn');
                self.$upBtn = self.get('upBtn');
                self.dragEl = self.$dragEl[0];
                self.trackEl = self.$trackEl[0];
                self.downBtn = self.$downBtn[0];
                self.upBtn = self.$upBtn[0];
            },
            bindUI: function () {
                var self = this, autoHide = self.get('autoHide'), scrollView = self.scrollView;
                if (autoHide) {
                    self.hideFn = util.bind(self.hide, self);
                }
                scrollView.on(self.afterScrollChangeEvent + SCROLLBAR_EVENT_NS, afterScrollChange, self).on('scrollTouchEnd' + SCROLLBAR_EVENT_NS, onScrollEnd, self).on('afterDisabledChange' + SCROLLBAR_EVENT_NS, onScrollViewDisabled, self).on('reflow' + SCROLLBAR_EVENT_NS, onScrollViewReflow, self);
                bindDrag(self, self.get('disabled'));
            },
            syncUI: function () {
                onScrollViewReflow.call(this);
            },
            _onSetDragHeight: function (v) {
                this.dragEl.style.height = v + 'px';
            },
            _onSetDragWidth: function (v) {
                this.dragEl.style.width = v + 'px';
            },
            _onSetDragLeft: function (v) {
                this.dragEl.style.left = v + 'px';
            },
            _onSetDragTop: function (v) {
                this.dragEl.style.top = v + 'px';
            },
            _onSetDisabled: function (v) {
                this.callSuper(v);
                bindDrag(this, v);
            },
            destructor: function () {
                this.scrollView.detach(SCROLLBAR_EVENT_NS);
                clearHideTimer(this);
            }
        };
    if (supportCss3) {
        var transformProperty = transformVendorInfo.propertyName;
        methods._onSetDragLeft = function (v) {
            this.dragEl.style[transformProperty] = 'translateX(' + v + 'px)' + ' translateY(' + this.get('dragTop') + 'px)' + (isTransform3dSupported ? ' translateZ(0)' : '');
        };
        methods._onSetDragTop = function (v) {
            this.dragEl.style[transformProperty] = 'translateX(' + this.get('dragLeft') + 'px)' + ' translateY(' + v + 'px)' + (isTransform3dSupported ? ' translateZ(0)' : '');
        };
    }    /**
 * @class KISSY.ScrollView.ScrollBar
 * @extend KISSY.Component.Control
 * @private
 */
    /**
 * @class KISSY.ScrollView.ScrollBar
 * @extend KISSY.Component.Control
 * @private
 */
    module.exports = Control.extend(methods, {
        ATTRS: {
            handleGestureEvents: { value: false },
            focusable: { value: false },
            allowTextSelection: { value: false },
            /**
         * minimum scrollbar length.
         * Defaults to 20.
         * @cfg {Number} minLength
         */
            /**
         * @ignore
         */
            minLength: { value: MIN_BAR_LENGTH },
            scrollView: {},
            axis: { render: 1 },
            /**
         * whether auto hide scrollbar after scroll end.
         * Defaults: true for ios device, false for non-touch device.
         * @cfg {Boolean} autoHide
         */
            /**
         * @ignore
         */
            autoHide: { value: UA.ios },
            visible: {
                valueFn: function () {
                    return !this.get('autoHide');
                }
            },
            /**
         * second of hide delay for scrollbar if allow autoHide
         * @cfg {Number} hideDelay
         */
            /**
         * @ignore
         */
            hideDelay: { value: 0.1 },
            dragWidth: {
                setter: function (v) {
                    var minLength = this.get('minLength');
                    if (v < minLength) {
                        return minLength;
                    }
                    return v;
                },
                render: 1
            },
            dragHeight: {
                setter: function (v) {
                    var minLength = this.get('minLength');
                    if (v < minLength) {
                        return minLength;
                    }
                    return v;
                },
                render: 1
            },
            dragLeft: {
                render: 1,
                value: 0
            },
            dragTop: {
                render: 1,
                value: 0
            },
            dragEl: {
                selector: function () {
                    return '.' + this.getBaseCssClass('drag');
                }
            },
            downBtn: {
                selector: function () {
                    return '.' + this.getBaseCssClass('arrow-down');
                }
            },
            upBtn: {
                selector: function () {
                    return '.' + this.getBaseCssClass('arrow-up');
                }
            },
            trackEl: {
                selector: function () {
                    return '.' + this.getBaseCssClass('track');
                }
            },
            contentTpl: { value: ScrollBarTpl }
        },
        xclass: 'scrollbar'
    });
});





KISSY.add('scroll-view/plugin/scrollbar/scrollbar-xtpl', [], function (S, require, exports, module) {
    /* Compiled By XTemplate */
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
    module.exports = function scrollbarXtpl(scope, buffer, undefined) {
        var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
        var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], rangeCommand = nativeCommands['range'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
        buffer.write('<div class="', 0);
        var option0 = { escape: 1 };
        var params1 = [];
        var id2 = scope.resolve(['axis'], 0);
        var exp3 = id2;
        exp3 = id2 + '-arrow-up arrow-up';
        params1.push(exp3);
        option0.params = params1;
        var callRet4;
        callRet4 = callFnUtil(tpl, scope, option0, buffer, ['getBaseCssClasses'], 0, 1);
        if (callRet4 && callRet4.isBuffer) {
            buffer = callRet4;
            callRet4 = undefined;
        }
        buffer.write(callRet4, true);
        buffer.write('">\r\n    <a href="javascript:void(\'up\')">up</a>\r\n</div>\r\n<div class="', 0);
        var option5 = { escape: 1 };
        var params6 = [];
        var id7 = scope.resolve(['axis'], 0);
        var exp8 = id7;
        exp8 = id7 + '-arrow-down arrow-down';
        params6.push(exp8);
        option5.params = params6;
        var callRet9;
        callRet9 = callFnUtil(tpl, scope, option5, buffer, ['getBaseCssClasses'], 0, 4);
        if (callRet9 && callRet9.isBuffer) {
            buffer = callRet9;
            callRet9 = undefined;
        }
        buffer.write(callRet9, true);
        buffer.write('">\r\n    <a href="javascript:void(\'down\')">down</a>\r\n</div>\r\n<div class="', 0);
        var option10 = { escape: 1 };
        var params11 = [];
        var id12 = scope.resolve(['axis'], 0);
        var exp13 = id12;
        exp13 = id12 + '-track track';
        params11.push(exp13);
        option10.params = params11;
        var callRet14;
        callRet14 = callFnUtil(tpl, scope, option10, buffer, ['getBaseCssClasses'], 0, 7);
        if (callRet14 && callRet14.isBuffer) {
            buffer = callRet14;
            callRet14 = undefined;
        }
        buffer.write(callRet14, true);
        buffer.write('">\r\n<div class="', 0);
        var option15 = { escape: 1 };
        var params16 = [];
        var id17 = scope.resolve(['axis'], 0);
        var exp18 = id17;
        exp18 = id17 + '-drag drag';
        params16.push(exp18);
        option15.params = params16;
        var callRet19;
        callRet19 = callFnUtil(tpl, scope, option15, buffer, ['getBaseCssClasses'], 0, 8);
        if (callRet19 && callRet19.isBuffer) {
            buffer = callRet19;
            callRet19 = undefined;
        }
        buffer.write(callRet19, true);
        buffer.write('">\r\n<div class="', 0);
        var option20 = { escape: 1 };
        var params21 = [];
        var id22 = scope.resolve(['axis'], 0);
        var exp23 = id22;
        exp23 = id22 + '-drag-top';
        params21.push(exp23);
        option20.params = params21;
        var callRet24;
        callRet24 = callFnUtil(tpl, scope, option20, buffer, ['getBaseCssClasses'], 0, 9);
        if (callRet24 && callRet24.isBuffer) {
            buffer = callRet24;
            callRet24 = undefined;
        }
        buffer.write(callRet24, true);
        buffer.write('">\r\n</div>\r\n<div class="', 0);
        var option25 = { escape: 1 };
        var params26 = [];
        var id27 = scope.resolve(['axis'], 0);
        var exp28 = id27;
        exp28 = id27 + '-drag-center';
        params26.push(exp28);
        option25.params = params26;
        var callRet29;
        callRet29 = callFnUtil(tpl, scope, option25, buffer, ['getBaseCssClasses'], 0, 11);
        if (callRet29 && callRet29.isBuffer) {
            buffer = callRet29;
            callRet29 = undefined;
        }
        buffer.write(callRet29, true);
        buffer.write('">\r\n</div>\r\n<div class="', 0);
        var option30 = { escape: 1 };
        var params31 = [];
        var id32 = scope.resolve(['axis'], 0);
        var exp33 = id32;
        exp33 = id32 + '-drag-bottom';
        params31.push(exp33);
        option30.params = params31;
        var callRet34;
        callRet34 = callFnUtil(tpl, scope, option30, buffer, ['getBaseCssClasses'], 0, 13);
        if (callRet34 && callRet34.isBuffer) {
            buffer = callRet34;
            callRet34 = undefined;
        }
        buffer.write(callRet34, true);
        buffer.write('">\r\n</div>\r\n</div>\r\n</div>', 0);
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});
