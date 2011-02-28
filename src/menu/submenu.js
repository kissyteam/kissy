/**
 * submenu model and control for kissy , transfer item's keycode to menu
 * @author:yiminghe@gmail.com
 */
KISSY.add("menu/submenu", function(S, UIBase, MenuItem, SubMenuRender) {
    var SubMenu;
    SubMenu = UIBase.create(MenuItem, [], {
        _handleMouseLeave:function(ev) {
            if (MenuItem.superclass._handleMouseLeave.call(this, ev) === false) return false;
            var menu = this.get("menu");
            //到了子菜单中，高亮不要消失
            if (menu && menu.get("visible")
                &&
                (menu.get("view").get("el").contains(ev.relatedTarget)
                    || menu.get("view").get("el")[0] == ev.relatedTarget[0]
                    )
                ) return;
            this.set("highlighted", false);
        },

        _uiSetHighlighted:function(v) {
            SubMenu.superclass._uiSetHighlighted.call(this, v);
            if (!v) {
                var menu = this.get("menu");
                menu && menu.hide();
            }
        },

        bindUI:function() {
            var self = this,parentMenu = self.get("parent");
            //当改菜单项所属的菜单隐藏后，该菜单项关联的子菜单也要隐藏
            if (parentMenu) {
                parentMenu.on("hide", function() {
                    if (self.get("menu")) self.get("menu").hide();
                });

                var menu = this.get("menu");

                //子菜单选中后也要通知父级菜单
                //不能使用 afterSelectedItemChange ，多个 menu 嵌套，可能有缓存
                // 单个 menu 来看可能 selectedItem没有变化
                menu.on("menuItemSelected", function() {
                    parentMenu.set("selectedItem", menu.get("selectedItem"));
                    parentMenu.fire("menuItemSelected");
                });
            }
        },

        _handleMouseEnter:function() {
            if (SubMenu.superclass._handleMouseEnter.call(this) === false) return false;
            this._showSubMenu();
        },

        _showSubMenu:function() {
            var menu = this.get("menu");
            menu.set("align", {node:this.get("view").get("el"), points:['tr','tl']});
            menu.render();
            menu.show();
        },

        _hideSubMenu:function() {
            var menu = this.get("menu");
            menu && menu.hide();
        },


        _handleClick:function() {
            if (MenuItem.superclass._handleClick.call(this) === false) return false;
            //从键盘过来的，如果子菜单有高亮，则不要把自己当做选中项
            if (arguments.length == 0) {
                var menu = this.get("menu");
                if (menu && menu.get("visible") && menu.get("highlightedItem")) {
                    return;
                }
            }
            this._handleClickInternal();
        },

        _handleKeydown:function(e) {

            if (SubMenu.superclass._handleKeydown.call(this, e) === false) return false;

            if (e.keyCode == 27) {
                this._hideSubMenu();
                return;
            }

            var menu = this.get("menu");

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
            },

            view:{
                valueFn:function() {
                    return new SubMenuRender();
                }
            }
        }
    });
    return SubMenu;
}, {
    requires:['uibase','./menuitem','./submenurender']
});