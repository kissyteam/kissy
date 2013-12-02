/**
 * combination of menu and button ,similar to native select
 * @ignore
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Node = require('node');
    var Button = require('button');
    var MenuButtonRender = require('./render');

    var KeyCode = Node.KeyCode;
    /**
     * A menu button component, consist of a button and a drop down popup menu.
     * xclass: 'menu-button'.
     * @class KISSY.MenuButton
     * @extends KISSY.Button
     */
    return Button.extend({
        isMenuButton: 1,

        _onSetCollapsed: function (v) {
            var self = this,
                menu = self.get('menu');
            if (v) {
                menu.hide();
            } else {
                var el = self.$el;
                if (!menu.get('visible')) {
                    // same as submenu
                    // in case menu is changed after menubutton is rendered
                    var align = {
                        node: el,
                        points: ['bl', 'tl'],
                        overflow: {
                            adjustX: 1,
                            adjustY: 1
                        }
                    };
                    S.mix(menu.get('align'), align, false);
                    if (self.get('matchElWidth')) {
                        menu.render();
                        var menuEl = menu.get('el');
                        var borderWidth =
                            (parseInt(menuEl.css('borderLeftWidth')) || 0) +
                                (parseInt(menuEl.css('borderRightWidth')) || 0);
                        menu.set('width', menu.get('align').node[0].offsetWidth - borderWidth);
                    }
                    menu.show();
                    el.attr('aria-haspopup', menu.get('el').attr('id'));
                }
            }
        },

        bindUI: function () {
            var self = this;
            self.on('afterHighlightedItemChange',
                onMenuAfterHighlightedItemChange, self);
            self.on('click', onMenuItemClick, self);
        },

        /**
         * Handle keydown/up event.
         * If drop down menu is visible then handle event to menu.
         * Returns true if the event was handled, falsy otherwise.
         * Protected, should only be overridden by subclasses.
         * @param {KISSY.Event.DomEvent.Object} e key event to handle.
         * @return {Boolean|undefined} True Whether the key event was handled.
         * @protected
         */
        handleKeyDownInternal: function (e) {
            var self = this,
                keyCode = e.keyCode,
                type = String(e.type),
                menu = self.get('menu');

            // space 只在 keyup 时处理
            if (keyCode === KeyCode.SPACE) {
                // Prevent page scrolling in Chrome.
                e.preventDefault();
                if (type !== 'keyup') {
                    return undefined;
                }
            } else if (type !== 'keydown') {
                return undefined;
            }
            //转发给 menu 处理
            if (menu.get('rendered') && menu.get('visible')) {
                var handledByMenu = menu.handleKeyDownInternal(e);
                // esc
                if (keyCode === KeyCode.ESC) {
                    self.set('collapsed', true);
                    return true;
                }
                return handledByMenu;
            }

            // Menu is closed, and the user hit the down/up/space key; open menu.
            if (keyCode === KeyCode.SPACE ||
                keyCode === KeyCode.DOWN ||
                keyCode === KeyCode.UP) {
                self.set('collapsed', false);
                return true;
            }
            return undefined;
        },

        /**
         * Perform default action for menubutton.
         * Toggle the drop down menu to show or hide.
         * Protected, should only be overridden by subclasses.
         * @protected
         *
         */
        handleClickInternal: function () {
            var self = this;
            // does not fire click from menubutton
            // self.callSuper(e);
            self.set('collapsed', !self.get('collapsed'));
        },

        /**
         * Handles blur event.
         * When it loses keyboard focus, close the drop dow menu.
         * @param {KISSY.Event.DomEvent.Object} e Blur event.
         * Protected, should only be overridden by subclasses.
         * @protected
         *
         */
        handleBlurInternal: function (e) {
            var self = this;
            self.callSuper(e);
            // such as : click the document
            self.set('collapsed', true);
        },


        /**
         * Adds a new menu item at the end of the menu.
         * @param {KISSY.Menu.Item} item Menu item to add to the menu.
         * @param {Number} index position to insert
         */
        addItem: function (item, index) {
            var menu = this.get('menu');
            menu.addChild(item, index);
        },

        /**
         * Remove a existing menu item from drop down menu.
         * @param c {KISSY.Menu.Item} Existing menu item.
         * @param [destroy=true] {Boolean} Whether destroy removed menu item.
         */
        removeItem: function (c, destroy) {
            var menu = this.get('menu');
            menu.removeChild(c, destroy);
        },

        /**
         * Remove all menu items from drop down menu.
         * @param [destroy] {Boolean} Whether destroy removed menu items.
         */
        removeItems: function (destroy) {
            var menu = this.get('menu');
            if (menu) {
                if (menu.removeChildren) {
                    menu.removeChildren(destroy);
                } else if (menu.children) {
                    menu.children = [];
                }
            }
        },

        /**
         * Returns the child menu item of drop down menu at the given index, or null if the index is out of bounds.
         * @param {Number} index 0-based index.
         */
        getItemAt: function (index) {
            var menu = this.get('menu');
            return menu.get('rendered') && menu.getChildAt(index);
        },

        // 禁用时关闭已显示菜单
        _onSetDisabled: function (v) {
            if(!v){
                this.set('collapsed', true);
            }
        },

        destructor: function () {
            this.get('menu').destroy();
        }

    }, {
        ATTRS: {

            /**
             * Whether drop down menu is same width with button.
             * Defaults to: true.
             * @cfg {Boolean} matchElWidth
             */
            /**
             * @ignore
             */
            matchElWidth: {
                value: true
            },

            /**
             * Whether hide drop down menu when click drop down menu item.
             * eg: u do not want to set true when menu has checked menuitem.
             * Defaults to: false
             * @cfg {Boolean} collapseOnClick
             */
            /**
             * @ignore
             */
            collapseOnClick: {
                value: false
            },
            /**
             * Drop down menu associated with this menubutton.
             * @cfg {KISSY.Menu|Object} menu
             */

            /**
             * Drop down menu associated with this menubutton.
             * @property {KISSY.Menu} menu
             */


            /**
             * @ignore
             */
            menu: {
                value: {},
                getter: function (v) {
                    if (!v.isControl) {
                        v.xclass = v.xclass || 'popupmenu';
                        v = this.createComponent(v);
                        this.setInternal('menu', v);
                    }
                    return v;
                },
                setter: function (m) {
                    if (m.isControl) {
                        m.setInternal('parent', this);
                    }
                }
            },

            /**
             * Whether drop menu is shown.
             * @property {Boolean} collapsed
             */
            /**
             * @ignore
             */
            collapsed: {
                value: false,
                view: 1
            },

            xrender: {
                value: MenuButtonRender
            }
        },
        xclass: 'menu-button'
    });

    function onMenuItemClick(e) {
        if (e.target.isMenuItem && this.get('collapseOnClick')) {
            this.set('collapsed', true);
        }
    }

    function onMenuAfterHighlightedItemChange(e) {
        if (e.target.isMenu) {
            var el = this.el,
                menuItem = e.newVal;
            el.setAttribute('aria-activedescendant', menuItem && menuItem.el.id || '');
        }
    }
});