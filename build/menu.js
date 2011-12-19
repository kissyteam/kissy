/*
Copyright 2011, KISSY UI Library v1.20
MIT Licensed
build time: Dec 19 13:01
*/
/**
 * deletable menuitem
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/delmenuitem", function(S, Node, UIBase, Component, MenuItem, DelMenuItemRender) {
    var $ = Node.all;
    var CLS = DelMenuItemRender.CLS,
        DEL_CLS = DelMenuItemRender.DEL_CLS;

    function del(self) {
        var parent = self.get("parent");
        if (parent.fire("beforeDelete", {
            target:self
        }) === false) {
            return;
        }
        parent.removeChild(self, true);
        parent.set("highlightedItem", null);
        parent.fire("delete", {
            target:self
        });
    }

    var DelMenuItem = UIBase.create(MenuItem, {
        _performInternal:function(e) {
            var target = $(e.target);
            // 点击了删除
            if (target.hasClass(this.getCls(DEL_CLS))) {
                del(this);
                return true;
            }
            return MenuItem.prototype._performInternal.call(this, e);
        },
        _handleKeydown:function(e) {
            // d 键
            if (e.keyCode === Node.KeyCodes.D) {
                del(this);
                return true;
            }
        }
    }, {
        ATTRS:{
            delTooltip:{
                view:true
            }
        },
        DefaultRender:DelMenuItemRender
    });


    Component.UIStore.setUIByClass(CLS, {
        priority:Component.UIStore.PRIORITY.LEVEL4,
        ui:DelMenuItem
    });
    return DelMenuItem;
}, {
    requires:['node','uibase','component','./menuitem','./delmenuitemrender']
});/**
 * deletable menuitemrender
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/delmenuitemrender", function(S, Node, UIBase, Component, MenuItemRender) {
    var CLS = "menuitem-deletable",
        DEL_CLS = "menuitem-delete";
    var DEL_TMPL = '<span class="{prefixCls}' + DEL_CLS + '" title="{tooltip}">X<' + '/span>';

    function addDel(self) {
        self.get("contentEl").append(S.substitute(DEL_TMPL, {
            prefixCls:self.get("prefixCls"),
            tooltip:self.get("delTooltip")
        }));
    }

    return UIBase.create(MenuItemRender, {
        createDom:function() {
            addDel(this);
        },
        _uiSetContent:function(v) {
            var self = this;
            MenuItemRender.prototype._uiSetContent.call(self, v);
            addDel(self);
        },

        _uiSetDelTooltip:function() {
            this._uiSetContent(this.get("content"));
        }
    }, {
        ATTRS:{
            delTooltip:{}
        },
        HTML_PARSER:{
            delEl:function(el) {
                return el.one(this.getCls(DEL_CLS));
            }
        },
        CLS:CLS,
        DEL_CLS:DEL_CLS
    });
}, {
    requires:['node','uibase','component','./menuitemrender']
});/**
 *  menu where items can be filtered based on user keyboard input
 *  @author yiminghe@gmail.com
 */
KISSY.add("menu/filtermenu", function(S, UIBase, Component, Menu, FilterMenuRender) {

    var HIT_CLS = "menuitem-hit";

    // 转义正则特殊字符，返回字符串用来构建正则表达式
    function regExpEscape(s) {
        return s.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
            replace(/\x08/g, '\\x08');
    }

    var FilterMenu = UIBase.create(Menu, {
            bindUI:function() {
                var self = this,
                    view = self.get("view"),
                    filterInput = view.get("filterInput");
                /*监控键盘事件*/
                filterInput.on("keyup", self.handleFilterEvent, self);
            },

            _handleMouseEnter:function() {
                var self = this;
                FilterMenu.superclass._handleMouseEnter.apply(self, arguments);
                // 权益解决，filter input focus 后会滚动到牌聚焦处，select 则不会
                // 如果 filtermenu 的菜单项被滚轮滚到后面，点击触发不了，会向前滚动到 filter input
                self.getKeyEventTarget()[0].select();
            },

            handleFilterEvent:function() {
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

            _uiSetFilterStr:function(v) {
                // 过滤条件变了立即过滤
                this.filterItems(v);
            },

            filterItems:function(str) {
                var self = this,
                    view = self.get("view"),
                    _labelEl = view.get("labelEl"),
                    filterInput = view.get("filterInput");

                // 有过滤条件提示隐藏，否则提示显示
                _labelEl[str ? "hide" : "show"]();

                if (self.get("allowMultiple")) {
                    var enteredItems = [],
                        lastWord;

                    var match = str.match(/(.+)[,，]\s*([^，,]*)/);
                    // 已经确认的项
                    // , 号之前的项必定确认

                    var items = [];

                    if (match) {
                        items = match[1].split(/[,，]/);
                    }

                    // 逗号结尾
                    // 如果可以补全，那么补全最后一项为第一个高亮项
                    if (/[,，]$/.test(str)) {
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
                        // 需要菜单过滤的过滤词，在最后一个 , 后面
                        if (match) {
                            str = match[2] || "";
                        }
                        // 没有 , 则就是当前输入的
                        // else{ str=str}

                        //记录下
                        enteredItems = items;
                    }
                    var oldEnteredItems = self.get("enteredItems");
                    // 发生变化，长度变化和内容变化等同
                    if (oldEnteredItems.length != enteredItems.length) {
                        S.log("enteredItems : ");
                        S.log(enteredItems);
                        self.set("enteredItems", enteredItems);
                    }
                }

                var children = self.get("children"),
                    strExp = str && new RegExp(regExpEscape(str), "ig"),
                    // 匹配项样式类
                    hit = this.getCls(HIT_CLS);

                // 过滤所有子组件
                S.each(children, function(c) {
                    var content = c.get("content");
                    if (!str) {
                        // 没有过滤条件
                        // 恢复原有内容
                        // 显示出来
                        c.get("contentEl").html(content);
                        c.set("visible", true);
                    } else {
                        if (content.indexOf(str) > -1) {
                            // 如果符合过滤项
                            // 显示
                            c.set("visible", true);
                            // 匹配子串着重 wrap
                            c.get("contentEl").html(content.replace(strExp, function(m) {
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

            decorateInternal:function(el) {
                var self = this;
                self.set("el", el);
                var menuContent = el.one("." + self.getCls("menu-content"));
                self.decorateChildren(menuContent);
            },

            /**
             * 重置状态，用于重用
             */
            reset:function() {
                var self = this,
                    view = self.get("view");
                self.set("filterStr", "");
                self.set("enteredItems", []);
                var filterInput = view && view.get("filterInput");
                filterInput && filterInput.val("");
            },

            destructor:function() {
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
        }
    );

    Component.UIStore.setUIByClass("filtermenu", {
        priority:Component.UIStore.PRIORITY.LEVEL2,
        ui:FilterMenu
    });

    return FilterMenu;
}, {
    requires:['uibase','component','./menu','./filtermenurender']
});/**
 * filter menu render
 * 1.create filter input
 * 2.change menu contentelement
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/filtermenurender", function(S, Node, UIBase, MenuRender) {
    var $ = Node.all,
        MENU_FILTER = "menu-filter",
        MENU_FILTER_LABEL = "menu-filter-label",
        MENU_CONTENT = "menu-content";

    return UIBase.create(MenuRender, {
        getContentElement:function() {
            return this.get("menuContent");
        },

        getKeyEventTarget:function() {
            return this.get("filterInput");
        },
        createDom:function() {
            var self = this;
            var contentEl = MenuRender.prototype.getContentElement.call(this);
            var filterWrap = self.get("filterWrap");
            if (!filterWrap) {
                self.set("filterWrap",
                    filterWrap = $("<div class='" + this.getCls(MENU_FILTER) + "'/>")
                        .appendTo(contentEl));
            }
            if (!this.get("labelEl")) {
                this.set("labelEl",
                    $("<div class='" + this.getCls(MENU_FILTER_LABEL) + "'/>")
                        .appendTo(filterWrap));
            }
            if (!self.get("filterInput")) {
                self.set("filterInput", $("<input autocomplete='off'/>")
                    .appendTo(filterWrap));
            }
            if (!self.get("menuContent")) {
                self.set("menuContent",
                    $("<div class='" + this.getCls(MENU_CONTENT) + "'/>")
                        .appendTo(contentEl));
            }
        },

        _uiSetLabel:function(v) {
            this.get("labelEl").html(v);
        }
    }, {

        ATTRS:{
            /* 过滤输入框的提示 */
            label:{}
        },

        HTML_PARSER:{
            labelEl:function(el) {
                return el.one("." + this.getCls(MENU_FILTER))
                    .one("." + this.getCls(MENU_FILTER_LABEL))
            },
            filterWrap:function(el) {
                return el.one("." + this.getCls(MENU_FILTER));
            },
            menuContent:function(el) {
                return el.one("." + this.getCls(MENU_CONTENT));
            },
            filterInput:function(el) {
                return el.one("." + this.getCls(MENU_FILTER)).one("input");
            }
        }
    });

}, {
    requires:['node','uibase','./menurender']
});/**
 * menu model and controller for kissy,accommodate menu items
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menu", function (S, Event, UIBase, Component, MenuRender) {
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

            _handleBlur:function (e) {
                Menu.superclass._handleBlur.call(this, e);
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

            _handleKeydown:function (e) {
                if (this._handleKeyEventInternal(e)) {
                    e.halt();
                    return true;
                }
                // return false , 会阻止 tab 键 ....
                return undefined;
            },

            /**
             * Attempts to handle a keyboard event; returns true if the event was handled,
             * false otherwise.  If the container is enabled, and a child is highlighted,
             * calls the child control's {@code handleKeyEvent} method to give the control
             * a chance to handle the event first.
             * @param  e Key event to handle.
             * @return {boolean} Whether the event was handled by the container (or one of
             *     its children).
             */
            _handleKeyEventInternal:function (e) {

                // Give the highlighted control the chance to handle the key event.
                var highlightedItem = this.get("highlightedItem");

                // 先看当前活跃 menuitem 是否要处理
                if (highlightedItem && highlightedItem._handleKeydown(e)) {
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

            containsElement:function (element) {
                var self = this;
                if (!self.get("view") ||
                    self.get("view").containsElement(element)) {
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
            ATTRS:{
                // 普通菜单可聚焦
                // 通过 tab 聚焦到菜单的根节点，通过上下左右操作子菜单项
                focusable:{
                    value:true
                },
                visibleMode:{
                    value:"display"
                },
                /**
                 * 当前高亮的儿子菜单项
                 */
                highlightedItem:{},
                /**
                 * 当前 active 的子孙菜单项，并不一直等于 highlightedItem
                 */
                activeItem:{
                    view:true
                }
            },
            DefaultRender:MenuRender
        });

    Component.UIStore.setUIByClass("menu", {
        priority:Component.UIStore.PRIORITY.LEVEL1,
        ui:Menu
    });

    return Menu;

}, {
    requires:['event', 'uibase', 'component', './menurender', './submenu']
});

/**
 * TODO
 *  - 去除 activeItem
 **//**
 * menu item ,child component for menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitem", function (S, UIBase, Component, MenuItemRender) {

    var $ = S.all;

    var MenuItem = UIBase.create(Component.ModelControl, [UIBase.Contentbox], {

        _handleMouseEnter:function (e) {
            // 父亲不允许自己处理
            if (MenuItem.superclass._handleMouseEnter.call(this, e)) {
                return true;
            }
            this.get("parent").set("highlightedItem", this);
        },

        _handleMouseLeave:function (e) {
            // 父亲不允许自己处理
            if (MenuItem.superclass._handleMouseLeave.call(this, e)) {
                return true;
            }
            this.get("parent").set("highlightedItem", undefined);
        },

        _performInternal:function () {
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
                // 使用熟悉的 target，而不是自造新词！
                target:self
            });
            return true;
        },

        _uiSetChecked:function (v) {
            this._forwardSetAttrToView("checked", v);
        },

        _uiSetSelected:function (v) {
            this._forwardSetAttrToView("selected", v);
        },

        _uiSetHighlighted:function (v) {
            MenuItem.superclass._uiSetHighlighted.apply(this, arguments);
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

        containsElement:function (element) {
            return this.get('view') && this.get('view').containsElement(element);
        }

    }, {
        ATTRS:{

            /**
             * 是否支持焦点处理
             * @override
             */
            focusable:{
                value:false
            },

            visibleMode:{
                value:"display"
            },

            /**
             * 是否绑定鼠标事件
             * @override
             */
            handleMouseEvents:{
                value:false
            },

            selectable:{
                view:true
            },

            checkable:{
                view:true
            },

            // @inheritedDoc
            // option.text
            // content:{},

            // option.value
            value:{},

            checked:{},
            selected:{}
        },

        HTML_PARSER:{
            selectable:function (el) {
                var cls = this.getCls("menuitem-selectable");
                return el.hasClass(cls);
            }
        }
    });

    MenuItem.DefaultRender = MenuItemRender;

    Component.UIStore.setUIByClass("menuitem", {
        priority:Component.UIStore.PRIORITY.LEVEL1,
        ui:MenuItem
    });

    return MenuItem;
}, {
    requires:['uibase', 'component', './menuitemrender']
});/**
 * simple menuitem render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitemrender", function(S, Node, UIBase, Component) {

    var CHECK_CLS = "menuitem-checkbox",
        CONTENT_CLS = "menuitem-content";

    function setUpCheckEl(self) {
        var el = self.get("el"),
            cls = self.getCls(CHECK_CLS),
            checkEl = el.one("." + cls);
        if (!checkEl) {
            checkEl = new Node("<div class='" + cls + "'/>").prependTo(el);
            // if not ie will lose focus when click
            checkEl.unselectable();
        }
        return checkEl;
    }

    return UIBase.create(Component.Render, [UIBase.Contentbox.Render], {
        renderUI:function() {
            var self = this,
                el = self.get("el");
            el.attr("role", "menuitem");
            self.get("contentEl").addClass(self.getCls(CONTENT_CLS));
            if (!el.attr("id")) {
                el.attr("id", S.guid("ks-menuitem"));
            }
        },

        _setSelected:function(v, componentCls) {
            var self = this,
                tag = "-selected",
                el = self.get("el"),
                cls = self._completeClasses(componentCls, tag);
            el[v ? 'addClass' : 'removeClass'](cls);
        },

        _setChecked:function(v, componentCls) {
            var self = this,
                tag = "-checked",
                el = self.get("el"),
                cls = self._completeClasses(componentCls, tag);
            el[v ? 'addClass' : 'removeClass'](cls);
        },

        _uiSetSelectable:function(v) {
            this.get("el").attr("role", v ? 'menuitemradio' : 'menuitem');
        },

        _uiSetCheckable:function(v) {
            if (v) {
                setUpCheckEl(this);
            }
            this.get("el").attr("role", v ? 'menuitemcheckbox' : 'menuitem');
        },

        containsElement:function(element) {
            var el = this.get("el");
            return el[0] == element || el.contains(element);
        }
    }, {
        ATTRS:{
            selected:{},
            // @inheritedDoc
            // content:{},
            // 属性必须声明，否则无法和 _uiSetChecked 绑定在一起
            checked:{}
        }
    });
}, {
    requires:['node','uibase','component']
});/**
 * render aria from menu according to current menuitem
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menurender", function(S, UA, UIBase, Component) {

    return UIBase.create(Component.Render, [
        UIBase.Contentbox.Render
    ], {

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
                //S.log("menurender :" + el.attr("id") + " _uiSetActiveItem : " + v.get("content"));
            } else {
                el.attr("aria-activedescendant", "");
                //S.log("menurender :" + el.attr("id") + " _uiSetActiveItem : " + "");
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
    requires:['ua','uibase','component']
});/**
 * positionable and not focusable menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenu", function (S, UIBase, Component, Menu, PopupMenuRender) {

    function getParentMenu(self) {
        var subMenuItem = self.get("parent"),
            parentMenu;
        if (subMenuItem && subMenuItem.get("menu") === self) {
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

    function getOldestMenu(self) {
        var pre = self, now = self;
        while (now) {
            pre = now;
            now = getAutoHideParentMenu(pre);
            if (!now) {
                break;
            }
        }
        return pre;
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
     * @name PopMenu
     * @constructor
     */
    var PopMenu = UIBase.create(Menu, [
        UIBase.Position,
        UIBase.Align
    ], {
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
                    menu.get(autoHideOnMouseLeave)) {
                    menu._clearLeaveHideTimers();
                }
            }
        },
        _handleMouseLeave:function () {
            var self = this;
            if (!self.get(autoHideOnMouseLeave)) {
                return;
            }
            self._leaveHideTimer = setTimeout(function () {
                // only hide ancestor is enough , it will listen to its ancestor's hide event to hide
                var oldMenu = getOldestMenu(self);
                oldMenu.hide();
                var parentMenu = getParentMenu(oldMenu);
                if (parentMenu) {
                    parentMenu.set("highlightedItem", null);
                }
            }, self.get("autoHideDelay"));
        },

        _handleMouseEnter:function () {
            var self = this,
                parent = getAutoHideParentMenu(self);
            if (parent) {
                parent._clearLeaveHideTimers();
            } else {
                self._clearLeaveHideTimers();
            }
        },


        /**
         *  suppose it has focus (as a context menu),
         *  then it must hide when click document
         */
        _handleBlur:function () {
            var self = this;
            PopMenu.superclass._handleBlur.apply(self, arguments);
            self.hide();
        }
    }, {
        ATTRS:{
            // 弹出菜单一般不可聚焦，焦点在使它弹出的元素上
            focusable:{
                value:false
            },
            visibleMode:{
                value:"visibility"
            },
            autoHideOnMouseLeave:{},
            autoHideDelay:{
                value:100
            }
        },
        DefaultRender:PopupMenuRender
    });

    Component.UIStore.setUIByClass("popupmenu", {
        priority:Component.UIStore.PRIORITY.LEVEL2,
        ui:PopMenu
    });

    return PopMenu;

}, {
    requires:['uibase', 'component', './menu', './popupmenurender']
});/**
 * popup menu render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenurender", function(S, UA, UIBase, MenuRender) {
    return UIBase.create(MenuRender, [
        UIBase.Position.Render,
        UA['ie'] === 6 ? UIBase.Shim.Render : null
    ]);
}, {
    requires:['ua','uibase','./menurender']
});/**
 * menu separator def
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/separator", function(S, UIBase, Component, SeparatorRender) {

    var Separator = UIBase.create(Component.ModelControl, {
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
    });

    Component.UIStore.setUIByClass("menuseparator", {
        priority:Component.UIStore.PRIORITY.LEVEL2,
        ui:Separator
    });

    return Separator;

}, {
    requires:['uibase','component','./separatorrender']
});/**
 * menu separator render def
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/separatorrender", function(S, UIBase, Component) {

    return UIBase.create(Component.Render, {
        createDom:function() {
            this.get("el").attr("role", "separator");
        }
    });

}, {
    requires:['uibase','component']
});/**
 * submenu model and control for kissy , transfer item's keycode to menu
 * @author yiminghe@gmail.com
 */
KISSY.add(
    /* or precisely submenuitem */
    "menu/submenu",
    function (S, Event, UIBase, Component, MenuItem, SubMenuRender) {


        function _onDocClick(e) {
            var self = this,
                menu = self.get("menu"),
                target = e.target,
                el = self.get("el");
            // only hide this menu, if click outside this menu and this menu's submenus
            if (
                !el.contains(target) &&
                    el[0] !== target &&
                    !menu.containsElement(target)
                ) {
                menu.hide();
                // submenuitem should also hide
                self.get("parent").set("highlightedItem", null);
            }
        }

        var KeyCodes = Event.KeyCodes,
            doc = document,
            MENU_DELAY = 300;
        /**
         * Class representing a submenu that can be added as an item to other menus.
         */
        var SubMenu = UIBase.create(MenuItem, [Component.DecorateChild], {

                _onParentHide:function () {
                    this.get("menu") && this.get("menu").hide();
                },

                bindUI:function () {
                    /**
                     * 自己不是 menu，自己只是 menuitem，其所属的 menu 为 get("parent")
                     */
                    var self = this,
                        parentMenu = self.get("parent"),
                        menu = this.get("menu");

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
                },


                /**
                 * @inheritDoc
                 * Sets a timer to show the submenu
                 **/
                _handleMouseEnter:function (e) {
                    var self = this;
                    if (SubMenu.superclass._handleMouseEnter.call(self, e)) {
                        return true;
                    }
                    self.clearTimers();
                    self.showTimer_ = S.later(self.showMenu,
                        this.get("menuDelay"), false, self);
                },

                showMenu:function () {
                    var self = this;
                    var menu = self.get("menu");
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
                },

                /**
                 * Listens to the sub menus items and ensures that this menu item is selected
                 * while dismissing the others.  This handles the case when the user mouses
                 * over other items on their way to the sub menu.
                 * @param  e Highlight event to handle.
                 * @private
                 */
                onChildHighlight_:function (e) {
                    if (e.newVal) {
                        if (this.get("menu").get("parent") == this) {
                            this.clearTimers();
                            // superclass(menuitem)._handleMouseLeave 已经把自己 highlight 去掉了
                            // 导致本类 _uiSetHighlighted 调用，又把子菜单隐藏了
                            this.get("parent").set("highlightedItem", this);
                        }
                    }
                },

                hideMenu:function () {
                    var menu = this.get("menu");
                    menu && menu.hide();
                },

                // click ，立即显示
                _performInternal:function () {
                    this.clearTimers();
                    this.showMenu();
                    //  trigger click event from menuitem
                    SubMenu.superclass._performInternal.apply(this, arguments);
                },

                /**
                 * Handles a key event that is passed to the menu item from its parent because
                 * it is highlighted.  If the right key is pressed the sub menu takes control
                 * and delegates further key events to its menu until it is dismissed OR the
                 * left key is pressed.
                 * @param e A key event.
                 * @return {boolean} Whether the event was handled.
                 */
                _handleKeydown:function (e) {
                    var self = this,
                        menu = self.get("menu"),
                        hasKeyboardControl_ = menu && menu.get("visible"),
                        keyCode = e.keyCode;

                    if (!hasKeyboardControl_) {
                        // right
                        if (keyCode == KeyCodes.RIGHT) {
                            self.showMenu();
                            var menuChildren = menu.get("children");
                            if (menuChildren[0]) {
                                menu.set("highlightedItem", menuChildren[0]);
                            }
                        }
                        // enter as click
                        else if (e.keyCode == Event.KeyCodes.ENTER) {
                            return this._performInternal(e);
                        }
                        else {
                            return undefined;
                        }
                    } else if (menu._handleKeydown(e)) {
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
                 * @inheritDoc
                 * Dismisses the submenu on a delay, with the result that the user needs less
                 * accuracy when moving to submenus.
                 **/
                _uiSetHighlighted:function (highlight, ev) {
                    var self = this;
                    SubMenu.superclass._uiSetHighlighted.call(self, highlight, ev);
                    if (!highlight) {
                        if (self.dismissTimer_) {
                            self.dismissTimer_.cancel();
                        }
                        self.dismissTimer_ = S.later(self.hideMenu,
                            self.get("menuDelay"),
                            false, self);
                    }
                },

                containsElement:function (element) {
                    var menu = this.get("menu");
                    return menu && menu.containsElement(element);
                },

                // 默认 addChild，这里里面的元素需要放到 menu 属性中
                decorateChildrenInternal:function (ui, el, cls) {
                    // 不能用 diaplay:none
                    el.css("visibility", "hidden");
                    var docBody = S.one(el[0].ownerDocument.body);
                    docBody.prepend(el);
                    var menu = new ui({
                        srcNode:el,
                        prefixCls:cls
                    });
                    this.set("menu", menu);
                },

                destructor:function () {
                    var self = this,
                        parentMenu = self.get("parent"),
                        menu = this.get("menu");

                    self.clearTimers();

                    Event.remove(doc, "click", _onDocClick, self);

                    //当改菜单项所属的菜单隐藏后，该菜单项关联的子菜单也要隐藏
                    if (parentMenu) {
                        parentMenu.detach("hide", self._onParentHide, self);
                    }
                    if (!self.get("externalSubMenu") && menu) {
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
                     * @type {boolean}
                     */
                    externalSubMenu:{
                        value:false
                    },
                    menuAlign:{},
                    menu:{
                        setter:function (m) {
                            m.set("parent", this);
                        }
                    },
                    decorateChildCls:{
                        value:"popupmenu"
                    }
                },

                DefaultRender:SubMenuRender
            }
        );


        Component.UIStore.setUIByClass("submenu", {
            priority:Component.UIStore.PRIORITY.LEVEL2,
            ui:SubMenu
        });

        return SubMenu;
    }, {
        requires:['event', 'uibase', 'component', './menuitem', './submenurender']
    });

/**

 **//**
 * submenu render for kissy ,extend menuitem render with arrow
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/submenurender", function(S, UIBase, MenuItemRender) {
        var SubMenuRender;
        var ARROW_TMPL = '<span class="{prefixCls}submenu-arrow">►<' + '/span>';
        SubMenuRender = UIBase.create(MenuItemRender, {
            renderUI:function() {
                var self = this,
                    el = self.get("el"),
                    contentEl = self.get("contentEl");
                el.attr("aria-haspopup", "true");
                contentEl.append(S.substitute(ARROW_TMPL, {
                    prefixCls:this.get("prefixCls")
                }));
            },
            _uiSetContent:function(v) {
                var self = this;
                SubMenuRender.superclass._uiSetContent.call(self, v);
                self.get("contentEl").append(S.substitute(ARROW_TMPL, {
                    prefixCls:this.get("prefixCls")
                }));
            }

        });
        return SubMenuRender;
    },
    {
        requires:['uibase','./menuitemrender']
    });KISSY.add("menu", function(S, Menu, Render, Item, ItemRender, SubMenu, SubMenuRender, Separator, SeparatorRender, PopupMenu, FilterMenu, DelMenuItem) {
    Menu.Render = Render;
    Menu.Item = Item;
    Menu.Item.Render = ItemRender;
    Menu.SubMenu = SubMenu;
    SubMenu.Render = SubMenuRender;
    Menu.Separator = Separator;
    Menu.PopupMenu = PopupMenu;
    Menu.FilterMenu = FilterMenu;
    Menu.DelMenuItem = DelMenuItem;
    return Menu;
}, {
    requires:[
        'menu/menu',
        'menu/menurender',
        'menu/menuitem',
        'menu/menuitemrender',
        'menu/submenu',
        'menu/submenurender',
        'menu/separator',
        'menu/separatorrender',
        'menu/popupmenu',
        'menu/filtermenu',
        'menu/delmenuitem',
        'menu/delmenuitemrender'
    ]
});
