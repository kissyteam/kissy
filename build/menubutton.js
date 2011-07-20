/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Jul 20 19:11
*/
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
});/**
 * render aria and drop arrow for menubutton
 * @author: yiminghe@gmail.com
 */
KISSY.add("menubutton/menubuttonrender", function(S, UIBase, Button) {

    var MENU_BUTTON_TMPL = '<div class="{prefixCls}inline-block ' +
        '{prefixCls}menu-button-caption">{content}</div>' +
        '<div class="{prefixCls}inline-block ' +
        '{prefixCls}menu-button-dropdown">&nbsp;</div>',
        CAPTION_CLS = "{prefixCls}menu-button-caption",
        COLLAPSE_CLS = "{prefixCls}menu-button-open";

    function getCls(self, str) {
        return S.substitute(str, {
            prefixCls:self.get("prefixCls")
        });
    }


    return UIBase.create(Button.Render, {

        createDom:function() {
            var el = this.get("contentEl"),
                html = S.substitute(MENU_BUTTON_TMPL, {
                    content:this.get("content") || "",
                    prefixCls:this.get("prefixCls")
                });
            el.one("div")
                .html(html)
                //带有 menu
                .attr("aria-haspopup", true);
        },

        _uiSetContent:function(v) {
            var caption = this.get("el").one("." + getCls(this, CAPTION_CLS));
            caption.html("");
            caption.append(v);
        },

        _uiSetCollapsed:function(v) {
            var el = this.get("el"),cls = getCls(this, COLLAPSE_CLS);
            if (!v) {
                el.addClass(cls);
                el.attr("aria-expanded", true);
            } else {
                el.removeClass(cls);
                el.attr("aria-expanded", false);
            }
        },

        _uiSetActiveItem:function(v) {
            this.get("el").attr("aria-activedescendant",
                (v && v.get("view").get("el").attr("id")) || "");
        }
    }, {
        ATTRS:{
            activeItem:{
            },
            collapsed:{
                value:true
            }
        }
    });
}, {
    requires:['uibase','button']
});/**
 * represent a menu option , just make it selectable and can have select status
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/option", function(S, UIBase, Menu) {
    var MenuItem = Menu.Item;
    return UIBase.create(MenuItem, {
    }, {
        ATTRS:{
            selectable:{
                value:true
            }
        }
    });


}, {
    requires:['uibase','menu']
});/**
 * manage a list of single-select options
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/select", function(S, Node, UIBase, MenuButton, Menu, Option) {

    var Select = UIBase.create(MenuButton, {
            bindUI:function() {
                var self = this;
                self.on("click", self.handleMenuClick, self);
                self.get("menu").on("show", self._handleMenuShow, self)
            },
            /**
             *  different from menubutton by highlighting the currently selected option
             *  on open menu.
             */
            _handleMenuShow:function() {
                this.get("menu").set("highlightedItem", this.get("selectedItem") || this.get("menu").getChildAt(0));
            },
            updateCaption_:function() {
                var self = this;
                var item = self.get("selectedItem");
                self.set("content", item ? item.get("content") : self.get("defaultCaption"));
            },
            handleMenuClick:function(e) {
                var self = this;
                self.set("selectedItem", e.target);
                self.hideMenu();
            },
            _uiSetSelectedItem:function(v, ev) {
                if (ev && ev.prevVal) {
                    ev.prevVal.set("selected", false);
                }
                var self = this;
                self.set("value", v && v.get("value"));
                self.updateCaption_();
            },
            _uiSetDefaultCaption:function() {
                this.updateCaption_();
            },

            _uiSetValue:function(v) {
                var self = this;
                var children = self.get("menu").get("children");
                for (var i = 0; i < children.length; i++) {
                    var item = children[i];
                    if (item.get("value") == v) {
                        self.set("selectedItem", item);
                        return;
                    }
                }
                self.set("selectedItem", null);
            }
        },
        {
            ATTRS:{
                // @inheritedDoc  from button
                // value :{}


                // @inheritedDoc  from button
                // content :{}

                selectedItem:{
                },

                // 只是 selectedItem 的一个视图，无状态
                selectedIndex:{
                    setter:function(index) {
                        var self = this;
                        self.set("selectedItem", self.get("menu").getChildAt(index));
                    },

                    getter:function() {
                        return S.indexOf(this.get("selectedItem"), this.get("menu").get("children"));
                    }
                },

                defaultCaption:{
                }
            }
        }
    );


    Select.decorate = function(element, cfg) {
        element = S.one(element);
        var optionMenu = new Menu.PopupMenu(S.mix({
            prefixCls:cfg.prefixCls
        }, cfg.menuCfg)),
            selectedItem,
            curValue = element.val(),
            options = element.all("option");

        options.each(function(option) {
            var item = new Option({
                content:option.text(),
                prefixCls:cfg.prefixCls,
                value:option.val()
            });
            if (curValue == option.val()) {
                selectedItem = item;
            }
            optionMenu.addChild(item);
        });

        var select = new Select(S.mix({
            selectedItem:selectedItem,
            menu:optionMenu
        }, cfg));

        select.render();
        select.get("el").insertBefore(element);

        var name;

        if (name = element.attr("name")) {
            var input = new Node("<input type='hidden' name='" + name
                + "' value='" + curValue + "'>").insertBefore(element);

            optionMenu.on("click", function(e) {
                input.val(e.target.get("value"));
            });
        }
        element.remove();
        return select;
    };

    return Select;

}, {
    requires:['node','uibase','./menubutton','menu','./option']
});

/**
 * TODO
 *  how to emulate multiple ?
 **/KISSY.add("menubutton", function(S, MenuButton, MenuButtonRender, Select, Option) {
    MenuButton.Render = MenuButtonRender;
    MenuButton.Select = Select;
    MenuButton.Option = Option;
    return MenuButton;
}, {
    requires:['menubutton/menubutton',
        'menubutton/menubuttonrender',
        'menubutton/select',
        'menubutton/option']
});
