/**
 * @ignore
 * submenu controller for kissy, transfer item's keyCode to menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/submenu", function (S, Node, MenuItem, SubMenuRender) {

    function afterHighlightedChange(e) {
        var target = e.target,
            self = this;
        // hover 子菜单，保持该菜单项高亮
        if (target !== self && target.isMenuItem && e.newVal) {
            self.clearHidePopupMenuTimers();
            if (!self.get('highlighted')) {
                self.set('highlighted', true);
                // refresh highlightedItem of parent menu
                target.set('highlighted', false);
                target.set('highlighted', true);
            }
        }
    }

    /* or precisely subMenuItem */
    var KeyCode = Node.KeyCode,
        MENU_DELAY = 0.15;

    /**
     * Class representing a submenu that can be added as an item to other menus.
     * xclass: 'submenu'.
     * @extends KISSY.Menu.Item
     * @class KISSY.Menu.SubMenu
     */
    var SubMenu = MenuItem.extend({

            isSubMenu: 1,

            clearShowPopupMenuTimers: function () {
                var showTimer;
                if (showTimer = this._showTimer) {
                    showTimer.cancel();
                    this._showTimer = null;
                }
            },

            clearHidePopupMenuTimers: function () {
                var dismissTimer;
                if (dismissTimer = this._dismissTimer) {
                    dismissTimer.cancel();
                    this._dismissTimer = null;
                }
            },

            clearSubMenuTimers: function () {
                this.clearHidePopupMenuTimers();
                this.clearShowPopupMenuTimers();
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
                self.clearSubMenuTimers();
                var menu = self.get('menu');
                if (menu.get('rendered') && menu.get('visible')) {
                    // 延迟 highlighted
                    self._dismissTimer = S.later(hideMenu,
                        self.get("menuDelay") * 1000, false, self);
                }
            },

            handleMouseEnter: function () {
                var self = this;
                self.set('highlighted', true, {
                    data: {
                        fromMouse: 1
                    }
                });
                self.clearSubMenuTimers();
                var menu = self.get('menu');
                if (!menu.get('rendered') || !menu.get('visible')) {
                    self._showTimer = S.later(showMenu, self.get("menuDelay") * 1000, false, self);
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
            handleKeyEventInternal: function (e) {
                var self = this,
                    menu = self.get('menu'),
                    menuChildren,
                    menuChild,
                    hasKeyboardControl_ = menu.get('rendered') && menu.get("visible"),
                    keyCode = e.keyCode;

                if (!hasKeyboardControl_) {
                    // right
                    if (keyCode == KeyCode.RIGHT) {
                        showMenu.call(self);
                        menuChildren = menu.get("children");
                        if (menuChild = menuChildren[0]) {
                            menuChild.set('highlighted', true, {
                                data: {
                                    fromKeyboard: 1
                                }
                            });
                        }
                    }
                    // enter as click
                    else if (keyCode == KeyCode.ENTER) {
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
                else if (keyCode == KeyCode.LEFT) {
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
                var menu = this.get('menu');
                return menu.get('rendered') && menu.containsElement(element);
            },

            destructor: function () {
                var self = this,
                    menu = self.get('menu');
                self.clearSubMenuTimers();
                menu.destroy();
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
                    value: {},
                    getter: function (v) {
                        if (!v.isController) {
                            v.xclass = v.xclass || 'popupmenu';
                            v = this.createComponent(v);
                            this.setInternal('menu', v);
                        }
                        return v;
                    },
                    setter: function (m) {
                        if (m.isController) {
                            m.setInternal('parent', this);
                            var align = {
                                node: this.el,
                                points: ['tr', 'tl'],
                                overflow: {
                                    adjustX: 1,
                                    adjustY: 1
                                }
                            };
                            S.mix(m.get('align'), align, false);
                        }
                    }
                },

                xrender: {
                    value: SubMenuRender
                }
            },
            xclass: 'submenu'
        });

    // # -------------------------------- private start

    function showMenu() {
        var self = this,
            el,
            align,
            menu = self.get('menu');

        el = self.el;
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
        el.attr("aria-haspopup", menu.el.attr("id"));

    }

    function hideMenu() {
        var menu = this.get('menu');
        if (menu.get('rendered')) {
            menu.hide();
        }
    }

    // # ------------------------------------ private end

    return SubMenu;
}, {
    requires: ['node', './menuitem', './submenu-render']
});