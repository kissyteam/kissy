/**
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
});