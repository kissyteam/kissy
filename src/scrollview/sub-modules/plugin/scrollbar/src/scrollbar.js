/**
 * scrollbar plugin for KISSY scrollview
 * @author yiminghe@gmail.com
 */
KISSY.add('scrollview/plugin/scrollbar', function (S, Base, ScrollBar) {

    function ScrollBarPlugin() {
        ScrollBarPlugin.superclass.constructor.apply(this, arguments);
    }

    S.extend(ScrollBarPlugin, Base, {

        pluginSyncUI: function (scrollView) {
            var minLength = this.get('minLength');
            var cfg = {
                scrollView: scrollView,
                // render: scrollView.get('el') => ie7 bug
                elBefore: scrollView.get('contentEl')
            };
            if (minLength !== undefined) {
                cfg.minLength = minLength;
            }
            if (scrollView.isAxisEnabled('x')) {
                if (this.scrollBarX) {
                    this.scrollBarX.sync();
                } else {
                    this.scrollBarX = new ScrollBar(S.merge(cfg, {
                        axis: 'x'
                    })).render();
                }
            }

            if (scrollView.isAxisEnabled('y')) {
                if (this.scrollBarY) {
                    this.scrollBarY.sync();
                } else {
                    this.scrollBarY = new ScrollBar(S.merge(cfg, {
                        axis: 'y'
                    })).render();
                }
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