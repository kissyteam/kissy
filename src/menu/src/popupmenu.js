/**
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
});