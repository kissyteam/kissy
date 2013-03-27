/**
 * combination of menu and button ,similar to native select
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/base", function (S, Node, Button, MenuButtonRender, Menu, Component, undefined) {

    var $ = Node.all,
        win = $(S.Env.host),
        KeyCodes = Node.KeyCodes,
        ALIGN = {
            points: ["bl", "tl"],
            overflow: {
                adjustX: 1,
                adjustY: 1
            }
        };
    /**
     * A menu button component, consist of a button and a drop down popup menu.
     * xclass: 'menu-button'.
     * @class KISSY.MenuButton
     * @extends KISSY.Button
     */
    var MenuButton = Button.extend([Component.DecorateChild],
        /**
         * @lends MenuButton.prototype
         */
        {
            isMenuButton: 1,

            _onSetCollapsed: function (v) {
                if (v) {
                    hideMenu(this);
                } else {
                    showMenu(this);
                }
            },

            bindUI: function () {
                var self = this;
                self.on('afterHighlightedItemChange', onMenuAfterHighlightedItemChange, self);
                win.on("resize", self.__repositionBuffer = S.buffer(reposition, 50), self);
                self.on('click', onMenuItemClick, self);
            },

            /**
             * Handle keydown/up event.
             * If drop down menu is visible then handle event to menu.
             * Returns true if the event was handled, falsy otherwise.
             * Protected, should only be overridden by subclasses.
             * @param {KISSY.Event.DOMEventObject} e key event to handle.
             * @return {Boolean|undefined} True Whether the key event was handled.
             * @protected
             */
            handleKeyEventInternal: function (e) {
                var self = this,
                    keyCode = e.keyCode,
                    type = String(e.type),
                    menu = getMenu(self);

                // space 只在 keyup 时处理
                if (keyCode == KeyCodes.SPACE) {
                    // Prevent page scrolling in Chrome.
                    e.preventDefault();
                    if (type != "keyup") {
                        return undefined;
                    }
                } else if (type != "keydown") {
                    return undefined;
                }
                //转发给 menu 处理
                if (menu && menu.get("visible")) {
                    var handledByMenu = menu.handleKeydown(e);
                    // esc
                    if (keyCode == KeyCodes.ESC) {
                        self.set("collapsed", true);
                        return true;
                    }
                    return handledByMenu;
                }

                // Menu is closed, and the user hit the down/up/space key; open menu.
                if (keyCode == KeyCodes.SPACE ||
                    keyCode == KeyCodes.DOWN ||
                    keyCode == KeyCodes.UP) {
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
             * @param {KISSY.Event.DOMEventObject} e Blur event.
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
             * @param {KISSY.Menu.Item} item Menu item to add to the menu.
             * @param {Number} index position to insert
             */
            addItem: function (item, index) {
                var menu = getMenu(this, 1);
                menu.addChild(item, index);
            },

            /**
             * Remove a existing menu item from drop down menu.
             * @param c {KISSY.Menu.Item} Existing menu item.
             * @param [destroy=true] {Boolean} Whether destroy removed menu item.
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
                el.css("top", "-9999").prependTo(el[0].ownerDocument.body);
                var self = this;
                self.setInternal("menu",
                    Component.DecorateChild.prototype.decorateChildrenInternal.call(self, UI, el, self.get('menu')));
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
                    value: 'popupmenu'
                },
                /**
                 * Drop down menu associated with this menubutton.
                 * @type {Menu}
                 */
                menu: {
                    value: {},
                    setter: function (m) {
                        if (m && m.isController) {
                            m.setInternal('parent', this);
                        }
                    }
                },

                defaultChildCfg: {
                    value: {
                        xclass: 'popupmenu'
                    }
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

    function onMenuItemClick(e) {
        if (e.target.isMenuItem && this.get('collapseOnClick')) {
            this.set("collapsed", true);
        }
    }

    function onMenuAfterHighlightedItemChange(e) {
        if (e.target.isMenu) {
            this.get('view').setAriaActiveDescendant(e.newVal);
        }
    }

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
            // 根据对齐的 el 自动调整大小
            if (self.get("matchElWidth")) {
                menu.set("width", $(menu.get("align").node || el).innerWidth());
            }
            menu.show();
            reposition.call(self);
            el.attr("aria-haspopup", menu.get("el").attr("id"));
        }
    }

    return MenuButton;
}, {
    requires: [ "node", "button", "./baseRender", "menu", "component/base"]
});