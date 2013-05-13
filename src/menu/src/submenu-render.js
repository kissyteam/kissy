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
        },

        _onSetContent: function (v) {
            this.get('contentEl').html(v).unselectable();
        }
    }, {
        ATTRS: {
            contentTpl: {
                value: CONTENT_TMPL + ARROW_TMPL
            }
        },
        HTML_PARSER: {
            content: function () {
                return el.children("." + this.get('prefixCls') +
                    "menuitem-content").html();
            },
            contentEl: function (el) {
                return el.children("." + this.get('prefixCls') +
                    "menuitem-content");
            }
        }
    });
}, {
    requires: ['./menuitem-render']
});