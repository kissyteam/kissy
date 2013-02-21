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
            var autoHideX = this.get('autoHideX');
            var autoHideY = this.get('autoHideY');
            var my;
            var cfg = {
                scrollView: scrollView,
                // render: scrollView.get('el') => ie7 bug
                elBefore: scrollView.get('contentEl')
            };
            if (minLength !== undefined) {
                cfg.minLength = minLength;
            }

            if (this.scrollBarX) {
                this.scrollBarX.set('disabled', false);
                this.scrollBarX.sync();
            } else if (scrollView.isAxisEnabled('x')) {
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
            } else if (scrollView.isAxisEnabled('y')) {
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