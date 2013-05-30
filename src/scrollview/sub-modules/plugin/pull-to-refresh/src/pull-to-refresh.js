/**
 * pull-to-refresh plugin for KISSY scrollview
 * @author yiminghe@gmail.com
 */
KISSY.add('scrollview/plugin/pull-to-refresh', function (S, Base) {

    var substitute = S.substitute;


    var transform = S.Features.getTransformProperty();

    function ScrollBarPlugin() {
        ScrollBarPlugin.superclass.constructor.apply(this, arguments);
    }

    S.extend(ScrollBarPlugin, Base, {

        pluginId: this.getName(),

        _afterStateChange: function (e) {
            this['_onSetState' + S.ucfirst(e.newVal)]();
        },

        _onSetStatePulling: function () {
            var prefixCls = this.scrollview.get('prefixCls');
            this.get('el')[0].className = (prefixCls +
                'scrollview-pull-to-refresh ' +
                prefixCls + 'scrollview-pulling');
            this.labelEl.html(this.get('pullingText'));
            this.elHeight = this.get('el').height();
        },

        '_onSetStateReleasing': function () {
            var prefixCls = this.scrollview.get('prefixCls');
            this.get('el')[0].className = (prefixCls +
                'scrollview-pull-to-refresh ' +
                prefixCls + 'scrollview-releasing');
            this.labelEl.html(this.get('releasingText'));
            this.elHeight = this.get('el').height();
        },

        '_onSetStateLoading': function () {
            var prefixCls = this.scrollview.get('prefixCls');
            this.get('el')[0].className = (prefixCls +
                'scrollview-pull-to-refresh ' +
                prefixCls + 'scrollview-loading');
            this.labelEl.html(this.get('loadingText'));
            this.elHeight = this.get('el').height();
        },

        _onScrollMove: function () {
            var b = this.scrollview.get('scrollTop');
            if (-b > this.elHeight) {
                this.set('state', 'releasing');
            } else if (b < 0) {
                this.set('state', 'pulling');
            }
        },

        _onDragEnd: function () {
            var self = this;
            var scrollview = this.scrollview;
            var b = scrollview.get('scrollTop');
            if (-b > this.elHeight) {
                scrollview.minScroll.top = -this.elHeight;
                var loadFn = this.get('loadFn');
                this.set('state', 'loading');
                function callback() {
                    scrollview.stopAnimation();
                    scrollview.scrollTo(undefined, scrollview.minScroll.top, {
                        duration: scrollview.get('snapDuration'),
                        easing: scrollview.get('snapEasing')
                    });
                    self.set('state', 'pulling');
                }

                if (loadFn) {
                    loadFn.call(this, callback);
                } else {
                    callback.call(this);
                }
            }
        },

        _onAfterScrollTopChange: function (v) {
            v = v.newVal;
            if (v < 0) {
                this.get('el')[0].style[transform] = 'translate3d(0,' + -v + 'px,0)';
            }

        },

        pluginRenderUI: function (scrollview) {
            this.scrollview = scrollview;
            var prefixCls = scrollview.get('prefixCls');
            var el = S.all(substitute('<div class="{prefixCls}scrollview-pull-to-refresh">' +
                '<div class="{prefixCls}scrollview-pull-to-refresh-content">' +
                '<span class="{prefixCls}scrollview-pull-icon"></span>' +
                '<span class="{prefixCls}scrollview-pull-label"></span>' +
                '</div>' +
                '</div>', {
                prefixCls: prefixCls
            }));
            this.labelEl = el.one('.' + prefixCls + 'scrollview-pull-label');
            scrollview.get('el').prepend(el);
            this.set('el', el);
            this._onSetStatePulling();
        },

        pluginBindUI: function (scrollview) {
            var self = this;
            scrollview.on('scrollMove', self._onScrollMove, self);
            scrollview.on('dragend', self._onDragEnd, self);
            self.on('afterStateChange', self._afterStateChange, self);
            scrollview.on('afterScrollTopChange', self._onAfterScrollTopChange, self);
        },

        pluginDestructor: function () {
            this.get('el').remove();
        }

    }, {
        ATTRS: {
            el: {},
            tpl: {
                value: '<span class="{prefixCls}scrollview-pull-icon"></span>' +
                    '<span class="{prefixCls}scrollview-pull-label"></span>'
            },
            pullingText: {
                value: 'Pull down to refresh...'
            },
            releasingText: {
                value: 'release to refresh...'
            },
            loadingText: {
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