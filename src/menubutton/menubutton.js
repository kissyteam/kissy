/**
 * combination of menu and button ,similar to native select
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/menubutton", function(S, UIBase, Node, Button, MenuButtonRender, Menu, Component) {
    var $ = Node.all;
    var MenuButton = UIBase.create(Button, {

        hideMenu:function() {
            this.get("menu") && this.get("menu").hide();
        },

        showMenu:function() {
            var self = this,
                view = self.get("view"),
                el = view.get("el"),
                menu = self.get("menu");
            if (!menu.get("visible")) {
                menu.set("align", S.mix({
                    node:el
                }, self.get("menuAlign")));
                menu.show();
                el.attr("aria-haspopup", menu.get("el").attr("id"));
                view.set("collapsed", false);
            }
        },


        _reposition:function() {
            var self = this,menu = self.get("menu"),el = self.get("el");
            if (menu && menu.get("visible")) {
                menu.set("align", S.mix({
                    node:el
                }, self.get("menuAlign")));
            }
        },

        bindUI:function() {
            var self = this,
                menu = this.get("menu");

            menu.on("afterActiveItemChange", function(ev) {
                self.set("activeItem", ev.newVal);
            });

            menu.on("click", function(e) {
                self.fire("click", {
                    target:e.target
                });
            });

            menu.on("hide", function() {
                self.get("view").set("collapsed", true);
            });

            //窗口改变大小，重新调整
            $(window).on("resize", self._reposition, self);
        },

        /**
         * @inheritDoc
         */
        _handleKeyEventInternal:function(e) {
            var menu = this.get("menu");

            // space 只在 keyup 时处理
            if (e.keyCode == 32) {
                // Prevent page scrolling in Chrome.
                e.preventDefault();
                if (e.type != "keyup") {
                    return undefined;
                }
            } else if (e.type != "keydown") {
                return undefined;
            }
            //转发给 menu 处理
            if (menu && menu.get("visible")) {
                var handledByMenu = menu._handleKeydown(e);
                // esc
                if (e.keyCode == 27) {
                    this.hideMenu();
                    return true;
                }
                return handledByMenu;
            }

            // Menu is closed, and the user hit the down/up/space key; open menu.
            if (e.keyCode == 38 || e.keyCode == 40 || e.keyCode == 32) {
                this.showMenu();
                return true;
            }
            return undefined;
        },

        _performInternal:function() {
            var menu = this.get("menu");
            if (menu.get("visible")) {
                // popup menu 监听 doc click ?
                this.hideMenu();
            }
            else {
                this.showMenu();
            }
        },

        /**
         * @inheritDoc
         */
        _handleBlur:function(e) {
            this.hideMenu();
        },

        /**
         * if no menu , then construct
         */
        getMenu:function() {
            var m = this.get("menu");
            if (!m) {
                m = new Menu.PopupMenu(S.mix({
                    prefixCls:this.get("prefixCls")
                }, this.get("menuCfg")));
                this.set("menu", m);
            }
            return m;
        },

        /**
         * Adds a new menu item at the end of the menu.
         * @param item Menu item to add to the menu.
         */
        addItem:function(item, index) {
            this.getMenu().addChild(item, index);
        },

        removeItem:function(c, destroy) {
            this.get("menu") && this.get("menu").removeChild(c, destroy);
        },

        removeItems:function(destroy) {
            this.get("menu") && this.get("menu").removeChildren(destroy);
        },

        getItemAt:function(index) {
            return this.get("menu") && this.get("menu").getChildAt(index);
        },

        // 禁用时关闭已显示菜单
        _uiSetDisabled:function(v) {
            var o = MenuButton.superclass._uiSetDisabled;
            o && o.apply(this, S.makeArray(arguments));
            !v && this.hideMenu();
        },

        // 找到下面有 popupmenu class 的元素，装饰为 PopupMenu 返回
        decorateInternal:function(el) {
            var self = this,
                ui = "popupmenu",
                prefixCls = self.get("prefixCls");
            self.set("el", el);
            var menuItem = el.one("." + self.getCls(ui));
            if (menuItem) {
                // child 必须等 render 时才会获得对应的 class，之前先 display:none 不占用空间
                menuItem.hide();
                var docBody = S.one(el[0].ownerDocument.body);
                docBody.prepend(menuItem);
                var UI = Component.UIStore.getUIByClass(ui);
                var menu = new UI({
                    srcNode:menuItem,
                    prefixCls:prefixCls
                });
                self.set("menu", menu);
            }
        },

        destructor:function() {
            var self = this, menu = self.get("menu");
            $(window).detach("resize", self._reposition, self);
            menu && menu.destroy();
        }

    }, {
        ATTRS:{
            activeItem:{
                view:true
            },
            menuAlign:{
                value:{
                    points:["bl","tl"],
                    overflow:{
                        failX:1,
                        failY:1,
                        adjustX:1,
                        adjustY:1
                    }
                }
            },
            // 不关心选中元素 , 由 select 负责
            // selectedItem
            menu:{
                setter:function(v) {
                    v.set("parent", this);
                }
            }
        },
        DefaultRender:MenuButtonRender
    });

    return MenuButton;
}, {
    requires:["uibase","node","button","./menubuttonrender","menu","component"]
});