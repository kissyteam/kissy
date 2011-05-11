/**
 * submenu model and control for kissy , transfer item's keycode to menu
 * @author:yiminghe@gmail.com
 */
KISSY.add(
    /* or precisely submenuitem */
    "menu/submenu",
    function(S, UIBase, Component, MenuItem, SubMenuRender) {
        var SubMenu;
        SubMenu = UIBase.create(MenuItem, {
            _handleMouseLeave:function(ev) {
                /**
                 * menuitem leave 会设成 false
                 * 这里不要继承 menuitem ，直接重写组件最顶层基类
                 */
                if (MenuItem.superclass._handleMouseLeave.call(this, ev) === false) {
                    return false;
                }

                var menu = this.get("menu");
                //到了子菜单中，高亮不要消失
                if (menu && menu.get("visible")
                    &&
                    (menu.get("view").get("el").contains(ev.relatedTarget)
                        || menu.get("view").get("el")[0] == ev.relatedTarget[0]
                        )
                    ) {
                    //S.log("submenuitem highlighted unchanged");
                    return;
                }
                //S.log("submenuitem highlighted changed !!!!!!!!!!");
                this.set("highlighted", false);
            },

            _uiSetHighlighted:function(v) {
                this.get("view").set("highlighted", v);
                if (!v) {
                    this._hideSubMenu();
                }
                // 不负责显示，显示两种方式
                // 1. submenuitem mouseenter
                // 2. submenuitem 当前右键
            },

            bindUI:function() {
                /**
                 * 自己不是 menu，自己只是 menuitem，其所属的 menu 为 get("parent")
                 */
                var self = this,
                    parentMenu = self.get("parent");

                var menu = this.get("menu");

                //当改菜单项所属的菜单隐藏后，该菜单项关联的子菜单也要隐藏
                if (parentMenu) {
                    parentMenu.on("hide", function() {
                        if (self.get("menu")) {
                            self.get("menu").hide();
                        }
                    });

                    // 子菜单选中后也要通知父级菜单
                    // 不能使用 afterSelectedItemChange ，多个 menu 嵌套，可能有缓存
                    // 单个 menu 来看可能 selectedItem没有变化
                    menu.on("menuItemClick", function(ev) {
                        parentMenu.fire("menuItemClick", {
                            menuItem:ev.menuItem
                        });
                    });

                    // 通知父级菜单
                    menu.on("afterHighlightedItemChange afterActiveItemChange", function(ev) {
                        S.log("通知父级菜单 : " + ev.newVal + "  : " + ev.type);
                        parentMenu.set("activeItem", ev.newVal);
                    });

                }


                //!TODO
                //parentMenu 的 aria-activedescendant 同步 menu 的 aria-activedescendant
            },

            _handleMouseEnter:function() {
                if (SubMenu.superclass._handleMouseEnter.call(this) === false) return false;
                this._showSubMenu();
            },

            _showSubMenu:function() {
                var menu = this.get("menu");
                menu.set("align", {node:this.get("view").get("el"), points:['tr','tl']});
                menu.render();
                /**
                 * If activation of your menuitem produces a popup menu,
                 then the menuitem should have aria-haspopup set to the ID of the corresponding menu
                 to allow the assistive technology to follow the menu hierarchy
                 and assist the user in determining context during menu navigation.
                 */
                this.get("view").get("el").attr("aria-haspopup",
                    menu.get("view").get("el").attr("id"));
                menu.show();
            },

            _hideSubMenu:function() {
                var menu = this.get("menu");
                menu && menu.hide();
            },

            _handleClickInternal:function(ev) {
                //从键盘过来的，如果子菜单有高亮，则不要把自己当做选中项
                if (ev && ev.type == "keydown") {
                    var menu = this.get("menu");
                    if (menu && menu.get("visible") && menu.get("highlightedItem")) {
                        return;
                    }
                }
                SubMenu.superclass._handleClickInternal.call(this);
            },

            _handleKeydown:function(e) {


                if (SubMenu.superclass._handleKeydown.call(this, e) === false) return false;

                var menu = this.get("menu");

                if (e.keyCode == 27) {
                    this._hideSubMenu();
                    return;
                }


                if (menu && menu.get("visible")) {
                    if (menu._handleKeydown(e) === false) {
                        //父亲不要处理了
                        return false;
                    }
                }

                //父亲不要处理了
                //right
                if (e.keyCode == 39 && (!menu ||
                    !menu.get("visible"))) {
                    this._showSubMenu();
                    var menuChildren = menu.get("children");
                    if (menuChildren[0]) {
                        menuChildren[0].set("highlighted", true);
                    }
                    return false;
                }
                //left
                else if (e.keyCode == 37 && menu && menu.get("visible")) {
                    this._hideSubMenu();
                    return false;
                }


            }

        }, {
            ATTRS:{
                menu:{
                    setter:function(m) {
                        m.set("focusable", false);
                    }
                }
            }
        });

        SubMenu.DefaultRender = SubMenuRender;
        return SubMenu;
    }, {
    requires:['uibase','component','./menuitem','./submenurender']
});

/**

 **/