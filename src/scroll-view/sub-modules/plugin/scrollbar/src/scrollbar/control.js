/**
 * @ignore
 * scrollbar for KISSY scroll-view
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var UA = require('ua');
    var Control = require('component/control');
    var ScrollBarRender = require('./render');
    var BaseGesture= require('event/gesture/base');
    var DragType = require('event/gesture/drag');

    var MIN_BAR_LENGTH = 20;

    var SCROLLBAR_EVENT_NS = '.ks-scrollbar';

    function preventDefault(e) {
        e.preventDefault();
    }

    function onDragStartHandler(e) {
        e.stopPropagation();
        var self = this;
        self.startScroll = self.scrollView.get(self.scrollProperty);
    }

    function onDragHandler(e) {
        var self = this,
            diff = self.pageXyProperty === 'pageX' ? e.deltaX : e.deltaY,
            scrollView = self.scrollView,
            scrollType = self.scrollType,
            scrollCfg = {};
        scrollCfg[scrollType] = self.startScroll + diff / self.trackElSize * self.scrollLength;
        scrollView.scrollToWithBounds(scrollCfg);
    }

    function onScrollViewReflow() {
        var self = this,
            scrollView = self.scrollView,
            trackEl = self.trackEl,
            scrollWHProperty = self.scrollWHProperty,
            whProperty = self.whProperty,
            clientWHProperty = self.clientWHProperty,
            dragWHProperty = self.dragWHProperty,
            ratio,
            trackElSize,
            barSize;

        if (scrollView.allowScroll[self.scrollType]) {
            self.scrollLength = scrollView[scrollWHProperty];
            trackElSize = self.trackElSize =
                whProperty === 'width' ? trackEl.offsetWidth : trackEl.offsetHeight;
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
        var self = this,
            scrollView = self.scrollView,
            scrollProperty = self.scrollProperty,
            scrollType = self.scrollType,
            step = scrollView.getScrollStep()[self.scrollType],
            target = e.target,
            direction = (target === self.downBtn || self.$downBtn.contains(target)) ? 1 : -1;
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
        var scrollType = self.scrollType,
            pageXy = self.pageXyProperty,
            trackEl = self.$trackEl,
            scrollView = self.scrollView,
        // align mouse with bar center
            per = Math.max(0, (e[pageXy] -
                trackEl.offset()[scrollType] -
                self.barSize / 2) / self.trackElSize),
            scrollCfg = {};
        scrollCfg[scrollType] = per * self.scrollLength;
        scrollView.scrollToWithBounds(scrollCfg);
        // prevent drag
        e.halt();
    }

    function onUpDownBtnMouseUp() {
        clearInterval(this.mouseInterval);
    }

    function syncOnScroll(control) {
        var scrollType = control.scrollType,
            scrollView = control.scrollView,
            dragLTProperty = control.dragLTProperty,
            dragWHProperty = control.dragWHProperty,
            trackElSize = control.trackElSize,
            barSize = control.barSize,
            contentSize = control.scrollLength,
            val = scrollView.get(control.scrollProperty),
            maxScrollOffset = scrollView.maxScroll,
            minScrollOffset = scrollView.minScroll,
            minScroll = minScrollOffset[scrollType],
            maxScroll = maxScrollOffset[scrollType],
            dragVal;
        if (val > maxScroll) {
            dragVal = maxScroll / contentSize * trackElSize;
            control.set(dragWHProperty, barSize - (val - maxScroll));
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

    /**
     * @class KISSY.ScrollView.ScrollBar
     * @extend KISSY.Component.Control
     * @private
     */
    return Control.extend({
        initializer: function () {
            var self = this;
            var scrollType = self.scrollType = self.get('axis') === 'x' ? 'left' : 'top';
            var ucScrollType = S.ucfirst(scrollType);
            self.pageXyProperty = scrollType === 'left' ? 'pageX' : 'pageY';
            var wh = self.whProperty = scrollType === 'left' ? 'width' : 'height';
            var ucWH = S.ucfirst(wh);
            self.afterScrollChangeEvent = 'afterScroll' + ucScrollType + 'Change';
            self.scrollProperty = 'scroll' + ucScrollType;

            self.dragWHProperty = 'drag' + ucWH;
            self.dragLTProperty = 'drag' + ucScrollType;

            self.clientWHProperty = 'client' + ucWH;
            self.scrollWHProperty = 'scroll' + ucWH;

            self.scrollView = self.get('scrollView');
        },

        _onSetDisabled: function (v) {
            var self = this;
            var action = v ? 'detach' : 'on';
            if (!self.get('autoHide')) {
                self.$dragEl[action]('dragstart mousedown', preventDefault)
                    [action](DragType.DRAG_START, onDragStartHandler, self)
                    [action](DragType.DRAG, onDragHandler, self);
                S.each([self.$downBtn, self.$upBtn], function (b) {
                    b[action](BaseGesture.START, onUpDownBtnMouseDown, self)
                        [action](BaseGesture.END, onUpDownBtnMouseUp, self);
                });
                self.$trackEl[action](BaseGesture.START, onTrackElMouseDown, self);
            }
        },

        bindUI: function () {
            var self = this,
                autoHide = self.get('autoHide'),
                scrollView = self.scrollView;
            if (autoHide) {
                self.hideFn = S.bind(self.hide, self);
            }
            scrollView
                .on(self.afterScrollChangeEvent + SCROLLBAR_EVENT_NS, afterScrollChange, self)
                .on('scrollTouchEnd' + SCROLLBAR_EVENT_NS, onScrollEnd, self)
                .on('afterDisabledChange' + SCROLLBAR_EVENT_NS, onScrollViewDisabled, self)
                .on('reflow' + SCROLLBAR_EVENT_NS, onScrollViewReflow, self);
        },

        syncUI: function () {
            onScrollViewReflow.call(this);
        },

        destructor: function () {
            this.scrollView.detach(SCROLLBAR_EVENT_NS);
            clearHideTimer(this);
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
            minLength: {
                value: MIN_BAR_LENGTH
            },

            scrollView: {
            },

            axis: {
                view: 1
            },

            /**
             * whether auto hide scrollbar after scroll end.
             * Defaults: true for ios device, false for non-touch device.
             * @cfg {Boolean} autoHide
             */
            /**
             * @ignore
             */
            autoHide: {
                value: UA.ios
            },

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
            hideDelay: {
                value: 0.1
            },

            dragWidth: {
                setter: function (v) {
                    var minLength = this.get('minLength');

                    if (v < minLength) {
                        return minLength;
                    }
                    return v;
                },
                view: 1
            },

            dragHeight: {
                setter: function (v) {
                    var minLength = this.get('minLength');
                    if (v < minLength) {
                        return minLength;
                    }
                    return v;
                },
                view: 1
            },

            dragLeft: {
                view: 1,
                value: 0
            },

            dragTop: {
                view: 1,
                value: 0
            },

            dragEl: {
            },

            downBtn: {
            },

            upBtn: {
            },

            trackEl: {
            },

            focusable: {
                value: false
            },

            xrender: {
                value: ScrollBarRender
            }
        },
        xclass: 'scrollbar'
    });
});