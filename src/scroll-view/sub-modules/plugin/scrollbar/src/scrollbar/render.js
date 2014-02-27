/**
 * @ignore
 * render for scrollbar
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Control = require('component/control');
    var ScrollBarTpl = require('./scrollbar-xtpl');
    var isTransform3dSupported = S.Features.isTransform3dSupported();
    // http://www.html5rocks.com/en/tutorials/speed/html5/
    var supportCss3 = S.Features.getVendorCssPropPrefix('transform') !== false;

    var methods = {
        beforeCreateDom: function (renderData, childrenElSelectors) {
            renderData.elCls.push(renderData.prefixCls + 'scrollbar-' + renderData.axis);
            S.mix(childrenElSelectors, {
                'dragEl': '#ks-scrollbar-drag-{id}',
                'downBtn': '#ks-scrollbar-arrow-down-{id}',
                'upBtn': '#ks-scrollbar-arrow-up-{id}',
                'trackEl': '#ks-scrollbar-track-{id}'
            });
        },

        createDom: function () {
            var control = this.control;
            control.$dragEl = control.get('dragEl');
            control.$trackEl = control.get('trackEl');
            control.$downBtn = control.get('downBtn');
            control.$upBtn = control.get('upBtn');
            control.dragEl = control.$dragEl[0];
            control.trackEl = control.$trackEl[0];
            control.downBtn = control.$downBtn[0];
            control.upBtn = control.$upBtn[0];
        },

        '_onSetDragHeight': function (v) {
            this.control.dragEl.style.height = v + 'px';
        },

        '_onSetDragWidth': function (v) {
            this.control.dragEl.style.width = v + 'px';
        },

        '_onSetDragLeft': function (v) {
            this.control.dragEl.style.left = v + 'px';
        },

        '_onSetDragTop': function (v) {
            this.control.dragEl.style.top = v + 'px';
        }
    };

    if (supportCss3) {
        var transformProperty = S.Features.getVendorCssPropName('transform');

        methods._onSetDragLeft = function (v) {
            this.control.dragEl.style[transformProperty] = 'translateX(' + v + 'px)' +
                ' translateY(' + this.control.get('dragTop') + 'px)' +
                (isTransform3dSupported ? ' translateZ(0)' : '');
        };

        methods._onSetDragTop = function (v) {
            this.control.dragEl.style[transformProperty] = 'translateX(' + this.control.get('dragLeft') + 'px)' +
                ' translateY(' + v + 'px)' +
                (isTransform3dSupported ? ' translateZ(0)' : '');
        };
    }

    return Control.getDefaultRender().extend(methods, {
        ATTRS: {
            contentTpl: {
                value: ScrollBarTpl
            }
        }
    });
});