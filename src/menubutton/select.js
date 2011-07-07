/**
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
 **/