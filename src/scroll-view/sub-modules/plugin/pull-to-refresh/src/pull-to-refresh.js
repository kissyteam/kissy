/**
 * @ignore
 * pull-to-refresh plugin for KISSY scroll-view
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Base = require('base');

    var substitute = S.substitute;

    var transformProperty = S.Features.getTransformProperty();

    /**
     * pull to refresh plugin for ScrollView
     * @class KISSY.ScrollView.Plugin.PullToRefresh
     * @extend KISSY.Base
     */
    return Base.extend({
        pluginId: this.getName(),

        _onSetState: function (e) {
            if (!this.scrollView) {
                return;
            }
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

                var callback = function () {
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
                };

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
                // does not care ie9 and non 3d browser
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
            /**
             * pulling hint html.
             * Defaults to: Pull down to refresh...
             * @cfg {String} pullingHtml
             */
            /**
             * @ignore
             */
            pullingHtml: {
                value: 'Pull down to refresh...'
            },
            /**
             * releasing hint html.
             * Defaults to: release to refresh...
             * @cfg {String} releasingHtml
             */
            /**
             * @ignore
             */
            releasingHtml: {
                value: 'release to refresh...'
            },
            /**
             * loading hint html.
             * Defaults to: loading...
             * @cfg {String} loadingHtml
             */
            /**
             * @ignore
             */
            loadingHtml: {
                value: 'loading...'
            },
            /**
             * load function to load data asynchronously
             * @cfg {Function} loadFn
             */
            /**
             * @ignore
             */
            loadFn: {
            },
            state: {
                value: 'pulling'
            }
        }
    });
});