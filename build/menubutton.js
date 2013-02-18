/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 18 14:59
*/
/**
 *  combination of menu and button ,similar to native select
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/base", function (S, Node, Button, MenuButtonRender, Menu, Component, undefined) {

    var win = S.Env.host;

    function getMenu(self, init) {
        var m = self.get("menu");
        if (m && !m.isController) {
            if (init) {
                m = Component.create(m, self);
                self.setInternal("menu", m);
            } else {
                return null;
            }
        }
        return m;
    }

    function reposition() {
        var self = this,
            alignCfg,
            alignNode,
            align,
            menu = getMenu(self);
        if (menu && menu.get("visible")) {
            alignCfg = menu.get("align");
            alignNode = alignCfg.node;
            delete alignCfg.node;
            align = S.clone(alignCfg);
            align.node = alignNode || self.get("el");
            S.mix(align, ALIGN, false);
            menu.set("align", align);
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
        // 保证显示前已经 bind 好 menu 事件
        if (menu && !menu.get("visible")) {
            // 先 render，监听 width 变化事件
            menu.render();
            self.bindMenu();
            // 根据对齐的 el 自动调整大小
            if (self.get("matchElWidth")) {
                menu.set("width", $(menu.get("align").node || el).innerWidth());
            }
            menu.show();
            reposition.call(self);
            el.attr("aria-haspopup", menu.get("el").attr("id"));
        }
    }

    var $ = Node.all,
        KeyCodes = Node.KeyCodes,
        ALIGN = {
            points: ["bl", "tl"],
            overflow: {
                adjustX: 1,
                adjustY: 1
            }
        };
    /**
     * @class
     * A menu button component, consist of a button and a drop down popup menu.
     * xclass: 'menu-button'.
     * @name MenuButton
     * @extends Button
     */
    var MenuButton = Button.extend([Component.DecorateChild],
        /**
         * @lends MenuButton.prototype
         */
        {
            _onSetCollapsed: function (v) {
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
            bindMenu: function () {
                var self = this,
                    menu = self.get("menu");

                menu.on("afterActiveItemChange", function (ev) {
                    self.set("activeItem", ev.newVal);
                });

                self.__repositionBuffer = S.buffer(reposition, 50);

                // 窗口改变大小，重新调整
                $(win).on("resize", self.__repositionBuffer, self);

                if (self.get("collapseOnClick")) {
                    menu.on("click", function () {
                        self.set("collapsed", true);
                    });
                }

                /*
                 只绑定事件一次
                 */
                self.bindMenu = S.noop;
            },

            /**
             * Handle keydown/up event.
             * If drop down menu is visible then handle event to menu.
             * Returns true if the event was handled, falsy otherwise.
             * Protected, should only be overridden by subclasses.
             * @param {Event.Object} e key event to handle.
             * @return {Boolean} True Whether the key event was handled.
             * @protected
             *
             */
            handleKeyEventInternal: function (e) {
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
             *
             */
            performActionInternal: function () {
                var self = this;
                self.set("collapsed", !self.get("collapsed"));
            },

            /**
             * Handles blur event.
             * When it loses keyboard focus, close the drop dow menu.
             * @param {Event.Object} e Blur event.
             * Protected, should only be overridden by subclasses.
             * @protected
             *
             */
            handleBlur: function (e) {
                var self = this;
                MenuButton.superclass.handleBlur.call(self, e);
                // such as : click the document
                self.set("collapsed", true);
            },


            /**
             * Adds a new menu item at the end of the menu.
             * @param {Menu.Item} item Menu item to add to the menu.
             */
            addItem: function (item, index) {
                var menu = getMenu(this, 1);
                menu.addChild(item, index);
            },

            /**
             * Remove a existing menu item from drop down menu.
             * @param c {Menu.Item} Existing menu item.
             * @param [destroy] {Boolean} Whether destroy removed menu item.
             */
            removeItem: function (c, destroy) {
                /**
                 * @type {Controller}
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
            removeItems: function (destroy) {
                var menu = this.get("menu");
                if (menu) {
                    if (menu.removeChildren) {
                        menu.removeChildren(destroy);
                    } else if (menu.children) {
                        menu.children = [];
                    }
                }
            },

            /**
             * Returns the child menu item of drop down menu at the given index, or null if the index is out of bounds.
             * @param {Number} index 0-based index.
             */
            getItemAt: function (index) {
                var menu = getMenu(this);
                return menu && menu.getChildAt(index);
            },

            // 禁用时关闭已显示菜单
            _onSetDisabled: function (v) {
                var self = this;
                !v && self.set("collapsed", true);
            },

            /**
             * Decorate child element to from a child component.
             * @param {Function} UI Child component's constructor
             * @param {KISSY.NodeList} el Child component's root element.
             * @protected
             *
             */
            decorateChildrenInternal: function (UI, el) {
                // 不能用 display:none , menu 的隐藏是靠 visibility
                // eg: menu.show(); menu.hide();
                var self = this,
                // decorate menu 配置了参数
                    menuCfg = self.get("menu"),
                    menu,
                    docBody = S.one(el[0].ownerDocument.body);
                docBody.prepend(el);
                menu = new UI(S.mix({
                    srcNode: el,
                    prefixCls: self.get("prefixCls")
                }, menuCfg));
                self.setInternal("menu", menu);
            },

            destructor: function () {
                var self = this,
                    menu,
                    repositionBuffer = self.__repositionBuffer;
                if (repositionBuffer) {
                    $(win).detach("resize", repositionBuffer, self);
                    repositionBuffer.stop();
                }
                menu = self.get("menu");
                if (menu.destroy) {
                    menu.destroy();
                }
            }

        },

        {
            ATTRS: /**
             * @lends MenuButton.prototype
             */
            {
                /**
                 * Current active menu item.
                 * @type {Menu.Item}
                 */
                activeItem: {
                    view: 1
                },

                /**
                 * Whether drop down menu is same width with button.
                 * Defaults to: true.
                 * @type {Boolean}
                 */
                matchElWidth: {
                    value: true
                },

                /**
                 * Whether hide drop down menu when click drop down menu item.
                 * eg: u do not want to set true when menu has checked menuitem.
                 * Defaults to: false
                 * @type {Boolean}
                 */
                collapseOnClick: {
                    value: false
                },

                /**
                 * @private
                 */
                decorateChildCls: {
                    valueFn: function () {
                        return this.get("prefixCls") + "popupmenu"
                    }
                },
                /**
                 * Drop down menu associated with this menubutton.
                 * @type {Menu}
                 */
                menu: {
                    value: {},
                    setter: function (v) {
                        if (v instanceof Menu) {
                            v.setInternal("parent", this);
                        }
                    }
                },

                defaultChildXClass: {
                    value: 'popupmenu'
                },

                /**
                 * Whether drop menu is shown.
                 * @type {Boolean}
                 */
                collapsed: {
                    view: 1
                },
                xrender: {
                    value: MenuButtonRender
                }
            }
        }, {
            xclass: 'menu-button',
            priority: 20
        });

    return MenuButton;
}, {
    requires: [ "node", "button", "./baseRender", "menu", "component/base"]
});/**
 *  render aria and drop arrow for menubutton
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/baseRender", function (S, Button) {

    var CAPTION_TMPL = '<div class="{prefixCls}menu-button-caption"><' + '/div>',

        DROP_TMPL =
            // 背景
            '<div class="{prefixCls}menu-button-dropdown">' +
                // 箭头
                '<div class=' +
                '"{prefixCls}menu-button-dropdown-inner">' +
                '<' + '/div>' +
                '<' + '/div>',
        COLLAPSE_CLS = "menu-button-open";

    return Button.Render.extend({

        createDom: function () {
            var self = this,
                el = self.get("el");
            el.append(S.substitute(DROP_TMPL, {
                prefixCls: this.get('prefixCls')
            }))
                //带有 menu
                .attr("aria-haspopup", true);
        },

        _onSetCollapsed: function (v) {
            var self = this,
                el = self.get("el"),
                cls = self.getCssClassWithPrefix(COLLAPSE_CLS);
            el[v ? 'removeClass' : 'addClass'](cls).attr("aria-expanded", !v);
        },

        _onSetActiveItem: function (v) {
            this.get("el").attr("aria-activedescendant",
                (v && v.get("el").attr("id")) || "");
        }
    }, {
        ATTRS: {
            contentEl: {
                valueFn: function () {
                    return S.all(S.substitute(CAPTION_TMPL, {
                        prefixCls: this.get('prefixCls')
                    }));
                }
            },
            activeItem: {
            },
            collapsed: {
                value: true
            }
        },
        HTML_PARSER: {
            contentEl: function (el) {
                return el.children("." + this.get('prefixCls') + "menu-button-caption");
            }
        }
    });
}, {
    requires: ['button']
});/**
 *  menubutton
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton", function(S, MenuButton, MenuButtonRender, Select, Option) {
    MenuButton.Render = MenuButtonRender;
    MenuButton.Select = Select;
    MenuButton.Option = Option;
    return MenuButton;
}, {
    requires:['menubutton/base',
        'menubutton/baseRender',
        'menubutton/select',
        'menubutton/option']
});/**
 *  represent a menu option , just make it selectable and can have select status
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/option", function (S, Menu) {
    var MenuItem = Menu.Item;
    /**
     * @name Option
     * @class
     * Option for Select component.
     * xclass: 'option'.
     * @memberOf MenuButton
     * @extends Menu.Item
     */
    var Option = MenuItem.extend(
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
                 * Defaults to: true.
                 * @type {Boolean}
                 */
                selectable:{
                    value:true
                },

                /**
                 * String will be used as select 's content if selected.
                 * @type {String}
                 */
                textContent:{

                }
            }
        }, {
            xclass:'option',
            priority:10
        });

    return Option;
}, {
    requires:['menu']
});/**
 *  manage a list of single-select options
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

    // c : Option
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
    function _handleMenuShow() {
        var self = this,
            selectedItem = getSelectedItem(self),
            m = self.get("menu");
        m.set("highlightedItem", selectedItem || m.getChildAt(0));
        // 初始化选中
        if (selectedItem) {
            selectedItem.set("selected", true);
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
     * @param {Event.Object} e
     */
    function handleMenuClick(e) {
        var self = this,
            target = e.target;
        if (target instanceof  Menu.Item) {
            var newValue = getItemValue(target),
                oldValue = self.get("value");
            self.set("value", getItemValue(target));
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
     * @memberOf MenuButton
     * @extends MenuButton
     */
    var Select = MenuButton.extend(
        /**
         * @lends MenuButton.Select.prototype
         */
        {
            bindUI: function () {
                this.on("click", handleMenuClick, this);
            },

            /**
             * Bind menu to current Select. When menu shows, set highlightedItem to current selectedItem.
             * @protected
             */
            bindMenu: function () {
                var self = this;
                Select.superclass.bindMenu.call(self);
                self.get("menu").on("show", _handleMenuShow, self);
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
             *
             */
            removeItem: function (c) {
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

            _onSetDefaultCaption: function () {
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
             * @memberOf MenuButton.Select
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
                        xclass:'option',
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
