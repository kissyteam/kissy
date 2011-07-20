/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Jul 20 18:43
*/
/**
 *  menu where items can be filtered based on user keyboard input
 *  @author yiminghe@gmail.com
 */
KISSY.add("menu/filtermenu", function(S, UIBase, Menu, FilterMenuRender) {

    var HIT_CLS = "{prefixCls}menuitem-hit";

    // 转义正则特殊字符，返回字符串用来构建正则表达式
    function regExpEscape(s) {
        return s.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
            replace(/\x08/g, '\\x08');
    }

    return UIBase.create(Menu, {
            bindUI:function() {
                var self = this;
                var view = self.get("view");
                var filterInput = view.get("filterInput");
                /*监控键盘事件*/
                filterInput.on("keyup", self.handleFilterEvent, self);
            },

            handleFilterEvent:function() {
                var self = this;
                var view = self.get("view");
                var filterInput = view.get("filterInput");
                /* 根据用户输入过滤 */
                self.set("filterStr", filterInput.val());
                var highlightedItem = self.get("highlightedItem");
                // 如果没有高亮项或者高亮项因为过滤被隐藏了
                // 默认选择符合条件的第一项
                if (!highlightedItem || !highlightedItem.get("visible")) {
                    self.set("highlightedItem", self._getNextEnabledHighlighted(0, 1));
                }
            },

            _uiSetFilterStr:function(v) {
                // 过滤条件变了立即过滤
                this.filterItems(v);
            },

            filterItems:function(str) {
                var self = this;
                var view = self.get("view");
                var _labelEl = view.get("labelEl");
                var filterInput = view.get("filterInput");

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
                            var item = self.get("highlightedItem");
                            var content = item && item.get("caption");
                            // 有高亮而且最后一项不为空补全
                            if (content && content.indexOf(lastWord) > -1 && lastWord) {
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

                var children = self.get("children");

                var strExp = str && new RegExp(regExpEscape(str), "ig");

                // 匹配项样式类
                var hit = S.substitute(HIT_CLS, {
                    prefixCls:this.get("prefixCls")
                });

                // 过滤所有子组件
                S.each(children, function(c) {
                    var content = c.get("caption"),
                        view = c.get("view");
                    if (!str) {
                        // 没有过滤条件
                        // 恢复原有内容
                        // 显示出来
                        view.set("content", content);
                        c.set("visible", true);
                    } else {
                        if (content.indexOf(str) > -1) {
                            // 如果符合过滤项
                            // 显示
                            c.set("visible", true);
                            // 匹配子串着重 wrap
                            c.get("view").set("content", content.replace(strExp, function(m) {
                                return "<span class='" + hit + "'>" + m + "</span>";
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
                var self = this,prefixCls = this.get("prefixCls");
                self.set("el", el);
                var menuContent = el.one("." + prefixCls + "menu-content");
                self.decorateChildren(menuContent);
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

}, {
    requires:['uibase','./menu','./filtermenurender']
});/**
 * filter menu render
 * 1.create filter input
 * 2.change menu contentelement
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/filtermenurender", function(S, Node, UIBase, MenuRender) {
    var $ = Node.all,
        MENU_FILTER = "{prefixCls}menu-filter",
        MENU_FILTER_LABEL = "{prefixCls}menu-filter-label",
        MENU_CONTENT = "{prefixCls}menu-content";

    function getCls(self, str) {
        return S.substitute(str, {
            prefixCls:self.get("prefixCls")
        });
    }

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
                    filterWrap = $("<div class='" + getCls(this, MENU_FILTER) + "'/>")
                        .appendTo(contentEl));
            }
            if (!this.get("labelEl")) {
                this.set("labelEl",
                    $("<div class='" + getCls(this, MENU_FILTER_LABEL) + "'/>").appendTo(filterWrap));
            }
            if (!self.get("filterInput")) {
                self.set("filterInput", $("<input autocomplete='off'/>").appendTo(filterWrap));
            }
            if (!self.get("menuContent")) {
                self.set("menuContent",
                    $("<div class='" + getCls(this, MENU_CONTENT) + "'/>").appendTo(contentEl));
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
                return el.one("." + getCls(this, MENU_FILTER))
                    .one("." + getCls(this, MENU_FILTER_LABEL))
            },
            filterWrap:function(el) {
                return el.one("." + getCls(this, MENU_FILTER));
            },
            menuContent:function(el) {
                return el.one("." + getCls(this, MENU_CONTENT));
            },
            filterInput:function(el) {
                return el.one("." + getCls(this, MENU_FILTER)).one("input");
            }
        }
    });

}, {
    requires:['node','uibase','./menurender']
});/**
 * menu model and controller for kissy,accommodate menu items
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menu", function(S, UIBase, Component, MenuRender) {

    var Menu;

    Menu = UIBase.create(Component.Container, {
        _uiSetHighlightedItem:function(v, ev) {
            var pre = ev && ev.prevVal;
            if (pre) {
                pre.set("highlighted", false);
            }
            v && v.set("highlighted", true);
            this.set("activeItem", v);
        },

        _handleBlur:function(e) {
            // 父亲不允许自己处理
            if (Menu.superclass._handleBlur.call(this, e)) {
                return true;
            }
            this.set("highlightedItem", undefined);
        },


        //dir : -1 ,+1
        //skip disabled items
        _getNextEnabledHighlighted:function(index, dir) {
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

        _handleClick:function(e) {
            if (Menu.superclass._handleClick.call(this, e))
                return true;

            var highlightedItem = this.get("highlightedItem");

            //先看当前活跃 menuitem 是否要处理
            if (highlightedItem && highlightedItem._handleClick(e)) {
                return true;
            }
        },

        _handleKeydown:function(e) {
            if (this._handleKeydownInternal(e)) {
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
        _handleKeydownInternal:function(e) {

            if (Menu.superclass._handleKeydown.call(this, e)) {
                return true;
            }

            // Give the highlighted control the chance to handle the key event.
            var highlightedItem = this.get("highlightedItem");

            // 先看当前活跃 menuitem 是否要处理
            if (highlightedItem && highlightedItem._handleKeydown(e)) {
                return true;
            }

            var children = this.get("children"),len = children.length;

            if (len == 0) {
                return undefined;
            }

            var index,destIndex;

            //自己处理了，不要向上处理，嵌套菜单情况
            switch (e.keyCode) {
                // esc
                case 27:
                    // TODO
                    // focus 的话手动失去焦点
                    return undefined;
                    break;

                // home
                case 36:
                    this.set("highlightedItem",
                        this._getNextEnabledHighlighted(0, 1));
                    break;
                // end
                case 35:
                    this.set("highlightedItem",
                        this._getNextEnabledHighlighted(len - 1, -1));
                    break;
                // up
                case 38:
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
                case 40:
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

        bindUI:function() {
            var self = this;
            /**
             * 隐藏后，去掉高亮与当前
             */
            self.on("hide", function() {
                self.set("highlightedItem", undefined);
            });
        },


        containsElement:function(element) {
            if (this.get("view").containsElement(element)) {
                return true;
            }

            var children = this.get('children');

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
        }
    });

    Menu.DefaultRender = MenuRender;

    Component.UIStore.setUIByClass("menu", {
        priority:10,
        ui:Menu
    });

    return Menu;

}, {
    requires:['uibase','component','./menurender','./submenu']
});

/**
 * TODO
 *  - 去除 activeItem
 **//**
 * menu item ,child component for menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitem", function(S, UIBase, Component, MenuItemRender) {
    var MenuItem = UIBase.create(Component.ModelControl, [UIBase.Contentbox], {

        _handleMouseEnter:function(e) {
            // 父亲不允许自己处理
            if (MenuItem.superclass._handleMouseEnter.call(this, e)) {
                return true;
            }
            this.get("parent").set("highlightedItem", this);
        },

        _handleMouseLeave:function(e) {
            // 父亲不允许自己处理
            if (MenuItem.superclass._handleMouseLeave.call(this, e)) {
                return true;
            }
            this.get("parent").set("highlightedItem", undefined);
        },

        _handleClick:function(e) {
            // 父亲不允许自己处理
            if (MenuItem.superclass._handleClick.call(this, e)) {
                return true;
            }
            // 可选
            if (this.get("selectable")) {
                this.set("selected", true);
            }
            // 可选中，取消选中
            if (this.get("checkable")) {
                this.set("checked", !this.get("checked"));
            }
            this.get("parent").fire("click", {
                // 使用熟悉的 target，而不是自造新词！
                target:this
            });
        },

        _uiSetHighlighted:function(v) {
            // 是否要滚动到当前菜单项
            if (v) {
                var el = this.get("el"),
                    p = this.get("parent").get("el"),
                    y = el.offset().top,
                    h = el[0].offsetHeight,
                    py = p.offset().top,
                    ph = p[0].offsetHeight;
                if (y - py >= ph) {
                    p[0].scrollTop += y - py + h - ph;
                } else if (y - py < 0) {
                    p[0].scrollTop += y - py;
                }
            }
        },

        containsElement:function(element) {
            return this.get('view').containsElement(element);
        }

    }, {
        ATTRS:{


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

            caption:{
                getter:function(v) {
                    if (!v) {
                        // 不使用 set ，会连锁
                        this.__set("caption", v = this.get("content"));
                    }
                    return v;
                }
            },

            // @inheritedDoc
            // option.text
            //content:{},

            // option.value
            value:{},
            highlighted:{
                // 不要值，防止初始就调用
                view:true
            },
            checked:{
                view:true
            },
            selected:{
                view:true
            }
        }
    });

    MenuItem.DefaultRender = MenuItemRender;

    Component.UIStore.setUIByClass("menuitem", {
        priority:10,
        ui:MenuItem
    });

    return MenuItem;
}, {
    requires:['uibase','component','./menuitemrender']
});/**
 * simple menuitem render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitemrender", function(S, Node, UIBase, Component) {


    var HIGHLIGHTED_CLS = "{prefixCls}menuitem-highlight",
        CONTENTBOX_CLS = "{prefixCls}contentbox",
        SELECTED_CLS = "{prefixCls}menuitem-selected",
        CHECKED_CLS = "{prefixCls}menuitem-checked",
        ACTIVE_CLS = "{prefixCls}menuitem-active",
        CHECK_CLS = "{prefixCls}menuitem-checkbox",
        CONTENT_CLS = "{prefixCls}menuitem-content",
        EL_CLS = "{prefixCls}menuitem",
        DISABLED_CLS = "{prefixCls}menuitem-disabled";

    function getCls(self, str) {
        return S.substitute(str, {
            prefixCls:self.get("prefixCls")
        });
    }

    function setUpCheckEl(self) {
        var el = self.get("el"),
            cls = getCls(self, CHECK_CLS),
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
            var cls = getCls(self, CONTENTBOX_CLS);
            el.addClass(getCls(self, EL_CLS))
                .attr("role", "menuitem");
            self.get("contentEl").addClass(getCls(self, CONTENT_CLS));
            if (!el.attr("id")) {
                el.attr("id", S.guid("ks-menuitem"));
            }
        },

        _uiSetDisabled:function(v) {
            var el = this.get("el").attr("aria-disabled", !!v);
            if (v) {
                el.addClass(getCls(this, DISABLED_CLS));
            } else {
                el.removeClass(getCls(this, DISABLED_CLS));
            }
        },

        _uiSetHighlighted:function(v) {
            var el = this.get("el");
            if (v) {
                el.addClass(getCls(this, HIGHLIGHTED_CLS));
            } else {
                el.removeClass(getCls(this, HIGHLIGHTED_CLS));
            }
        },

        _uiSetSelected:function(v) {
            var el = this.get("el");
            el[v ? "addClass" : "removeClass"](getCls(this, SELECTED_CLS));
        },

        _uiSetChecked:function(v) {
            var el = this.get("el");
            el[v ? "addClass" : "removeClass"](getCls(this, CHECKED_CLS));
            v && setUpCheckEl(this);
        },

        _uiSetSelectable:function(v) {
            this.get("el").attr("role", v ? 'menuitemradio' : 'menuitem');
        },

        _uiSetCheckable:function(v) {
            this.get("el").attr("role", v ? 'menuitemcheckbox' : 'menuitem');
        },

        _handleMouseDown:function() {
            var el = this.get("el");
            el.addClass(getCls(this, ACTIVE_CLS));
            el.attr("aria-pressed", true);
        },

        _handleMouseUp:function() {
            var el = this.get("el");
            el.removeClass(getCls(this, ACTIVE_CLS));
            el.attr("aria-pressed", false);
        },

        containsElement:function(element) {
            var el = this.get("el");
            return el[0] == element || el.contains(element);
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
            highlighted:{},
            selected:{},
            // @inheritedDoc
            // content:{},
            // 属性必须声明，否则无法和 _uiSetChecked 绑定在一起
            checked:{},
            visibleMode:{
                value:"display"
            }
        }
    });
}, {
    requires:['node','uibase','component']
});/**
 * render aria from menu according to current menuitem
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menurender", function(S, UA, UIBase, Component) {

    var CLS = "{prefixCls}menu  {prefixCls}menu-vertical";

    return UIBase.create(Component.Render, [
        UIBase.Contentbox.Render
    ], {

        renderUI:function() {
            var el = this.get("el");
            el.addClass(S.substitute(CLS, {
                prefixCls:this.get("prefixCls")
            }))
                .attr("role", "menu")
                .attr("aria-haspopup", true);
            if (!el.attr("id")) {
                el.attr("id", S.guid("ks-menu"));
            }
        },

        _uiSetActiveItem:function(v) {
            var el = this.get("el");
            if (v) {
                var menuItemEl = v.get("view").get("el"),
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
            // 普通菜单可聚焦
            // 通过 tab 聚焦到菜单的根节点，通过上下左右操作子菜单项
            focusable:{
                value:true
            },
            activeItem:{},
            visibleMode:{
                value:"display"
            }
        }
    });
}, {
    requires:['ua','uibase','component']
});/**
 * positionable and not focusable menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenu", function(S, UIBase, Component, Menu, PopupMenuRender) {
    var PopMenu = UIBase.create(Menu, [
        UIBase.Position,
        UIBase.Align
    ], {
    }, {
        DefaultRender:PopupMenuRender
    });

    Component.UIStore.setUIByClass("popupmenu", {
        priority:20,
        ui:PopMenu
    });

    return PopMenu;

}, {
    requires:['uibase','component','./menu','./popupmenurender']
});/**
 * popup menu render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenurender", function(S, UA, UIBase, MenuRender) {
    var CLS = "{prefixCls}popmenu";
    return UIBase.create(MenuRender, [
        UIBase.Position.Render,
        UA['ie'] === 6 ? UIBase.Shim.Render : null
    ], {
        renderUI:function() {
            this.get("el").addClass(S.substitute(CLS, {
                prefixCls:this.get("prefixCls")
            }));
        }
    }, {
        ATTRS:{
            // 弹出菜单一般不可聚焦，焦点在使它弹出的元素上
            focusable:{
                value:false
            },
            visibleMode:{
                value:"visibility"
            }
        }
    });
}, {
    requires:['ua','uibase','./menurender']
});/**
 * menu separator def
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/separator", function(S, UIBase, Component, SeparatorRender) {

    return UIBase.create(Component.ModelControl, {
    }, {
        ATTRS:{

            handleMouseEvents:{
                value:false
            }

        },

        DefaultRender:SeparatorRender
    });

}, {
    requires:['uibase','component','./separatorrender']
});/**
 * menu separator render def
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/separatorrender", function(S, UIBase, Component) {

    var CLS = "{prefixCls}menuseparator";
    return UIBase.create(Component.Render, {

        createDom:function() {
            var el = this.get("el");
            el.attr("role", "separator").addClass(S.substitute(CLS, {
                prefixCls:this.get("prefixCls")
            }));
        }

    }, {
        ATTRS:{
            focusable:{
                value:false
            },
            // 分隔线禁用，不可以被键盘访问
            disabled:{
                value:true
            }
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
    function(S, UIBase, Component, MenuItem, SubMenuRender) {
        var SubMenu;

        /**
         * Class representing a submenu that can be added as an item to other menus.
         */
        SubMenu = UIBase.create(MenuItem, {

                _onParentHide:function() {
                    this.get("menu") && this.get("menu").hide();
                },

                bindUI:function() {
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
                        menu.on("click", function(ev) {
                            parentMenu.fire("click", {
                                target:ev.target
                            });
                        });

                        // 通知父级菜单
                        menu.on("afterActiveItemChange", function(ev) {
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
                _handleMouseEnter:function(e) {
                    if (SubMenu.superclass._handleMouseEnter.call(this, e)) {
                        return true;
                    }
                    this.clearTimers();
                    this.showTimer_ = S.later(this.showMenu, this.get("menuDelay"), false, this);
                },

                showMenu:function() {
                    var menu = this.get("menu");
                    menu.set("align", {node:this.get("view").get("el"), points:['tr','tl']});
                    menu.render();
                    /**
                     * If activation of your menuitem produces a popup menu,
                     then the menuitem should have aria-haspopup set to the ID of the corresponding menu
                     to allow the assistive technology to follow the menu hierarchy
                     and assist the user in determining context during menu navigation.
                     */
                    this.get("view").get("el").attr("aria-haspopup",
                        menu.get("view").get("el").attr("id"));
                    menu.show();
                },


                /**
                 * Clears the show and hide timers for the sub menu.
                 */
                clearTimers : function() {
                    if (this.dismissTimer_) {
                        this.dismissTimer_.cancel();
                        this.dismissTimer_ = null;
                    }
                    if (this.showTimer_) {
                        this.showTimer_.cancel();
                        this.showTimer_ = null;
                    }
                },

                /**
                 * Listens to the sub menus items and ensures that this menu item is selected
                 * while dismissing the others.  This handles the case when the user mouses
                 * over other items on their way to the sub menu.
                 * @param  e Highlight event to handle.
                 * @private
                 */
                onChildHighlight_ :function(e) {
                    if (e.newVal) {
                        if (this.get("menu").get("parent") == this) {
                            this.clearTimers();
                            // superclass(menuitem)._handleMouseLeave 已经把自己 highlight 去掉了
                            // 导致本类 _uiSetHighlighted 调用，又把子菜单隐藏了
                            this.get("parent").set("highlightedItem", this);
                        }
                    }
                },

                hideMenu:function() {
                    var menu = this.get("menu");
                    menu && menu.hide();
                },

                _handleClick:function(ev) {
                    this.showMenu();
                    var menu = this.get("menu");
                    return menu._handleClick(ev);
                },

                /**
                 * Handles a key event that is passed to the menu item from its parent because
                 * it is highlighted.  If the right key is pressed the sub menu takes control
                 * and delegates further key events to its menu until it is dismissed OR the
                 * left key is pressed.
                 * @param e A key event.
                 * @return {boolean} Whether the event was handled.
                 */
                _handleKeydown:function(e) {

                    if (SubMenu.superclass._handleKeydown.call(this, e)) {
                        return true;
                    }

                    var menu = this.get("menu");

                    var hasKeyboardControl_ = menu && menu.get("visible");

                    var keyCode = e.keyCode;

                    if (!hasKeyboardControl_) {
                        // right
                        if (keyCode == 39) {
                            this.showMenu();
                            var menuChildren = menu.get("children");
                            if (menuChildren[0]) {
                                menu.set("highlightedItem", menuChildren[0]);
                            }
                        } else {
                            return undefined;
                        }
                    } else if (menu._handleKeydown(e)) {
                    }
                    // The menu has control and the key hasn't yet been handled, on left arrow
                    // we turn off key control.
                    // left
                    else if (keyCode == 37) {
                        this.hideMenu();
                        // 隐藏后，当前激活项重回
                        this.get("parent").set("activeItem", this);
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
                _uiSetHighlighted:function(highlight, ev) {
                    SubMenu.superclass._uiSetHighlighted.call(this, highlight, ev);
                    if (!highlight) {
                        if (this.dismissTimer_) {
                            this.dismissTimer_.cancel();
                        }
                        this.dismissTimer_ = S.later(this.hideMenu,
                            this.get("menuDelay"),
                            false, this);
                    }
                },

                containsElement:function(element) {
                    var menu = this.get("menu");
                    return menu && menu.containsElement(element);
                },


                decorateInternal:function(element) {
                    var self = this,
                        ui = "popupmenu",
                        prefixCls = self.get("prefixCls");
                    self.set("el", element);
                    var child = element.one("." + prefixCls + ui);
                    if (child) {
                        // child 必须等 render 时才会获得对应的 class，之前先 display:none 不占用空间
                        child.hide();
                        var docBody = S.one(element[0].ownerDocument.body);
                        docBody.prepend(child);
                        var UI = Component.UIStore.getUIByClass(ui);
                        var menu = new UI({
                            srcNode:child,
                            prefixCls:prefixCls
                        });
                        self.set("menu", menu);
                    }
                },

                destructor : function() {
                    var self = this,
                        parentMenu = self.get("parent"),
                        menu = this.get("menu");

                    self.clearTimers();

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
                        value:300
                    },
                    /**
                     * whether destroy submenu when destroy itself ,reverse result
                     * @type {boolean}
                     */
                    externalSubMenu:{
                        value:false
                    },
                    menu:{
                        setter:function(m) {
                            m.set("parent", this);
                        }
                    }
                }
            }
        );

        SubMenu.DefaultRender = SubMenuRender;

        Component.UIStore.setUIByClass("submenu", {
            priority:20,
            ui:SubMenu
        });

        return SubMenu;
    }, {
        requires:['uibase','component','./menuitem','./submenurender']
    });

/**

 **//**
 * submenu render for kissy ,extend menuitem render with arrow
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/submenurender", function(S, UIBase, MenuItemRender) {
        var SubMenuRender;
        var ARROW_TMPL = '<span class="{prefixCls}submenu-arrow">►</span>';
        SubMenuRender = UIBase.create(MenuItemRender, {
            renderUI:function() {
                var self = this,
                    el = self.get("el"),
                    contentEl = self.get("contentEl");
                el.addClass(this.get("prefixCls") + "submenu")
                    .attr("aria-haspopup", "true");
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
    });KISSY.add("menu", function(S, Menu, Render, Item, ItemRender, SubMenu, SubMenuRender, Separator, SeparatorRender, PopupMenu, FilterMenu) {
    Menu.Render = Render;
    Menu.Item = Item;
    Menu.Item.Render = ItemRender;
    Menu.SubMenu = SubMenu;
    SubMenu.Render = SubMenuRender;
    Menu.Separator = Separator;
    Menu.PopupMenu = PopupMenu;
    Menu.FilterMenu = FilterMenu;
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
        'menu/filtermenu'
    ]
});
