KISSY.add("button/menubutton", function(S, UIBase, Button) {

    var MenuButton = UIBase.create(Button, [], {
        _hideMenu:function() {
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
                menu.set("align", {
                    node:el,
                    points:['bl',"tl"]
                });
                menu.show();
                view.set("collapsed", false);
            }
        },

        /**
         * @inheritDoc
         */
        _handleKeydown:function(e) {
            var menu = this.get("menu");
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
            var re = MenuButton.superclass._handleClick.call(this);
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
            menu:{}
        }
    });

    return MenuButton;
}, {
    requires:["uibase","./base"]
});