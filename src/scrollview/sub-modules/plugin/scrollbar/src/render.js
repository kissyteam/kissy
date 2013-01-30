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
            '</a>' +
            '</div>' +
            '<div class="' + DRAG_PREFIX + 'arrow-down" >' +
            '<a href="javascript:void(\'down\')">' +
            '</a>' +
            '</div>';

    function getCls(cls, prefix, axis, addOn) {
        addOn = addOn || '';
        return addOn + S.substitute(cls, {
            prefix: prefix,
            axis: axis
        });
    }

    return Component.Render.extend({

        renderUI: function () {
            var self = this,
                el = self.get('el'),
                axis = self.get('axis'),
                prefix = self.get('prefixCls');
            el.html(getCls(tpl, prefix, axis));
            self.set('dragEl', el.one(getCls(DRAG_CLS, prefix, axis, '.')));
            self.set('downBtn', el.one(getCls(DOWN_CLS, prefix, axis, '.')));
            self.set('upBtn', el.one(getCls(UP_CLS, prefix, axis, '.')));
            self.set('trackEl', el.one(getCls(TRACK_CLS, prefix, axis, '.')));
        },

        '_onSetDragHeight': function (v) {
            this.get('dragEl').height(v);
        },

        '_onSetDragWidth': function (v) {
            this.get('dragEl').width(v);
        },

        '_onSetDragLeft': function (v) {
            this.get('dragEl').css('left', v);
        },

        '_onSetDragTop': function (v) {
            this.get('dragEl').css('top', v);
        }

    }, {
        ATTRS: {
            scrollView: {
                view: 1
            },
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