/**
 * render aria from menu according to current menuitem
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menurender", function(S, UA, UIBase, Component) {

    var CLS = "{prefixCls}menu  {prefixCls}menu-vertical";

    return UIBase.create(Component.Render, [
        UIBase.Contentbox.Render,
        UIBase.Position.Render,
        UA['ie'] === 6 ? UIBase.Shim.Render : null
    ], {

        renderUI:function() {
            var el = this.get("el");
            el.addClass(S.substitute(CLS, {
                prefixCls:this.get("prefixCls")
            }))
                .attr("role", "menu")
                .attr("aria-haspopup", true)
                .unselectable();
            if (!UA.ie) {
                el.attr('onmousedown', 'return false;');
            }
            if (!el.attr("id")) {
                el.attr("id", S.guid("ks-menu"));
            }
        },

        _uiSetActiveItem:function(v) {
            var el = this.get("el");
            if (v) {
                var menuItemEl = v.get("view").get("el"),
                    id = menuItemEl.attr("id");
                el.attr("aria-activedescendant", id);
                // 会打印重复 ，每个子菜单都会打印，然后冒泡至父菜单，再打印，和该 menuitem 所处层次有关系
                //S.log("menurender :" + el.attr("id") + " _uiSetActiveItem : " + v.get("content"));
            } else {
                el.attr("aria-activedescendant", "");
                //S.log("menurender :" + el.attr("id") + " _uiSetActiveItem : " + "");
            }

        }
    }, {
        ATTRS:{
            highlightedItem:{},
            activeItem:{}
        }
    });
}, {
    requires:['ua','uibase','component']
});