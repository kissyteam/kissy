/**
 * combination of menu and button ,similar to native select
 * @author:yiminghe@gmail.com
 */
KISSY.add("menubutton/menubutton", function(S, UIBase, Button, MenuButtonRender) {

    var MenuButton = UIBase.create(Button, {

        _hideMenu:function() {
            var self = this,
                view = self.get("view"),
                el = view.get("el");
            var menu = this.get("menu");
            menu.hide();
            this.get("view").set("collapsed", true);
        },

        _showMenu:function() {
            var self = this,
                view = self.get("view"),
                el = view.get("el");
            var menu = self.get("menu");
            if (!menu.get("visible")) {
                menu.set("align", {
                    node:el,
                    points:["bl","tl"]
                });
                menu.render();
                menu.show();
                view.set("collapsed", false);
            }
        },

        bindUI:function() {
            var self = this,
                menu = this.get("menu");

            menu.on("afterActiveItemChange", function(ev) {

                self.set("activeItem", ev.newVal);
            });
        },

        /**
         * @inheritDoc
         */
        _handleKeydown:function(e) {

            //不继承 button 的按钮设置，space , enter 都要留给 menu
            //if (MenuButton.superclass._handleKeydown.call(this, e) === false) {
            //    return false;
            //}

            var menu = this.get("menu");
            //转发给 menu 处理
            if (menu && menu.get("visible")) {
                menu._handleKeydown(e);
            }
            if (e.keyCode == 27) {
                e.preventDefault();
                this._hideMenu();
            } else if (e.keyCode == 38 || e.keyCode == 40) {
                if (!menu.get("visible")) {
                    e.preventDefault();
                    this._showMenu();
                }
            }
        },

        /**
         * @inheritDoc
         */
        _handleBlur:function() {
            var re = MenuButton.superclass._handleBlur.call(this);
            if (re === false) return re;
            this._hideMenu();
        },

        /**
         * @inheritDoc
         */
        _handleClick:function() {
            var re = MenuButton.superclass._handleClick.call(this);
            if (re === false) return re;
            var menu = this.get("menu");
            if (!menu.get("visible")) {
                this._showMenu();
            } else {
                this._hideMenu();
            }
        }
    }, {
        ATTRS:{
            activeItem:{
                view:true
            },
            menu:{
                setter:function(v) {
                    //menubutton 的 menu 不可以获得焦点
                    v.set("focusable", false);
                }
            }
        }
    });

    MenuButton.DefaultRender = MenuButtonRender;

    return MenuButton;
}, {
    requires:["uibase","button","./menubuttonrender"]
});