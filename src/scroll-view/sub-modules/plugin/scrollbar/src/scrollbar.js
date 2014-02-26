/**
 * @ignore
 * scrollbar plugin for KISSY scroll-view
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Base = require('base');
    var ScrollBar = require('./scrollbar/control');

    function onScrollViewReflow() {
        var self = this;
        var scrollView = self.scrollView;
        var minLength = self.get('minLength');
        var autoHideX = self.get('autoHideX');
        var autoHideY = self.get('autoHideY');
        var cfg;

        if (!self.scrollBarX && scrollView.allowScroll.left) {
            cfg = {
                axis: 'x',
                scrollView: scrollView,
                // render: scrollView.get('el') => ie7 bug
                elBefore: scrollView.$contentEl
            };
            if (minLength !== undefined) {
                cfg.minLength = minLength;
            }
            if (autoHideX !== undefined) {
                cfg.autoHide = autoHideX;
            }
            self.scrollBarX = new ScrollBar(cfg).render();
        }

        if (!self.scrollBarY && scrollView.allowScroll.top) {
            cfg = {
                axis: 'y',
                scrollView: scrollView,
                // render: scrollView.get('el') => ie7 bug
                elBefore: scrollView.$contentEl
            };
            if (minLength !== undefined) {
                cfg.minLength = minLength;
            }
            if (autoHideY !== undefined) {
                cfg.autoHide = autoHideY;
            }
            self.scrollBarY = new ScrollBar(cfg).render();
        }
    }

    /**
     * ScrollBar plugin for ScrollView.
     * @class KISSY.ScrollView.Plugin.ScrollBar
     * @extend KISSY.Base
     */
    return Base.extend({
        pluginId: this.getName(),

        pluginBindUI: function (scrollView) {
            var self = this;
            self.scrollView = scrollView;
            scrollView.on('reflow', onScrollViewReflow, self);
        },

        pluginDestructor: function (scrollView) {
            var self = this;
            if (self.scrollBarX) {
                self.scrollBarX.destroy();
                self.scrollBarX = null;
            }
            if (self.scrollBarY) {
                self.scrollBarY.destroy();
                self.scrollBarY = null;
            }
            scrollView.detach('reflow', onScrollViewReflow, self);
        }
    }, {
        ATTRS: {
            /**
             * minimum scrollbar length.
             * Defaults to 20.
             * @cfg {Number} minLength
             */
            /**
             * @ignore
             */
            minLength: {

            },
            /**
             * whether auto hide x scrollbar like ios
             * @cfg {Boolean} autoHideX
             */
            /**
             * @ignore
             */
            autoHideX: {

            },
            /**
             * whether auto hide y scrollbar like ios
             * @cfg {Boolean} autoHideY
             */
            /**
             * @ignore
             */
            autoHideY: {

            }
        }
    });
});