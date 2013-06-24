/**
 * render aria and drop arrow for menubutton
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/render", function (S, Button, ContentRenderExtension) {

    return Button.ATTRS.xrender.value.extend([ContentRenderExtension], {

        decorateDom: function (el) {
            var control = this.control,
                prefixCls = control.prefixCls;
            var popupMenuEl = el.one('.' + prefixCls + 'popupmenu');
            var docBody = popupMenuEl[0].ownerDocument.body;
            docBody.insertBefore(popupMenuEl[0], docBody.firstChild);
            var PopupMenuClass =
                this.getComponentConstructorByNode(prefixCls, popupMenuEl);
            control.setInternal('menu', new PopupMenuClass({
                srcNode: popupMenuEl,
                prefixCls: prefixCls
            }));
        },

        beforeCreateDom: function (renderData) {
            S.mix(renderData.elAttrs, {
                'aria-expanded': false,
                'aria-haspopup': true
            });
        },

        _onSetCollapsed: function (v) {
            var self = this,
                el = self.$el,
                cls = self.getBaseCssClass("open");
            el[v ? 'removeClass' : 'addClass'](cls).attr("aria-expanded", !v);
        }
    }, {
        ATTRS: {
            contentTpl: {
                value: ContentRenderExtension.ATTRS.contentTpl.value +
                    '<div class="{{getBaseCssClasses "dropdown"}}">' +
                    '<div class="{{getBaseCssClasses "dropdown-inner"}}">' +
                    '</div>'
            }
        }
    });
}, {
    requires: ['button', 'component/extension/content-render']
});