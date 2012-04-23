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
            self.__bindMenu();
        }
        return m;
    }

    function _reposition() {
        var self = this,
            menu = getMenu(self);
        if (menu &&
            menu.get("visible")) {
            menu.set("align", S.merge({
                node:self.get("el")
            }, ALIGN, self.get("menuAlign")));
        }
    }

    var $ = Node.all,
        KeyCodes = Node.KeyCodes,
        ALIGN = {
            points:["bl", "tl"],
            overflow:{
                failX:1,
                failY:1,
                adjustX:1,
                adjustY:1
            }
        },
        /**
         * @name MenuButton
         * @constructor
         * @extends Button
         */
            MenuButton =
            UIBase.create(Button, [Component.DecorateChild],
                /*@lends MenuButton.prototype*/
                {

                    _getMenu:function (init) {
                        return getMenu(this, init);
                    },

                    initializer:function () {
                        this._reposition = S.buffer(_reposition, 50, this);
                    },

                    /**
                     * private
                     */
                    _hideMenu:function () {
                        var menu = getMenu(this);
                        if (menu) {
                            menu.hide();
                        }
                    },

                    /**
                     * private
                     */
                    _showMenu:function () {
                        var self = this,
                            el = self.get("el"),
                            menu = getMenu(self, 1);
                        if (menu && !menu.get("visible")) {
                            menu.set("align", S.merge({
                                node:el
                            }, ALIGN, self.get("menuAlign")));
                            menu.show();
                            el.attr("aria-haspopup", menu.get("el").attr("id"));
                        }
                    },

                    _uiSetCollapsed:function (v) {
                        if (v) {
                            this._hideMenu();
                        } else {
                            this._showMenu();
                        }
                    },

                    /**
                     * 产生菜单时对菜单监听，只监听一次
                     * @protected
                     */
                    __bindMenu:function () {
                        var self = this,
                            menu = getMenu(self);
                        if (menu) {
                            menu.on("afterActiveItemChange", function (ev) {
                                self.set("activeItem", ev.newVal);
                            });

                            menu.on("click", self._handleMenuClick, self);

                            //窗口改变大小，重新调整
                            $(win).on("resize", self._reposition, self);
                            /*
                             bind 与 getMenu 都可能调用，时序不定
                             */
                            self.__bindMenu = S.noop;
                        }
                    },

                    /**
                     * @protected
                     */
                    _handleMenuClick:function (e) {
                        var self = this;
                        self.fire("click", {
                            target:e.target
                        });
                    },


                    bindUI:function () {
                        this.__bindMenu();
                    },


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

                    performActionInternal:function () {
                        var self = this;
                        self.set("collapsed", !self.get("collapsed"));

                    },

                    handleBlur:function (e) {
                        var self = this;
                        MenuButton.superclass.handleBlur.call(self, e);
                        // such as : click the document
                        self.set("collapsed", true);
                    },

                    constructMenu:function () {
                        var self = this,
                            m = new Menu.PopupMenu(S.mix({
                                prefixCls:self.get("prefixCls")
                            }, self.get("menuCfg")));
                        self.__set("menu", m);
                        self.__bindMenu();
                        return m;
                    },

                    /**
                     * If no menu, then construct
                     * @private
                     */
                    getMenu:function () {
                        var self = this,
                            m = getMenu(self);
                        if (!m) {
                            m = self.constructMenu();
                        }
                        return m;
                    },

                    /**
                     * Adds a new menu item at the end of the menu.
                     * @param {Menu.Item} item Menu item to add to the menu.
                     */
                    addItem:function (item, index) {
                        this.getMenu().addChild(item, index);
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

                    decorateChildrenInternal:function (ui, el, cls) {
                        // 不能用 diaplay:none , menu 的隐藏是靠 visibility
                        // eg: menu.show(); menu.hide();
                        el.css("visibility", "hidden");
                        var self = this,
                            docBody = S.one(el[0].ownerDocument.body);
                        docBody.prepend(el);
                        var menu = new ui(S.mix({
                            srcNode:el,
                            prefixCls:cls
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
                /*@lends MenuButton.prototype*/
                {
                    ATTRS:{
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
                });

    Component.UIStore.setUIConstructorByCssClass("menu-button", {
        priority:Component.UIStore.PRIORITY.LEVEL2,
        ui:MenuButton
    });

    if (1 > 2) {
        MenuButton.getItemAt();
    }

    return MenuButton;
}, {
    requires:["uibase", "node", "button", "./menubuttonrender", "menu", "component"]
});