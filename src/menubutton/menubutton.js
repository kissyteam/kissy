/**
 * combination of menu and button ,similar to native select
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/menubutton", function(S, UIBase, Node, Button, MenuButtonRender, Menu) {
    var MenuButton = UIBase.create(Button, {

        hideMenu:function() {
            this.get("menu").hide();
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
                el.attr("aria-haspopup", menu.get("view").get("el").attr("id"));
                view.set("collapsed", false);
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
        },

        /**
         * @inheritDoc
         */
        _handleKeydown:function(e) {
            var menu = this.get("menu");
            //转发给 menu 处理
            if (menu && menu.get("visible")) {
                var handledByMenu = menu._handleKeydown(e);
                if (e.keyCode == 27) {
                    this.hideMenu();
                    return true;
                }
                return handledByMenu;
            }
            if (e.keyCode == 38 || e.keyCode == 40) {
                this.showMenu();
                return true;
            }
            return undefined;
        },

        /**
         * @inheritDoc
         */
        _handleBlur:function(e) {
            if (MenuButton.superclass._handleBlur.call(this, e)) {
                return true;
            }
            this.hideMenu();
        },

        /**
         * @inheritDoc
         */
        _handleClick:function(e) {
            if (Button.superclass._handleClick.call(this, e)) {
                return true;
            }
            var menu = this.get("menu");

            // 鼠标点击只是简单隐藏，显示切换
            if (e.type == 'click') {
                if (menu.get("visible")) {
                    // popup menu 监听 doc click ?
                    this.hideMenu();
                }
                else {
                    this.showMenu();
                }
            } else if (e.type == 'keydown') {
                // enter 转发给 menu 处理
                if (e.keyCode == 13) {
                    if (menu.get("visible")) {
                        menu._handleClick(e);
                    }
                } else if (e.keyCode == 32) {
                    // Prevent page scrolling in Chrome.
                    e.preventDefault();
                    // space 只负责打开
                    this.showMenu();
                }
            }
        },

        /**
         * Adds a new menu item at the end of the menu.
         * @param item Menu item to add to the menu.
         */
        addItem:function(item, index) {
            this.get("menu").addChild(item, index);
        },

        removeItem:function(c, destroy) {
            this.get("menu").removeChild(c, destroy);
        },

        removeItems:function(destroy) {
            this.get("menu").removeChildren(destroy);
        },

        getItemAt:function(index) {
            return this.get("menu").getChildAt(index);
        },

        destructor:function() {
            var menu = this.get("menu");
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
                valueFn:function() {
                    return new Menu.PopupMenu(S.mix({
                        prefixCls:this.get("prefixCls"),
                        parent:this
                    }, this.get("menuCfg")));
                },
                setter:function(v) {
                    v.set("parent", this);
                }
            }
        }
    });

    MenuButton.DefaultRender = MenuButtonRender;

    return MenuButton;
}, {
    requires:["uibase","node","button","./menubuttonrender","menu"]
});