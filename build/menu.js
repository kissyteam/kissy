/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: ${build.time}
*/
/**
 * menu model and controller for kissy,accommodate menu items
 * @author:yiminghe@gmail.com
 */
KISSY.add("menu/menu", function(S, UIBase, Component, MenuRender) {

    var Menu;

    Menu = UIBase.create(Component.ModelControl, [
        UIBase.Position,
        UIBase.Align
    ], {

        _bindMenuItem:function(menuItem) {
            var self = this;
            menuItem.on("afterSelectedChange", function(ev) {
                if (!ev.newVal) return;
                self.set("selectedItem", this);
            });

            menuItem.on("afterHighlightedChange", function(ev) {
                if (!ev.newVal) return;
                self.set("highlightedItem", this);
            });

            menuItem.on("menuItemSelected", function() {
                self.fire("menuItemSelected");
            });
        },

        //清楚上一个选择 menuitem 的选中状态
        _uiSetSelectedItem:function(item, ev) {
            if (ev.prevVal) {
                //不触发事件，避免再被 menuitem 捕获死循环 ??
                //afterSelectedChange 已经只监控选中了
                ev.prevVal.set("selected", false);
            }
            item.set("selected", true);
        },

        _uiSetHighlightedItem:function(v, ev) {
            if (ev && ev.prevVal) {
                ev.prevVal.set("highlighted", false);
            }
            v && v.set("highlighted", true);
            this.get("view").set("highlightedItem", v);
        },
        _handleBlur:function() {
            if (Menu.superclass._handleBlur.call(this) === false) return false;
            this.set("highlightedItem", null);
        },


        //dir : -1 ,+1
        //skip disabled items
        _getNextEnabledHighlighted:function(index, dir) {
            var children = this.get("children");
            if (children.length == 0)return null;
            if (!children[index].get("disabled")) return children[index];
            var o = index;
            index += dir;
            while (index != o) {
                if (!children[index].get("disabled")) return children[index];
                index += dir;
                if (index == -1) index = children.length - 1;
                else if (index == children.length) index = 0;
            }
            return null;
        },

        _handleKeydown:function(e) {

            if (Menu.superclass._handleKeydown.call(this, e) === false)
                return false;
            var highlightedItem = this.get("highlightedItem");

            //先看当前活跃 menuitem 是否要处理
            if (highlightedItem && highlightedItem._handleKeydown) {
                if (highlightedItem._handleKeydown(e) === false) return false;
            }

            //自己这边只处理上下
            var children = this.get("children");
            if (children.length === 0) return;
            var index,destIndex;

            //up
            if (e.keyCode == 38) {
                if (!highlightedItem) {
                    this.set("highlightedItem", this._getNextEnabledHighlighted(children.length - 1, -1));
                } else {
                    index = S.indexOf(highlightedItem, children);
                    destIndex = index == 0 ? children.length - 1 : index - 1;
                    this.set("highlightedItem", this._getNextEnabledHighlighted(destIndex, -1));
                }
                e.preventDefault();
                //自己处理了，嵌套菜单情况
                return false;
            }
            //down
            else if (e.keyCode == 40) {
                if (!highlightedItem) {
                    this.set("highlightedItem", this._getNextEnabledHighlighted(0, 1));
                } else {
                    index = S.indexOf(highlightedItem, children);
                    destIndex = index == children.length - 1 ? 0 : index + 1;
                    this.set("highlightedItem", this._getNextEnabledHighlighted(destIndex, 1));
                }
                e.preventDefault();
                //自己处理了，不要向上处理，嵌套菜单情况
                return false;
            }
        },

        bindUI:function() {
            var self = this;
            S.each(this.get("children"), function(c) {
                self._bindMenuItem(c);
            });
        },

        _uiSetFocusable:function(v) {

            this.get("view").set("focusable", v);
        }
    }, {
        ATTRS:{
            highlightedItem:{},
            selectedItem:{},
            focusable:{
                //默认可以获得焦点
                value:true
            }
        }
    });

    Menu.DefaultRender = MenuRender;
    return Menu;

}, {
    requires:['uibase','component','./menurender']
});/**
 * menu item ,child component for menu
 * @author:yiminghe@gmail.com
 */
KISSY.add("menu/menuitem", function(S, UIBase, Component, MenuItemRender) {
    var MenuItem = UIBase.create(Component.ModelControl,{
        _uiSetHighlighted:function(v) {
            this.get("view").set("highlighted", v);
        },
        _uiSetSelected:function(v) {
            this.get("view").set("selected", v);
        },
        _uiSetContent:function(v) {
            this.get("view").set("content", v);
        },

        _handleMouseEnter:function() {
            if (MenuItem.superclass._handleMouseEnter.call(this) === false) return false;
            this.set("highlighted", true);
        },

        _handleMouseLeave:function() {
            if (MenuItem.superclass._handleMouseLeave.call(this) === false) return false;
            this.set("highlighted", false);
        },

        _handleClickInternal:function() {
            this.set("selected", true);
            this.fire("menuItemSelected");
        },
        _handleClick:function() {
            if (MenuItem.superclass._handleClick.call(this) === false) return false;
            this._handleClickInternal.apply(this, arguments);
        }
    }, {
        ATTRS:{
            content:{},
            highlighted:{
                value:false
            },
            selected:{
                value:false
            }
        }
    });

    MenuItem.DefaultRender = MenuItemRender;
    
    return MenuItem;
}, {
    requires:['uibase','component','./menuitemrender']
});/**
 * simple menuitem render
 * @author:yiminghe@gmail.com
 */
KISSY.add("menu/menuitemrender", function(S, UIBase, Component) {
    return UIBase.create(Component.Render, {
        renderUI:function() {
            this.get("el").html("<div class='" + this.get("prefixCls") + "menuitem-content" + "'>")
            this.get("el").attr("role", "menuitem");
            this.get("el").unselectable();
        },

        _uiSetContent:function(v) {
            var cs = this.get("el").children("div");
            cs.item(cs.length - 1).html(v);
        },

        _uiSetDisabled:function(v) {

            var el = this.get("el");
            if (v) {
                el.addClass(this.get("prefixCls") + "menuitem-disabled");
            } else {
                el.removeClass(this.get("prefixCls") + "menuitem-disabled");
            }
            el.attr("aria-disabled", !!v);
        },

        _uiSetHighlighted:function(v) {
            if (v) {
                this.get("el").addClass(this.get("prefixCls") + "menuitem-highlight");
            } else {
                this.get("el").removeClass(this.get("prefixCls") + "menuitem-highlight");
            }
        },

        _handleMouseDown:function() {
            this.get("el").addClass(this.get("prefixCls") + "menuitem-active");
            this.get("el").attr("aria-pressed", true);
        },

        _handleMouseUp:function() {
            this.get("el").removeClass(this.get("prefixCls") + "menuitem-active");
            this.get("el").attr("aria-pressed", false);
        },

        //支持按钮，默认按键 space ，enter 映射到 model and view handleClick
        _handleKeydown:function() {
        }
    }, {
        ATTRS:{
            elCls:{
                valueFn:function(v) {
                    return this.get("prefixCls") + "menuitem";
                }
            },
            highlighted:{},
            prefixCls:{
                value:"goog-"
            },
            content:{}
        },
        HTML_PARSER:{
            content:function(el) {
                return el.html();
            }
        }
    });
}, {
    requires:['uibase','component']
});/**
 * render aria from menu according to current menuitem
 * @author:yiminghe@gmail.com
 */
KISSY.add("menu/menurender", function(S, UA, UIBase, Component) {
    var MenuRender = UIBase.create(Component.Render, [

        UIBase.Contentbox.Render,
        UIBase.Position.Render,
        UA['ie'] === 6 ? UIBase.Shim.Render : null
    ], {

        renderUI:function() {
            var el = this.get("el");
            el.attr("role", "menu");
            el.attr("aria-haspopup", true);
        },

        _uiSetHighlightedItem:function(v) {

            var el = this.get("el");
            if (v) {
                var menuItemEl = v.get("view").get("el"),
                    id = menuItemEl.attr("id");
                if (!id) {
                    menuItemEl.attr("id", id = S.guid("ks-menuitem"));
                }
                el.attr("aria-activedescendant", id);
            } else {
                el.attr("aria-activedescendant", " ");
            }
        },

        _uiSetDisabled:function(v) {
            if (this.get("focusable")) {
                //接受键盘焦点
                this.get("el").attr("tabindex", v ? -1 : 0);
            }
        },

        _uiSetFocusable:function(v) {
            if (!this.get("disabled")) {
                
                if (v) {
                } else {
                    this.get("el").unselectable();
                    this.get("el").attr("onmousedown", "return false;");
                }
            }
        },

        /**
         * just a tag
         * allow keydown
         */
        _handleKeydown:function() {

        }

    }, {
        ATTRS:{
            highlightedItem:{},
            elCls:{
                valueFn:function() {
                    return this.get("prefixCls") + "menu "
                        + this.get("prefixCls") + "menu-vertical";
                }
            },
            prefixCls:{
                value:"goog-"
            },
            focusable:{
                value:true
            }
        }
    });
    return MenuRender;
}, {
    requires:['ua','uibase','component']
});/**
 * submenu model and control for kissy , transfer item's keycode to menu
 * @author:yiminghe@gmail.com
 */
KISSY.add("menu/submenu", function(S, UIBase, MenuItem, SubMenuRender) {
    var SubMenu;
    SubMenu = UIBase.create(MenuItem,  {
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
            var self = this,
                parentMenu = self.get("parent");

            var menu = this.get("menu");

            //当改菜单项所属的菜单隐藏后，该菜单项关联的子菜单也要隐藏
            if (parentMenu) {
                parentMenu.on("hide", function() {
                    if (self.get("menu")) self.get("menu").hide();
                });

                // 子菜单选中后也要通知父级菜单
                // 不能使用 afterSelectedItemChange ，多个 menu 嵌套，可能有缓存
                // 单个 menu 来看可能 selectedItem没有变化
                menu.on("menuItemSelected", function() {
                    parentMenu.set("selectedItem", menu.get("selectedItem"));
                    parentMenu.fire("menuItemSelected");
                });

                //纯表现层的事情
                menu.get("view").on("afterHighlightedItemChange", function(ev) {
                    parentMenu.get("view").set("highlightedItem", ev.newVal);
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
    requires:['uibase','./menuitem','./submenurender']
});/**
 * submenu render for kissy ,extend menuitem render with arrow
 * @author:yiminghe@gmail.com
 */
KISSY.add("menu/submenurender", function(S, UIBase, MenuItemRender) {
    var SubMenuRender;
    var ARROW_TMPL = '<span class="{prefixCls}submenu-arrow">►</span>';
    SubMenuRender = UIBase.create(MenuItemRender,  {
        renderUI:function() {
            this.get("el").addClass(this.get("prefixCls") + "submenu");
        },
        _uiSetContent:function(v) {

            this.get("el").one("." + this.get("prefixCls")
                + "menuitem-content").html(v + S.substitute(ARROW_TMPL, {
                prefixCls:this.get("prefixCls")
            }));
        }

    },
    {

    });
    return SubMenuRender;
},
{
    requires:['uibase','./menuitemrender']
});KISSY.add("menu", function(S, Menu, Render, Item, ItemRender, SubMenu, SubMenuRender) {
    Menu.Render = Render;
    Menu.Item = Item;
    Menu.Item.Render = ItemRender;
    Menu.SubMenu = SubMenu;
    SubMenu.Render = SubMenuRender;
    return Menu;
}, {
    requires:[
        'menu/menu',
        'menu/menurender',
        'menu/menuitem',
        'menu/menuitemrender',
        'menu/submenu',
        'menu/submenurender'
    ]
});
