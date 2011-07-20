/**
 * render aria from menu according to current menuitem
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menurender", function(S, UA, UIBase, Component) {

    var CLS = "menu  menu-vertical";

    return UIBase.create(Component.Render, [
        UIBase.Contentbox.Render
    ], {

        renderUI:function() {
            var el = this.get("el");
            el.addClass(this.getCls(CLS))
                .attr("role", "menu")
                .attr("aria-haspopup", true);
            if (!el.attr("id")) {
                el.attr("id", S.guid("ks-menu"));
            }
        },

        _uiSetActiveItem:function(v) {
            var el = this.get("el");
            if (v) {
                var menuItemEl = v.get("el"),
                    id = menuItemEl.attr("id");
                el.attr("aria-activedescendant", id);
                // 会打印重复 ，每个子菜单都会打印，然后冒泡至父菜单，再打印，和该 menuitem 所处层次有关系
                //S.log("menurender :" + el.attr("id") + " _uiSetActiveItem : " + v.get("content"));
            } else {
                el.attr("aria-activedescendant", "");
                //S.log("menurender :" + el.attr("id") + " _uiSetActiveItem : " + "");
            }
        },

        containsElement:function(element) {
            var el = this.get("el");
            return el[0] === element || el.contains(element);
        }
    }, {
        ATTRS:{
            // 普通菜单可聚焦
            // 通过 tab 聚焦到菜单的根节点，通过上下左右操作子菜单项
            focusable:{
                value:true
            },
            activeItem:{},
            visibleMode:{
                value:"display"
            }
        }
    });
}, {
    requires:['ua','uibase','component']
});