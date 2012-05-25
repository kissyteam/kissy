/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 25 12:28
*/
/**
 * @fileOverview menu model and controller for kissy,accommodate menu items
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/base", function (S, Event, UIBase, Component, MenuRender) {
    var KeyCodes = Event.KeyCodes;

    function onMenuHide() {
        this.set("highlightedItem", undefined);
    }

    /**
     * @name Menu
     * @constructor
     * @extends Component.Container
     */
    var Menu = UIBase.create(Component.Container,
        /** @lends Menu.prototype*/
        {
            _uiSetHighlightedItem:function (v, ev) {
                var pre = ev && ev.prevVal;
                if (pre) {
                    pre.set("highlighted", false);
                }
                v && v.set("highlighted", true);
                this.set("activeItem", v);
            },

            handleBlur:function (e) {
                Menu.superclass.handleBlur.call(this, e);
                this.set("highlightedItem", undefined);
            },


            //dir : -1 ,+1
            //skip disabled items
            _getNextEnabledHighlighted:function (index, dir) {
                var children = this.get("children"),
                    len = children.length,
                    o = index;
                do {
                    var c = children[index];
                    if (!c.get("disabled") && (c.get("visible") !== false)) {
                        return children[index];
                    }
                    index = (index + dir + len) % len;
                } while (index != o);
                return undefined;
            },

            handleKeydown:function (e) {
                if (this.handleKeyEventInternal(e)) {
                    e.halt();
                    return true;
                }
                // return false , 会阻止 tab 键 ....
                return undefined;
            },

            /**
             * Attempts to handle a keyboard event;
             * returns true if the event was handled,
             * false otherwise.
             * If the container is enabled, and a child is highlighted,
             * calls the child controller's {@code handleKeydown} method to give the control
             * a chance to handle the event first.
             * Protected, should only be overridden by subclasses.
             * @param {Event.Object} e Key event to handle.
             * @return {Boolean} Whether the event was handled by the container (or one of
             *     its children).
             * @protected
             * @override
             */
            handleKeyEventInternal:function (e) {

                // Give the highlighted control the chance to handle the key event.
                var highlightedItem = this.get("highlightedItem");

                // 先看当前活跃 menuitem 是否要处理
                if (highlightedItem && highlightedItem.handleKeydown(e)) {
                    return true;
                }

                var children = this.get("children"), len = children.length;

                if (len === 0) {
                    return undefined;
                }

                var index, destIndex;

                //自己处理了，不要向上处理，嵌套菜单情况
                switch (e.keyCode) {
                    // esc
                    case KeyCodes.ESC:
                        // TODO
                        // focus 的话手动失去焦点
                        return undefined;
                        break;

                    // home
                    case KeyCodes.HOME:
                        this.set("highlightedItem",
                            this._getNextEnabledHighlighted(0, 1));
                        break;
                    // end
                    case KeyCodes.END:
                        this.set("highlightedItem",
                            this._getNextEnabledHighlighted(len - 1, -1));
                        break;
                    // up
                    case KeyCodes.UP:
                        if (!highlightedItem) {
                            destIndex = len - 1;
                        } else {
                            index = S.indexOf(highlightedItem, children);
                            destIndex = (index - 1 + len) % len;
                        }
                        this.set("highlightedItem",
                            this._getNextEnabledHighlighted(destIndex, -1));
                        break;
                    //down
                    case KeyCodes.DOWN:
                        if (!highlightedItem) {
                            destIndex = 0;
                        } else {
                            index = S.indexOf(highlightedItem, children);
                            destIndex = (index + 1 + len) % len;
                        }
                        this.set("highlightedItem",
                            this._getNextEnabledHighlighted(destIndex, 1));
                        break;
                    default:
                        return undefined;
                }
                return true;
            },

            bindUI:function () {
                var self = this;
                /**
                 * 隐藏后，去掉高亮与当前
                 */
                self.on("hide", onMenuHide, self);
            },

            /**
             * Whether this menu contains specified html element.
             * @param {NodeList} element Html Element to be tested.
             * @return {Boolean}
             */
            containsElement:function (element) {
                var self = this;

                // 隐藏当然不包含了
                // self.get("visible") === undefined 相当于 true
                if (self.get("visible") === false || !self.get("view")) {
                    return false;
                }

                if (self.get("view").containsElement(element)) {
                    return true;
                }

                var children = self.get('children');

                for (var i = 0, count = children.length; i < count; i++) {
                    var child = children[i];
                    if (typeof child.containsElement == 'function' &&
                        child.containsElement(element)) {
                        return true;
                    }
                }

                return false;
            }
        }, {
            ATTRS:/** @lends Menu.prototype*/
            {
                visibleMode:{
                    value:"display"
                },
                /**
                 * Current highlighted child menu item.
                 * @type Menu.Item
                 */
                highlightedItem:{},
                /**
                 * Current active menu item. Maybe a descendant but not a child of current menu.
                 * @type Menu.Item
                 */
                activeItem:{
                    view:true
                }
            },
            DefaultRender:MenuRender
        }, "Menu");

    Component.UIStore.setUIConstructorByCssClass("menu", {
        priority:Component.UIStore.PRIORITY.LEVEL1,
        ui:Menu
    });

    return Menu;

}, {
    requires:['event', 'uibase', 'component', './menuRender', './submenu']
});

/**
 * 普通菜单可聚焦
 * 通过 tab 聚焦到菜单的根节点，通过上下左右操作子菜单项
 *
 * TODO
 *  - 去除 activeItem
 **//**
 *  @fileOverview menu where items can be filtered based on user keyboard input
 *  @author yiminghe@gmail.com
 */
KISSY.add("menu/filtermenu", function (S, UIBase, Component, Menu, FilterMenuRender) {

    var HIT_CLS = "menuitem-hit";

    // 转义正则特殊字符,返回字符串用来构建正则表达式
    function regExpEscape(s) {
        return s.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
            replace(/\x08/g, '\\x08');
    }

    var FilterMenu = UIBase.create(Menu, {
            bindUI:function () {
                var self = this,
                    view = self.get("view"),
                    filterInput = view.get("filterInput");
                /*监控键盘事件*/
                filterInput.on("keyup", self.handleFilterEvent, self);
            },

            handleMouseEnter:function () {
                var self = this;
                FilterMenu.superclass.handleMouseEnter.apply(self, arguments);
                // 权益解决,filter input focus 后会滚动到牌聚焦处,select 则不会
                // 如果 filtermenu 的菜单项被滚轮滚到后面,点击触发不了,会向前滚动到 filter input
                self.getKeyEventTarget()[0].select();
            },

            handleFilterEvent:function () {
                var self = this,
                    view = self.get("view"),
                    filterInput = view.get("filterInput"),
                    highlightedItem = self.get("highlightedItem");
                /* 根据用户输入过滤 */
                self.set("filterStr", filterInput.val());

                // 如果没有高亮项或者高亮项因为过滤被隐藏了
                // 默认选择符合条件的第一项
                if (!highlightedItem || !highlightedItem.get("visible")) {
                    self.set("highlightedItem",
                        self._getNextEnabledHighlighted(0, 1));
                }
            },

            _uiSetFilterStr:function (v) {
                // 过滤条件变了立即过滤
                this.filterItems(v);
            },

            filterItems:function (str) {
                var self = this,
                    view = self.get("view"),
                    _labelEl = view.get("labelEl"),
                    filterInput = view.get("filterInput");

                // 有过滤条件提示隐藏,否则提示显示
                _labelEl[str ? "hide" : "show"]();

                if (self.get("allowMultiple")) {
                    var enteredItems = [],
                        lastWord;
                    // \uff0c => ，
                    var match = str.match(/(.+)[,\uff0c]\s*([^\uff0c,]*)/);
                    // 已经确认的项
                    // , 号之前的项必定确认

                    var items = [];

                    if (match) {
                        items = match[1].split(/[,\uff0c]/);
                    }

                    // 逗号结尾
                    // 如果可以补全,那么补全最后一项为第一个高亮项
                    if (/[,\uff0c]$/.test(str)) {
                        enteredItems = [];
                        if (match) {
                            enteredItems = items;
                            //待补全的项
                            lastWord = items[items.length - 1];
                            var item = self.get("highlightedItem"),
                                content = item && item.get("html");
                            // 有高亮而且最后一项不为空补全
                            if (content && content.indexOf(lastWord) > -1
                                && lastWord) {
                                enteredItems[enteredItems.length - 1] = content;
                            }
                            filterInput.val(enteredItems.join(",") + ",");
                        }
                        str = '';
                    } else {
                        // 需要菜单过滤的过滤词,在最后一个 , 后面
                        if (match) {
                            str = match[2] || "";
                        }
                        // 没有 , 则就是当前输入的
                        // else{ str=str}

                        //记录下
                        enteredItems = items;
                    }
                    var oldEnteredItems = self.get("enteredItems");
                    // 发生变化,长度变化和内容变化等同
                    if (oldEnteredItems.length != enteredItems.length) {
                        S.log("enteredItems : ");
                        S.log(enteredItems);
                        self.set("enteredItems", enteredItems);
                    }
                }

                var children = self.get("children"),
                    strExp = str && new RegExp(regExpEscape(str), "ig"),
                    // 匹配项样式类
                    hit = this.getCssClassWithPrefix(HIT_CLS);

                // 过滤所有子组件
                S.each(children, function (c) {
                    var content = c.get("html");
                    if (!str) {
                        // 没有过滤条件
                        // 恢复原有内容
                        // 显示出来
                        c.get("el").html(content);
                        c.set("visible", true);
                    } else {
                        if (content.indexOf(str) > -1) {
                            // 如果符合过滤项
                            // 显示
                            c.set("visible", true);
                            // 匹配子串着重 wrap
                            c.get("el").html(content.replace(strExp, function (m) {
                                return "<span class='" + hit + "'>" + m + "<" + "/span>";
                            }));
                        } else {
                            // 不符合
                            // 隐藏
                            c.set("visible", false);
                        }
                    }
                });
            },

            decorateInternal:function (el) {
                var self = this;
                self.set("el", el);
                var menuContent = el.one("." + self.getCssClassWithPrefix("menu-content"));
                self.decorateChildren(menuContent);
            },

            /**
             * 重置状态,用于重用
             */
            reset:function () {
                var self = this,
                    view = self.get("view");
                self.set("filterStr", "");
                self.set("enteredItems", []);
                var filterInput = view && view.get("filterInput");
                filterInput && filterInput.val("");
            },

            destructor:function () {
                var view = this.get("view");
                var filterInput = view && view.get("filterInput");
                filterInput && filterInput.detach();
            }

        },
        {
            ATTRS:{
                label:{
                    view:true
                },

                filterStr:{
                },

                enteredItems:{
                    value:[]
                },

                allowMultiple:{
                    value:false
                }
            },
            DefaultRender:FilterMenuRender
        }, "Menu_FilterMenu");

    Component.UIStore.setUIConstructorByCssClass("filtermenu", {
        priority:Component.UIStore.PRIORITY.LEVEL2,
        ui:FilterMenu
    });

    return FilterMenu;
}, {
    requires:['uibase', 'component', './base', './filtermenuRender']
});/**
 * @fileOverview filter menu render
 * 1.create filter input
 * 2.change menu contentelement
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/filtermenuRender", function (S, Node, UIBase, MenuRender) {
    var $ = Node.all,
        MENU_FILTER = "menu-filter",
        MENU_FILTER_LABEL = "menu-filter-label",
        MENU_CONTENT = "menu-content";

    return UIBase.create(MenuRender, {
        getContentElement:function () {
            return this.get("menuContent");
        },

        getKeyEventTarget:function () {
            return this.get("filterInput");
        },
        createDom:function () {
            var self = this;
            var contentEl = MenuRender.prototype.getContentElement.call(this);
            var filterWrap = self.get("filterWrap");
            if (!filterWrap) {
                self.set("filterWrap",
                    filterWrap = $("<div class='" + this.getCssClassWithPrefix(MENU_FILTER) + "'/>")
                        .appendTo(contentEl));
            }
            if (!this.get("labelEl")) {
                this.set("labelEl",
                    $("<div class='" + this.getCssClassWithPrefix(MENU_FILTER_LABEL) + "'/>")
                        .appendTo(filterWrap));
            }
            if (!self.get("filterInput")) {
                self.set("filterInput", $("<input autocomplete='off'/>")
                    .appendTo(filterWrap));
            }
            if (!self.get("menuContent")) {
                self.set("menuContent",
                    $("<div class='" + this.getCssClassWithPrefix(MENU_CONTENT) + "'/>")
                        .appendTo(contentEl));
            }
        },

        _uiSetLabel:function (v) {
            this.get("labelEl").html(v);
        }
    }, {

        ATTRS:{
            /* 过滤输入框的提示 */
            label:{}
        },

        HTML_PARSER:{
            labelEl:function (el) {
                return el.one("." + this.getCssClassWithPrefix(MENU_FILTER))
                    .one("." + this.getCssClassWithPrefix(MENU_FILTER_LABEL))
            },
            filterWrap:function (el) {
                return el.one("." + this.getCssClassWithPrefix(MENU_FILTER));
            },
            menuContent:function (el) {
                return el.one("." + this.getCssClassWithPrefix(MENU_CONTENT));
            },
            filterInput:function (el) {
                return el.one("." + this.getCssClassWithPrefix(MENU_FILTER)).one("input");
            }
        }
    }, "Menu_FilterMenu_Render");

}, {
    requires:['node', 'uibase', './menuRender']
});/**
 * @fileOverview menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu", function (S, Menu, Render, Item, ItemRender, SubMenu, SubMenuRender, Separator, SeparatorRender, PopupMenu, PopupMenuRender, FilterMenu) {
    Menu.Render = Render;
    Menu.Item = Item;
    Item.Render = ItemRender;
    Menu.SubMenu = SubMenu;
    SubMenu.Render = SubMenuRender;
    Menu.Separator = Separator;
    Menu.PopupMenu = PopupMenu;
    PopupMenu.Render = PopupMenuRender;
    Menu.FilterMenu = FilterMenu;
    return Menu;
}, {
    requires:[
        'menu/base',
        'menu/menuRender',
        'menu/menuitem',
        'menu/menuitemRender',
        'menu/submenu',
        'menu/submenuRender',
        'menu/separator',
        'menu/separatorRender',
        'menu/popupmenu',
        'menu/popupmenuRender',
        'menu/filtermenu'
    ]
});/**
 * @fileOverview render aria from menu according to current menuitem
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuRender", function(S, UA, UIBase, Component) {

    return UIBase.create(Component.Render,{

        renderUI:function() {
            var el = this.get("el");
            el .attr("role", "menu")
                .attr("aria-haspopup", true);
            if (!el.attr("id")) {
                el.attr("id", S.guid("ks-menu"));
            }
        },

        _uiSetActiveItem:function(v) {
            var el = this.get("el");
            if (v) {
                var menuItemEl = v.get("el"),
                    id = menuItemEl.attr("id");
                el.attr("aria-activedescendant", id);
                // 会打印重复 ，每个子菜单都会打印，然后冒泡至父菜单，再打印，和该 menuitem 所处层次有关系
                //S.log("menuRender :" + el.attr("id") + " _uiSetActiveItem : " + v.get("content"));
            } else {
                el.attr("aria-activedescendant", "");
                //S.log("menuRender :" + el.attr("id") + " _uiSetActiveItem : " + "");
            }
        },

        containsElement:function(element) {
            var el = this.get("el");
            return el[0] === element || el.contains(element);
        }
    }, {
        ATTRS:{
            activeItem:{}
        }
    },"Menu_Render");
}, {
    requires:['ua','uibase','component']
});/**
 * @fileOverview menu item ,child component for menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitem", function (S, UIBase, Component, MenuItemRender) {

    var $ = S.all;

    /**
     * A menu item component which menu is consisted of.
     * @class
     * @name Item
     * @memberOf Menu
     * @extends Component.Controller
     */
    var MenuItem = UIBase.create(Component.Controller,
        /**
         * @lends Menu.Item#
         */
        {

            /**
             * Handle mouseenter event. Make parent menu to highlight itself.
             * Protected, should only be overridden by subclasses.
             * @param {Event.Object} e Mouseenter event object.
             * @protected
             * @override
             */
            handleMouseEnter:function (e) {
                // 父亲不允许自己处理
                if (MenuItem.superclass.handleMouseEnter.call(this, e)) {
                    return true;
                }
                this.get("parent").set("highlightedItem", this);
            },

            /**
             * Handle mouseleave event. Make parent menu to unhighlight itself.
             * Protected, should only be overridden by subclasses.
             * @param {Event.Object} e Mouseleave event object.
             * @protected
             * @override
             */
            handleMouseLeave:function (e) {
                // 父亲不允许自己处理
                if (MenuItem.superclass.handleMouseLeave.call(this, e)) {
                    return true;
                }
                this.get("parent").set("highlightedItem", null);
            },

            /**
             * Perform default action when click on enter on this menuitem.
             * If selectable, then make it selected.
             * If checkable, then toggle it.
             * Finally fire click on its parent menu.
             * @protected
             * @override
             */
            performActionInternal:function () {
                var self = this;
                // 可选
                if (self.get("selectable")) {
                    self.set("selected", true);
                }
                // 可选中，取消选中
                if (self.get("checkable")) {
                    self.set("checked", !self.get("checked"));
                }
                self.get("parent").fire("click", {
                    target:self
                });
                return true;
            },

            _uiSetHighlighted:function (v) {
                // 是否要滚动到当前菜单项(横向，纵向)
                if (v) {
                    var el = this.get("el"),
                        // 找到向上路径上第一个可以滚动的容器，直到父组件节点（包括）
                        // 找不到就放弃，为效率考虑不考虑 parent 的嵌套可滚动 div
                        p = el.parent(function (e) {
                            return $(e).css("overflow") != "visible";
                        }, this.get("parent").get("el").parent());
                    if (!p) {
                        return;
                    }
                    el.scrollIntoView(p, undefined, undefined, true);
                }
            },

            /**
             * Check whether this menu item contains specified element.
             * @param {NodeList} element Element to be tested.
             */
            containsElement:function (element) {
                return this.get('view') && this.get('view').containsElement(element);
            }

        }, {
            ATTRS:/**
             * @lends Menu.Item#
             */
            {

                focusable:{
                    value:false
                },

                visibleMode:{
                    value:"display"
                },

                handleMouseEvents:{
                    value:false
                },

                /**
                 * Whether the menu item is selectable or not.
                 * Set to true for option.
                 * @type Boolean
                 */
                selectable:{
                    view:true
                },

                /**
                 * Whether the menu item is checkable or not.
                 * Set to true for checkbox option.
                 * @type Boolean
                 */
                checkable:{
                    view:true
                },

                /**
                 * The value associated with the menu item.
                 */
                value:{},

                /**
                 * Whether the menu item is checked.
                 * @type Boolean
                 */
                checked:{
                    view:true
                },

                /**
                 * Whether the menu item is selected.
                 * @type Boolean
                 */
                selected:{
                    view:true
                },
                /**
                 * Please use {@link UIBase.Box#html} attribute instead!
                 * @deprecated 1.3
                 */
                content:{
                    getter:function () {
                        return this.get("html");
                    },
                    setter:function (v) {
                        return this.set("html", v);
                    }
                }
            },

            HTML_PARSER:{
                selectable:function (el) {
                    var cls = this.getCssClassWithPrefix("menuitem-selectable");
                    return el.hasClass(cls);
                }
            }
        }, "Menu_Item");

    MenuItem.DefaultRender = MenuItemRender;

    Component.UIStore.setUIConstructorByCssClass("menuitem", {
        priority:Component.UIStore.PRIORITY.LEVEL1,
        ui:MenuItem
    });

    return MenuItem;
}, {
    requires:['uibase', 'component', './menuitemRender']
});/**
 * @fileOverview simple menuitem render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitemRender", function (S, Node, UIBase, Component) {

    var CHECK_CLS = "menuitem-checkbox";

    function setUpCheckEl(self) {
        var el = self.get("el"),
            cls = self.getCssClassWithPrefix(CHECK_CLS),
            checkEl = el.one("." + cls);
        if (!checkEl) {
            checkEl = new Node("<div class='" + cls + "'/>").prependTo(el);
            // if not ie will lose focus when click
            checkEl.unselectable();
        }
        return checkEl;
    }

    return UIBase.create(Component.Render, {

        _uiSetChecked:function (v) {
            var self = this,
                el = self.get("el"),
                cls = self.getComponentCssClassWithState("-checked");
            el[v ? 'addClass' : 'removeClass'](cls);
        },

        _uiSetSelected:function (v) {
            var self = this,
                el = self.get("el"),
                cls = self.getComponentCssClassWithState("-selected");
            el[v ? 'addClass' : 'removeClass'](cls);
        },

        _uiSetSelectable:function (v) {
            this.get("el").attr("role", v ? 'menuitemradio' : 'menuitem');
        },

        _uiSetCheckable:function (v) {
            if (v) {
                setUpCheckEl(this);
            }
            this.get("el").attr("role", v ? 'menuitemcheckbox' : 'menuitem');
        },

        containsElement:function (element) {
            var el = this.get("el");
            return el[0] == element || el.contains(element);
        }
    }, {
        ATTRS:{
            elAttrs:{
                valueFn:function () {
                    return {
                        role:"menuitem",
                        id:S.guid("ks-menuitem")
                    };
                }
            },
            selected:{},
            // @inheritedDoc
            // content:{},
            // 属性必须声明，否则无法和 _uiSetChecked 绑定在一起
            checked:{}
        }
    }, "Menu_Item_Render");
}, {
    requires:['node', 'uibase', 'component']
});/**
 * @fileOverview positionable and not focusable menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenu", function (S, UIBase, Component, Menu, PopupMenuRender) {

    function getParentMenu(self) {
        var subMenuItem = self.get("parent"),
            parentMenu;
        if (subMenuItem && subMenuItem.get("menu") == self) {
            parentMenu = subMenuItem.get("parent");
        }
        return parentMenu;
    }

    function getAutoHideParentMenu(self) {
        var parentMenu = getParentMenu(self);
        if (parentMenu && parentMenu.get(autoHideOnMouseLeave)) {
            return parentMenu;
        }
        return 0;
    }

    var autoHideOnMouseLeave = "autoHideOnMouseLeave";

    function clearOwn(self) {
        var l;
        if (l = self._leaveHideTimer) {
            clearTimeout(l);
            self._leaveHideTimer = 0;
        }
    }

    /**
     * Popup Menu
     * @name PopupMenu
     * @memberOf Menu
     * @constructor
     * @extends Menu
     * @extends UIBase.Position
     * @extends UIBase.Align
     */
    var PopupMenu = UIBase.create(Menu, [
        UIBase.ContentBox,
        UIBase.Position,
        UIBase.Align
    ],
        /**
         * @lends Menu.PopupMenu#
         */
        {
            _clearLeaveHideTimers:function () {
                var self = this, i, item, menu;
                if (!self.get(autoHideOnMouseLeave)) {
                    return;
                }
                // 清除自身
                clearOwn(self);
                var cs = self.get("children");
                for (i = 0; i < cs.length; i++) {
                    item = cs[i];
                    // 递归清除子菜单
                    if ((menu = item.get("menu")) &&
                        // 不是懒加载函数
                        !S.isFunction(menu) &&
                        menu.get(autoHideOnMouseLeave)) {
                        menu._clearLeaveHideTimers();
                    }
                }
            },

            /**
             * Handle mouseleave event.Make parent subMenu item unHighlighted.
             * Protected, should only be overridden by subclasses.
             * @protected
             * @override
             */
            handleMouseLeave:function () {
                var self = this,
                    parent;
                if (!self.get(autoHideOnMouseLeave)) {
                    return;
                }
                self._leaveHideTimer = setTimeout(function () {
                    self.hide();
                    var subMenuItem = self.get("parent"), m;
                    if (subMenuItem) {
                        m = getParentMenu(self);
                        // 过段时间仍然是父亲 submenu 仍然是他的兄弟中高亮，证明已经离开
                        // 否则
                        // 1.鼠标移到 submenu 的话，submenu mouseenter clearTimers,
                        //   这个 timer 执行不了！
                        //
                        // 2.鼠标移到了 submenu 并列的其他 menuitem，
                        //   导致其他 menuitem highlighted
                        //   那么 当前所属 submenu unhighlighted
                        //   执行 clearTimers ，这个 timer 仍然不执行

                        // 那么只剩下一种情况，移除了整个嵌套的 menu，
                        // 那么执行该 timer
                        // menu hide 并且将其所属的 submenu 高亮去掉！
                        if (m && m.get("highlightedItem") === subMenuItem) {
                            m.set("highlightedItem", null);
                        }
                    }
                }, self.get("autoHideDelay"));
                parent = getAutoHideParentMenu(self);
                if (parent) {
                    parent.handleMouseLeave();
                }
            },

            /**
             * Handle mouseenter event.Make parent subMenu item highlighted.
             * Protected, should only be overridden by subclasses.
             * @protected
             * @override
             */
            handleMouseEnter:function () {
                var self = this;
                if (!self.get(autoHideOnMouseLeave)) {
                    return;
                }
                var parent = getAutoHideParentMenu(self);
                if (parent) {
                    parent.handleMouseEnter();
                }
                self._clearLeaveHideTimers();
            },


            /**
             * Suppose it has focus (as a context menu), then it must hide when lose focus.
             * Protected, should only be overridden by subclasses.
             * @protected
             * @override
             */
            handleBlur:function () {
                var self = this;
                PopupMenu.superclass.handleBlur.apply(self, arguments);
                self.hide();
            }
        }, {
            ATTRS:/**
             * @lends Menu.PopupMenu#
             */
            {
                // 弹出菜单一般不可聚焦，焦点在使它弹出的元素上
                /**
                 * Whether the popup menu is focuable.
                 * Default : false.
                 * @type Boolean
                 */
                focusable:{
                    value:false
                },
                visibleMode:{
                    value:"visibility"
                },
                /**
                 * Whether the popup menu hides when mouseleave.
                 * Default : false.
                 * @type Boolean
                 */
                autoHideOnMouseLeave:{},
                /**
                 * After how much time the popup menu hides when mouseleave.
                 * Unit : second.
                 * Default : 0.1.
                 * @type Number
                 */
                autoHideDelay:{
                    value:0.1
                }
            },
            DefaultRender:PopupMenuRender
        }, "Menu_PopupMenu");

    Component.UIStore.setUIConstructorByCssClass("popupmenu", {
        priority:Component.UIStore.PRIORITY.LEVEL2,
        ui:PopupMenu
    });

    return PopupMenu;

}, {
    requires:['uibase', 'component', './base', './popupmenuRender']
});/**
 * @fileOverview popup menu render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenuRender", function (S, UA, UIBase, MenuRender) {
    return UIBase.create(MenuRender, [
        UIBase.ContentBox.Render,
        UIBase.Position.Render,
        UA['ie'] === 6 ? UIBase.Shim.Render : null
    ], "Menu_PopupMenu_Render");
}, {
    requires:['ua', 'uibase', './menuRender']
});/**
 * @fileOverview menu separator def
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/separator", function (S, UIBase, Component, SeparatorRender) {

    var Separator = UIBase.create(Component.Controller, {
    }, {
        ATTRS:{
            focusable:{
                value:false
            },
            // 分隔线禁用，不可以被键盘访问
            disabled:{
                value:true
            },
            handleMouseEvents:{
                value:false
            }
        },
        DefaultRender:SeparatorRender
    }, "Menu_Separator");

    Component.UIStore.setUIConstructorByCssClass("menuseparator", {
        priority:Component.UIStore.PRIORITY.LEVEL2,
        ui:Separator
    });

    return Separator;

}, {
    requires:['uibase', 'component', './separatorRender']
});/**
 * @fileOverview menu separator render def
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/separatorRender", function (S, UIBase, Component) {

    return UIBase.create(Component.Render, {
        createDom:function () {
            this.get("el").attr("role", "separator");
        }
    }, "Menu_Separator_Render");

}, {
    requires:['uibase', 'component']
});/**
 * @fileOverview submenu model and control for kissy , transfer item's keycode to menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/submenu", function (S, Event, UIBase, Component, MenuItem, SubMenuRender) {

    /* or precisely submenuitem */


    function bindMenu(self, menu) {
        /**
         * 自己不是 menu，自己只是 menuitem，其所属的 menu 为 get("parent")
         */
        var parentMenu = self.get("parent");

        //当改菜单项所属的菜单隐藏后，该菜单项关联的子菜单也要隐藏
        if (parentMenu) {

            parentMenu.on("hide", self._onParentHide, self);

            // 子菜单选中后也要通知父级菜单
            // 不能使用 afterSelectedItemChange ，多个 menu 嵌套，可能有缓存
            // 单个 menu 来看可能 selectedItem没有变化
            menu.on("click", function (ev) {
                parentMenu.fire("click", {
                    target:ev.target
                });
            });

            // if not bind doc click for parent menu
            // if already bind, then if parent menu hide, menu will hide too
            if (!parentMenu.__bindDocClickToHide) {
                Event.on(doc, "click", _onDocClick, self);
                parentMenu.__bindDocClickToHide = 1;
                menu.__bindDocClickToHide = 1;
            }

            // 通知父级菜单
            menu.on("afterActiveItemChange", function (ev) {
                parentMenu.set("activeItem", ev.newVal);
            });
        }
        // 访问子菜单，当前 submenu 不隐藏 menu
        // leave submenuitem -> enter menuitem -> menu item highlight ->
        // -> menu highlight -> onChildHighlight_ ->

        // menu render 后才会注册 afterHighlightedItemChange 到 _uiSet
        // 这里的 onChildHighlight_ 比 afterHighlightedItemChange 先执行
        // 保险点用 beforeHighlightedItemChange
        menu.on("beforeHighlightedItemChange", self.onChildHighlight_, self);
    }

    function getMenu(self, init) {
        var m = self.get("menu");
        if (S.isFunction(m)) {
            if (init) {
                m = m.call(self);
                self.__set("menu", m);
            } else {
                return null;
            }
        } else {
            m = Component.Controller.create(m,self);
            self.__set("menu", m);
        }
        if (m && m.get("parent") !== self) {
            m.__set("parent", self);
            bindMenu(self, m);
        }
        return m;
    }

    function _onDocClick(e) {
        var self = this,
            menu = getMenu(self),
            target = e.target,
            parentMenu = self.get("parent"),
            el = self.get("el");

        // only hide this menu, if click outside this menu and this menu's submenus
        if (!parentMenu.containsElement(target)) {
            menu && menu.hide();
            // submenuitem should also hide
            self.get("parent").set("highlightedItem", null);
        }
    }

    var KeyCodes = Event.KeyCodes,
        doc = S.Env.host.document,
        MENU_DELAY = 300;
    /**
     * Class representing a submenu that can be added as an item to other menus.
     */
    var SubMenu = UIBase.create(MenuItem, [Component.DecorateChild], {

            _onParentHide:function () {
                var menu = getMenu(this);
                menu && menu.hide();
            },

            handleMouseEnter:function (e) {
                var self = this;
                if (SubMenu.superclass.handleMouseEnter.call(self, e)) {
                    return true;
                }
                self.clearTimers();
                self.showTimer_ = S.later(self.showMenu,
                    self.get("menuDelay"), false, self);
            },

            showMenu:function () {
                var self = this,
                    menu = getMenu(self, 1);
                if (menu) {
                    menu.set("align", S.mix({
                        node:self.get("el"),
                        points:['tr', 'tl']
                    }, self.get("menuAlign")));
                    menu.render();
                    /**
                     * If activation of your menuitem produces a popup menu,
                     then the menuitem should have aria-haspopup set to the ID of the corresponding menu
                     to allow the assistive technology to follow the menu hierarchy
                     and assist the user in determining context during menu navigation.
                     */
                    self.get("el").attr("aria-haspopup",
                        menu.get("el").attr("id"));
                    menu.show();
                }
            },


            /**
             * Clears the show and hide timers for the sub menu.
             */
            clearTimers:function () {
                var self = this;
                if (self.dismissTimer_) {
                    self.dismissTimer_.cancel();
                    self.dismissTimer_ = null;
                }
                if (self.showTimer_) {
                    self.showTimer_.cancel();
                    self.showTimer_ = null;
                }
                var menu = getMenu(self);
                // TODO 耦合 popmenu.js
                if (menu && menu._leaveHideTimer) {
                    clearTimeout(menu._leaveHideTimer);
                    menu._leaveHideTimer = 0;
                }
            },

            /**
             * Listens to the sub menus items and ensures that this menu item is selected
             * while dismissing the others.  This handles the case when the user mouses
             * over other items on their way to the sub menu.
             * @param  e Highlight event to handle.
             * @private
             */
            onChildHighlight_:function (e) {
                var self = this;
                if (e.newVal) {
                    self.clearTimers();
                    // superclass(menuitem).handleMouseLeave 已经把自己 highlight 去掉了
                    // 导致本类 _uiSetHighlighted 调用，又把子菜单隐藏了
                    self.get("parent").set("highlightedItem", self);
                }
            },

            hideMenu:function () {
                var menu = getMenu(this);
                if (menu) {
                    menu.hide();
                }
            },

            // click ，立即显示
            performActionInternal:function () {
                var self = this;
                self.clearTimers();
                self.showMenu();
                //  trigger click event from menuitem
                SubMenu.superclass.performActionInternal.apply(self, arguments);
            },

            /**
             * Handles a key event that is passed to the menu item from its parent because
             * it is highlighted.  If the right key is pressed the sub menu takes control
             * and delegates further key events to its menu until it is dismissed OR the
             * left key is pressed.
             * @param e A key event.
             * @return {Boolean} Whether the event was handled.
             */
            handleKeydown:function (e) {
                var self = this,
                    menu = getMenu(self),
                    hasKeyboardControl_ = menu && menu.get("visible"),
                    keyCode = e.keyCode;

                if (!hasKeyboardControl_) {
                    // right
                    if (keyCode == KeyCodes.RIGHT) {
                        self.showMenu();
                        menu = getMenu(self);
                        if (menu) {
                            var menuChildren = menu.get("children");
                            if (menuChildren[0]) {
                                menu.set("highlightedItem", menuChildren[0]);
                            }
                        }
                    }
                    // enter as click
                    else if (e.keyCode == Event.KeyCodes.ENTER) {
                        return this.performActionInternal(e);
                    }
                    else {
                        return undefined;
                    }
                } else if (menu.handleKeydown(e)) {
                }
                // The menu has control and the key hasn't yet been handled, on left arrow
                // we turn off key control.
                // left
                else if (keyCode == KeyCodes.LEFT) {
                    self.hideMenu();
                    // 隐藏后，当前激活项重回
                    self.get("parent").set("activeItem", self);
                } else {
                    return undefined;
                }
                return true;
            },

            /**
             * @protected
             * Dismisses the submenu on a delay, with the result that the user needs less
             * accuracy when moving to submenus.
             **/
            _uiSetHighlighted:function (highlight, ev) {
                var self = this;
                SubMenu.superclass._uiSetHighlighted.call(self, highlight, ev);
                if (!highlight) {
                    self.clearTimers();
                    self.dismissTimer_ = S.later(self.hideMenu,
                        self.get("menuDelay"),
                        false, self);
                }
            },

            containsElement:function (element) {
                var menu = getMenu(this);
                return menu && menu.containsElement(element);
            },

            // 默认 addChild，这里里面的元素需要放到 menu 属性中
            decorateChildrenInternal:function (ui, el) {
                // 不能用 diaplay:none
                el.css("visibility", "hidden");
                var self = this,
                    docBody = S.one(el[0].ownerDocument.body);
                docBody.prepend(el);
                var menu = new ui({
                    srcNode:el,
                    prefixCls:self.get("prefixCls")
                });
                self.__set("menu", menu);
            },

            destructor:function () {
                var self = this,
                    parentMenu = self.get("parent"),
                    menu = getMenu(self);

                self.clearTimers();

                if (menu && menu.__bindDocClickToHide) {
                    menu.__bindDocClickToHide = 0;
                    Event.remove(doc, "click", _onDocClick, self);
                }

                //当改菜单项所属的菜单隐藏后，该菜单项关联的子菜单也要隐藏
                if (parentMenu) {
                    parentMenu.detach("hide", self._onParentHide, self);
                }

                if (menu && !self.get("externalSubMenu")) {
                    menu.destroy();
                }
            }
        },
        {
            ATTRS:{
                /**
                 * The delay before opening the sub menu in milliseconds.  (This number is
                 * arbitrary, it would be good to get some user studies or a designer to play
                 * with some numbers).
                 * @type {number}
                 */
                menuDelay:{
                    value:MENU_DELAY
                },
                /**
                 * whether destroy submenu when destroy itself ,reverse result
                 * @type {Boolean}
                 */
                externalSubMenu:{
                    value:false
                },
                menuAlign:{},
                menu:{
                },
                decorateChildCls:{
                    value:"popupmenu"
                }
            },

            DefaultRender:SubMenuRender
        }, "Menu_SubMenu");


    Component.UIStore.setUIConstructorByCssClass("submenu", {
        priority:Component.UIStore.PRIORITY.LEVEL2,
        ui:SubMenu
    });

    return SubMenu;
}, {
    requires:['event', 'uibase', 'component', './menuitem', './submenuRender']
});

/**

 **//**
 * @fileOverview submenu render for kissy ,extend menuitem render with arrow
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/submenuRender", function (S, UIBase, MenuItemRender) {
        var SubMenuRender;
        var ARROW_TMPL = '<span class="{prefixCls}submenu-arrow">►<' + '/span>';
        SubMenuRender = UIBase.create(MenuItemRender, {
            renderUI:function () {
                var self = this,
                    el = self.get("el");
                el.attr("aria-haspopup", "true")
                    .append(S.substitute(ARROW_TMPL, {
                    prefixCls:this.get("prefixCls")
                }));
            },
            _uiSetHtml:function (v) {
                var self = this;
                SubMenuRender.superclass._uiSetHtml.call(self, v);
                self.get("el").append(S.substitute(ARROW_TMPL, {
                    prefixCls:this.get("prefixCls")
                }));
            }
        }, "Menu_SubMenu_Render");
        return SubMenuRender;
    },
    {
        requires:['uibase', './menuitemRender']
    });
