/**
 * scrollbar for KISSY scroll-view
 * @author yiminghe@gmail.com
 */
KISSY.add('scroll-view/plugin/scrollbar/control', function (S, Node, DD, Control, ScrollBarRender) {

    var MIN_BAR_LENGTH = 20;

    var SCROLLBAR_EVENT_NS = '.ks-scrollbar';

    var Gesture = Node.Gesture;

    return Control.extend({
        initializer: function () {
            var self = this;
            var scrollType = self.scrollType = self.get('axis') == 'x' ? 'left' : 'top';
            var ucScrollType = S.ucfirst(scrollType);
            self.pageXyProperty = scrollType == 'left' ? 'pageX' : 'pageY';
            var wh = self.whProperty = scrollType == 'left' ? 'width' : 'height';
            var ucWH = S.ucfirst(wh);
            self.afterScrollChangeEvent = 'afterScroll' + ucScrollType + 'Change';
            self.scrollProperty = 'scroll' + ucScrollType;

            self.dragWHProperty = 'drag' + ucWH;
            self.dragLTProperty = 'drag' + ucScrollType;

            self.clientWHProperty = 'client' + ucWH;
            self.scrollWHProperty = 'scroll' + ucWH;
        },

        bindUI: function () {
            var self = this,
                autoHide = self.get('autoHide'),
                scrollView = self.get('scrollView');
            if (autoHide) {
                self.hideFn = S.bind(self.hide, self);
            } else {
                S.each([self.$downBtn, self.$upBtn], function (b) {
                    b.on(Gesture.start, self.onUpDownBtnMouseDown, self)
                        .on(Gesture.end, self.onUpDownBtnMouseUp, self);
                });
                self.$trackEl.on(Gesture.start, self.onTrackElMouseDown, self);
                self.dd = new DD.Draggable({
                    node: self.$dragEl,
                    groups: false,
                    // allow nested scroll-view
                    halt: true
                }).on('drag', self.onDrag, self)
                    .on('dragstart', self.onDragStart, self);
            }
            scrollView
                .on(self.afterScrollChangeEvent + SCROLLBAR_EVENT_NS,
                    self.afterScrollChange, self)
                .on('scrollEnd' + SCROLLBAR_EVENT_NS, self.onScrollEnd, self)
                .on('afterDisabledChange', self.onScrollViewDisabled, self);
        },


        destructor: function () {
            this.get('scrollView').detach(SCROLLBAR_EVENT_NS);
            this.clearHideTimer();
        },

        onScrollViewDisabled: function (e) {
            this.set('disabled', e.newVal);
        },

        onDragStart: function () {
            var self = this,
                scrollView = self.scrollView;
            self.startMousePos = self.dd.get('startMousePos')[self.scrollType];
            self.startScroll = scrollView.get(self.scrollProperty);
        },

        onDrag: function (e) {
            var self = this,
                diff = e[self.pageXyProperty] - self.startMousePos,
                scrollView = self.scrollView,
                scrollType = self.scrollType,
                scrollCfg = {};
            scrollCfg[scrollType] = self.startScroll + diff / self.trackElSize * self.scrollLength;
            scrollView.scrollToWithBounds(scrollCfg);
        },

        startHideTimer: function () {
            var self = this;
            self.clearHideTimer();
            self.hideTimer = setTimeout(self.hideFn, self.get('hideDelay') * 1000);
        },

        clearHideTimer: function () {
            var self = this;
            if (self.hideTimer) {
                clearTimeout(self.hideTimer);
                self.hideTimer = null;
            }
        },

        onUpDownBtnMouseDown: function (e) {
            if (this.get('disabled')) {
                return;
            }
            e.halt();
            var self = this,
                scrollView = self.scrollView,
                scrollProperty = self.scrollProperty,
                scrollType = self.scrollType,
                step = scrollView.getScrollStep()[self.scrollType],
                target = e.target,
                direction = (target == self.downBtn || self.$downBtn.contains(target)) ? 1 : -1;
            clearInterval(self.mouseInterval);
            function doScroll() {
                var scrollCfg = {};
                scrollCfg[scrollType] = scrollView.get(scrollProperty) + direction * step;
                scrollView.scrollToWithBounds(scrollCfg);
            }

            self.mouseInterval = setInterval(doScroll, 100);
            doScroll();
        },

        onTrackElMouseDown: function (e) {
            var self = this;
            if (self.get('disabled')) {
                return;
            }
            var target = e.target;
            var dragEl = self.dragEl;
            var $dragEl = self.$dragEl;
            if (dragEl == target || $dragEl.contains(target)) {
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
        },

        onUpDownBtnMouseUp: function () {
            clearInterval(this.mouseInterval);
        },

        onScrollEnd: function () {
            var self = this;
            if (self.hideFn) {
                self.startHideTimer();
            }
        },

        // percentage matters!
        afterScrollChange: function () {
            // only show when scroll
            var self = this;
            var scrollView = self.scrollView;
            if (!scrollView.allowScroll[self.scrollType]) {
                return;
            }
            self.clearHideTimer();
            self.set('visible', true);
            if (self.hideFn && !scrollView.dd.get('dragging')) {
                self.startHideTimer();
            }
            self.view.syncOnScrollChange();
        },

        _onSetDisabled: function (v) {
            if (this.dd) {
                this.dd.set('disabled', v);
            }
        }
    }, {
        ATTRS: {
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
             * Defaults: true for touch device, false for non-touch device.
             * @cfg {Boolean} autoHide
             */
            /**
             * @ignore
             */
            autoHide: {
                value: S.UA.ios
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
                view: 1
            },

            dragTop: {
                view: 1
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

}, {
    requires: ['node', 'dd', 'component/control', './render']
});