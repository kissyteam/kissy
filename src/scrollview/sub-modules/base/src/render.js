/**
 * scrollview render
 * @author yiminghe@gmail.com
 */
KISSY.add('scrollview/base/render', function (S, Component, Extension) {

    // http://www.html5rocks.com/en/tutorials/speed/html5/
    var supportCss3 = S.Features.isTransformSupported();
    var css3Prefix = S.Features.getTransformPrefix();

    var methods = {

        renderUI: function () {
            this._contentEl = this.get('contentEl')[0];
        },

        '_onSetScrollLeft': function (v) {
            this._contentEl.style.left = -v + 'px';
        },

        '_onSetScrollTop': function (v) {
            this._contentEl.style.top = -v + 'px';
        }

    };

    var transformProperty = css3Prefix ? css3Prefix + 'Transform' : 'transform';

    if (supportCss3) {

        methods._onSetScrollLeft = function (v) {
            var scrollTop = this.get('scrollTop');
            this._contentEl.style[transformProperty] = 'translate3d(' + -v + 'px,' + -scrollTop + 'px,0)';
        };

        methods._onSetScrollTop = function (v) {
            var scrollLeft = this.get('scrollLeft');
            this._contentEl.style[transformProperty] = 'translate3d(' + -scrollLeft + 'px,' + -v + 'px,0)';
        };

    }

    return Component.Render.extend([Extension.ContentBox.Render], methods, {
        ATTRS: {
            scrollLeft: {
                value: 0
            },
            scrollTop: {
                value: 0
            }
        }
    });

}, {
    requires: ['component/base', 'component/extension']
});