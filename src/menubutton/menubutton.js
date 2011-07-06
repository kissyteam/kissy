/**
 * combination of menu and button ,similar to native select
 * @author:yiminghe@gmail.com
 */
KISSY.add("menubutton/menubutton", function(S, UIBase, Node, Button, MenuButtonRender, Menu) {

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
                    S.log("active : " + ( ev.newVal && ev.newVal.get("content") || ""));
                    self.set("activeItem", ev.newVal);
                });

                menu.on("afterSelectedItemChange", function(ev) {
                    self.set("selectedItem", ev.newVal);
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
                        //e.keyCode = 40;
                        menu._handleKeydown(e);
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
                //转发给 menu 处理
                if (menu && menu.get("visible")) {
                    menu._handleClick(e);
                } else {
                    this.showMenu();
                }
                this.fire("select");
            }

        }, {
            ATTRS:{
                activeItem:{
                    view:true
                },
                selectedItem:{},
                menu:{}
            }
        });

        MenuButton.decorateSelect = function(select, cfg) {
            cfg = cfg || {};
            select = S.one(select);

            var optionMenu = new Menu({
                prefixCls:cfg.prefixCls
            }),
                curCurContent,
                curValue = select.val(),
                options = select.all("option");

            options.each(function(option) {
                if (curValue == option.val()) {
                    curCurContent = option.text();
                }

                optionMenu.addChild(new Menu.Item({
                    content:option.text(),
                    prefixCls:cfg.prefixCls,
                    value:option.val()
                }));
            });

            var menuButton = new MenuButton({
                content:curCurContent,
                describedby:"describe",
                menu:optionMenu,
                prefixCls:cfg.prefixCls,
                autoRender:true
            });

            menuButton.get("el").insertBefore(select);

            var input = new Node("<input type='hidden' name='" + select.getDOMNode().name
                + "' value='" + curValue + "'>").insertBefore(select);

            optionMenu.on("afterSelectedItemChange", function(e) {
                input.val(e.newVal.get("value"));
                menuButton.set("content", e.newVal.get("content"));
                optionMenu.hide();
            });

            select.remove();
            return menuButton;
        };

        MenuButton.DefaultRender = MenuButtonRender;

        return MenuButton;
    },
    {
        requires:["uibase","node","button","./menubuttonrender","menu"]
    }
)
    ;