/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Mar 23 12:19
*/
/**
 * @fileOverview combination of menu and button ,similar to native select
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/base", function (S, UIBase, Node, Button, MenuButtonRender, Menu, Component, undefined) {

    var win=S.Env.host;

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
            UIBase.create(Button, [Component.DecorateChild], {

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

                /**
                 * @private
                 */
                bindUI:function () {
                    this.__bindMenu();
                },

                /**
                 * @inheritDoc
                 */
                _handleKeyEventInternal:function (e) {
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
                        var handledByMenu = menu._handleKeydown(e);
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
                 * handle click or enter key
                 */
                _performInternal:function () {
                    var self = this;
                    self.set("collapsed", !self.get("collapsed"));

                },

                /**
                 * @inheritDoc
                 */
                _handleBlur:function (e) {
                    var self = this;
                    MenuButton.superclass._handleBlur.call(self, e);
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
                 * if no menu , then construct
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
                 * @param item Menu item to add to the menu.
                 */
                addItem:function (item, index) {
                    this.getMenu().addChild(item, index);
                },

                removeItem:function (c, destroy) {
                    /**
                     * @type Controller
                     */
                    var menu = getMenu(this);
                    if (menu) {
                        menu.removeChild(c, destroy);
                    }
                },

                removeItems:function (destroy) {
                    var menu = getMenu(this);
                    menu && menu.removeChildren(destroy);
                },

                getItemAt:function (index) {
                    var menu = getMenu(this);
                    return menu && menu.getChildAt(index);
                },

                // 禁用时关闭已显示菜单
                _uiSetDisabled:function (v) {
                    var self = this;
                    MenuButton.superclass._uiSetDisabled.apply(self, S.makeArray(arguments));
                    !v && self.set("collapsed", true);
                },

                /**
                 * @private
                 */
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

                /**
                 * @private
                 */
                destructor:function () {
                    var self = this, menu = getMenu(self);
                    $(win).detach("resize", self._reposition, self);
                    menu && menu.destroy();
                }

            }, {
                ATTRS:{
                    activeItem:{
                        view:true
                    },
                    menuAlign:{
                        value:{}
                    },
                    menuCfg:{},
                    decorateChildCls:{
                        value:"popupmenu"
                    },
                    // 不关心选中元素 , 由 select 负责
                    // selectedItem
                    menu:{},
                    collapsed:{
                        value:true,
                        view:true
                    }
                },
                DefaultRender:MenuButtonRender
            });

    Component.UIStore.setUIByClass("menu-button", {
        priority:Component.UIStore.PRIORITY.LEVEL2,
        ui:MenuButton
    });

    if (1 > 2) {
        MenuButton.getItemAt();
    }

    return MenuButton;
}, {
    requires:["uibase", "node", "button", "./menubuttonrender", "menu", "component"]
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
        'menubutton/menubuttonrender',
        'menubutton/select',
        'menubutton/option']
});/**
 * @fileOverview render aria and drop arrow for menubutton
 * @author  yiminghe@gmail.com
 */
KISSY.add("menubutton/menubuttonrender", function(S, UIBase, Button) {

    var MENU_BUTTON_TMPL = '<div class="{prefixCls}inline-block ' +
        '{prefixCls}menu-button-caption">{content}<' + '/div>' +
        '<div class="{prefixCls}inline-block ' +
        '{prefixCls}menu-button-dropdown">&nbsp;<' + '/div>',
        CAPTION_CLS = "menu-button-caption",
        COLLAPSE_CLS = "menu-button-open";

    return UIBase.create(Button.Render, {

        createDom:function() {
            var innerEl = this.get("innerEl"),
                html = S.substitute(MENU_BUTTON_TMPL, {
                    content:this.get("content") || "",
                    prefixCls:this.get("prefixCls")
                });
            innerEl
                .html(html)
                //带有 menu
                .attr("aria-haspopup", true);
        },

        _uiSetContent:function(v) {
            var caption = this.get("el").one("." + this.getCls(CAPTION_CLS));
            caption.html("");
            v && caption.append(v);
        },

        _uiSetCollapsed:function(v) {
            var self = this,
                el = self.get("el"),
                cls = self.getCls(COLLAPSE_CLS);
            el[v ? 'removeClass' : 'addClass'](cls).attr("aria-expanded", !v);
        },

        _uiSetActiveItem:function(v) {
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
    });
}, {
    requires:['uibase','button']
});/**
 * @fileOverview represent a menu option , just make it selectable and can have select status
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/option", function(S, UIBase, Component, Menu) {
    var MenuItem = Menu.Item;
    var Option = UIBase.create(MenuItem, {}, {
        ATTRS:{
            selectable:{
                value:true
            }
        }
    });
    Component.UIStore.setUIByClass("option", {
        priority:10,
        ui:Option
    });
    return Option;

}, {
    requires:['uibase','component','menu']
});/**
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
