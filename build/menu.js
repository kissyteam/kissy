/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:22
*/
/**
 * @ignore
 * menu controller for kissy,accommodate menu items
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/base", function (S, Event, Component, MenuRender, undefined) {

    var KeyCodes = Event.KeyCodes;

    /**
     * KISSY Menu.
     * xclass: 'menu'.
     * @class KISSY.Menu
     * @extends KISSY.Component.Container
     */
    var Menu = Component.Container.extend({
        isMenu: 1,


        // 只能允许一个方向，这个属性只是为了记录和排他性选择
        // 只允许调用 menuItem 的 set('highlighted')
        // 不允许调用 menu 的 set('highlightedItem')，内部调用时防止循环更新
        _onSetHighlightedItem: function (v, ev) {
            var highlightedItem;
            // ignore v == null
            // do not use set('highlightedItem',null) for api
            // use this.get('highlightedItem').set('highlighted', false);
            if (v && (highlightedItem = ev.prevVal)) {
                // in case set highlightedItem null again
                highlightedItem.set('highlighted', false, {
                    data: {
                        byPassSetHighlightedItem: 1
                    }
                });
            }
        },

        _onSetVisible: function (v, e) {
            Menu.superclass._onSetVisible.apply(this, arguments);
            var highlightedItem;
            if (!v && (highlightedItem = this.get('highlightedItem'))) {
                highlightedItem.set('highlighted', false);
            }
        },

        bindUI: function () {
            var self = this;
            self.on('afterHighlightedItemChange', afterHighlightedItemChange, self);
        },

        getRootMenu: function () {
            return this;
        },

        handleMouseEnter: function () {
            Menu.superclass.handleMouseEnter.apply(this, arguments);
            var rootMenu = this.getRootMenu();
            // maybe called by popupmenu, no submenu
            if (rootMenu && rootMenu._popupAutoHideTimer) {
                clearTimeout(rootMenu._popupAutoHideTimer);
                rootMenu._popupAutoHideTimer = null;
            }
            if (this.get('focusable')) {
                this.set('focused', true);
            }
        },

        handleBlur: function (e) {
            Menu.superclass.handleBlur.call(this, e);
            var highlightedItem;
            if (highlightedItem = this.get('highlightedItem')) {
                highlightedItem.set('highlighted', false);
            }
        },

        //dir : -1 ,+1
        //skip disabled items
        _getNextEnabledHighlighted: function (index, dir) {
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

        /**
         * Attempts to handle a keyboard event;
         * returns true if the event was handled,
         * false otherwise.
         * If the container is enabled, and a child is highlighted,
         * calls the child controller's {@code handleKeydown} method to give the control
         * a chance to handle the event first.
         * Protected, should only be overridden by subclasses.
         * @param {KISSY.Event.DOMEventObject} e Key event to handle.
         * @return {Boolean|undefined} Whether the event was handled by the container (or one of
         *     its children).
         * @protected
         *
         */
        handleKeyEventInternal: function (e) {

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

            var index, destIndex, nextHighlighted;

            //自己处理了，不要向上处理，嵌套菜单情况
            switch (e.keyCode) {
                // esc
                case KeyCodes.ESC:
                    // 清除所有菜单
                    if (highlightedItem = this.get('highlightedItem')) {
                        highlightedItem.set('highlighted', false);
                    }
                    break;

                // home
                case KeyCodes.HOME:
                    nextHighlighted = this._getNextEnabledHighlighted(0, 1);
                    break;
                // end
                case KeyCodes.END:
                    nextHighlighted = this._getNextEnabledHighlighted(len - 1, -1);
                    break;
                // up
                case KeyCodes.UP:
                    if (!highlightedItem) {
                        destIndex = len - 1;
                    } else {
                        index = S.indexOf(highlightedItem, children);
                        destIndex = (index - 1 + len) % len;
                    }
                    nextHighlighted = this._getNextEnabledHighlighted(destIndex, -1);
                    break;
                //down
                case KeyCodes.DOWN:
                    if (!highlightedItem) {
                        destIndex = 0;
                    } else {
                        index = S.indexOf(highlightedItem, children);
                        destIndex = (index + 1 + len) % len;
                    }
                    nextHighlighted = this._getNextEnabledHighlighted(destIndex, 1);
                    break;
            }
            if (nextHighlighted) {
                nextHighlighted.set('highlighted', true, {
                    data: {
                        fromKeyboard: 1
                    }
                });
                return true;
            } else {
                return undefined;
            }
        },

        /**
         * Whether this menu contains specified html element.
         * @param {KISSY.NodeList} element html Element to be tested.
         * @return {Boolean}
         * @protected
         */
        containsElement: function (element) {
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
                if (child.containsElement && child.containsElement(element)) {
                    return true;
                }
            }

            return false;
        }
    }, {
        ATTRS: {
            /**
             * Current highlighted child menu item.
             * @type {KISSY.Menu.Item}
             * @property highlightedItem
             * @readonly
             */
            /**
             * @ignore
             */
            highlightedItem: {
                value: null
            },
            xrender: {
                value: MenuRender
            },

            defaultChildCfg: {
                value: {
                    xclass:'menuitem'
                }
            }
        }
    }, {
        xclass: 'menu',
        priority: 10
    });

    // capture bubbling
    function afterHighlightedItemChange(e) {
        this.get('view').setAriaActiveDescendant(e.newVal);
    }

    return Menu;

}, {
    requires: ['event', 'component/base', './menu-render']
});

/**
 * @ignore
 * 普通菜单可聚焦
 * 通过 tab 聚焦到菜单的根节点，通过上下左右操作子菜单项
 *
 * TODO
 *  - 去除 activeItem. done@2013-03-12
 **//**
 * @ignore
 * filter menu render
 * 1.create filter input
 * 2.change menu content element
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/filtermenu-render", function (S, Node, MenuRender) {
    var $ = Node.all,
        MENU_FILTER = "menu-filter",
        MENU_FILTER_LABEL = "menu-filter-label",
        MENU_CONTENT = "menu-content";

    return MenuRender.extend({
        getContentElement:function () {
            return this.get("menuContent");
        },

        getKeyEventTarget:function () {
            return this.get("filterInput");
        },
        createDom:function () {
            var self = this;
            var prefixCls=self.get('prefixCls');
            var el = self.get('el');
            var filterWrap = self.get("filterWrap");
            if (!filterWrap) {
                self.set("filterWrap",
                    filterWrap = $("<div class='" + prefixCls+MENU_FILTER + "'/>")
                        .appendTo(el, undefined));
            }
            if (!this.get("labelEl")) {
                this.set("labelEl",
                    $("<div class='" + prefixCls+MENU_FILTER_LABEL + "'/>")
                        .appendTo(filterWrap, undefined));
            }
            if (!self.get("filterInput")) {
                self.set("filterInput", $("<input "+"autocomplete='off'/>")
                    .appendTo(filterWrap, undefined));
            }
            if (!self.get("menuContent")) {
                self.set("menuContent",
                    $("<div class='" + prefixCls+MENU_CONTENT + "'/>")
                        .appendTo(el, undefined));
            }
        },
        '_onSetLabel':function (v) {
            this.get("labelEl").html(v);
        }
    }, {
        ATTRS:{
            label:{}
        },

        HTML_PARSER:{
            labelEl:function (el) {
                return el.one("." + this.get('prefixCls')+MENU_FILTER)
                    .one("." + this.get('prefixCls')+MENU_FILTER_LABEL)
            },
            'filterWrap':function (el) {
                return el.one("." + this.get('prefixCls')+MENU_FILTER);
            },
            menuContent:function (el) {
                return el.one("." + this.get('prefixCls')+MENU_CONTENT);
            },
            filterInput:function (el) {
                return el.one("." + this.get('prefixCls')+MENU_FILTER)
                    .one("input");
            }
        }
    });

}, {
    requires:['node', './menu-render']
});/**
 * @ignore
 * menu where items can be filtered based on user keyboard input
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/filtermenu", function (S, Component, Menu, FilterMenuRender) {

    var HIT_CLS = "menuitem-hit";

    /**
     * Filter Menu for KISSY.
     * xclass: 'filter-menu'.
     * @extends KISSY.Menu
     * @class KISSY.Menu.FilterMenu
     */
    var FilterMenu = Menu.extend([Component.DecorateChild], {
            bindUI: function () {
                var self = this,
                    view = self.get("view"),
                    filterInput = view.get("filterInput");
                /*监控键盘事件*/
                filterInput.on("valuechange", self.handleFilterEvent, self);
            },

            handleMouseEnter: function () {
                var self = this;
                FilterMenu.superclass.handleMouseEnter.apply(self, arguments);
                // 权益解决,filter input focus 后会滚动到牌聚焦处,select 则不会
                // 如果 filtermenu 的菜单项被滚轮滚到后面,点击触发不了,会向前滚动到 filter input
                self.getKeyEventTarget()[0].select();
            },

            handleFilterEvent: function () {
                var self = this,
                    view = self.get("view"),
                    str,
                    filterInput = view.get("filterInput"),
                    highlightedItem = self.get("highlightedItem");
                /* 根据用户输入过滤 */
                self.set("filterStr", filterInput.val());
                str = filterInput.val();
                if (self.get('allowMultiple')) {
                    str = str.replace(/^.+,/, '');
                }

                if (!str && highlightedItem) {
                    highlightedItem.set('highlighted', false);
                }
                // 尽量保持原始高亮
                // 如果没有高亮项或者高亮项因为过滤被隐藏了
                // 默认选择符合条件的第一项
                else if (str && (!highlightedItem || !highlightedItem.get("visible"))) {
                    highlightedItem = self._getNextEnabledHighlighted(0, 1);
                    if (highlightedItem) {
                        highlightedItem.set('highlighted', true);
                    }
                }
            },

            '_onSetFilterStr': function (v) {
                // 过滤条件变了立即过滤
                this.filterItems(v);
            },

            /**
             * Specify how to filter items.
             * @param {String} str User input.
             */
            filterItems: function (str) {
                var self = this,
                    prefixCls = self.get('prefixCls'),
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
                                content = item && item.get("content");
                            // 有高亮而且最后一项不为空补全
                            if (content && content.indexOf(lastWord) > -1 && lastWord) {
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
                        // S.log("enteredItems : ");
                        // S.log(enteredItems);
                        self.set("enteredItems", enteredItems);
                    }
                }

                var children = self.get("children"),
                    strExp = str && new RegExp(S.escapeRegExp(str), "ig");

                // 过滤所有子组件
                S.each(children, function (c) {
                    var content = c.get("content");
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
                                return "<span class='" + prefixCls + HIT_CLS + "'>" + m + "<" + "/span>";
                            }));
                        } else {
                            // 不符合
                            // 隐藏
                            c.set("visible", false);
                        }
                    }
                });
            },

            /**
             * Reset user input.
             */
            reset: function () {
                var self = this,
                    view = self.get("view");
                self.set("filterStr", "");
                self.set("enteredItems", []);
                var filterInput = view && view.get("filterInput");
                filterInput && filterInput.val("");
            },

            destructor: function () {
                var view = this.get("view");
                var filterInput = view && view.get("filterInput");
                filterInput && filterInput.detach();
            }

        },
        {
            ATTRS: {
                allowTextSelection: {
                    value: true
                },

                /**
                 * Hit info string
                 * @cfg {String} label
                 */
                /**
                 * @ignore
                 */
                label: {
                    view: 1
                },

                /**
                 * Filter string
                 * @cfg {String} filterStr
                 */
                /**
                 * @ignore
                 */
                filterStr: {
                },

                /**
                 * user entered string list when allowMultiple.
                 * @type {String[]}
                 * @ignore
                 */
                enteredItems: {
                    value: []
                },

                /**
                 * Whether to allow input multiple.
                 * @cfg {Boolean} allowMultiple
                 */
                /**
                 * @ignore
                 */
                allowMultiple: {
                    value: false
                },

                decorateChildCls: {
                    value: 'menu-content'
                },

                xrender: {
                    value: FilterMenuRender
                }
            }
        }, {
            xclass: 'filter-menu',
            priority: 20
        });

    return FilterMenu;
}, {
    requires: ['component/base', './base', './filtermenu-render']
});/**
 * @ignore
 * render aria from menu according to current menuitem
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menu-render", function(S, Component) {

    return Component.Render.extend({

        renderUI:function() {
            var el = this.get("el");
            el .attr("role", "menu")
                .attr("aria-haspopup", true);
            if (!el.attr("id")) {
                el.attr("id", S.guid("ks-menu"));
            }
        },

        setAriaActiveDescendant:function(v) {
            var el = this.get("el");
            if (v) {
                var menuItemEl = v.get("el"),
                    id = menuItemEl.attr("id");
                el.attr("aria-activedescendant", id);
                // 会打印重复 ，每个子菜单都会打印，然后冒泡至父菜单，再打印，和该 menuitem 所处层次有关系
            } else {
                el.attr("aria-activedescendant", "");
            }
        },

        containsElement:function(element) {
            var el = this.get("el");
            return el[0] === element || el.contains(element);
        }
    });
}, {
    requires:['component/base']
});/**
 * @ignore
 * menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu", function (S, Menu, Render, Item, ItemRender, SubMenu, SubMenuRender, PopupMenu, PopupMenuRender, FilterMenu) {
    Menu.Render = Render;
    Menu.Item = Item;
    Item.Render = ItemRender;
    Menu.SubMenu = SubMenu;
    SubMenu.Render = SubMenuRender;
    Menu.PopupMenu = PopupMenu;
    PopupMenu.Render = PopupMenuRender;
    Menu.FilterMenu = FilterMenu;
    return Menu;
}, {
    requires:[
        'menu/base',
        'menu/menu-render',
        'menu/menuitem',
        'menu/menuitem-render',
        'menu/submenu',
        'menu/submenu-render',
        'menu/popupmenu',
        'menu/popupmenu-render',
        'menu/filtermenu'
    ]
});/**
 * @ignore
 * simple menuitem render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitem-render", function (S, Node, Component, undefined) {

    var CHECK_CLS = "menuitem-checkbox";

    function setUpCheckEl(self) {
        var el = self.get("el"),
            prefixCls = self.get('prefixCls'),
            checkEl = el.one("." + prefixCls + CHECK_CLS);
        if (!checkEl) {
            checkEl = new Node("<div class='" + prefixCls + CHECK_CLS + "'/>")
                .prependTo(el);
            // if not ie will lose focus when click
            checkEl.unselectable(/**
             @type HTMLElement
             @ignore
             */undefined);
        }
        return checkEl;
    }

    return Component.Render.extend({

        createDom:function(){
            this.get('el').attr({
                role: "menuitem",
                id: S.guid("ks-menuitem")
            });
        },

        _onSetChecked: function (v) {
            var self = this,
                el = self.get("el"),
                cls = self.getCssClassWithState("checked");
            el[v ? 'addClass' : 'removeClass'](cls);
        },

        _onSetSelected: function (v) {
            var self = this,
                el = self.get("el"),
                cls = self.getCssClassWithState("selected");
            el[v ? 'addClass' : 'removeClass'](cls);
        },

        '_onSetSelectable': function (v) {
            this.get("el").attr("role", v ? ('menuitem'+'radio') : 'menuitem');
        },

        '_onSetCheckable': function (v) {
            if (v) {
                setUpCheckEl(this);
            }
            this.get("el").attr("role", v ? ('menuitem'+'checkbox') : 'menuitem');
        },

        containsElement: function (element) {
            var el = this.get("el");
            return el && ( el[0] == element || el.contains(element));
        }
    }, {
        ATTRS: {
            checkable: {},
            selected: {},
            // 属性必须声明，否则无法和 _onSetChecked 绑定在一起
            checked: {}
        },
        HTML_PARSER: {
            selectable: function (el) {
                var cls = this.getCssClassWithPrefix("menuitem-selectable");
                return el.hasClass(cls);
            },
            checkable: function (el) {
                var cls = this.getCssClassWithPrefix("menuitem-checkable");
                return el.hasClass(cls);
            }
        }
    });
}, {
    requires: ['node', 'component/base']
});/**
 * @ignore
 * menu item ,child component for menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitem", function (S, Component, MenuItemRender) {

    var $ = S.all;

    /**
     * @class KISSY.Menu.Item
     * A menu item component which menu is consisted of.
     * xclass: 'menuitem'.
     * @extends KISSY.Component.Controller
     */
    var MenuItem = Component.Controller.extend({

        isMenuItem: 1,

        // for ios, ios only has touchdown
        handleMouseDown: function (e) {
            MenuItem.superclass.handleMouseDown.call(this, e);
            this.set("highlighted", true);
        },

        /**
         * Perform default action when click on enter on this menuitem.
         * If selectable, then make it selected.
         * If checkable, then toggle it.
         * Finally fire click on its parent menu.
         * @protected
         */
        performActionInternal: function () {
            var self = this;
            // 可选
            if (self.get("selectable")) {
                self.set("selected", true);
            }
            // 可选中，取消选中
            if (self.get("checkable")) {
                self.set("checked", !self.get("checked"));
            }
            self.fire("click");
            return true;
        },

        // 只允许调用 menuItem 的 set('highlighted')
        // 不允许调用 menu 的 set('highlightedItem')
        _onSetHighlighted: function (v, e) {
            if (e && e.byPassSetHighlightedItem) {

            } else {
                this.get('parent').set('highlightedItem', v ? this : null);
            }
            // 是否要滚动到当前菜单项(横向，纵向)
            if (v) {
                var el = this.get("el"),
                // 找到向上路径上第一个可以滚动的容器，直到父组件节点（包括）
                // 找不到就放弃，为效率考虑不考虑 parent 的嵌套可滚动 div
                    p = el.parent(function (e) {
                        return $(e).css("overflow") != "visible";
                    }, this.get('parent').get("el").parent());
                if (!p) {
                    return;
                }
                el.scrollIntoView(p, {
                    alignWithTop: true,
                    allowHorizontalScroll: true,
                    onlyScrollIfNeeded: true
                });
            }
        },

        /**
         * Check whether this menu item contains specified element.
         * @param {KISSY.NodeList} element Element to be tested.
         * @protected
         */
        containsElement: function (element) {
            return this.get('view') && this.get('view').containsElement(element);
        }

    }, {
        ATTRS: {

            focusable: {
                value: false
            },

            handleMouseEvents: {
                value: false
            },

            /**
             * Whether the menu item is selectable or not.
             * Set to true for option.
             * @cfg {Boolean} selectable
             */
            /**
             * @ignore
             */
            selectable: {
                view: 1
            },

            /**
             * Whether the menu item is checkable or not.
             * Set to true for checkbox option.
             * @cfg {Boolean} checkable
             */
            /**
             * @ignore
             */
            checkable: {
                view: 1
            },

            /**
             * The value associated with the menu item.
             * @cfg {*} value
             */
            /**
             * The value associated with the menu item.
             * @property value
             * @type {*}
             */
            /**
             * @ignore
             */
            value: {},

            /**
             * Whether the menu item is checked.
             * @type {Boolean}
             * @property checked
             */
            /**
             * Whether the menu item is checked.
             * @cfg {Boolean} checked
             */
            /**
             * @ignore
             */
            checked: {
                view: 1
            },

            /**
             * Whether the menu item is selected.
             * @type {Boolean}
             * @property selected
             */
            /**
             * Whether the menu item is selected.
             * @cfg {Boolean} selected
             */
            /**
             * @ignore
             */
            selected: {
                view: 1
            },

            xrender: {
                value: MenuItemRender
            }
        }
    }, {
        xclass: "menuitem",
        priority: 10
    });

    return MenuItem;
}, {
    requires: ['component/base', './menuitem-render']
});/**
 * @ignore
 * popup menu render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenu-render", function (S, extension, MenuRender) {

    var UA= S.UA;

    return MenuRender.extend([
        extension.ContentBox.Render,
        extension.Position.Render,
        UA['ie'] === 6 ? extension.Shim.Render : null
    ]);
}, {
    requires:['component/extension', './menu-render']
});/**
 * @ignore
 * positionable and not focusable menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenu", function (S, extension, Menu, PopupMenuRender) {

    /**
     * Popup Menu.
     * xclass: 'popupmenu'.
     * @class KISSY.Menu.PopupMenu
     * @extends KISSY.Menu
     * @mixins KISSY.Component.Extension.Position
     * @mixins KISSY.Component.Extension.Align
     */
    var PopupMenu = Menu.extend([
        extension.Position,
        extension.Align
    ],
        {
            // 根菜单 popupmenu 或者到中间的 menu 菜单
            'getRootMenu': function () {
                var cur = this,
                    last;
                do {
                    // 沿着 menu，menuitem 链
                    last = cur;
                    cur = cur.get('parent');
                } while (cur && (cur.isMenuItem || cur.isMenu));
                return last === this ? null : last;
            },

            handleMouseLeave: function (e) {
                PopupMenu.superclass.handleMouseLeave.apply(this, arguments);
                // sub menuitem 有时不灵敏
                var parent = this.get('parent');
                if (parent && parent.isSubMenu) {
                    parent.clearSubMenuTimers();
                }
                if (this.get('autoHideOnMouseLeave')) {
                    var rootMenu = this.getRootMenu();
                    if (rootMenu) {
                        clearTimeout(rootMenu._popupAutoHideTimer);
                        rootMenu._popupAutoHideTimer = setTimeout(function () {
                            var item;
                            if (item = rootMenu.get('highlightedItem')) {
                                item.set('highlighted', false);
                            }
                        }, this.get('parent').get('menuDelay') * 1000);
                    }
                }
            },

            isPopupMenu: 1,

            /**
             * Suppose it has focus (as a context menu), then it must hide when lose focus.
             * Protected, should only be overridden by subclasses.
             * @protected
             */
            handleBlur: function () {
                var self = this;
                PopupMenu.superclass.handleBlur.apply(self, arguments);
                self.hide();
            }
        }, {
            ATTRS: {
                // 弹出菜单一般不可聚焦，焦点在使它弹出的元素上
                /**
                 * Whether the popup menu is focusable.
                 * Defaults to: false.
                 * @type {Boolean}
                 * @ignore
                 */
                focusable: {
                    value: false
                },

                /**
                 * Whether the whole menu tree which contains popup menu hides when mouseleave.
                 * Only valid for submenu 's popupmenu.
                 * Defaults to: false.
                 * @cfg {Boolean} autoHideOnMouseLeave
                 */
                /**
                 * @ignore
                 */
                autoHideOnMouseLeave: {},

                xrender: {
                    value: PopupMenuRender
                }
            }
        }, {
            xclass: 'popupmenu',
            priority: 20
        });

    return PopupMenu;

}, {
    requires: ['component/extension',
        './base', './popupmenu-render']
});/**
 * @ignore
 * submenu render for kissy ,extend menuitem render with arrow
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/submenu-render", function (S, MenuItemRender) {
    var SubMenuRender,
        CONTENT_TMPL = '<span class="{prefixCls}menuitem-content"><' + '/span>',
        ARROW_TMPL = '<span class="{prefixCls}submenu-arrow">►<' + '/span>';

    SubMenuRender = MenuItemRender.extend({
        createDom: function () {
            var self = this,
                el = self.get("el");
            el.attr("aria-haspopup", "true")
                .append(S.substitute(ARROW_TMPL, {
                prefixCls: self.get('prefixCls')
            }));
        }
    }, {
        ATTRS: {
            arrowEl: {},
            contentEl: {
                valueFn: function () {
                    return S.all(S.substitute(CONTENT_TMPL, {
                        prefixCls: this.get('prefixCls')
                    }));
                }
            }
        },
        HTML_PARSER: {
            contentEl: function (el) {
                return el.children("." + this.get('prefixCls') + "menuitem-content");
            }
        }
    });

    return SubMenuRender;
}, {
    requires: ['./menuitem-render']
});/**
 * @ignore
 * submenu controller for kissy, transfer item's keyCode to menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/submenu", function (S, Event, Component, MenuItem, SubMenuRender) {

    function afterHighlightedChange(e) {
        var target = e.target;
        // hover 子菜单，保持该菜单项高亮
        if (target !== this && target.isMenuItem && e.newVal) {
            clearSubMenuTimers(this);
            if (!this.get('highlighted')) {
                this.set('highlighted', true);
                // refresh highlightedItem of parent menu
                target.set('highlighted', false);
                target.set('highlighted', true);
            }
        }
    }

    // Clears the show and hide timers for the sub menu.
    function clearSubMenuTimers(self) {
        var dismissTimer_,
            showTimer_;
        if (dismissTimer_ = self.dismissTimer_) {
            dismissTimer_.cancel();
            self.dismissTimer_ = null;
        }
        if (showTimer_ = self.showTimer_) {
            showTimer_.cancel();
            self.showTimer_ = null;
        }
    }

    /* or precisely subMenuItem */
    var KeyCodes = Event.KeyCodes,
        MENU_DELAY = 0.15;
    /**
     * Class representing a submenu that can be added as an item to other menus.
     * xclass: 'submenu'.
     * @extends KISSY.Menu.Item
     * @class KISSY.Menu.SubMenu
     */
    var SubMenu = MenuItem.extend([Component.DecorateChild], {

            isSubMenu: 1,

            clearSubMenuTimers: function () {
                clearSubMenuTimers(this);
            },

            bindUI: function () {
                this.on('afterHighlightedChange', afterHighlightedChange, this);
            },

            handleMouseLeave: function () {
                var self = this;
                self.set('highlighted', false, {
                    data: {
                        fromMouse: 1
                    }
                });
                clearSubMenuTimers(self);
                var menu = getMenu(self);
                if (menu && menu.get('visible')) {
                    // 延迟 highlighted
                    self.dismissTimer_ = S.later(hideMenu, self.get("menuDelay") * 1000, false, self);
                }
            },

            handleMouseEnter: function () {
                var self = this;
                self.set('highlighted', true, {
                    data: {
                        fromMouse: 1
                    }
                });
                clearSubMenuTimers(self);
                var menu = getMenu(self);
                if (!menu || !menu.get('visible')) {
                    self.showTimer_ = S.later(showMenu, self.get("menuDelay") * 1000, false, self);
                }
            },

            /**
             * Dismisses the submenu on a delay, with the result that the user needs less
             * accuracy when moving to sub menus.
             * @protected
             */
            _onSetHighlighted: function (v, e) {
                var self = this;
                // sync
                if (!e) {
                    return;
                }
                SubMenu.superclass._onSetHighlighted.apply(this, arguments);
                if (e.fromMouse) {
                    return;
                }
                if (v && !e.fromKeyboard) {
                    showMenu.call(self);
                } else if (!v) {
                    hideMenu.call(self);
                }
            },

            // click ，立即显示
            performActionInternal: function () {
                var self = this;
                showMenu.call(self);
                //  trigger click event from menuitem
                SubMenu.superclass.performActionInternal.apply(self, arguments);
            },

            /**
             * Handles a key event that is passed to the menu item from its parent because
             * it is highlighted.  If the right key is pressed the sub menu takes control
             * and delegates further key events to its menu until it is dismissed OR the
             * left key is pressed.
             * Protected for subclass overridden.
             * @param {KISSY.Event.DOMEventObject} e key event.
             * @protected
             * @return {Boolean|undefined} Whether the event was handled.
             */
            handleKeydown: function (e) {
                var self = this,
                    menu = getMenu(self),
                    menuChildren,
                    menuChild,
                    hasKeyboardControl_ = menu && menu.get("visible"),
                    keyCode = e.keyCode;

                if (!hasKeyboardControl_) {
                    // right
                    if (keyCode == KeyCodes.RIGHT) {
                        showMenu.call(self);
                        menu = getMenu(self);
                        if (menu) {
                            menuChildren = menu.get("children");
                            if (menuChild = menuChildren[0]) {
                                menuChild.set('highlighted', true, {
                                    data: {
                                        fromKeyboard: 1
                                    }
                                });
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
                    // refresh highlightedItem of parent menu
                    self.set('highlighted', false);
                    self.set('highlighted', true, {
                        data: {
                            fromKeyboard: 1
                        }
                    });
                } else {
                    return undefined;
                }
                return true;
            },

            containsElement: function (element) {
                var menu = getMenu(this);
                return menu && menu.containsElement(element);
            },

            // 默认 addChild，这里里面的元素需要放到 menu 属性中
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
                    menu = getMenu(self);

                clearSubMenuTimers(self);

                if (menu && menu.destroy) {
                    menu.destroy();
                }
            }
        },
        {
            ATTRS: {
                /**
                 * The delay before opening the sub menu in seconds.  (This number is
                 * arbitrary, it would be good to get some user studies or a designer to play
                 * with some numbers).
                 * Defaults to: 0.15
                 * @cfg {Number} menuDelay
                 */
                /**
                 * @ignore
                 */
                menuDelay: {
                    value: MENU_DELAY
                },
                /**
                 * Menu config or instance.
                 * @cfg {KISSY.Menu|Object} menu
                 */
                /**
                 * Menu config or instance.
                 * @property menu
                 * @type {KISSY.Menu|Object}
                 */
                /**
                 * @ignore
                 */
                menu: {
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

                decorateChildCls: {
                    value: 'popupmenu'
                },
                xrender: {
                    value: SubMenuRender
                }
            }
        }, {
            xclass: 'submenu',
            priority: 20
        });

    // # -------------------------------- private start

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

    function showMenu() {
        var self = this,
            el,
            align,
            menu = getMenu(self, 1);
        if (menu) {
            el = self.get('el');
            align = menu.get("align");
            delete align.node;
            align = S.clone(align);
            align.node = el;
            align.points = align.points || ['tr', 'tl'];
            menu.set("align", align);
            menu.show();
            /*
             If activation of your menuitem produces a popup menu,
             then the menuitem should have aria-haspopup set to the ID of the corresponding menu
             to allow the assist technology to follow the menu hierarchy
             and assist the user in determining context during menu navigation.
             */
            el.attr("aria-haspopup", menu.get("el").attr("id"));
        }
    }

    function hideMenu() {
        var menu = getMenu(this);
        if (menu) {
            menu.hide();
        }
    }

    // # ------------------------------------ private end

    return SubMenu;
}, {
    requires: ['event', 'component/base', './menuitem', './submenu-render']
});
