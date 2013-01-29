/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Jan 29 20:39
*/
/**
 * @ignore
 * menu controller for kissy,accommodate menu items
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/base", function (S, Event, Component, MenuRender) {
    var KeyCodes = Event.KeyCodes;

    function onMenuHide(e) {
        this.set("highlightedItem", null);
        e.stopPropagation();
    }

    /**
     * KISSY Menu.
     * xclass: 'menu'.
     * @class KISSY.Menu
     * @extends KISSY.Component.Container
     */
    var Menu = Component.Container.extend({
        _onSetHighlightedItem: function (v, ev) {
            var pre = ev && ev.prevVal;
            if (pre) {
                pre.set("highlighted", false);
            }
            v && v.set("highlighted", true);
            this.set("activeItem", v);
        },

        handleBlur: function (e) {
            Menu.superclass.handleBlur.call(this, e);
            this.set("highlightedItem", null);
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
         * @return {Boolean} Whether the event was handled by the container (or one of
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

        bindUI: function () {
            var self = this;
            // 隐藏后，去掉高亮与当前
            self.on("hide", onMenuHide, self);
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
                if (typeof child.containsElement == 'function' &&
                    child.containsElement(element)) {
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
             */
            /**
             * @ignore
             */
            highlightedItem: {},
            /**
             * Current active menu item.
             * Maybe a descendant but not a child of current menu.
             * @type {KISSY.Menu.Item}
             * @property activeItem
             */
            /**
             * @ignore
             */
            activeItem: {
                view: 1
            },
            xrender: {
                value: MenuRender
            },

            defaultChildXClass: {
                value: 'menuitem'
            }
        }
    }, {
        xclass: 'menu',
        priority: 10
    });

    return Menu;

}, {
    requires: ['event', 'component/base', './menu-render', './submenu']
});

/**
 * @ignore
 * 普通菜单可聚焦
 * 通过 tab 聚焦到菜单的根节点，通过上下左右操作子菜单项
 *
 * TODO
 *  - 去除 activeItem
 **//**
 * @ignore
 * filter menu render
 * 1.create filter input
 * 2.change menu contentelement
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
            var contentEl = MenuRender.prototype.getContentElement.call(this);
            var filterWrap = self.get("filterWrap");
            if (!filterWrap) {
                self.set("filterWrap",
                    filterWrap = $("<div class='" + prefixCls+MENU_FILTER + "'/>")
                        .appendTo(contentEl, undefined));
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
                        .appendTo(contentEl, undefined));
            }
        },

        '_onSetLabel':function (v) {
            this.get("labelEl").html(v);
        }
    }, {

        ATTRS:{
            /* 过滤输入框的提示 */
            label:{}
        },

        HTML_PARSER:{
            labelEl:function (el) {
                return el.one("." + this.get('prefixCls')+MENU_FILTER)
                    .one("." + this.get('prefixCls')+MENU_FILTER_LABEL)
            },
            filterWrap:function (el) {
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

    // 转义正则特殊字符,返回字符串用来构建正则表达式
    function regExpEscape(s) {
        return s.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
            replace(/\x08/g, '\\x08');
    }

    /**
     *
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
                filterInput.on("keyup", self.handleFilterEvent, self);
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
                    strExp = str && new RegExp(regExpEscape(str), "ig");

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
                    valueFn: function () {
                        return this.get("prefixCls") + "menu-content"
                    }
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

        _onSetActiveItem:function(v) {
            var el = this.get("el");
            if (v) {
                var menuItemEl = v.get("el"),
                    id = menuItemEl.attr("id");
                el.attr("aria-activedescendant", id);
                // 会打印重复 ，每个子菜单都会打印，然后冒泡至父菜单，再打印，和该 menuitem 所处层次有关系
                //S.log("menu-render :" + el.attr("id") + " _onSetActiveItem : " + v.get("content"));
            } else {
                el.attr("aria-activedescendant", "");
                //S.log("menu-render :" + el.attr("id") + " _onSetActiveItem : " + "");
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

        _onSetChecked: function (v) {
            var self = this,
                el = self.get("el"),
                cls = self.getCssClassWithState("-checked");
            el[v ? 'addClass' : 'removeClass'](cls);
        },

        _onSetSelected: function (v) {
            var self = this,
                el = self.get("el"),
                cls = self.getCssClassWithState("-selected");
            el[v ? 'addClass' : 'removeClass'](cls);
        },

        '_onSetSelectable': function (v) {
            this.get("el").attr("role", v ? 'menuitemradio' : 'menuitem');
        },

        '_onSetCheckable': function (v) {
            if (v) {
                setUpCheckEl(this);
            }
            this.get("el").attr("role", v ? 'menuitemcheckbox' : 'menuitem');
        },

        containsElement: function (element) {
            var el = this.get("el");
            return el && ( el[0] == element || el.contains(element));
        }
    }, {
        ATTRS: {
            checkable: {},
            elAttrs: {
                valueFn: function () {
                    return {
                        role: "menuitem",
                        id: S.guid("ks-menuitem")
                    };
                }
            },
            selected: {},
            // @inheritedDoc
            // content:{},
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

            /**
             * Handle mouseenter event. Make parent menu to highlight itself.
             * Protected, should only be overridden by subclasses.
             * @param {KISSY.Event.DOMEventObject} e Mouseenter event object.
             * @protected
             */
            handleMouseEnter: function (e) {
                // 父亲不允许自己处理
                if (MenuItem.superclass.handleMouseEnter.call(this, e)) {
                    return true;
                }
                this.get("parent").set("highlightedItem", this);
            },

            /**
             * Handle mouseleave event. Make parent menu to unhighlight itself.
             * Protected, should only be overridden by subclasses.
             * @param {KISSY.Event.DOMEventObject} e Mouseleave event object.
             * @protected
             *
             */
            handleMouseLeave: function (e) {
                // 父亲不允许自己处理
                if (MenuItem.superclass.handleMouseLeave.call(this, e)) {
                    return true;
                }
                this.get("parent").set("highlightedItem", null);
            },

            // for ios, ios only has touchdown
            handleMouseDown: function (e) {
                // 父亲不允许自己处理
                if (MenuItem.superclass.handleMouseDown.call(this, e)) {
                    return true;
                }
                this.get("parent").set("highlightedItem", this);
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

            _onSetHighlighted: function (v) {
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
                    el.scrollIntoView(p,{
                        alignWithTop:true,
                        allowHorizontalScroll:true,
                        onlyScrollIfNeeded:true
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
KISSY.add("menu/popupmenu", function (S,
                                      extension,
                                      Menu, PopupMenuRender) {

    var autoHideOnMouseLeave = "autoHideOnMouseLeave";


    /**
     * Popup Menu.
     * xclass: 'popupmenu'.
     * @class KISSY.Menu.PopupMenu
     * @extends KISSY.Menu
     * @mixins KISSY.Component.Extension.Position
     * @mixins KISSY.Component.Extension.Align
     */
    var PopupMenu = Menu.extend([
        extension.ContentBox,
        extension.Position,
        extension.Align
    ],
        {
            /**
             * Handle mouseleave event.Make parent subMenu item unHighlighted.
             * Protected, should only be overridden by subclasses.
             * @protected
             */
            handleMouseLeave:function () {
                var self = this;
                if (!self.get(autoHideOnMouseLeave)) {
                    return;
                }
                // 通知 submenu item buffer 层层检查，是否隐藏掉改子菜单以及子菜单的祖先菜单
                self.get("parent").hideParentMenusBuffer();
            },

            /**
             * Suppose it has focus (as a context menu), then it must hide when lose focus.
             * Protected, should only be overridden by subclasses.
             * @protected
             */
            handleBlur:function () {
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
                focusable:{
                    value:false
                },
                /**
                 * Whether the popup menu hides when mouseleave.
                 * Only valid for submenu.
                 * Defaults to: false.
                 * @cfg {Boolean} autoHideOnMouseLeave
                 */
                /**
                 * @ignore
                 */
                autoHideOnMouseLeave:{},

                xrender:{
                    value:PopupMenuRender
                }
            }
        }, {
            xclass:'popupmenu',
            priority:20
        });

    return PopupMenu;

}, {
    requires:['component/extension',
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
 * submenu controller for kissy, transfer item's keycode to menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/submenu", function (S, Event, Component, MenuItem, SubMenuRender) {

    /* or precisely submenuitem */

    var KeyCodes = Event.KeyCodes,
        doc = S.Env.host.document,
        MENU_DELAY = 0.15;
    /**
     * Class representing a submenu that can be added as an item to other menus.
     * xclass: 'submenu'.
     * @extends KISSY.Menu.Item
     * @class KISSY.Menu.SubMenu
     */
    var SubMenu = MenuItem.extend([Component.DecorateChild], {

            /**
             * Bind sub menu events.
             * Protected for subclass overridden.
             * @protected
             */
            bindSubMenu: function () {
                /**
                 * 自己不是 menu，自己只是 menuitem，其所属的 menu 为 get("parent")
                 */
                var self = this,
                    menu = self.get("menu"),
                    parentMenu = self.get("parent");

                //当改菜单项所属的菜单隐藏后，该菜单项关联的子菜单也要隐藏
                if (parentMenu) {

                    parentMenu.on("hide", onParentHide, self);

                    // if not bind doc click for parent menu
                    // if already bind, then if parent menu hide, menu will hide too
                    // !TODO 优化此处绑定！，不要特殊标记
                    if (!parentMenu.__bindDocClickToHide) {
                        // 绑到最根部
                        Event.on(doc, "click", _onDocClick, self);
                        parentMenu.__bindDocClickToHide = 1;
                        // 绑到最根部
                        menu.__bindDocClickToHide = 1;
                    }

                    // 通知父级菜单
                    menu.on("afterActiveItemChange", function (ev) {
                        parentMenu.set("activeItem", ev.newVal);
                        ev.stopPropagation();
                    });


                    menu.on("afterHighlightedItemChange", function (ev) {
                        if (ev.newVal) {
                            // 1. 菜单再次高亮时，取消隐藏
                            // 2. fix #160
                            self.set("highlighted", true);
                        }
                        ev.stopPropagation();
                    });

                    // 只绑定一次
                    self.bindSubMenu = S.noop;
                }

                // 访问子菜单，当前 submenu 不隐藏 menu
                // leave submenuitem -> enter menuitem -> menu item highlight ->
                // -> menu highlight -> beforeSubMenuHighlightChange ->

                // menu render 后才会注册 afterHighlightedItemChange 到 _onSet
                // 这里的 beforeSubMenuHighlightChange 比 afterHighlightedItemChange 先执行
                // 保险点用 beforeHighlightedItemChange
                menu.on("beforeHighlightedItemChange",
                    beforeSubMenuHighlightChange, self);
            },

            handleMouseEnter: function (e) {
                var self = this;
                if (SubMenu.superclass.handleMouseEnter.call(self, e)) {
                    return true;
                }
                // 两个作用
                // 1. 停止孙子菜单的层层检查，导致 highlighted false 而 buffer 的隐藏
                // 2. 停止本身 highlighted false 而 buffer 的隐藏
                self.clearSubMenuTimers();
                self.showTimer_ = S.later(showMenu, self.get("menuDelay") * 1000, false, self);
                return undefined;
            },

            /**
             * Dismisses the submenu on a delay, with the result that the user needs less
             * accuracy when moving to sub menus.
             * @protected
             */
            _onSetHighlighted: function (e) {
                var self = this;
                if (!e) {
                    self.dismissTimer_ = S.later(hideMenu, self.get("menuDelay") * 1000, false, self);
                }
            },

            /**
             * Clears the show and hide timers for the sub menu.
             * @private
             */
            clearSubMenuTimers: function () {
                var self = this,
                    dismissTimer_,
                    showTimer_;
                if (dismissTimer_ = self.dismissTimer_) {
                    dismissTimer_.cancel();
                    self.dismissTimer_ = null;
                }
                if (showTimer_ = self.showTimer_) {
                    showTimer_.cancel();
                    self.showTimer_ = null;
                }
            },

            // click ，立即显示
            performActionInternal: function () {
                var self = this;
                self.clearSubMenuTimers();
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
                    hasKeyboardControl_ = menu && menu.get("visible"),
                    keyCode = e.keyCode;

                if (!hasKeyboardControl_) {
                    // right
                    if (keyCode == KeyCodes.RIGHT) {
                        showMenu.call(self);
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
                    hideMenu.call(self);
                    // 隐藏后，当前激活项重回
                    self.get("parent").set("activeItem", self);
                } else {
                    return undefined;
                }
                return true;
            },

            hideParentMenusBuffer: function () {
                var self = this, parentMenu = self.get("parent");
                self.dismissTimer_ = S.later(function () {
                        var submenu = self,
                            popupmenu = self.get("menu");
                        while (popupmenu.get("autoHideOnMouseLeave")) {
                            // 取消高亮，buffer 隐藏子菜单
                            // 可能马上又移到上面，防止闪烁
                            // 相当于强制 submenu mouseleave
                            submenu.set("highlighted", false);
                            // 原来的 submenu 在高亮
                            // 表示越级选择 menu
                            if (parentMenu.get("highlightedItem") != submenu) {
                                break;
                            }
                            submenu = parentMenu.get("parent");
                            if (!submenu) {
                                break;
                            }
                            parentMenu = submenu.get("parent");
                            popupmenu = submenu.get("menu");
                        }
                    },
                    self.get("menuDelay") * 1000,
                    false,
                    self);
            },

            containsElement: function (element) {
                var menu = getMenu(this);
                return menu && menu.containsElement(element);
            },

            // 默认 addChild，这里里面的元素需要放到 menu 属性中
            decorateChildrenInternal: function (UI, el) {
                // 不能用 display:none
                el.css("visibility", "hidden");
                var self = this,
                    docBody = S.one(el[0].ownerDocument.body);
                docBody.prepend(el);
                var menu = new UI({
                    srcNode: el,
                    prefixCls: self.get("prefixCls")
                });
                self.setInternal("menu", menu);
            },

            destructor: function () {
                var self = this,
                    parentMenu = self.get("parent"),
                    menu = getMenu(self);

                self.clearSubMenuTimers();

                if (menu && menu.__bindDocClickToHide) {
                    menu.__bindDocClickToHide = 0;
                    Event.remove(doc, "click", _onDocClick, self);
                }

                //当改菜单项所属的菜单隐藏后，该菜单项关联的子菜单也要隐藏
                if (parentMenu) {
                    parentMenu.detach("hide", onParentHide, self);
                }

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
                        if (m instanceof  Component.Controller) {
                            m.setInternal("parent", this);
                        }
                    }
                },

                defaultChildXClass: {
                    value: 'popupmenu'
                },

                decorateChildCls: {
                    valueFn: function () {
                        return this.get("prefixCls") + "popupmenu"
                    }
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

    function _onDocClick(e) {
        var self = this,
            menu = getMenu(self),
            target = e.target,
            parentMenu = self.get("parent"),
            el = self.get("el");

        // only hide this menu, if click outside this menu and this menu's submenus
        if (!parentMenu.containsElement(target)) {
            menu && menu.hide();
            // sub menuitem should also hide
            self.get("parent").set("highlightedItem", null);
        }
    }

    function showMenu() {
        var self = this,
            menu = getMenu(self, 1);
        if (menu) {

            // 保证显示前已经绑定好事件
            self.bindSubMenu();

            var align = S.clone(menu.get("align"));
            align.node = self.get("el");
            align.points = align.points || ['tr', 'tl'];
            menu.set("align", align);
            menu.show();
            /*
             If activation of your menuitem produces a popup menu,
             then the menuitem should have aria-haspopup set to the ID of the corresponding menu
             to allow the assist technology to follow the menu hierarchy
             and assist the user in determining context during menu navigation.
             */
            self.get("el").attr("aria-haspopup",
                menu.get("el").attr("id"));
        }
    }

    function hideMenu() {
        var menu = getMenu(this);
        if (menu) {
            menu.hide();
        }
    }

    /**
     * Listens to the sub menus items and ensures that this menu item is selected
     * while dismissing the others.  This handles the case when the user mouses
     * over other items on their way to the sub menu.
     * @param  e Highlight event to handle.
     * @private
     */
    function beforeSubMenuHighlightChange(e) {
        var self = this;
        if (e.newVal) {
            self.clearSubMenuTimers();
            // superclass(menuitem).handleMouseLeave 已经把自己 highlight 去掉了
            // 导致本类 _onSetHighlighted 调用，又把子菜单隐藏了
            self.get("parent").set("highlightedItem", self);
        }
        e.stopPropagation();
    }

    function onParentHide(e) {
        var menu = getMenu(this);
        menu && menu.hide();
        e.stopPropagation();
    }

    // # ------------------------------------ private end

    return SubMenu;
}, {
    requires: ['event', 'component/base', './menuitem', './submenu-render']
});
