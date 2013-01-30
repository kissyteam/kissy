/**
 * scrollbar for KISSY scrollview
 * @author yiminghe@gmail.com
 */
KISSY.add('scrollview/plugin/scrollbar/control', function (S, Component, ScrollBarRender) {

    var MIN_BAR_LENGTH = 20;

    var STEP = 20;


    function constrain(v, max, min) {
        return Math.min(Math.max(v, min), max);
    }


    return Component.Controller.extend({

        bindUI: function () {
            var scrollView = this.get('scrollView');
            if (this.get('axis') == 'x') {
                scrollView.on('afterScrollLeftChange', this.afterScrollLeftChange, this);
            } else {
                scrollView.on('afterScrollTopChange', this.afterScrollTopChange, this);
            }
            this.get('downBtn').on('mousedown', this._onMouseDown, this)
                .on('mouseup', this._onMouseUp, this);
            this.get('upBtn').on('mousedown', this._onMouseDown, this)
                .on('mouseup', this._onMouseUp, this);
        },

        _onMouseDown: function (e) {
            var xAxis = this.get('axis') == 'x';
            var property = xAxis ? 'scrollLeft' : 'scrollTop';
            var scrollView = this.get('scrollView');
            var downBtn = this.get('downBtn');
            var target = e.target;
            var max = scrollView.getMaxScroll()[xAxis ? 'left' : 'top'];
            var min = scrollView.getMinScroll()[xAxis ? 'left' : 'top'];
            var direction = (target == downBtn[0] || downBtn.contains(target)) ? -1 : 1;
            clearInterval(this.mouseInterval);
            // prevent drag
            e.halt();
            this.mouseInterval = setInterval(function () {
                scrollView.set(property, constrain((scrollView.get(property) + direction * STEP), max, min));
            }, 100);
        },

        _onMouseUp: function (e) {
            clearInterval(this.mouseInterval);
        },

        syncUI: function () {
            var scrollContent = this.get('scrollView').get('contentEl');
            var scrollEl = this.get('scrollView').get('el');
            var trackEl = this.get('trackEl');
            var dragEl = this.get('dragEl');
            var ratio;
            if (this.get('axis') == 'x') {
                this._contentSize = scrollContent[0].scrollWidth;
                this._trackElSize = trackEl.width();
                ratio = scrollEl.width() / this._contentSize;
                this.set('dragWidth', this.barWidth = ratio * this._trackElSize);
            } else {
                this._contentSize = scrollContent[0].scrollHeight;
                this._trackElSize = trackEl.height();
                ratio = scrollEl.height() / this._contentSize;
                this.set('dragHeight', this.barHeight = ratio * this._trackElSize);
            }
        },

        afterScrollLeftChange: function (e) {
            this.afterScrollChange(e, 'x');
        },

        afterScrollTopChange: function (e) {
            this.afterScrollChange(e, 'y');
        },

        afterScrollChange: function (e, axis) {
            var xAxis = axis == 'x' ? 1 : 0;
            var dragAxis = xAxis ? 'dragLeft' : 'dragTop';
            var dragSizeAxis = xAxis ? 'dragWidth' : 'dragHeight';
            var barSize = xAxis ? this.barWidth : this.barHeight;
            var contentSize = this._contentSize;
            var trackElSize = this._trackElSize;
            var val = -e.newVal;
            var scrollView = this.get('scrollView');
            var maxScrollOffset = scrollView.getMaxScroll();
            var minScrollOffset = scrollView.getMinScroll();
            var minScroll = xAxis ? -maxScrollOffset.left : -maxScrollOffset.top;
            var maxScroll = xAxis ? -minScrollOffset.left : -minScrollOffset.top;
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
    requires: ['component/base', './render']
});