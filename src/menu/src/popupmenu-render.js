/**
 * @ignore
 * popup menu render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenu-render", function (S, extension, MenuRender) {

    var UA = S.UA;

    return MenuRender.extend([
        extension.Position.Render,
        UA['ie'] === 6 ? extension.Shim.Render : null
    ], {
        initializer: function () {
            this.get('childrenElSelectors')['contentEl'] = '#{prefixCls}contentbox{id}';
        },
        createDom: function () {
            if (!this.get('contentEl')) {
                var contentEl = S.all(new XTemplate(this.get('contentTpl')).render({
                    prefixCls: this.get('prefixCls'),
                    content: ''
                }));
                contentEl.append(this.get('el').contents());
                this.setInternal('contentEl', contentEl);
                this.get('el').append(contentEl);
            }
        },
        getChildrenContainerEl: function () {
            return this.get('contentEl');
        }
    }, {
        ATTRS: {
            contentEl: {},

            contentTpl: {
                value: '<div ' +
                    'id="ks-contentbox{{id}}" ' +
                    'class="{{prefixCls}}contentbox ' +
                    '{{prefixCls}}popupmenu-contentbox">' +
                    '</div>'
            }
        }
    });
}, {
    requires: ['component/extension', './menu-render']
});