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

        syncUI: function () {
            var self = this,
                control = self.control,
                scrollView = control.get('scrollView'),
                trackEl = control.trackEl,
                scrollWHProperty = control.scrollWHProperty,
                whProperty = control.whProperty,
                clientWHProperty = control.clientWHProperty,
                dragWHProperty = control.dragWHProperty,
                ratio,
                trackElSize,
                barSize;

            control.scrollView = scrollView;

            if (scrollView.allowScroll[control.scrollType]) {
                control.scrollLength = scrollView[scrollWHProperty];
                trackElSize = control.trackElSize =
                    whProperty === 'width' ? trackEl.offsetWidth : trackEl.offsetHeight;
                ratio = scrollView[clientWHProperty] / control.scrollLength;
                barSize = ratio * trackElSize;
                control.set(dragWHProperty, barSize);
                control.barSize = barSize;
                self.syncOnScrollChange();
                control.set('visible', true);
            } else {
                control.set('visible', false);
            }
        },

        syncOnScrollChange: function () {
            var self = this,
                control = self.control,
                scrollType = control.scrollType,
                scrollView = control.scrollView,
                dragLTProperty = control.dragLTProperty,
                dragWHProperty = control.dragWHProperty,
                trackElSize = control.trackElSize,
                barSize = control.barSize,
                contentSize = control.scrollLength,
                val = scrollView.get(control.scrollProperty),
                maxScrollOffset = scrollView.maxScroll,
                minScrollOffset = scrollView.minScroll,
                minScroll = minScrollOffset[scrollType],
                maxScroll = maxScrollOffset[scrollType],
                dragVal;
            if (val > maxScroll) {
                dragVal = maxScroll / contentSize * trackElSize;
                control.set(dragWHProperty, barSize - (val - maxScroll));
                // dragSizeAxis has minLength
                control.set(dragLTProperty, dragVal + barSize - control.get(dragWHProperty));
            } else if (val < minScroll) {
                dragVal = minScroll / contentSize * trackElSize;
                control.set(dragWHProperty, barSize - (minScroll - val));
                control.set(dragLTProperty, dragVal);
            } else {
                dragVal = val / contentSize * trackElSize;
                control.set(dragLTProperty, dragVal);
                control.set(dragWHProperty, barSize);
            }
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