/**
 * @fileOverview deletable menuitemrender
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/delmenuitemrender", function (S, Node, UIBase, Component, Menu) {
    var CLS = "menuitem-deletable",
        DEL_CLS = "menuitem-delete";
    var MenuItemRender = Menu.Item.Render;
    var DEL_TMPL = '<span class="{prefixCls}' + DEL_CLS + '" title="{tooltip}">X<' + '/span>';

    function addDel(self) {
        self.get("contentEl").append(S.substitute(DEL_TMPL, {
            prefixCls:self.get("prefixCls"),
            tooltip:self.get("delTooltip")
        }));
    }

    return UIBase.create(MenuItemRender, {
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
                return el.one(this.getCls(DEL_CLS));
            }
        },
        CLS:CLS,
        DEL_CLS:DEL_CLS
    });
}, {
    requires:['node', 'uibase', 'component', 'menu']
});