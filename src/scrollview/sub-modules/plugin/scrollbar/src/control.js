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
                xAxis = 0,
                scrollView = self.get('scrollView');
            if (self.get('axis') == 'x') {
                xAxis = 1;
                scrollView.on('afterScrollLeftChange' + SCROLLBAR_EVENT_NS, self.afterScrollLeftChange, self);
            } else {
                scrollView.on('afterScrollTopChange' + SCROLLBAR_EVENT_NS, self.afterScrollTopChange, self);
            }
            this._xAxis = xAxis;
            var autoHide = self.get('autoHide');

            if (!autoHide) {
                self.get('downBtn').on('mousedown' + SCROLLBAR_EVENT_NS, self._onUpDownBtnMouseDown, self)
                    .on('mouseup' + SCROLLBAR_EVENT_NS, self._onUpDownBtnMouseUp, self);
                self.get('upBtn').on('mousedown' + SCROLLBAR_EVENT_NS, self._onUpDownBtnMouseDown, self)
                    .on('mouseup' + SCROLLBAR_EVENT_NS, self._onUpDownBtnMouseUp, self);
                self.get('trackEl').on(Event.Gesture.start, self._onTrackElMouseDown, self);
                var dd = self.dd = new DD.Draggable({
                    node: self.get('dragEl'),
                    // allow nested scrollview
                    halt: true,
                    move: 0
                });
                dd.on('drag', xAxis ? self._onDragX : self._onDragY, self)
                    .on('dragstart', self._onDragStart, self);
            } else {
                scrollView.on('scrollEnd' + SCROLLBAR_EVENT_NS, self._onScrollEnd, self);
                self._hideFn = function () {
                    self.hide();
                };
            }
        },

        _onDragX: function (e) {
            this._onDrag(e, 'x');
        },

        _onDragY: function (e) {
            this._onDrag(e, 'y');
        },

        _onDragStart: function () {
            var scrollView = this.scrollView;
            var xAxis = this._xAxis;
            this._startMousePos = this.dd.get('startMousePos')[xAxis ? 'left' : 'top'];
            this._startScroll = xAxis ? scrollView.get('scrollLeft') : scrollView.get('scrollTop');
        },

        _onDrag: function (e, axis) {
            var xAxis = axis == 'x';
            var pageXY = xAxis ? 'pageX' : 'pageY';
            var diff = e[pageXY] - this._startMousePos;
            var scrollView = this.scrollView;
            var scroll = this._startScroll + diff / this._trackElSize * this._scrollLength;
            if (xAxis) {
                scrollView.scrollTo(scroll);
            } else {
                scrollView.scrollTo(undefined, scroll);
            }
        },

        syncUI: function () {
            var scrollView = this.get('scrollView');
            var trackEl = this.get('trackEl');
            var dragEl = this.get('dragEl');
            this.scrollView = scrollView;
            var ratio;
            if (this._xAxis) {
                this._scrollLength = scrollView.scrollWidth;
                this._trackElSize = trackEl.width();
                ratio = scrollView.clientWidth / this._scrollLength;
                this.set('dragWidth', this.barSize = ratio * this._trackElSize);
            } else {
                this._scrollLength = scrollView.scrollHeight;
                this._trackElSize = trackEl.height();
                ratio = scrollView.clientHeight / this._scrollLength;
                this.set('dragHeight', this.barSize = ratio * this._trackElSize);
            }
            if (this.get('autoHide')) {
                this.hide();
            }
        },


        destructor: function () {
            this.scrollView.detach(SCROLLBAR_EVENT_NS);
            this.get('downBtn').detach(SCROLLBAR_EVENT_NS);
            this.get('upBtn').detach(SCROLLBAR_EVENT_NS);
            this.get('trackEl').detach(SCROLLBAR_EVENT_NS);
            this._clearHideTimer();
        },

        _onScrollEnd: function (e) {
            if (this.get('axis') == e.axis) {
                this._startHideTimer();
            }
        },

        _startHideTimer: function () {
            this._clearHideTimer();
            this._hideTimer = setTimeout(this._hideFn, this.get('hideDelay') * 1000);
        },

        _clearHideTimer: function () {
            if (this._hideTimer) {
                clearTimeout(this._hideTimer);
                this._hideTimer = null;
            }
        },

        _onUpDownBtnMouseDown: function (e) {
            var xAxis = this._xAxis;
            var property = xAxis ? 'scrollLeft' : 'scrollTop';
            var scrollView = this.scrollView;
            var step = scrollView.scrollStep[xAxis ? 'left' : 'top'];
            var downBtn = this.get('downBtn');
            var target = e.target;
            var direction = (target == downBtn[0] || downBtn.contains(target)) ? 1 : -1;
            clearInterval(this.mouseInterval);
            // prevent drag
            e.halt();
            function doScroll() {
                var v = scrollView.get(property) + direction * step;
                if (xAxis) {
                    scrollView.scrollTo(v);
                } else {
                    scrollView.scrollTo(undefined, v);
                }
            }

            this.mouseInterval = setInterval(doScroll, 100);
            doScroll();
        },

        _onTrackElMouseDown: function (e) {
            var xAxis = this._xAxis;
            var leftTop = xAxis ? 'left' : 'top';
            var pageXY = xAxis ? 'pageX' : 'pageY';
            var trackEl = this.get('trackEl');
            var dragEl = this.get('dragEl');
            var scrollView = this.scrollView;
            var per = Math.max(0,
                // align mouse with bar center
                (e[pageXY] - trackEl.offset()[leftTop] - this.barSize / 2) / this._trackElSize);
            var v = per * this._scrollLength;
            if (xAxis) {
                scrollView.scrollTo(v);
            } else {
                scrollView.scrollTo(undefined, v);
            }
            // prevent drag
            e.halt();
        },

        _onUpDownBtnMouseUp: function () {
            clearInterval(this.mouseInterval);
        },

        afterScrollLeftChange: function (e) {
            this.afterScrollChange(e, 'x');
        },

        afterScrollTopChange: function (e) {
            this.afterScrollChange(e, 'y');
        },

        afterScrollChange: function (e, axis) {
            // only show when scroll
            var xAxis = axis == 'x' ? 1 : 0;
            var scrollView = this.scrollView;
            this._clearHideTimer();
            this.show();
            if (this._hideFn && !scrollView.dd.get('dragging')) {
                this._startHideTimer();
            }
            var dragAxis = xAxis ? 'dragLeft' : 'dragTop';
            var dragSizeAxis = xAxis ? 'dragWidth' : 'dragHeight';
            var barSize = this.barSize;
            var contentSize = this._scrollLength;
            var trackElSize = this._trackElSize;
            var val = e.newVal;

            var maxScrollOffset = scrollView.maxScroll;
            var minScrollOffset = scrollView.minScroll;
            var minScroll = xAxis ? minScrollOffset.left : minScrollOffset.top;
            var maxScroll = xAxis ? maxScrollOffset.left : maxScrollOffset.top;
            var dragVal;
            if (val > maxScroll) {
                dragVal = maxScroll / contentSize * trackElSize;
                this.set(dragSizeAxis, barSize - (val - maxScroll));
                // dragSizeAxis has minLength
                this.set(dragAxis, dragVal + barSize - this.get(dragSizeAxis));
            } else if (val < minScroll) {
                dragVal = minScroll / contentSize * trackElSize;
                this.set(dragSizeAxis, barSize - (minScroll - val));
                this.set(dragAxis, dragVal);
            } else {
                dragVal = val / contentSize * trackElSize;
                this.set(dragAxis, dragVal);
                this.set(dragSizeAxis, barSize);
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
            scrollView: {
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
                value: S.Features.isTouchSupported()
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