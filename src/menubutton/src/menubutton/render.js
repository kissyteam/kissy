/**
 * render aria and drop arrow for menubutton
 * @ignore
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Button = require('button');
    var MenuButtonTpl = require('./menubutton-xtpl');
    var ContentRenderExtension = require('component/extension/content-render');

    return Button.getDefaultRender().extend([ContentRenderExtension], {
        decorateDom: function (el) {
            var control = this.control,
                prefixCls = control.get('prefixCls');
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
                cls = self.getBaseCssClass('open');
            el[v ? 'removeClass' : 'addClass'](cls).attr('aria-expanded', !v);
        }
    }, {
        ATTRS: {
            contentTpl: {
                value: MenuButtonTpl
            }
        }
    });
});