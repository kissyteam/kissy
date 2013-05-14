/**
 * @ignore
 * popup menu render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenu-render", function (S, Extension, MenuRender) {

    var UA = S.UA;

    return MenuRender.extend([

        Extension.Position.Render,
        UA['ie'] === 6 ? Extension.Shim.Render : null
    ], {
        initializer: function () {
            this.get('childrenElSelectors')['contentEl'] = '#ks-contentbox{id}';
        },
        getChildrenContainerEl: function () {
            return this.get('contentEl');
        }
    }, {
        HTML_PARSER: {
            contentEl: function (el) {
                return el.one('.' + this.get('prefixCls') + 'contentbox');
            }
        },
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