/**
 * manage a list of single-select options
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/select", function (S, Node, MenuButton, Menu, Option, undefined) {

    function getSelectedItem(self) {
        var menu = self.get("menu"),
            cs = menu.children || menu.get && menu.get("children") || [],
            value = self.get("value"),
            c,
            i;
        for (i = 0; i < cs.length; i++) {
            c = cs[i];
            if (getItemValue(c) == value) {
                return c;
            }
        }
        return null;
    }

    // c: Option
    // c.get("value")
    // c: Object
    // c.value
    function getItemValue(c) {
        var v;
        if (c) {
            if (c.get) {
                if ((v = c.get("value")) === undefined) {
                    v = c.get("textContent") || c.get("content");
                }
            } else {
                if ((v = c.value) === undefined) {
                    v = c.textContent || c.content;
                }
            }
        }
        return v;
    }

    function deSelectAllExcept(self) {
        var menu = self.get("menu"),
            value = self.get("value"),
            cs = menu && menu.get && menu.get("children");
        S.each(cs, function (c) {
            if (c && c.set) {
                c.set("selected", getItemValue(c) == value)
            }
        });
    }

    /**
     *  different from menubutton by highlighting the currently selected option
     *  on open menu.
     */
    function _handleMenuShow(e) {
        var self = this,
            selectedItem = getSelectedItem(self),
            m = self.get("menu");
        if (e.target === m) {
            var item = selectedItem || m.getChildAt(0);
            if (item) {
                item.set('highlighted', true);
            }
            // 初始化选中
            if (selectedItem) {
                selectedItem.set("selected", true);
            }
        }
    }

    function _updateCaption(self) {
        var item = getSelectedItem(self),
            textContent = item && ( item.textContent || item.get && item.get("textContent")),
            content = item && (item.content || item.get && item.get('content'));
        // 可能设置到 select content 的内容并不和 menuitem 的内容完全一致
        self.set("content", textContent || content || self.get("defaultCaption"));
    }


    /**
     * Handle click on drop down menu.
     * Set selected menu item as current selectedItem and hide drop down menu.
     * Protected, should only be overridden by subclasses.
     * @protected
     *
     * @param {KISSY.Event.DOMEventObject} e
     */
    function handleMenuClick(e) {
        var self = this,
            target = e.target;
        if (target.isMenuItem) {
            var newValue = getItemValue(target),
                oldValue = self.get("value");
            self.set("value", newValue);
            if (newValue != oldValue) {
                self.fire("change", {
                    prevVal: oldValue,
                    newVal: newValue
                });
            }
        }
    }


    /**
     * @class
     * Select component which supports single selection from a drop down menu
     * with semantics similar to native HTML select.
     * xclass: 'select'.
     * @name Select
     * @member MenuButton
     * @extends MenuButton
     */
    var Select = MenuButton.extend(
        /**
         * @lends MenuButton.Select.prototype
         */
        {
            bindUI: function () {
                this.on("click", handleMenuClick, this);
                this.on('show', _handleMenuShow, this);
            },

            /**
             * Removes all menu items from current select, and set selectedItem to null.
             *
             */
            removeItems: function () {
                var self = this;
                Select.superclass.removeItems.apply(self, arguments);
                self.set("value", null);
            },

            /**
             * Remove specified item from current select.
             * If specified item is selectedItem, then set selectedItem to null.
             * @param c {KISSY.MenuButton.Option} Existing menu item.
             * @param [destroy=true] {Boolean} Whether destroy removed menu item.
             */
            removeItem: function (c,destroy) {
                var self = this;
                Select.superclass.removeItem.apply(self, arguments);
                if (c.get("value") == self.get("value")) {
                    self.set("value", null);
                }
            },

            _onSetValue: function () {
                var self = this;
                deSelectAllExcept(self);
                _updateCaption(self);
            },

            '_onSetDefaultCaption': function () {
                _updateCaption(this);
            }
        },
        {
            ATTRS: /**
             * @lends MenuButton.Select.prototype
             */
            {

                /**
                 * Get current select 's value.
                 */
                value: {
                },

                /**
                 * Default caption to be shown when no option is selected.
                 * @type {String}
                 */
                defaultCaption: {
                    value: ""
                },

                collapseOnClick: {
                    value: true
                }
            },

            /**
             * Generate a select component from native select element.
             * @param {HTMLElement} element Native html select element.
             * @param {Object} cfg Extra configuration for current select component.
             * @member MenuButton.Select
             */
            decorate: function (element, cfg) {
                element = S.one(element);
                cfg = cfg || {};
                cfg.elBefore = element;

                var name,
                    allItems = [],
                    select,
                    selectedItem = null,
                    curValue = element.val(),
                    options = element.all("option");

                options.each(function (option) {
                    var item = {
                        xclass: 'option',
                        content: option.text(),
                        elCls: option.attr("class"),
                        value: option.val()
                    };
                    if (curValue == option.val()) {
                        selectedItem = {
                            content: item.content,
                            value: item.value
                        };
                    }
                    allItems.push(item);
                });

                S.mix(cfg, {
                    menu: S.mix({
                        children: allItems
                    }, cfg.menuCfg)
                });

                delete cfg.menuCfg;

                select = new Select(S.mix(cfg, selectedItem)).render();

                if (name = element.attr("name")) {
                    var input = new Node("<input" +
                        " type='hidden'" +
                        " name='" + name
                        + "' value='" + curValue + "'>")
                        .insertBefore(element, undefined);

                    select.on("afterValueChange", function (e) {
                        input.val(e.newVal || "");
                    });
                }

                element.remove();
                return select;
            }

        }, {
            xclass: 'select',
            priority: 30
        });

    return Select;

}, {
    requires: ['node', './base', 'menu', './option']
});

/**
 * TODO
 *  how to emulate multiple ?
 **/