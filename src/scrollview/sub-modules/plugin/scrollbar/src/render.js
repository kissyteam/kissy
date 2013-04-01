/**
 * render for scrollbar
 * @author yiminghe@gmail.com
 */
KISSY.add('scrollview/plugin/scrollbar/render', function (S, Component) {

    var DRAG_PREFIX = '{prefix}scrollbar-{axis}-',
        DRAG_CLS = DRAG_PREFIX + 'drag',
        DOWN_CLS = DRAG_PREFIX + 'arrow-down',
        UP_CLS = DRAG_PREFIX + 'arrow-up',
        TRACK_CLS = DRAG_PREFIX + 'track',
        tpl = '<div class="' + DRAG_PREFIX + 'track">' +
            '<div class="' + DRAG_CLS + '">' +
            '<div class="' + DRAG_PREFIX + 'drag-top">' +
            '</div>' +
            '<div class="' + DRAG_PREFIX + 'drag-center">' +
            '</div>' +
            '<div class="' + DRAG_PREFIX + 'drag-bottom">' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="' + DRAG_PREFIX + 'arrow-up" >' +
            '<a href="javascript:void(\'up\')">' +
            'up' +
            '</a>' +
            '</div>' +
            '<div class="' + DRAG_PREFIX + 'arrow-down" >' +
            '<a href="javascript:void(\'down\')">' +
            'down' +
            '</a>' +
            '</div>';

    function getCls(cls, prefix, axis, addOn) {
        addOn = addOn || '';
        return addOn + S.substitute(cls, {
            prefix: prefix,
            axis: axis
        });
    }

    // http://www.html5rocks.com/en/tutorials/speed/html5/
    var supportCss3 = S.Features.isTransformSupported();
    var css3Prefix = S.Features.getTransformPrefix();

    var methods = {

        createDom: function () {
            this.get('el').addClass(this.get('prefixCls') + 'scrollbar-' + this.get('axis'));
        },

        renderUI: function () {
            var self = this,
                el = self.get('el'),
                axis = self.get('axis'),
                dragEl,
                prefix = self.get('prefixCls');
            el.html(getCls(tpl, prefix, axis));
            self.set('dragEl', dragEl = el.one(getCls(DRAG_CLS, prefix, axis, '.')));
            self.set('downBtn', el.one(getCls(DOWN_CLS, prefix, axis, '.')));
            self.set('upBtn', el.one(getCls(UP_CLS, prefix, axis, '.')));
            self.set('trackEl', el.one(getCls(TRACK_CLS, prefix, axis, '.')));
            self.domDragEl = dragEl[0];
        },

        '_onSetDragHeight': function (v) {
            this.domDragEl.style.height = v + 'px';
        },

        '_onSetDragWidth': function (v) {
            this.domDragEl.style.width = v + 'px';
        },

        '_onSetDragLeft': function (v) {
            this.domDragEl.style.left = v + 'px';
        },

        '_onSetDragTop': function (v) {
            this.domDragEl.style.top = v + 'px';
        }

    };

    var transformProperty = css3Prefix ? css3Prefix + 'Transform' : 'transform';

    if (supportCss3) {

        methods._onSetDragLeft = function (v) {
            this.domDragEl.style[transformProperty] = 'translateX(' + v + 'px) translateZ(0)';
        };

        methods._onSetDragTop = function (v) {
            this.domDragEl.style[transformProperty] = 'translateY(' + v + 'px) translateZ(0)';
        };

    }

    return Component.Render.extend(methods, {
        ATTRS: {
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
    requires: ['component/base']
});