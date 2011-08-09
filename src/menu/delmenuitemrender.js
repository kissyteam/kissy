/**
 * deletable menuitemrender
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/delmenuitemrender", function(S, Node, UIBase, Component, MenuItemRender) {
    var CLS = "menuitem-deletable",
        DEL_CLS = "menuitem-delete";
    var DEL_TMPL = '<span class="{prefixCls}' + DEL_CLS + '" title="{tooltip}">X<' + '/span>';

    function addDel(self) {
        self.get("contentEl").append(S.substitute(DEL_TMPL, {
            prefixCls:self.get("prefixCls"),
            tooltip:self.get("delTooltip")
        }));
    }

    var DelMenuItemRender = UIBase.create(MenuItemRender, {
        renderUI:function() {
            this.get("el").addClass(this.getCls(CLS))
        },
        createDom:function() {
            addDel(this);
        },
        _uiSetContent:function(v) {
            var self = this;
            MenuItemRender.prototype._uiSetContent.call(self, v);
            addDel(self);
        },

        _uiSetDelTooltip:function() {
            this._uiSetContent(this.get("content"));
        }
    }, {
        ATTRS:{
            delTooltip:{}
        },
        HTML_PARSER:{
            delEl:function(el) {
                return el.one(this.getCls(DEL_CLS));
            }
        },
        CLS:CLS,
        DEL_CLS:DEL_CLS
    });

    if (1 > 2) {
        DelMenuItemRender._uiSetDelTooltip().delEl;
    }
    return DelMenuItemRender;

}, {
    requires:['node','uibase','component','./menuitemrender']
});