/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 2 10:13
*/
/**
 * @fileOverview combination of menu and button ,similar to native select
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/base", function (S, UIBase, Node, Button, MenuButtonRender, Menu, Component, undefined) {

    var win = S.Env.host;

    function getMenu(self, init) {
        var m = self.get("menu");
        if (S.isFunction(m)) {
            if (init) {
                m = m.call(self);
                self.__set("menu", m);
            } else {
                return null;
            }
        }
        if (m && m.get("parent") !== self) {
            m.__set("parent", self);
            self.bindMenu();
        }
        return m;
    }

    function constructMenu(self) {
        var m = new Menu.PopupMenu(S.mix({
            prefixCls:self.get("prefixCls")
        }, self.get("menuCfg")));
        self.__set("menu", m);
        self.bindMenu();
        return m;
    }

    function reposition() {
        var self = this,
            menu = getMenu(self);
        if (menu &&
            menu.get("visible")) {
            menu.set("align", S.merge({
                node:self.get("el")
            }, ALIGN, self.get("menuAlign")));
        }
    }

    function hideMenu(self) {
        var menu = getMenu(self);
        if (menu) {
            menu.hide();
        }
    }

    function showMenu(self) {
        var el = self.get("el"),
            menu = getMenu(self, 1);
        if (menu && !menu.get("visible")) {
            menu.set("align", S.merge({
                node:el
            }, ALIGN, self.get("menuAlign")));
            menu.show();
            el.attr("aria-haspopup", menu.get("el").attr("id"));
        }
    }

    var $ = Node.all,
        KeyCodes = Node.KeyCodes,
        ALIGN = {
            points:["bl", "tl"],
            overflow:{
                adjustX:1,
                adjustY:1
            }
        };
    /**
     * A menu button component, consist of a button and a drop down popup menu.
     * @class
     * @name MenuButton
     * @extends Button
     */
    var MenuButton = UIBase.create(Button, [Component.DecorateChild],
        /**
         * @lends MenuButton.prototype
         */
        {

            /**
             * Get menu from attribute consider function type.
             * @param {Boolean} [initByCallFunction] If attribute 's value is a function, whether to call this function to get its returned value.
             * @return {Menu} Menu instance or null.
             */
            getMenu:function (initByCallFunction) {
                return getMenu(this, initByCallFunction);
            },

            initializer:function () {
                this._reposition = S.buffer(reposition, 50, this);
            },

            _uiSetCollapsed:function (v) {
                if (v) {
                    hideMenu(this);
                } else {
                    showMenu(this);
                }
            },

            /**
             * Bind menu to current component.
             * Protected, should only be overridden by subclasses.
             * @protected
             */
            bindMenu:function () {
                var self = this,
                    menu = getMenu(self);
                if (menu) {
                    menu.on("afterActiveItemChange", function (ev) {
                        self.set("activeItem", ev.newVal);
                    });

                    menu.on("click", self.handleMenuClick, self);

                    // 窗口改变大小，重新调整
                    $(win).on("resize", self._reposition, self);

                    /*
                     bind 与 getMenu 都可能调用，时序不定
                     */
                    self.bindMenu = S.noop;
                }
            },

            /**
             * Handle click on drop down menu. Fire click event on menubutton.
             * Protected, should only be overridden by subclasses.
             * @param {Event.Object} e Click event object.
             * @protected
             */
            handleMenuClick:function (e) {
                var self = this;
                self.fire("click", {
                    target:e.target
                });
            },

            /**
             * Bind drop menu event.
             * Protected, should only be overridden by subclasses.
             * @protected
             * @override
             **/
            bindUI:function () {
                this.bindMenu();
            },

            /**
             * Handle keydown/up event.
             * If drop down menu is visible then handle event to menu.
             * Returns true if the event was handled, falsy otherwise.
             * Protected, should only be overridden by subclasses.
             * @param {Event.Object} e key event to handle.
             * @return {Boolean} True Whether the key event was handled.
             * @protected
             * @override
             */
            handleKeyEventInternal:function (e) {
                var self = this,
                    menu = getMenu(self);

                // space 只在 keyup 时处理
                if (e.keyCode == KeyCodes.SPACE) {
                    // Prevent page scrolling in Chrome.
                    e.preventDefault();
                    if (e.type != "keyup") {
                        return undefined;
                    }
                } else if (e.type != "keydown") {
                    return undefined;
                }
                //转发给 menu 处理
                if (menu && menu.get("visible")) {
                    var handledByMenu = menu.handleKeydown(e);
                    // esc
                    if (e.keyCode == KeyCodes.ESC) {
                        self.set("collapsed", true);
                        return true;
                    }
                    return handledByMenu;
                }

                // Menu is closed, and the user hit the down/up/space key; open menu.
                if (e.keyCode == KeyCodes.SPACE ||
                    e.keyCode == KeyCodes.DOWN ||
                    e.keyCode == KeyCodes.UP) {
                    self.set("collapsed", false);
                    return true;
                }
                return undefined;
            },

            /**
             * Perform default action for menubutton.
             * Toggle the drop down menu to show or hide.
             * Protected, should only be overridden by subclasses.
             * @protected
             * @override
             */
            performActionInternal:function () {
                var self = this;
                self.set("collapsed", !self.get("collapsed"));
            },

            /**
             * Handles blur event.
             * When it loses keyboard focus, close the drop dow menu.
             * @param {Event.Object} e Blur event.
             * Protected, should only be overridden by subclasses.
             * @protected
             * @override
             */
            handleBlur:function (e) {
                var self = this;
                MenuButton.superclass.handleBlur.call(self, e);
                // such as : click the document
                self.set("collapsed", true);
            },


            /**
             * Adds a new menu item at the end of the menu.
             * @param {Menu.Item} item Menu item to add to the menu.
             */
            addItem:function (item, index) {
                var menu = getMenu(this, 1) || constructMenu(this);
                menu.addChild(item, index);
            },

            /**
             * Remove a existing menu item from drop down menu.
             * @param c {Menu.Item} Existing menu item.
             * @param [destroy] {Boolean} Whether destroy removed menu item.
             */
            removeItem:function (c, destroy) {
                /**
                 * @type Controller
                 */
                var menu = getMenu(this);
                if (menu) {
                    menu.removeChild(c, destroy);
                }
            },

            /**
             * Remove all menu items from drop down menu.
             * @param [destroy] {Boolean} Whether destroy removed menu items.
             */
            removeItems:function (destroy) {
                var menu = getMenu(this);
                menu && menu.removeChildren(destroy);
            },

            /**
             * Returns the child menu item of drop down menu at the given index, or null if the index is out of bounds.
             * @param {Number} index 0-based index.
             */
            getItemAt:function (index) {
                var menu = getMenu(this);
                return menu && menu.getChildAt(index);
            },

            // 禁用时关闭已显示菜单
            _uiSetDisabled:function (v) {
                var self = this;
                !v && self.set("collapsed", true);
            },

            /**
             * Decorate child element to from a child component.
             * @param {Function} UI Child component's constructor
             * @param {Node} el Child component's root element.
             * @protected
             * @override
             */
            decorateChildrenInternal:function (UI, el) {
                // 不能用 diaplay:none , menu 的隐藏是靠 visibility
                // eg: menu.show(); menu.hide();
                el.css("visibility", "hidden");
                var self = this,
                    docBody = S.one(el[0].ownerDocument.body);
                docBody.prepend(el);
                var menu = new UI(S.mix({
                    srcNode:el,
                    prefixCls:self.get("prefixCls")
                }, self.get("menuCfg")));
                self.__set("menu", menu);
            },

            destructor:function () {
                var self = this,
                    menu = self.get("menu")
                $(win).detach("resize", self._reposition, self);
                if (menu && menu.destroy) {
                    menu.destroy();
                }
            }

        },

        {
            ATTRS:/**
             * @lends MenuButton.prototype
             */
            {
                /**
                 * Current active menu item.
                 * @type Menu.Item
                 */
                activeItem:{
                    view:true
                },
                /**
                 * Menu align configuration.See {@link UIBase.Align#align}.
                 * Default node is menubutton 's root element.
                 * @type Object
                 */
                menuAlign:{
                    value:{}
                },
                /**
                 * Menu configuration.See {@link Menu}.
                 * @type Object
                 */
                menuCfg:{},
                /**
                 * @private
                 */
                decorateChildCls:{
                    value:"popupmenu"
                },
                /**
                 * Drop down menu associated with this menubutton.
                 * @type Menu
                 */
                menu:{},
                /**
                 * Whether drop menu is shown.
                 * @type Boolean
                 */
                collapsed:{
                    value:true,
                    view:true
                }
            },
            DefaultRender:MenuButtonRender
        }, "MenuButton");

    Component.UIStore.setUIConstructorByCssClass("menu-button", {
        priority:Component.UIStore.PRIORITY.LEVEL2,
        ui:MenuButton
    });

    return MenuButton;
}, {
    requires:["uibase", "node", "button", "./menubuttonRender", "menu", "component"]
});/**
 * @fileOverview menubutton
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton", function(S, MenuButton, MenuButtonRender, Select, Option) {
    MenuButton.Render = MenuButtonRender;
    MenuButton.Select = Select;
    MenuButton.Option = Option;
    return MenuButton;
}, {
    requires:['menubutton/base',
        'menubutton/menubuttonRender',
        'menubutton/select',
        'menubutton/option']
});/**
 * @fileOverview render aria and drop arrow for menubutton
 * @author  yiminghe@gmail.com
 */
KISSY.add("menubutton/menubuttonRender", function (S, UIBase, Button) {

    var MENU_BUTTON_TMPL = '<div class="ks-inline-block ' +
        '{prefixCls}menu-button-caption">{content}<' + '/div>' +
        '<div class="ks-inline-block ' +
        '{prefixCls}menu-button-dropdown"><' + '/div>',
        CAPTION_CLS = "menu-button-caption",
        COLLAPSE_CLS = "menu-button-open";

    return UIBase.create(Button.Render, {

        createDom:function () {
            var el = this.get("el"),
                html = S.substitute(MENU_BUTTON_TMPL, {
                    content:this.get("content"),
                    prefixCls:this.get("prefixCls")
                });
            el
                .html(html)
                //带有 menu
                .attr("aria-haspopup", true);
        },

        _uiSetContent:function (v) {
            var caption = this.get("el").one("." + this.getCssClassWithPrefix(CAPTION_CLS));
            caption.html("");
            v && caption.append(v);
        },

        _uiSetCollapsed:function (v) {
            var self = this,
                el = self.get("el"),
                cls = self.getCssClassWithPrefix(COLLAPSE_CLS);
            el[v ? 'removeClass' : 'addClass'](cls).attr("aria-expanded", !v);
        },

        _uiSetActiveItem:function (v) {
            this.get("el").attr("aria-activedescendant",
                (v && v.get("el").attr("id")) || "");
        }
    }, {
        ATTRS:{
            activeItem:{
            },
            collapsed:{
            }
        }
    }, "MenuButton_Render");
}, {
    requires:['uibase', 'button']
});/**
 * @fileOverview represent a menu option , just make it selectable and can have select status
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/option", function (S, UIBase, Component, Menu) {
    var MenuItem = Menu.Item;
    /**
     * Option for Select component.
     * @name Option
     * @class
     * @memberOf MenuButton
     * @extends Menu.Item
     */
    var Option = UIBase.create(MenuItem,
        /**
         * @lends MenuButton.Option.prototype
         */
        {
            /**
             * Handle blur event.
             */
            handleBlur:function () {
                return Option.superclass.handleBlur.apply(this, arguments);
            }
        }, {
            ATTRS:/**
             * @lends MenuButton.Option.prototype
             */
            {
                /**
                 * Whether this option can be selected.
                 * Default : true.
                 * @type Boolean
                 */
                selectable:{
                    value:true
                }
            }
        }, "Menu_Option");
    Component.UIStore.setUIConstructorByCssClass("option", {
        priority:10,
        ui:Option
    });
    return Option;
}, {
    requires:['uibase', 'component', 'menu']
});/**
 * @fileOverview manage a list of single-select options
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/select", function (S, Node, UIBase, Component, MenuButton, Menu, Option, undefined) {

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
    var Select = UIBase.create(MenuButton,
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
                self.set("content", item ? item.get("content") : self.get("defaultCaption"));
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

        }, "Menu_Select");

    Component.UIStore.setUIConstructorByCssClass("select", {
        priority:Component.UIStore.PRIORITY.LEVEL3,
        ui:Select
    });

    return Select;

}, {
    requires:['node', 'uibase', 'component', './base', 'menu', './option']
});

/**
 * TODO
 *  how to emulate multiple ?
 **/
