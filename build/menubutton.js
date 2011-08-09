/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Aug 9 18:58
*/
/**
 * combination of menu and button ,similar to native select
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/menubutton", function(S, UIBase, Node, Button, MenuButtonRender, Menu, Component) {
    var $ = Node.all;
    var KeyCodes = Node.KeyCodes;
    var MenuButton = UIBase.create(Button, [Component.DecorateChild], {

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
            if (e.keyCode == KeyCodes.SPACE) {
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
                if (e.keyCode == KeyCodes.ESC) {
                    this.hideMenu();
                    return true;
                }
                return handledByMenu;
            }

            // Menu is closed, and the user hit the down/up/space key; open menu.
            if (e.keyCode == KeyCodes.SPACE ||
                e.keyCode == KeyCodes.DOWN ||
                e.keyCode == KeyCodes.UP) {
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
            MenuButton.superclass._handleBlur.call(this, e);
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

        decorateChildrenInternal:function(ui, el, cls) {
            el.hide();
            var docBody = S.one(el[0].ownerDocument.body);
            docBody.prepend(el);
            var menu = new ui({
                srcNode:el,
                prefixCls:cls
            });
            this.set("menu", menu);
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
            decorateChildCls:{
                value:"popupmenu"
            },
            // 不关心选中元素 , 由 select 负责
            // selectedItem
            menu:{
                setter:function(v) {
                    v.set("parent", this);
                }
            },
            collapsed:{
                value:true
            }
        },
        DefaultRender:MenuButtonRender
    });

    if (1 > 2) {
        MenuButton.getItemAt();
    }

    return MenuButton;
}, {
    requires:["uibase","node","button","./menubuttonrender","menu","component"]
});/**
 * render aria and drop arrow for menubutton
 * @author  yiminghe@gmail.com
 */
KISSY.add("menubutton/menubuttonrender", function(S, UIBase, Button) {

    var MENU_BUTTON_TMPL = '<div class="{prefixCls}inline-block ' +
        '{prefixCls}menu-button-caption">{content}<' + '/div>' +
        '<div class="{prefixCls}inline-block ' +
        '{prefixCls}menu-button-dropdown">&nbsp;<' + '/div>',
        CAPTION_CLS = "menu-button-caption",
        COLLAPSE_CLS = "menu-button-open";

    var MenuButtonRender = UIBase.create(Button.Render, {

        createDom:function() {
            var innerEl = this.get("innerEl"),
                html = S.substitute(MENU_BUTTON_TMPL, {
                    content:this.get("content") || "",
                    prefixCls:this.get("prefixCls")
                });
            innerEl
                .html(html)
                //带有 menu
                .attr("aria-haspopup", true);
        },

        _uiSetContent:function(v) {
            var caption = this.get("el").one("." + this.getCls(CAPTION_CLS));
            caption.html("");
            v && caption.append(v);
        },

        _uiSetCollapsed:function(v) {
            var el = this.get("el"),cls = this.getCls(COLLAPSE_CLS);
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
                (v && v.get("el").attr("id")) || "");
        }
    }, {
        ATTRS:{
            activeItem:{
            },
            collapsed:{
            }
        }
    });

    if (1 > 2) {
        MenuButtonRender._uiSetCollapsed();
    }

    return MenuButtonRender;
}, {
    requires:['uibase','button']
});/**
 * represent a menu option , just make it selectable and can have select status
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/option", function(S, UIBase, Component, Menu) {
    var MenuItem = Menu.Item;
    var Option = UIBase.create(MenuItem, {
        renderUI:function() {
            this.get("el").addClass(this.getCls("option"));
        }
    }, {
        ATTRS:{
            selectable:{
                value:true
            }
        }
    });
    Component.UIStore.setUIByClass("option", {
        priority:10,
        ui:Option
    });
    return Option;

}, {
    requires:['uibase','component','menu']
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
                this.get("menu").set("highlightedItem",
                    this.get("selectedItem") || this.get("menu").getChildAt(0));
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
            removeItems:function() {
                Select.superclass.removeItems.apply(this, arguments);
                this.set("selectedItem", null);
            },
            removeItem:function(c) {
                Select.superclass.removeItem.apply(this, arguments);
                if (c == this.get("selectedItem")) {
                    this.set("selectedItem", null);
                }
            },
            _uiSetSelectedItem:function(v, ev) {
                if (ev && ev.prevVal) {
                    ev.prevVal.set("selected", false);
                }
                this.updateCaption_();
            },
            _uiSetDefaultCaption:function() {
                this.updateCaption_();
            }
        },
        {
            ATTRS:{

                // 也是 selectedItem 的一个视图
                value :{
                    getter:function() {
                        var selectedItem = this.get("selectedItem");
                        return selectedItem && selectedItem.get("value");
                    },
                    setter:function(v) {
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
                        return null;
                    }
                },


                // @inheritedDoc  from button
                // content :{}

                selectedItem:{
                },

                // 只是 selectedItem 的一个视图，无状态
                selectedIndex:{
                    setter:function(index) {
                        var self = this,
                            children = self.get("menu").get("children");
                        if (index < 0 || index >= children.length) {
                            // 和原生保持一致
                            return -1;
                        }
                        self.set("selectedItem", children[index]);
                    },

                    getter:function() {
                        return S.indexOf(this.get("selectedItem"),
                            this.get("menu").get("children"));
                    }
                },

                defaultCaption:{
                    value:""
                }
            }
        }
    );

    if (1 > 2) {
        Select._uiSetDefaultCaption();
    }

    Select.decorate = function(element, cfg) {
        element = S.one(element);
        var optionMenu = new Menu.PopupMenu(S.mix({
            prefixCls:cfg.prefixCls
        }, cfg['menuCfg'])),
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

            select.on("afterSelectedItemChange", function(e) {
                if (e.newVal) {
                    input.val(e.newVal.get("value"));
                } else {
                    input.val("");
                }
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
