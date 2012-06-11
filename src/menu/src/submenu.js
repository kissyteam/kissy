/**
 * @fileOverview submenu model and control for kissy , transfer item's keycode to menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/submenu", function (S, Event, Component, MenuItem, SubMenuRender) {

    /* or precisely submenuitem */

    var KeyCodes = Event.KeyCodes,
        doc = S.Env.host.document,
        MENU_DELAY = 300;
    /**
     * Class representing a submenu that can be added as an item to other menus.
     */
    var SubMenu = MenuItem.extend([Component.DecorateChild], {

            /**
             * Bind sub menu events.
             * @protected
             */
            bindSubMenu:function () {
                /**
                 * 自己不是 menu，自己只是 menuitem，其所属的 menu 为 get("parent")
                 */
                var self = this,
                    menu = self.get("menu"),
                    parentMenu = self.get("parent");

                //当改菜单项所属的菜单隐藏后，该菜单项关联的子菜单也要隐藏
                if (parentMenu) {

                    parentMenu.on("hide", onParentHide, self);

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
                    // 只绑定一次
                    self.bindSubMenu = S.noop;
                }

                // 访问子菜单，当前 submenu 不隐藏 menu
                // leave submenuitem -> enter menuitem -> menu item highlight ->
                // -> menu highlight -> beforeSubMenuHighlightChange ->

                // menu render 后才会注册 afterHighlightedItemChange 到 _uiSet
                // 这里的 beforeSubMenuHighlightChange 比 afterHighlightedItemChange 先执行
                // 保险点用 beforeHighlightedItemChange
                menu.on("beforeHighlightedItemChange", beforeSubMenuHighlightChange, self);
            },

            handleMouseEnter:function (e) {
                var self = this;
                if (SubMenu.superclass.handleMouseEnter.call(self, e)) {
                    return true;
                }
                // 停止层层检查以及子菜单的隐藏
                self.clearSubMenuTimers();
                self.showTimer_ = S.later(showMenu, self.get("menuDelay"), false, self);
            },

            /**
             * Dismisses the submenu on a delay, with the result that the user needs less
             * accuracy when moving to sub menus.
             * @protected
             */
            _uiSetHighlighted:function (e) {
                var self = this;
                if (!e) {
                    self.dismissTimer_ = S.later(hideMenu, self.get("menuDelay"), false, self);
                }
            },

            /**
             * Clears the show and hide timers for the sub menu.
             */
            clearSubMenuTimers:function () {
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
            performActionInternal:function () {
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
             * @param e A key event.
             * @protected
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

            hideParentMenusBuffer:function () {
                var self = this, parentMenu = self.get("parent");
                self.dismissTimer_ = S.later(function () {
                        var submenu = self,
                            popupmenu = self.get("menu");
                        while (popupmenu.get("autoHideOnMouseLeave")) {
                            hideMenu.call(submenu);
                            if (// 原来的 submenu 在高亮
                            // 表示越级选择 menu
                                parentMenu.get("highlightedItem") != submenu) {
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
                    self.get("menuDelay"),
                    false,
                    self);
            },

            containsElement:function (element) {
                var menu = getMenu(this);
                return menu && menu.containsElement(element);
            },

            // 默认 addChild，这里里面的元素需要放到 menu 属性中
            decorateChildrenInternal:function (ui, el) {
                // 不能用 display:none
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

                self.clearSubMenuTimers();

                if (menu && menu.__bindDocClickToHide) {
                    menu.__bindDocClickToHide = 0;
                    Event.remove(doc, "click", _onDocClick, self);
                }

                //当改菜单项所属的菜单隐藏后，该菜单项关联的子菜单也要隐藏
                if (parentMenu) {
                    parentMenu.detach("hide", onParentHide, self);
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
                /**
                 * Can set "align" to specify alignment submenu with current menuitem
                 * @type Object
                 * @example
                 * <code>
                 * {
                 *   align:{
                 *      points:['cc','cc']
                 *   }
                 * }
                 * </code>
                 */
                menuCfg:{
                    value:{}
                },
                menu:{
                    setter:function (m) {
                        if (m instanceof  Component.Controller) {
                            m.__set("parent", this);
                        }
                    }
                },
                decorateChildCls:{
                    value:"popupmenu"
                },
                xrender:{
                    value:SubMenuRender
                }
            }
        }, {
            xclass:'submenu',
            priority:20
        });

    // # -------------------------------- private start

    function getMenu(self, init) {
        var m = self.get("menu");
        if (m && m.xclass) {
            if (init) {
                m = Component.create(m, self);
                self.__set("menu", m);
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
            // submenuitem should also hide
            self.get("parent").set("highlightedItem", null);
        }
    }

    function showMenu() {
        var self = this,
            menu = getMenu(self, 1);
        if (menu) {
            // 保证显示前已经绑定好事件
            self.bindSubMenu();
            menu.set("align", S.mix({
                node:self.get("el"),
                points:['tr', 'tl']
            }, self.get("menuCfg").align));
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
            // 导致本类 _uiSetHighlighted 调用，又把子菜单隐藏了
            self.get("parent").set("highlightedItem", self);
        }
    }

    function onParentHide() {
        var menu = getMenu(this);
        menu && menu.hide();
    }

    // # ------------------------------------ private end

    return SubMenu;
}, {
    requires:['event', 'component', './menuitem', './submenuRender']
});

/**

 **/