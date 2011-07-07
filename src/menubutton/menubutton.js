/**
 * combination of menu and button ,similar to native select
 * @author yiminghe@gmail.com
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
                if (menu._handleKeydown(e) === true) {
                    return true;
                }
            }
            if (e.keyCode == 27) {
                this.hideMenu();
            } else if (e.keyCode == 38 || e.keyCode == 40) {
                if (!menu.get("visible")) {
                    this.showMenu();
                }
            }
        },

        /**
         * @inheritDoc
         */
        _handleBlur:function(e) {
            var ret = MenuButton.superclass._handleBlur.call(this,e);
            if (ret === true) {
                return ret;
            }
            this.hideMenu();
        },

        /**
         * @inheritDoc
         */
        _handleClick:function(e) {
            var re = Button.superclass._handleClick.call(this,e);
            if (re === true) {
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
});