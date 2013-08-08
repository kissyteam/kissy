﻿/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Aug 1 15:51
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 scroll-view/plugin/pull-to-refresh
*/

/**
 * pull-to-refresh plugin for KISSY scroll-view
 * @author yiminghe@gmail.com
 */
KISSY.add('scroll-view/plugin/pull-to-refresh', function (S, Base) {
    var substitute = S.substitute;

    var transformProperty = S.Features.getTransformProperty();

    function ScrollBarPlugin() {
        ScrollBarPlugin.superclass.constructor.apply(this, arguments);
    }

    S.extend(ScrollBarPlugin, Base, {

        pluginId: this.getName(),

        _onSetState: function (e) {
            var status = e.newVal,
                self = this,
                prefixCls = self.scrollView.get('prefixCls'),
                $el = self.$el;
            $el.attr('class', prefixCls +
                'scroll-view-pull-to-refresh ' +
                prefixCls + 'scroll-view-' + status);
            self.labelEl.html(self.get(status + 'Html'));
            self.elHeight = $el.height();
        },

        _onScrollMove: function () {
            var self = this,
                b = self.scrollView.get('scrollTop');
            if (-b > self.elHeight) {
                self.set('state', 'releasing');
            } else if (b < 0) {
                self.set('state', 'pulling');
            }
        },

        _onDragEnd: function () {
            var self = this;
            var scrollView = self.scrollView;
            var b = scrollView.get('scrollTop');
            if (-b > self.elHeight) {
                scrollView.minScroll.top = -self.elHeight;
                var loadFn = self.get('loadFn');
                self.set('state', 'loading');
                function callback() {
                    // will animate to restore
                    scrollView.scrollTo({
                        top: -self.elHeight
                    });
                    scrollView.scrollTo({
                        top: scrollView.minScroll.top
                    }, {
                        duration: scrollView.get('snapDuration'),
                        easing: scrollView.get('snapEasing')
                    });
                    self.set('state', 'pulling');
                }

                if (loadFn) {
                    loadFn.call(self, callback);
                } else {
                    callback.call(self);
                }
            }
        },

        _onSetScrollTop: function (v) {
            v = v.newVal;
            if (v < 0) {
                this.el.style[transformProperty] = 'translate3d(0,' + -v + 'px,0)';
            }
        },

        pluginRenderUI: function (scrollView) {
            var self = this;
            self.scrollView = scrollView;
            var prefixCls = scrollView.get('prefixCls');
            var el = S.all(substitute('<div class="{prefixCls}scroll-view-pull-to-refresh">' +
                '<div class="{prefixCls}scroll-view-pull-to-refresh-content">' +
                '<span class="{prefixCls}scroll-view-pull-icon"></span>' +
                '<span class="{prefixCls}scroll-view-pull-label"></span>' +
                '</div>' +
                '</div>', {
                prefixCls: prefixCls
            }));
            self.labelEl = el.one('.' + prefixCls + 'scroll-view-pull-label');
            scrollView.get('el').prepend(el);
            self.$el = el;
            self.el = el[0];
            self._onSetState({
                newValue: 'pulling'
            });
        },

        pluginBindUI: function (scrollView) {
            var self = this;
            scrollView.on('scrollMove', self._onScrollMove, self);
            scrollView.on('dragend', self._onDragEnd, self);
            self.on('afterStateChange', self._onSetState, self);
            scrollView.on('afterScrollTopChange', self._onSetScrollTop, self);
        },

        pluginDestructor: function () {
            this.$el.remove();
        }
    }, {
        ATTRS: {
            pullingHtml: {
                value: 'Pull down to refresh...'
            },

            releasingHtml: {
                value: 'release to refresh...'
            },

            loadingHtml: {
                value: 'loading...'
            },

            loadFn: {
            },

            state: {
                value: 'pulling'
            }
        }
    });

    return ScrollBarPlugin;
}, {
    requires: ['base']
});

