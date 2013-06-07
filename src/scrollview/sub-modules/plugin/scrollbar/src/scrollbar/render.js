/**
 * render for scrollbar
 * @author yiminghe@gmail.com
 */
KISSY.add('scrollview/plugin/scrollbar/render', function (S, Component, ScrollBarTpl) {

    // http://www.html5rocks.com/en/tutorials/speed/html5/
    var supportCss3 = S.Features.isTransformSupported();

    var methods = {

        initializer: function () {
            var self = this,
                axis = self.get('axis'),
                prefixCls = self.prefixCls;
            self.get('elCls').push(prefixCls + 'scrollbar-' + axis);
            S.mix(self.get('childrenElSelectors'), {
                'dragEl': '#ks-scrollbar-drag-{id}',
                'downBtn': '#ks-scrollbar-arrow-down-{id}',
                'upBtn': '#ks-scrollbar-arrow-up-{id}',
                'trackEl': '#ks-scrollbar-track-{id}'
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

    var transformProperty = S.Features.getTransformProperty();

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