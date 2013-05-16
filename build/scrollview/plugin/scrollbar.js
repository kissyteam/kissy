/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: May 17 01:31
*/
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
                self.get('trackEl').on(Event.Gesture.start,
                    self._onTrackElMouseDown, self);
                dd = self.dd = new DD.Draggable({
                    node: self.get('dragEl'),
                    groups: false,
                    // allow nested scrollview
                    halt: true
                });
                dd.on('drag', self._onDrag, self)
                    .on('dragstart', self._onDragStart, self);
            }
            scrollview
                .on('afterScroll' + (self._xAxis ? 'Left' : 'Top') +
                    'Change' + SCROLLBAR_EVENT_NS, self.afterScrollChange, self)
                .on('scrollEnd' + SCROLLBAR_EVENT_NS, self._onScrollEnd, self)
                .on('afterDisabledChange', self._onScrollViewDisabled, self);
        },

        syncUI: function () {
            var self = this,
                scrollview = self.get('scrollview'),
                trackEl = self.get('trackEl'),
                dragEl = self.get('dragEl'),
                ratio,
                trackElSize,
                rendered = self.get('rendered');
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
            } else {
                if (rendered && !scrollview.isAxisEnabled('y')) {
                    self.hide();
                    return;
                }
                self._scrollLength = scrollview.scrollHeight;
                trackElSize = self._trackElSize = trackEl.height();
                ratio = scrollview.clientHeight / self._scrollLength;
                self.set('dragHeight', self.barSize = ratio * trackElSize);
            }
            self._syncAndReRender();
        },

        destructor: function () {
            this.get('scrollview').detach(SCROLLBAR_EVENT_NS);
            this._clearHideTimer();
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
                scroll = self._startScroll +
                    diff / self._trackElSize * self._scrollLength;
            if (xAxis) {
                scrollview.scrollTo(scroll);
            } else {
                scrollview.scrollTo(undefined, scroll);
            }
        },

        _startHideTimer: function () {
            this._clearHideTimer();
            this._hideTimer = setTimeout(this._hideFn,
                this.get('hideDelay') * 1000);
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
        afterScrollChange: function () {
            // only show when scroll
            var self = this;
            var scrollview = self.scrollview;
            self._clearHideTimer();
            self.show();
            if (self._hideFn && !scrollview.dd.get('dragging')) {
                self._startHideTimer();
            }
            self._syncAndReRender();
        },

        _syncAndReRender: function () {
            var self = this;
            var xAxis = self._xAxis;
            var scrollview = self.scrollview;
            var dragAxis = xAxis ? 'dragLeft' : 'dragTop',
                dragSizeAxis = xAxis ? 'dragWidth' : 'dragHeight',
                barSize = self.barSize,
                contentSize = self._scrollLength,
                trackElSize = self._trackElSize,
                val = scrollview.get(xAxis ? 'scrollLeft' : 'scrollTop'),
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
});/**
 * render for scrollbar
 * @author yiminghe@gmail.com
 */
KISSY.add('scrollview/plugin/scrollbar/render', function (S, Component, ScrollBarTpl) {

    // http://www.html5rocks.com/en/tutorials/speed/html5/
    var supportCss3 = S.Features.isTransformSupported();
    var css3Prefix = S.Features.getTransformPrefix();

    var methods = {

        initializer: function () {
            var self = this,
                axis = self.get('axis'),
                prefixCls = self.get('prefixCls');
            self.get('elCls').push(prefixCls + 'scrollbar-' + axis);
            S.mix(self.get('childrenElSelectors'), {
                'dragEl': '#ks-scrollbar-{axis}-drag{id}',
                'downBtn': '#ks-scrollbar-{axis}-arrow-down{id}',
                'upBtn': '#ks-scrollbar-{axis}-arrow-up{id}',
                'trackEl': '#ks-scrollbar-{axis}-track{id}'
            });
        },

        '_onSetDragHeight': function (v) {
            this.get('dragEl')[0].style.height = v + 'px';
        },

        '_onSetDragWidth': function (v) {
            this.get('dragEl')[0].style.width = v + 'px';
        },

        '_onSetDragLeft': function (v) {
            this.get('dragEl')[0].style.left = v + 'px';
        },

        '_onSetDragTop': function (v) {
            this.get('dragEl')[0].style.top = v + 'px';
        }

    };

    var transformProperty = css3Prefix ? css3Prefix + 'Transform' : 'transform';

    if (supportCss3) {

        methods._onSetDragLeft = function (v) {
            this.get('dragEl')[0].style[transformProperty] = 'translateX(' + v + 'px) translateZ(0)';
        };

        methods._onSetDragTop = function (v) {
            this.get('dragEl')[0].style[transformProperty] = 'translateY(' + v + 'px) translateZ(0)';
        };

    }

    return Component.Render.extend(methods, {
        ATTRS: {
            contentTpl: {
                value: ScrollBarTpl
            },
            axis: {},
            scrollview: {},
            dragWidth: {},
            dragHeight: {},
            dragLeft: {},
            dragTop: {},
            dragEl: {},
            downBtn: {},
            upBtn: {},
            trackEl: {}
        }
    });

}, {
    requires: ['component/base', './scrollbar-tpl']
});/*
  Generated by kissy-tpl2mod.
*/
KISSY.add('scrollview/plugin/scrollbar/scrollbar-tpl',function(){
 return '<div id="ks-scrollbar-{{axis}}-track{{id}}" class="{{prefixCls}}scrollbar-{{axis}}-track"> <div id="ks-scrollbar-{{axis}}-drag{{id}}" class="{{prefixCls}}scrollbar-{{axis}}-drag"> <div class="{{prefixCls}}scrollbar-{{axis}}-drag-top"> </div> <div class="{{prefixCls}}scrollbar-{{axis}}-drag-center"> </div> <div class="{{prefixCls}}scrollbar-{{axis}}-drag-bottom"> </div> </div> </div> <div id="ks-scrollbar-{{axis}}-arrow-up{{id}}" class="{{prefixCls}}scrollbar-{{axis}}-arrow-up"> <a href="javascript:void(\'up\')">up</a> </div> <div id="ks-scrollbar-{{axis}}-arrow-down{{id}}" class="{{prefixCls}}scrollbar-{{axis}}-arrow-down"> <a href="javascript:void(\'down\')">down</a> </div>';
});
/**
 * scrollbar plugin for KISSY scrollview
 * @author yiminghe@gmail.com
 */
KISSY.add('scrollview/plugin/scrollbar', function (S, Base, ScrollBar) {

    function ScrollBarPlugin() {
        ScrollBarPlugin.superclass.constructor.apply(this, arguments);
    }

    S.extend(ScrollBarPlugin, Base, {

        pluginId: 'scrollview/plugin/scrollbar',

        pluginSyncUI: function (scrollview) {
            var minLength = this.get('minLength');
            var autoHideX = this.get('autoHideX');
            var autoHideY = this.get('autoHideY');
            var my;
            var cfg = {
                scrollview: scrollview,
                // render: scrollview.get('el') => ie7 bug
                elBefore: scrollview.get('contentEl')
            };
            if (minLength !== undefined) {
                cfg.minLength = minLength;
            }

            if (this.scrollBarX) {
                this.scrollBarX.sync();
            } else if (scrollview.isAxisEnabled('x')) {
                my = {
                    axis: 'x'
                };
                if (autoHideX !== undefined) {
                    cfg.autoHide = autoHideX;
                }
                this.scrollBarX = new ScrollBar(S.merge(cfg, my)).render();
            }

            if (this.scrollBarY) {
                this.scrollBarY.sync();
            } else if (scrollview.isAxisEnabled('y')) {
                my = {
                    axis: 'y'
                };
                if (autoHideY !== undefined) {
                    cfg.autoHide = autoHideY;
                }
                this.scrollBarY = new ScrollBar(S.merge(cfg, my)).render();
            }

        },

        pluginDestructor: function () {
            if (this.scrollBarX) {
                this.scrollBarX.destroy();
                this.scrollBarX = null;
            }
            if (this.scrollBarY) {
                this.scrollBarY.destroy();
                this.scrollBarY = null;
            }
        }

    });

    return ScrollBarPlugin;
}, {
    requires: ['base', './scrollbar/control']
});
