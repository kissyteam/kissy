/**
 * @fileOverview deletable menuitemRender
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/delmenuitemRender", function (S, Node, Component, Menu) {
    var CLS = "menuitem-deletable",
        DEL_CLS = "menuitem-delete";
    var MenuItemRender = Menu.Item.Render;
    var DEL_TMPL = '<span class="{prefixCls}' + DEL_CLS + '" title="{tooltip}">X<' + '/span>';

    function addDel(self) {
        self.get("el").append(S.substitute(DEL_TMPL, {
            prefixCls:self.get("prefixCls"),
            tooltip:self.get("delTooltip")
        }));
    }

    return Component.define(MenuItemRender, {
        createDom:function () {
            addDel(this);
        },
        _uiSetContent:function (v) {
            var self = this;
            MenuItemRender.prototype._uiSetContent.call(self, v);
            addDel(self);
        },

        _uiSetDelTooltip:function () {
            this._uiSetContent(this.get("content"));
        }
    }, {
        ATTRS:{
            delTooltip:{}
        },
        HTML_PARSER:{
            delEl:function (el) {
                return el.one(this.getCssClassWithPrefix(DEL_CLS));
            }
        },
        CLS:CLS,
        DEL_CLS:DEL_CLS
    });
}, {
    requires:['node', 'component', 'menu']
});