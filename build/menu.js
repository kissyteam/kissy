/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jun 19 18:04
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 menu/menu-render
 menu/base
 menu/menuitem-render
 menu/menuitem
 menu/check-menuitem-render
 menu/check-menuitem
 menu/submenu-render
 menu/popupmenu-render
 menu/popupmenu
 menu/filtermenu-tpl
 menu/filtermenu-render
 menu/filtermenu
 menu
*/

/**
 * @ignore
 * render aria from menu according to current menuitem
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menu-render", function (S, Controller) {

    return Controller.Render.extend({

        beforeCreateDom: function (renderData) {
            renderData.elAttrs.role='menu';
        },

        setAriaActiveDescendant: function (v) {
            var el = this.el;
            if (v) {
                var menuItemEl = v.get("el"),
                    id = menuItemEl.attr("id");
                el.attr("aria-activedescendant", id);
                // 会打印重复 ，每个子菜单都会打印，然后冒泡至父菜单，再打印，和该 menuitem 所处层次有关系
            } else {
                el.attr("aria-activedescendant", "");
            }
        },

        containsElement: function (element) {
            var el = this.el;
            return el[0] === element || el.contains(element);
        }
    });
}, {
    requires: ['component/controller']
});
/**
 * @ignore
 * menu controller for kissy,accommodate menu items
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/base", function (S, Node, Controller,DelegateChildrenExtension,
                                 MenuRender, undefined) {

    var KeyCode = Node.KeyCode;

    /**
     * KISSY Menu.
     * xclass: 'menu'.
     * @class KISSY.Menu
     * @extends KISSY.Component.Controller
     */
    var Menu = Controller.extend([
        DelegateChildrenExtension
    ],{
        isMenu: 1,


        // 只能允许一个方向，这个属性只是为了记录和排他性选择
        // 只允许调用 menuItem 的 set('highlighted')
        // 不允许调用 menu 的 set('highlightedItem')，内部调用时防止循环更新
        _onSetHighlightedItem: function (v, ev) {
            var highlightedItem;
            // ignore v == null
            // do not use set('highlightedItem',null) for api
            // use this.get('highlightedItem').set('highlighted', false);
            if (v && ev && (highlightedItem = ev.prevVal)) {
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
                case KeyCode.ESC:
                    // 清除所有菜单
                    if (highlightedItem = this.get('highlightedItem')) {
                        highlightedItem.set('highlighted', false);
                    }
                    break;

                // home
                case KeyCode.HOME:
                    nextHighlighted = this._getNextEnabledHighlighted(0, 1);
                    break;
                // end
                case KeyCode.END:
                    nextHighlighted = this._getNextEnabledHighlighted(len - 1, -1);
                    break;
                // up
                case KeyCode.UP:
                    if (!highlightedItem) {
                        destIndex = len - 1;
                    } else {
                        index = S.indexOf(highlightedItem, children);
                        destIndex = (index - 1 + len) % len;
                    }
                    nextHighlighted = this._getNextEnabledHighlighted(destIndex, -1);
                    break;
                //down
                case KeyCode.DOWN:
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
            if (self.get("visible") === false || !self.view) {
                return false;
            }

            if (self.view.containsElement(element)) {
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
                    xclass: 'menuitem'
                }
            }
        },
        xclass: 'menu'
    });

    // capture bubbling
    function afterHighlightedItemChange(e) {
        this.view.setAriaActiveDescendant(e.newVal);
    }

    return Menu;

}, {
    requires: ['node', 'component/controller',
        'component/extension/delegate-children','./menu-render']
});

/**
 * @ignore
 * 普通菜单可聚焦
 * 通过 tab 聚焦到菜单的根节点，通过上下左右操作子菜单项
 *
 * TODO
 *  - 去除 activeItem. done@2013-03-12
 **/
/**
 * @ignore
 * simple menuitem render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitem-render", function (S, Node, Controller) {

    return Controller.Render.extend({

        beforeCreateDom: function (renderData) {
            renderData.elAttrs.role= renderData.selectable ?
                'menuitemradio' : 'menuitem';
            if (renderData.selected) {
                renderData.elCls.push(this.getBaseCssClasses('selected'));
            }
        },

        _onSetSelected: function (v) {
            var self = this,
                el = self.el,
                cls = self.getBaseCssClasses("selected");
            el[v ? 'addClass' : 'removeClass'](cls);
        },

        containsElement: function (element) {
            var el = this.el;
            return el && ( el[0] == element || el.contains(element));
        }
    }, {
        HTML_PARSER: {
            selectable: function (el) {
                return el.hasClass(this.getBaseCssClass("selectable"));
            }
        }
    });
}, {
    requires: ['node', 'component/controller']
});
/**
 * @ignore
 * menu item ,child component for menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitem", function (S, Controller, MenuItemRender) {

    var $ = S.all;

    /**
     * @class KISSY.Menu.Item
     * A menu item component which menu is consisted of.
     * xclass: 'menuitem'.
     * @extends KISSY.Component.Controller
     */
    var MenuItem = Controller.extend({

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
            self.fire("click");
            return true;
        },

        // 只允许调用 menuItem 的 set('highlighted')
        // 不允许调用 menu 的 set('highlightedItem')
        _onSetHighlighted: function (v, e) {
            if (e && e.byPassSetHighlightedItem) {

            } else {
                if (this.get('rendered')) {
                    this.get('parent').set('highlightedItem', v ? this : null);
                } else {
                    if (v) {
                        // do not set null on initializer
                        this.get('parent').set('highlightedItem', this);
                    }
                }
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
            return this.view && this.view.containsElement(element);
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
        },
        xclass: "menuitem"
    });

    return MenuItem;
}, {
    requires: ['component/controller', './menuitem-render']
});
/**
 * checkable menu item render
 * @author yiminghe@gmail.com
 */
KISSY.add('menu/check-menuitem-render', function (S, MenuItemRender, ContentRenderExtension) {

    return MenuItemRender.extend([ContentRenderExtension], {

        beforeCreateDom: function (renderData) {
            if (renderData.checked) {
                renderData.elCls.push(self.getBaseCssClasses("checked"));
            }
        },

        _onSetChecked: function (v) {
            var self = this,
                el = self.get("el"),
                cls = self.getBaseCssClasses("checked");
            el[v ? 'addClass' : 'removeClass'](cls);
        }

    }, {
        ATTRS: {
            contentTpl: {
                value: '<div class="{{getBaseCssClasses "checkbox"}}"></div>' +
                    Extension.ContentRender.ContentTpl
            }
        }
    })
}, {
    requires: ['./menuitem-render', 'component/extension/content-render']
});
/**
 * checkable menu item
 * @author yiminghe@gmail.com
 */
KISSY.add('menu/check-menuitem', function (S, MenuItem, CheckMenuItemRender) {
    return MenuItem.extend({

        performActionInternal: function () {
            var self = this;
            self.set("checked", !self.get("checked"));
            self.fire('click');
            return true;
        }

    }, {
        ATTRS: {
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
            xrender: {
                value: CheckMenuItemRender
            }
        },
        xclass: "check-menuitem"
    })
}, {
    requires: ['./menuitem', './check-menuitem-render']
});
/**
 * @ignore
 * submenu render for kissy ,extend menuitem render with arrow
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/submenu-render", function (S, MenuItemRender, ContentRenderExtension) {

    return MenuItemRender.extend([ContentRenderExtension], {
        decorateDom: function (el) {
            var controller = this.controller,
                prefixCls = controller.prefixCls;
            var popupMenuEl = el.one('.' + prefixCls + 'popupmenu');
            var docBody = popupMenuEl[0].ownerDocument.body;
            docBody.insertBefore(popupMenuEl[0], docBody.firstChild);
            var PopupMenuClass =
                this.getComponentConstructorByNode(prefixCls, popupMenuEl);
            controller.setInternal('menu', new PopupMenuClass({
                srcNode: popupMenuEl,
                prefixCls: prefixCls
            }));
        }
    }, {
        ATTRS: {
            contentTpl: {
                value: ContentRenderExtension.ContentTpl +
                    '<span class="{{prefixCls}}submenu-arrow">►</span>'
            }
        }
    });

}, {
    requires: ['./menuitem-render', 'component/extension/content-render']
});
/**
 * @ignore
 * popup menu render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenu-render", function (S, ContentRenderExtension, ShimRenderExtension, MenuRender) {

    return MenuRender.extend([
        ContentRenderExtension,
        ShimRenderExtension
    ]);

}, {
    requires: ['component/extension/content-render',
        'component/extension/shim-render',
        './menu-render']
});
/**
 * @ignore
 * positionable and not focusable menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenu", function (S, AlignExtension, Menu, PopupMenuRender) {

    /**
     * Popup Menu.
     * xclass: 'popupmenu'.
     * @class KISSY.Menu.PopupMenu
     * @extends KISSY.Menu
     * @mixins KISSY.Component.Extension.Position
     * @mixins KISSY.Component.Extension.Align
     */
    var PopupMenu = Menu.extend([
        AlignExtension
    ], {
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

                contentEl: {
                    view: 1
                },

                xrender: {
                    value: PopupMenuRender
                }
            },
            xclass: 'popupmenu'
        });

    return PopupMenu;

}, {
    requires: ['component/extension/align',
        './base', './popupmenu-render']
});
/*
  Generated by kissy-tpl2mod.
*/
KISSY.add('menu/filtermenu-tpl',function(){
 return '<div id="ks-filter-menu-input-wrap-{{id}}" class="{{getBaseCssClasses "input-wrap"}}"> <div id="ks-filter-menu-placeholder-{{id}}" class="{{getBaseCssClasses "placeholder"}}"> {{placeholder}} </div> <input id="ks-filter-menu-input-{{id}}" class="{{getBaseCssClasses "input"}}" autocomplete="off"/> </div> <div id="ks-content-{{id}}" class="{{getBaseCssClasses "content"}}"> </div>';
});
/**
 * @ignore
 * filter menu render
 * 1.create filter input
 * 2.change menu content element
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/filtermenu-render", function (S, Node, MenuRender, FilterMenuTpl, ContentRenderExtension) {

    return MenuRender.extend([ContentRenderExtension], {

        beforeCreateDom:function(renderData,childrenElSelectors){
            S.mix(childrenElSelectors, {
                placeholderEl: '#ks-filter-menu-placeholder-{id}',
                filterInputWrap: '#ks-filter-menu-input-wrap-{id}',
                filterInput: '#ks-filter-menu-input-{id}'
            });
        },

        getKeyEventTarget: function () {
            return this.controller.get("filterInput");
        },

        '_onSetPlaceholder': function (v) {
            this.controller.get("placeholderEl").html(v);
        }
    }, {
        ATTRS: {
            contentTpl: {
                value: FilterMenuTpl
            }
        },

        HTML_PARSER: {
            placeholderEl: function (el) {
                return el.one("." + this.getBaseCssClass('placeholder'))
            },
            'filterInputWrap': function (el) {
                return el.one("." + this.getBaseCssClass('input-wrap'));
            },
            filterInput: function (el) {
                return el.one("." + this.getBaseCssClass('input'));
            }
        }
    });

}, {
    requires: ['node', './menu-render', './filtermenu-tpl', 'component/extension/content-render']
});
/**
 * @ignore
 * menu where items can be filtered based on user keyboard input
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/filtermenu", function (S, Menu, FilterMenuRender) {

    var HIT_CLS = "menuitem-hit";

    /**
     * Filter Menu for KISSY.
     * xclass: 'filter-menu'.
     * @extends KISSY.Menu
     * @class KISSY.Menu.FilterMenu
     */
    var FilterMenu = Menu.extend({
            bindUI: function () {
                var self = this,
                    view = self.view,
                    filterInput = view.get("filterInput");
                /*监控键盘事件*/
                filterInput.on("valuechange", self.handleFilterEvent, self);
            },

            handleMouseEnter: function () {
                var self = this;
                FilterMenu.superclass.handleMouseEnter.apply(self, arguments);
                // 权益解决,filter input focus 后会滚动到牌聚焦处,select 则不会
                // 如果 filtermenu 的菜单项被滚轮滚到后面,点击触发不了,会向前滚动到 filter input
                self.view.getKeyEventTarget()[0].select();
            },

            handleFilterEvent: function () {
                var self = this,
                    view = self.view,
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
                    prefixCls = self.prefixCls,
                    view = self.view,
                    _placeholderEl = view.get("placeholderEl"),
                    filterInput = view.get("filterInput");

                // 有过滤条件提示隐藏,否则提示显示
                _placeholderEl[str ? "hide" : "show"]();

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
                            // 匹配子串着重 input-wrap
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
                    view = self.view;
                self.set("filterStr", "");
                self.set("enteredItems", []);
                var filterInput = view && view.get("filterInput");
                filterInput && filterInput.val("");
            },

            destructor: function () {
                var view = this.view;
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
                 * @cfg {String} placeholder
                 */
                /**
                 * @ignore
                 */
                placeholder: {
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

                xrender: {
                    value: FilterMenuRender
                }
            },
            xclass: 'filter-menu'
        });

    return FilterMenu;
}, {
    requires: ['./base', './filtermenu-render']
});
/**
 * @ignore
 * menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu", function (S, Menu, Render, Item, CheckItem, CheckItemRender, ItemRender, SubMenu, SubMenuRender, PopupMenu, PopupMenuRender, FilterMenu) {
    Menu.Render = Render;
    Menu.Item = Item;
    Menu.CheckItem = CheckItem;
    CheckItem.Render = CheckItemRender;
    Item.Render = ItemRender;
    Menu.SubMenu = SubMenu;
    SubMenu.Render = SubMenuRender;
    Menu.PopupMenu = PopupMenu;
    PopupMenu.Render = PopupMenuRender;
    Menu.FilterMenu = FilterMenu;
    return Menu;
}, {
    requires: [
        'menu/base',
        'menu/menu-render',
        'menu/menuitem',
        'menu/check-menuitem',
        'menu/check-menuitem-render',
        'menu/menuitem-render',
        'menu/submenu',
        'menu/submenu-render',
        'menu/popupmenu',
        'menu/popupmenu-render',
        'menu/filtermenu'
    ]
});

