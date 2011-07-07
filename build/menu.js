/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: ${build.time}
*/
/**
 * menu model and controller for kissy,accommodate menu items
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menu", function(S, UIBase, Component, MenuRender) {

    var Menu;

    Menu = UIBase.create(Component.Container, [
        UIBase.Position,
        UIBase.Align
    ], {

        _uiSetHighlightedItem:function(v, ev) {
            var pre = ev && ev.prevVal;
            if (pre) {
                pre.set("highlighted", false);
            }
            v && v.set("highlighted", true);
            this.set("activeItem", v);
        },

        _handleBlur:function() {
            if (Menu.superclass._handleBlur.call(this) === false) {
                return false;
            }
            this.set("highlightedItem", null);
        },


        //dir : -1 ,+1
        //skip disabled items
        _getNextEnabledHighlighted:function(index, dir) {
            var children = this.get("children");
            if (children.length == 0) {
                return null;
            }
            if (!children[index].get("disabled")) {
                return children[index];
            }
            var o = index;
            index += dir;
            while (index != o) {
                if (!children[index].get("disabled")) {
                    return children[index];
                }
                index += dir;
                if (index == -1) {
                    index = children.length - 1;
                }
                else if (index == children.length) {
                    index = 0;
                }
            }
            return null;
        },

        _handleClick:function(e) {
            if (Menu.superclass._handleClick.call(this, e) === false)
                return false;
            var highlightedItem = this.get("highlightedItem");

            //先看当前活跃 menuitem 是否要处理
            if (highlightedItem) {
                if (highlightedItem._handleClick(e) === false) {
                    return false;
                }
            }
        },

        _handleKeydown:function(e) {

            if (Menu.superclass._handleKeydown.call(this, e) === false)
                return false;
             var highlightedItem = this.get("highlightedItem");

            //先看当前活跃 menuitem 是否要处理
            if (highlightedItem) {

                if (highlightedItem._handleKeydown(e) === false) {
                    return false;
                }
            }

            //自己这边只处理上下
            var children = this.get("children");
            if (children.length === 0) {
                return;
            }
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
            /**
             * 隐藏后，去掉高亮与当前
             */
            self.on("hide", function() {
                self.set("highlightedItem", null);
            });
        }
    }, {
        ATTRS:{
            /**
             * 当前高亮的儿子菜单项
             */
            highlightedItem:{},
            /**
             * 当前 active 的子孙菜单项，并不一直等于 highlightedItem
             */
            activeItem:{
                view:true
            }
        }
    });

    Menu.DefaultRender = MenuRender;
    return Menu;

}, {
    requires:['uibase','component','./menurender','./submenu']
});/**
 * menu item ,child component for menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitem", function(S, UIBase, Component, MenuItemRender) {
    var MenuItem = UIBase.create(Component.ModelControl, {

        _handleMouseEnter:function() {
            if (MenuItem.superclass._handleMouseEnter.call(this) === false) {
                return false;
            }
            this.get("parent").set("highlightedItem", this);
        },

        _handleMouseLeave:function() {
            if (MenuItem.superclass._handleMouseLeave.call(this) === false) {
                return false;
            }
            this.get("parent").set("highlightedItem", null);
        },

        _handleClick:function() {
            if (MenuItem.superclass._handleClick.call(this) === false) {
                return false;
            }
            // 可选
            if (this.get("selectable")) {
                this.set("selected", true);
            }
            // 可选中，取消选中
            if (this.get("checkable")) {
                this.set("checked", !this.get("checked"));
            }
            this.get("parent").fire("click", {
                // 使用熟悉的 target，而不是自造新词！
                target:this
            });
        }

    }, {
        ATTRS:{


            /**
             * 是否绑定鼠标事件
             * @override
             */
            handleMouseEvents:{
                value:false
            },

            /**
             * 是否支持焦点处理
             * @override
             */
            supportFocused:{
                value:false
            },

            selectable:{
                value:false,
                view:true
            },

            checkable:{
                value:false,
                view:true
            },

            // option.text
            content:{
                view:true,
                valueFn:function() {
                    return this.get("view") && this.get("view").get("content");
                }
            },

            // option.value
            value:{},
            highlighted:{
                view:true,
                value:false
            },
            checked:{
                value:false,
                view:true
            },
            selected:{
                view:true,
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
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitemrender", function(S, UIBase, Component) {


    var HIGHLIGHTED_CLS = "{prefixCls}menuitem-highlight",
        SELECTED_CLS = "{prefixCls}menuitem-selected",
        CHECKED_CLS = "{prefixCls}menuitem-checked",
        ACTIVE_CLS = "{prefixCls}menuitem-active",
        CONTENT_CLS = "{prefixCls}menuitem-content",
        EL_CLS = "{prefixCls}menuitem",
        DISABLED_CLS = "{prefixCls}menuitem-disabled";

    function getCls(self, str) {
        return S.substitute(str, {
            prefixCls:self.get("prefixCls")
        });
    }

    return UIBase.create(Component.Render, {
        renderUI:function() {
            var self = this,el = self.get("el");
            el.addClass(getCls(self, EL_CLS))
                .html("<div class='" + getCls(self, CONTENT_CLS) + "'>")
                .attr("role", "menuitem")
                .unselectable();
            if (!el.attr("id")) {
                el.attr("id", S.guid("ks-menuitem"));
            }
        },

        _uiSetContent:function(v) {
            var cs = this.get("el").children("div");
            cs.item(cs.length - 1).html(v);
        },

        _uiSetDisabled:function(v) {
            var el = this.get("el").attr("aria-disabled", !!v);
            if (v) {
                el.addClass(getCls(this, DISABLED_CLS));
            } else {
                el.removeClass(getCls(this, DISABLED_CLS));
            }
        },

        _uiSetHighlighted:function(v) {
            if (v) {
                this.get("el").addClass(getCls(this, HIGHLIGHTED_CLS));
            } else {
                this.get("el").removeClass(getCls(this, HIGHLIGHTED_CLS));
            }
        },

        _uiSetSelected:function(v) {
            var el = this.get("el");
            el[v ? "addClass" : "removeClass"](getCls(this, SELECTED_CLS));
        },

        _uiSetChecked:function(v) {
            var el = this.get("el");
            el[v ? "addClass" : "removeClass"](getCls(this, CHECKED_CLS));
        },

        _uiSetSelectable:function(v) {
            this.get("el").attr("role", v ? 'menuitemradio' : 'menuitem');
        },

        _uiSetCheckable:function(v) {
            this.get("el").attr("role", v ? 'menuitemcheckbox' : 'menuitem');
        },

        _handleMouseDown:function() {
            this.get("el").addClass(getCls(this, ACTIVE_CLS));
            this.get("el").attr("aria-pressed", true);
        },

        _handleMouseUp:function() {
            this.get("el").removeClass(getCls(this, ACTIVE_CLS));
            this.get("el").attr("aria-pressed", false);
        }
    }, {
        ATTRS:{
            highlighted:{},
            selected:{},
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
            } else {
                el.attr("aria-activedescendant", "");
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
});/**
 * submenu model and control for kissy , transfer item's keycode to menu
 * @author yiminghe@gmail.com
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

                var menu = this.get("menu"),relatedTarget = S.one(ev.relatedTarget)[0];
                //到了子菜单中，高亮不要消失
                if (menu && menu.get("visible")
                    &&
                    (menu.get("view").get("el").contains(relatedTarget)
                        || menu.get("view").get("el")[0] == relatedTarget
                        )
                    ) {
                } else {
                    this.get("parent").set("highlightedItem", null);
                    this.hideMenu();
                }

            },

            _uiSetHighlighted:function(v) {
                this.get("view").set("highlighted", v);
                if (!v) {
                    this.hideMenu();
                }
            },


            bindUI:function() {
                /**
                 * 自己不是 menu，自己只是 menuitem，其所属的 menu 为 get("parent")
                 */
                var self = this,
                    parentMenu = self.get("parent"),
                    menu = this.get("menu");

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
                    menu.on("click", function(ev) {
                        parentMenu.fire("click", {
                            target:ev.target
                        });
                    });

                    // 通知父级菜单
                    menu.on("afterActiveItemChange", function(ev) {
                        parentMenu.set("activeItem", ev.newVal);
                    });
                }
            },

            _handleMouseEnter:function() {
                if (SubMenu.superclass._handleMouseEnter.call(this) === false) {
                    return false;
                }
                this.showMenu();
            },

            showMenu:function() {
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

            hideMenu:function() {
                var menu = this.get("menu");
                menu && menu.hide();
            },

            _handleClick:function(ev) {
                var menu = this.get("menu");
                return  menu && menu.get("visible") && menu._handleClick(ev);
            },

            _handleKeydown:function(e) {

                if (SubMenu.superclass._handleKeydown.call(this, e) === false) {
                    return false;
                }

                var menu = this.get("menu");

                if (e.keyCode == 27) {
                    this.hideMenu();
                    return;
                }


                if (menu && menu.get("visible")) {
                    var ret = menu._handleKeydown(e);
                    if (ret === false) {
                        //父亲不要处理了
                        return false;
                    }
                }

                //父亲不要处理了
                //right
                if (e.keyCode == 39 && (!menu ||
                    !menu.get("visible"))) {
                    this.showMenu();
                    var menuChildren = menu.get("children");
                    if (menuChildren[0]) {
                        menu.set("highlightedItem", menuChildren[0]);
                    }
                    return false;
                }
                //left
                else if (e.keyCode == 37 && menu && menu.get("visible")) {
                    this.hideMenu();
                    this.get("parent").set("activeItem", this);
                    return false;
                }


            }

        }, {
            ATTRS:{
                menu:{}
            }
        });

        SubMenu.DefaultRender = SubMenuRender;
        return SubMenu;
    }, {
        requires:['uibase','component','./menuitem','./submenurender']
    });

/**

 **//**
 * submenu render for kissy ,extend menuitem render with arrow
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/submenurender", function(S, UIBase, MenuItemRender) {
        var SubMenuRender;
        var ARROW_TMPL = '<span class="{prefixCls}submenu-arrow">►</span>';
        SubMenuRender = UIBase.create(MenuItemRender, {
            renderUI:function() {
                this.get("el").addClass(this.get("prefixCls") + "submenu");
                this.get("el").attr("aria-haspopup", "true");
            },
            _uiSetContent:function(v) {
                this.get("el").one("." + this.get("prefixCls")
                    + "menuitem-content").html(v + S.substitute(ARROW_TMPL, {
                    prefixCls:this.get("prefixCls")
                }));
            }

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
