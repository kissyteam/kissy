/**
 * scrollview render
 * @author yiminghe@gmail.com
 */
KISSY.add('scrollview/base/render', function (S, Component, Extension) {

    // http://www.html5rocks.com/en/tutorials/speed/html5/
    var supportCss3 = S.Features.isTransformSupported(),
        transformProperty;

    var methods = {

        '_onSetScrollLeft': function (v) {
            this.get('contentEl')[0].style.left = -v + 'px';
        },

        '_onSetScrollTop': function (v) {
            this.get('contentEl')[0].style.top = -v + 'px';
        }

    };

    if (supportCss3) {

        var css3Prefix = S.Features.getTransformPrefix();

        transformProperty = css3Prefix ? css3Prefix + 'Transform' : 'transform';

        methods._onSetScrollLeft = function (v) {
            var scrollTop = this.get('scrollTop');
            this.get('contentEl')[0].style[transformProperty] = 'translate3d(' + -v + 'px,' + -scrollTop + 'px,0)';
        };

        methods._onSetScrollTop = function (v) {
            var scrollLeft = this.get('scrollLeft');
            this.get('contentEl')[0].style[transformProperty] = 'translate3d(' + -scrollLeft + 'px,' + -v + 'px,0)';
        };

    }

    return Component.Render.extend([Extension.ContentRender], methods, {
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