/**
 * scrollbar for KISSY scrollview
 * @author yiminghe@gmail.com
 */
KISSY.add('scrollview/plugin/scrollbar/control', function (S, Event, DD, Component, ScrollBarRender) {

    var MIN_BAR_LENGTH = 20;

    var SCROLLBAR_EVENT_NS = '.ks-scrollbar';

    return Component.Controller.extend({

        bindUI: function () {
            var self = this,
                dd,
                autoHide = self.get('autoHide'),
                scrollview = self.get('scrollview');
            self._xAxis = self.get('axis') == 'x';
            if (autoHide) {
                self._hideFn = function () {
                    self.hide();
                };
            } else {
                S.each([self.get('downBtn'), self.get('upBtn')], function (b) {
                    b.on('mousedown', self._onUpDownBtnMouseDown, self)
                        .on('mouseup', self._onUpDownBtnMouseUp, self);
                });
                self.get('trackEl').on(Event.Gesture.start, self._onTrackElMouseDown, self);
                dd = self.dd = new DD.Draggable({
                    node: self.get('dragEl'),
                    groups: false,
                    // allow nested scrollview
                    halt: true
                });
                dd.on('drag', self._onDrag, self)
                    .on('dragstart', self._onDragStart, self);
            }
        },

        syncUI: function () {
            var self = this,
                scrollview = self.get('scrollview'),
                trackEl = self.get('trackEl'),
                dragEl = self.get('dragEl'),
                ratio,
                trackElSize,
                newVal,
                rendered = self.get('rendered');
            self._unBindScrollView();
            self.scrollview = scrollview;
            if (self._xAxis) {
                if (rendered && !scrollview.isAxisEnabled('x')) {
                    self.hide();
                    return;
                }
                self._scrollLength = scrollview.scrollWidth;
                trackElSize = self._trackElSize = trackEl.width();
                ratio = scrollview.clientWidth / self._scrollLength;
                self.set('dragWidth', self.barSize = ratio * trackElSize);
                if (rendered) {
                    newVal = scrollview.get('scrollLeft');
                }
            } else {
                if (rendered && !scrollview.isAxisEnabled('y')) {
                    self.hide();
                    return;
                }
                self._scrollLength = scrollview.scrollHeight;
                trackElSize = self._trackElSize = trackEl.height();
                ratio = scrollview.clientHeight / self._scrollLength;
                self.set('dragHeight', self.barSize = ratio * trackElSize);
                // avoid recursive render in show
                if (rendered) {
                    newVal = scrollview.get('scrollTop');
                }
            }
            self._bindScrollView();
            if (newVal) {
                self.afterScrollChange({
                    newVal: newVal
                });
            }
        },

        destructor: function () {
            this._unBindScrollView();
            this._clearHideTimer();
        },

        _unBindScrollView: function () {
            this.get('scrollview').detach(SCROLLBAR_EVENT_NS);
        },

        _bindScrollView: function () {
            var self = this;
            self.get('scrollview')
                .on('afterScroll' + (self._xAxis ? 'Left' : 'Top') + 'Change' + SCROLLBAR_EVENT_NS, self.afterScrollChange, self)
                .on('scrollEnd' + SCROLLBAR_EVENT_NS, self._onScrollEnd, self)
                .on('afterDisabledChange', self._onScrollViewDisabled, self);
        },

        _onScrollViewDisabled: function (e) {
            this.set('disabled', e.newVal);
        },

        _onDragStart: function () {
            var self = this,
                scrollview = self.scrollview,
                xAxis = self._xAxis;
            self._startMousePos = self.dd.get('startMousePos')[xAxis ? 'left' : 'top'];
            self._startScroll = scrollview.get(xAxis ? 'scrollLeft' : 'scrollTop');
        },

        _onDrag: function (e) {
            var self = this,
                xAxis = self._xAxis,
                pageXY = xAxis ? 'pageX' : 'pageY',
                diff = e[pageXY] - self._startMousePos,
                scrollview = self.scrollview,
                scroll = self._startScroll + diff / self._trackElSize * self._scrollLength;
            if (xAxis) {
                scrollview.scrollTo(scroll);
            } else {
                scrollview.scrollTo(undefined, scroll);
            }
        },

        _startHideTimer: function () {
            this._clearHideTimer();
            this._hideTimer = setTimeout(this._hideFn, this.get('hideDelay') * 1000);
        },

        _clearHideTimer: function () {
            var self = this;
            if (self._hideTimer) {
                clearTimeout(self._hideTimer);
                self._hideTimer = null;
            }
        },

        _onUpDownBtnMouseDown: function (e) {
            if (this.get('disabled')) {
                return;
            }
            e.halt();
            var self = this,
                scrollview = self.scrollview,
                xAxis = self._xAxis,
                property = xAxis ? 'scrollLeft' : 'scrollTop',
                step = scrollview.scrollStep[xAxis ? 'left' : 'top'],
                downBtn = self.get('downBtn'),
                target = e.target,
                direction = (target == downBtn[0] || downBtn.contains(target)) ? 1 : -1,
                doScroll = xAxis ? function () {
                    scrollview.scrollTo(scrollview.get(property) + direction * step);
                } : function () {
                    scrollview.scrollTo(undefined, scrollview.get(property) + direction * step);
                };
            clearInterval(self.mouseInterval);
            self.mouseInterval = setInterval(doScroll, 100);
            doScroll();
        },

        _onTrackElMouseDown: function (e) {
            if (this.get('disabled')) {
                return;
            }
            var self = this,
                xAxis = self._xAxis,
                leftTop = xAxis ? 'left' : 'top',
                pageXY = xAxis ? 'pageX' : 'pageY',
                trackEl = self.get('trackEl'),
                dragEl = self.get('dragEl'),
                scrollview = self.scrollview,
                per = Math.max(0,
                    // align mouse with bar center
                    (e[pageXY] - trackEl.offset()[leftTop] - self.barSize / 2) / self._trackElSize),
                v = per * self._scrollLength;
            if (xAxis) {
                scrollview.scrollTo(v);
            } else {
                scrollview.scrollTo(undefined, v);
            }
            // prevent drag
            e.halt();
        },

        _onUpDownBtnMouseUp: function () {
            clearInterval(this.mouseInterval);
        },

        _onScrollEnd: function (e) {
            var self = this;
            if (self._hideFn && self.get('axis') == e.axis) {
                self._startHideTimer();
            }
        },
        // percentage matters!
        afterScrollChange: function (e) {
            // only show when scroll
            var self = this,
                xAxis = self._xAxis,
                scrollview = self.scrollview;
            self._clearHideTimer();
            self.show();
            if (self._hideFn && !scrollview.dd.get('dragging')) {
                self._startHideTimer();
            }
            var dragAxis = xAxis ? 'dragLeft' : 'dragTop',
                dragSizeAxis = xAxis ? 'dragWidth' : 'dragHeight',
                barSize = self.barSize,
                contentSize = self._scrollLength,
                trackElSize = self._trackElSize,
                val = e.newVal,
                maxScrollOffset = scrollview.maxScroll,
                minScrollOffset = scrollview.minScroll,
                minScroll = xAxis ? minScrollOffset.left : minScrollOffset.top,
                maxScroll = xAxis ? maxScrollOffset.left : maxScrollOffset.top,
                dragVal;
            if (val > maxScroll) {
                dragVal = maxScroll / contentSize * trackElSize;
                self.set(dragSizeAxis, barSize - (val - maxScroll));
                // dragSizeAxis has minLength
                self.set(dragAxis, dragVal + barSize - self.get(dragSizeAxis));
            } else if (val < minScroll) {
                dragVal = minScroll / contentSize * trackElSize;
                self.set(dragSizeAxis, barSize - (minScroll - val));
                self.set(dragAxis, dragVal);
            } else {
                dragVal = val / contentSize * trackElSize;
                self.set(dragAxis, dragVal);
                self.set(dragSizeAxis, barSize);
            }
        },

        _onSetDisabled: function (v) {
            if (this.dd) {
                this.dd.set('disabled', v);
            }
        }

    }, {
        ATTRS: {
            allowTextSelection: {
                value: true
            },
            minLength: {
                value: MIN_BAR_LENGTH
            },
            scrollview: {
                view: 1
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
                view: 1
            },
            downBtn: {
                view: 1
            },
            upBtn: {
                view: 1
            },
            trackEl: {
                view: 1
            },
            focusable: {
                value: false
            },
            xrender: {
                value: ScrollBarRender
            }
        }
    }, {
        xclass: 'scrollbar'
    });

}, {
    requires: ['event', 'dd/base', 'component/base', './render']
});