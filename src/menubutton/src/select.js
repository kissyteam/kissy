/**
 * @fileOverview manage a list of single-select options
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/select", function (S, Node, UIBase, Component, MenuButton, Menu, Option, undefined) {

    function getMenuChildren(self) {
        // 需要初始化 menu
        var m = self._getMenu(1);
        return m && m.get("children") || [];
    }


    var Select = UIBase.create(MenuButton, {

            /**
             * @protected
             */
            __bindMenu:function () {
                var self = this,
                    menu = self._getMenu();
                Select.superclass.__bindMenu.call(self);
                if (menu) {
                    menu.on("show", self._handleMenuShow, self);
                }
            },
            /**
             *  different from menubutton by highlighting the currently selected option
             *  on open menu.
             */
            _handleMenuShow:function () {
                var self = this, m = self.get("menu");
                m.set("highlightedItem", self.get("selectedItem") || m.getChildAt(0));
            },
            /**
             * @private
             */
            _updateCaption:function () {
                var self = this,
                    item = self.get("selectedItem");
                self.set("content", item ? item.get("content") : self.get("defaultCaption"));
            },
            _handleMenuClick:function (e) {
                var self = this;
                self.set("selectedItem", e.target);
                self.set("collapsed", true);
                Select.superclass._handleMenuClick.call(self, e);
            },

            removeItems:function () {
                var self = this;
                Select.superclass.removeItems.apply(self, arguments);
                self.set("selectedItem", null);
            },
            removeItem:function (c) {
                var self = this;
                Select.superclass.removeItem.apply(self, arguments);
                if (c == self.get("selectedItem")) {
                    self.set("selectedItem", null);
                }
            },
            _uiSetSelectedItem:function (v, ev) {
                if (ev && ev.prevVal) {
                    ev.prevVal.set("selected", false);
                }
                this._updateCaption();
            },
            _uiSetDefaultCaption:function () {
                this._updateCaption();
            }
        },
        {
            ATTRS:{

                // 也是 selectedItem 的一个视图
                value:{
                    getter:function () {
                        var selectedItem = this.get("selectedItem");
                        return selectedItem && selectedItem.get("value");
                    },
                    setter:function (v) {
                        var self = this,
                            children = getMenuChildren(self);
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
                    setter:function (index) {
                        var self = this,
                            children = getMenuChildren(self);
                        if (index < 0 || index >= children.length) {
                            // 和原生保持一致
                            return -1;
                        }
                        self.set("selectedItem", children[index]);
                    },

                    getter:function () {
                        return S.indexOf(this.get("selectedItem"),
                            getMenuChildren(this));
                    }
                },

                defaultCaption:{
                    value:""
                }
            }
        }
    );

    Select.decorate = function (element, cfg) {
        element = S.one(element);
        cfg = cfg || {};
        cfg.elBefore = element;

        var name,
            allItems = [],
            selectedItem = null,
            curValue = element.val(),
            options = element.all("option");

        S.mix(cfg, {
            menu:function () {
                var m = this.constructMenu();
                for (var i = 0; i < allItems.length; i++) {
                    m.addChild(new Option(allItems[i]));
                }
                return m;
            }
        });

        options.each(function (option) {
            var item = {
                content:option.text(),
                prefixCls:cfg.prefixCls,
                elCls:option.attr("class"),
                value:option.val()
            };
            if (curValue == option.val()) {
                selectedItem = {
                    content:item.content,
                    value:item.value
                };
            }
            allItems.push(item);
        });

        var select = new Select(S.mix(cfg, selectedItem));
        select.render();

        if (name = element.attr("name")) {
            var input = new Node("<input type='hidden' name='" + name
                + "' value='" + curValue + "'>").insertBefore(element, undefined);

            select.on("afterSelectedItemChange", function (e) {
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

    Component.UIStore.setUIByClass("select", {
        priority:Component.UIStore.PRIORITY.LEVEL3,
        ui:Select
    });


    if (1 > 2) {
        Select._uiSetDefaultCaption();
    }

    return Select;

}, {
    requires:['node', 'uibase', 'component', './base', 'menu', './option']
});

/**
 * TODO
 *  how to emulate multiple ?
 **/