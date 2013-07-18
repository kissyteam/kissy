/**
 * render for scrollbar
 * @author yiminghe@gmail.com
 */
KISSY.add('scroll-view/plugin/scrollbar/render', function (S, Control, ScrollBarTpl) {

    // http://www.html5rocks.com/en/tutorials/speed/html5/
    var supportCss3 = S.Features.isTransformSupported();

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
                $trackEl = control.$trackEl,
                isX = control.isX,
                scrollWHProperty = isX ? 'scrollWidth' : 'scrollHeight',
                whProperty = isX ? 'width' : 'height',
                clientWHProperty = isX ? 'clientWidth' : 'clientHeight',
                dragWhProperty = control.dragWhProperty,
                ratio,
                trackElSize,
                barSize,
                rendered = control.get('rendered');

            control.scrollView = scrollView;

            if (scrollView.isAxisEnabled(control.get('axis'))) {
                control.scrollLength = scrollView[scrollWHProperty];
                trackElSize = control.trackElSize = $trackEl[whProperty]();
                ratio = scrollView[clientWHProperty] / control.scrollLength;
                barSize = ratio * trackElSize;
                control.set(dragWhProperty, barSize);
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
                ltProperty = control.ltProperty,
                scrollView = control.scrollView,
                dragLtProperty = control.dragLtProperty,
                dragWhProperty = control.dragWhProperty,
                trackElSize = control.trackElSize,
                barSize = control.barSize,
                contentSize = control.scrollLength,
                val = scrollView.get(control.scrollProperty),
                maxScrollOffset = scrollView.maxScroll,
                minScrollOffset = scrollView.minScroll,
                minScroll = minScrollOffset[ltProperty],
                maxScroll = maxScrollOffset[ltProperty],
                dragVal;
            if (val > maxScroll) {
                dragVal = maxScroll / contentSize * trackElSize;
                control.set(dragWhProperty, barSize - (val - maxScroll));
                // dragSizeAxis has minLength
                control.set(dragLtProperty, dragVal + barSize - control.get(dragWhProperty));
            } else if (val < minScroll) {
                dragVal = minScroll / contentSize * trackElSize;
                control.set(dragWhProperty, barSize - (minScroll - val));
                control.set(dragLtProperty, dragVal);
            } else {
                dragVal = val / contentSize * trackElSize;
                control.set(dragLtProperty, dragVal);
                control.set(dragWhProperty, barSize);
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

    var transformProperty = S.Features.getTransformProperty();

    if (supportCss3) {

        methods._onSetDragLeft = function (v) {
            this.control.dragEl.style[transformProperty] = 'translateX(' + v + 'px) translateZ(0)';
        };

        methods._onSetDragTop = function (v) {
            this.control.dragEl.style[transformProperty] = 'translateY(' + v + 'px) translateZ(0)';
        };

    }

    return Control.getDefaultRender().extend(methods, {
        ATTRS: {
            contentTpl: {
                value: ScrollBarTpl
            }
        }
    });

}, {
    requires: ['component/control', './scrollbar-tpl']
});