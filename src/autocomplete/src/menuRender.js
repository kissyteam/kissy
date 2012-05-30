/**
 * @fileOverview AutoComplete menu render
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete/menuRender", function (S, Menu) {
    var $ = S.all;
    return Menu.PopupMenu.Render.extend({
        createDom:function () {
            var self = this,
                el = self.get("el"),
                head = $("<div class='" +
                    self.get("prefixCls") + "autocomplete-menu-header"
                    + "'></div>"),
                foot = $("<div class='" +
                    self.get("prefixCls") + "autocomplete-menu-footer"
                    + "'></div>");
            el.prepend(head);
            el.append(foot);
            self.__set("head", head);
            self.__set("foot", foot);
        }
    }, {
        ATTRS:{
            head:{
                view:true
            },
            foot:{
                view:true
            }
        }
    });
}, {
    requires:['menu']
});