/**
 * @fileOverview manage a list of single-select options
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/select", function (S, Node, MenuButton, Menu, Option, undefined) {

    function getMenuChildren(self) {
        // 需要初始化 menu
        var m = self.getMenu(1);
        return m && m.get("children") || [];
    }

    /**
     * Select component which supports single selection from a drop down menu
     * with semantics similar to native HTML select.
     * @class
     * @name Select
     * @memberOf MenuButton
     * @extends MenuButton
     */
    var Select = MenuButton.extend(
        /**
         * @lends MenuButton.Select.prototype
         */
        {

            /**
             * Bind menu to current Select. When menu shows, set highlightedItem to current selectedItem.
             * @protected
             */
            bindMenu:function () {
                var self = this,
                    menu = self.getMenu();
                Select.superclass.bindMenu.call(self);
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

            _updateCaption:function () {
                var self = this,
                    item = self.get("selectedItem");
                self.set("html", item ? item.get("html") : self.get("defaultCaption"));
            },

            /**
             * Handle click on drop down menu.
             * Set selected menu item as current selectedItem and hide drop down menu.
             * Protected, should only be overridden by subclasses.
             * @protected
             * @override
             * @param {Event.Object} e
             */
            handleMenuClick:function (e) {
                var self = this;
                self.set("selectedItem", e.target);
                self.set("collapsed", true);
                Select.superclass.handleMenuClick.call(self, e);
            },

            /**
             * Removes all menu items from current select, and set selectedItem to null.
             * @override
             */
            removeItems:function () {
                var self = this;
                Select.superclass.removeItems.apply(self, arguments);
                self.set("selectedItem", null);
            },

            /**
             * Remove specified item from current select.
             * If specified item is selectedItem, then set selectedItem to null.
             * @override
             */
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
            ATTRS:/**
             * @lends MenuButton.Select.prototype
             */
            {

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

                /**
                 * Selected option of current select component.
                 * @type MenuButton.Option
                 */
                selectedItem:{
                },

                // 只是 selectedItem 的一个视图，无状态
                /**
                 * SelectedIndex of current select component.
                 * @type Number
                 */
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

                /**
                 * Default caption to be shown when no option is selected.
                 * @type String
                 */
                defaultCaption:{
                    value:""
                }
            },

            /**
             * Generate a select component from native select element.
             * @param {HTMLElement} element Native html select element.
             * @param {Object} cfg Extra configuration for current select component.
             * @memberOf MenuButton.Select
             */
            decorate:function (element, cfg) {
                element = S.one(element);
                cfg = cfg || {};
                cfg.elBefore = element;

                var name,
                    allItems = [],
                    selectedItem = null,
                    curValue = element.val(),
                    options = element.all("option");

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

                S.mix(cfg, {
                    menu:function () {
                        var m = new Menu.PopupMenu(S.mix({
                            prefixCls:this.get("prefixCls")
                        }, this.get("menuCfg")));
                        for (var i = 0; i < allItems.length; i++) {
                            m.addChild(new Option(allItems[i]));
                        }
                        return m;
                    }
                });

                var select = new Select(S.mix(cfg, selectedItem));

                select.render();

                if (name = element.attr("name")) {
                    var input = new Node("<input" +
                        " type='hidden'" +
                        " name='" + name
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
            }

        }, {
            xclass:'select',
            priority:30
        });

    return Select;

}, {
    requires:['node', './base', 'menu', './option']
});

/**
 * TODO
 *  how to emulate multiple ?
 **/