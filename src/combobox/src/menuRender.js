/**
 * @fileOverview ComboBox menu render
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/menuRender", function (S, Menu) {
    var $ = S.all;
    return Menu.PopupMenu.Render.extend({
        createDom:function () {
            var self = this,
                el = self.get("el"),
                head = $("<div class='ks-combobox-menu-header"
                    + "'></div>"),
                foot = $("<div class='ks-combobox-menu-footer"
                    + "'></div>");
            el.prepend(head);
            el.append(foot);
            self.__set("head", head);
            self.__set("foot", foot);
        }
    }, {
        ATTRS:{
            head:{
                view:1
            },
            foot:{
                view:1
            }
        }
    });
}, {
    requires:['menu']
});