/**
 * combination of menu and button ,similar to native select
 * @author:yiminghe@gmail.com
 */
KISSY.add("menubutton/menubutton", function(S, UIBase, Button) {

    var MenuButton = UIBase.create(Button, [], {

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
                menu.render();
                menu.get("view").set("align", {
                    node:el,
                    points:['bl',"tl"]
                });
                menu.show();
                view.set("collapsed", false);
            }
        },

        bindUI:function() {
            var self = this,
                el = self.get("view").get("el"),
                menu = this.get("menu");
            menu.on("afterSelectedItemChange", function(ev) {
                self.set("selectedItem", ev.newVal);
            });

            menu.on("menuItemSelected", function() {
                if (self.get("selectedItem")) self.fire("menuItemSelected");
            });

            menu.on("afterHighlightedItemChange", function(ev) {
                //等 menuitem 自己搞好了id再执行
                setTimeout(function() {
                    if (ev.newVal) {
                        el.attr("aria-activedescendant", ev.newVal.get("view").get("el").attr("id"));
                    } else {
                        el.attr("aria-activedescendant", " ");
                    }
                }, 0);
            });
        },

        /**
         * @inheritDoc
         */
        _handleKeydown:function(e) {

            var re = MenuButton.superclass._handleKeydown.call(this, e);
            if (re === false) return re;
            var menu = this.get("menu");
            //转发给 menu 处理
            menu._handleKeydown(e);
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

            selectedItem:{
                valueFn:function() {
                    return this.get("menu").get("selectedItem");
                }
            },

            menu:{
                setter:function(v) {
                    //menubutton 的 menu 不可以获得焦点
                    v.on("afterRenderUI", function() {
                        v.set("focusable", false);
                        v.get("view").get("el").attr("onmousedown", "return false;");
                    });
                }
            }
        }
    });

    return MenuButton;
}, {
    requires:["uibase","button"]
});