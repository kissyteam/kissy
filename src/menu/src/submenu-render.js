/**
 * @ignore
 * submenu render for kissy ,extend menuitem render with arrow
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/submenu-render", function (S, MenuItemRender) {
    var CONTENT_TMPL = '<span id="{{prefixCls}}menuitem-content{{id}}" ' +
            'class="{{prefixCls}}menuitem-content">{{{content}}}' +
            '<' + '/span>',
        ARROW_TMPL = '<span class="{{prefixCls}}submenu-arrow">►<' + '/span>';

    return MenuItemRender.extend({
        initializer: function () {
            this.get('childrenElSelectors')['contentEl'] =
                '#{prefixCls}menuitem-content{id}';
        }
    }, {
        ATTRS: {
            contentTpl: {
                value: CONTENT_TMPL + ARROW_TMPL
            }
        },
        HTML_PARSER: {
            contentEl: function (el) {
                return el.children("." + this.get('prefixCls') + "menuitem-content");
            }
        }
    });
}, {
    requires: ['./menuitem-render']
});