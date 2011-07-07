/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: ${build.time}
*/
/**
 * combination of menu and button ,similar to native select
 * @author:yiminghe@gmail.com
 */
KISSY.add("menubutton/menubutton", function(S, UIBase, Node, Button, MenuButtonRender) {

    var MenuButton = UIBase.create(Button, {

        hideMenu:function() {
            var self = this,
                view = self.get("view"),
                el = view.get("el"),
                menu = this.get("menu");
            menu.hide();
            self.get("view").set("collapsed", true);
        },

        showMenu:function() {
            var self = this,
                view = self.get("view"),
                el = view.get("el"),
                menu = self.get("menu");
            if (!menu.get("visible")) {
                menu.set("align", {
                    node:el,
                    points:["bl","tl"]
                });
                menu.show();
                el.attr("aria-haspopup", menu.get("view").get("el").attr("id"));
                view.set("collapsed", false);
            }
        },

        bindUI:function() {
            var self = this,
                menu = this.get("menu");

            menu.on("afterActiveItemChange", function(ev) {
                //S.log("active : " + ( ev.newVal && ev.newVal.get("content") || ""));
                self.set("activeItem", ev.newVal);
            });

            menu.on("click", function(e) {
                self.fire("click", {
                    target:e.target
                });
            });
        },

        /**
         * @inheritDoc
         */
        _handleKeydown:function(e) {

            var menu = this.get("menu");
            //转发给 menu 处理
            if (menu && menu.get("visible")) {
                if (menu._handleKeydown(e) === false) {
                    return false;
                }
            }
            if (e.keyCode == 27) {
                e.preventDefault();
                this.hideMenu();
            } else if (e.keyCode == 38 || e.keyCode == 40) {
                if (!menu.get("visible")) {
                    e.preventDefault();
                    this.showMenu();
                }
            }
        },

        /**
         * @inheritDoc
         */
        _handleBlur:function() {
            var re = MenuButton.superclass._handleBlur.call(this);
            if (re === false) return re;
            this.hideMenu();
        },

        /**
         * @inheritDoc
         */
        _handleClick:function(e) {
            var re = Button.superclass._handleClick.call(this);
            if (re === false) {
                return re;
            }
            var menu = this.get("menu");

            // 鼠标点击只是简单隐藏，显示切换
            if (e.type == 'click') {
                if (menu.get("visible")) {
                    this.hideMenu();
                } else {
                    this.showMenu();
                }
            } else if (e.type == 'keydown') {
                // enter 转发给 menu 处理
                if (e.keyCode == 13) {
                    if (menu.get("visible")) {
                        menu._handleClick(e);
                    }
                } else if (e.keyCode == 32) {
                    // space 只负责打开
                    this.showMenu();
                }
            }
        }

    }, {
        ATTRS:{
            activeItem:{
                view:true
            },
            // 不关心选中元素 , 由 select 负责
            // selectedItem
            menu:{}
        }
    });

    MenuButton.DefaultRender = MenuButtonRender;

    return MenuButton;
}, {
    requires:["uibase","node","button","./menubuttonrender"]
});/**
 * render aria and drop arrow for menubutton
 * @author: yiminghe@gmail.com
 */
KISSY.add("menubutton/menubuttonrender", function(S, UIBase, Button) {

    var MENU_BUTTON_TMPL = '<div class="{prefixCls}inline-block {prefixCls}menu-button-caption"></div>' +
        '<div class="{prefixCls}inline-block {prefixCls}menu-button-dropdown">&nbsp;</div>';

    return UIBase.create(Button.Render, {
        renderUI:function() {
            var el = this.get("el");
            el.one("div").one("div").html(S.substitute(MENU_BUTTON_TMPL, {
                prefixCls:this.get("prefixCls")
            }));
            //带有 menu
            el.attr("aria-haspopup", true);
        },

        _uiSetContent:function(v) {
            if (v == undefined) return;
            this.get("el").one("." + this.get("prefixCls") + "menu-button-caption").html(v);
        },

        _uiSetCollapsed:function(v) {
            var el = this.get("el"),prefixCls = this.get("prefixCls") + "menu-button";
            if (!v) {
                el.addClass(prefixCls + "menu-button-open");
                el.attr("aria-expanded", true);
            } else {
                el.removeClass(prefixCls + "menu-button-open");
                el.attr("aria-expanded", false);
            }
        },

        _uiSetActiveItem:function(v) {
            //S.log("button set aria " + (v && v.get("view").get("el").attr("id")) || "");
            this.get("el").attr("aria-activedescendant", (v && v.get("view").get("el").attr("id")) || "");
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
KISSY.add("menubutton/option", function(S, UIBase, MenuItem) {

    return UIBase.create(MenuItem, {
    }, {
        ATTRS:{
            selectable:{
                value:true
            }
        }
    });


}, {
    requires:['uibase','menu/menuitem']
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
        var optionMenu = new Menu(S.mix({
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

        var select = new Select({
            selectedItem:selectedItem,
            menu:optionMenu,
            defaultCaption:cfg.defaultCaption,
            prefixCls:cfg.prefixCls,
            autoRender:true
        });

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
    requires:['node','uibase','./menubutton','menu/menu','./option']
});

/**
 * TODO
 *  how to emulate multiple ?
 **/KISSY.add("menubutton", function(S, MenuButton, MenuButtonRender, Select) {
    MenuButton.Render = MenuButtonRender;
    MenuButton.Select = Select;
    return MenuButton;
}, {
    requires:['menubutton/menubutton','menubutton/menubuttonrender','menubutton/select']
});
