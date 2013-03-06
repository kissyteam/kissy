/**
 * @ignore
 * submenu controller for kissy, transfer item's keycode to menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/submenu", function (S, Event, Component, MenuItem, SubMenuRender) {

    function afterHighlightedChange(e) {
        // 冒泡来的
        if (e.target !== this && e.target.isMenuItem && e.newVal) {
            this.set('highlighted', true);
        }
    }

    /* or precisely submenuitem */

    var KeyCodes = Event.KeyCodes,
        MENU_DELAY = 0.15;
    /**
     * Class representing a submenu that can be added as an item to other menus.
     * xclass: 'submenu'.
     * @extends KISSY.Menu.Item
     * @class KISSY.Menu.SubMenu
     */
    var SubMenu = MenuItem.extend([Component.DecorateChild], {

            bindUI: function () {
                this.on('afterHighlightedChange', afterHighlightedChange, this);
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
                if (!v) {
                    if (e.hideImmediate) {
                        hideMenu.call(self);
                    } else {
                        self.dismissTimer_ = S.later(hideMenu, self.get("menuDelay") * 1000, false, self);
                    }
                } else if (!e.byKeyboard) {
                    self.clearSubMenuTimers();
                    self.showTimer_ = S.later(showMenu, self.get("menuDelay") * 1000, false, self);
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
                                menuChildren[0].set('highlighted', true);
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
                    // 隐藏后，当前激活项重回，强制高亮事件
                    self.fire('afterHighlightedChange', {
                        newVal: true,
                        byKeyboard: 1
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
                    menu = getMenu(self);

                self.clearSubMenuTimers();

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