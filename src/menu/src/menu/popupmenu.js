/**
 * @ignore
 * positionable and not focusable menu
 * @author yiminghe@gmail.com
 */

var AlignExtension = require('component/extension/align');
var Shim = require('component/extension/shim');
var Menu = require('./control');
var ContentBox = require('component/extension/content-box');

/**
 * Popup Menu.
 * xclass: 'popupmenu'.
 * @class KISSY.Menu.PopupMenu
 * @extends KISSY.Menu
 * @mixins KISSY.Component.Extension.Align
 */
module.exports = Menu.extend([
    ContentBox,
    Shim,
    AlignExtension
], {
    // 根菜单 popupmenu 或者到中间的 menu 菜单
    getRootMenu: function () {
        var self = this,
            cur = self,
            last;
        do {
            // 沿着 menu，menuitem 链
            last = cur;
            cur = cur.get('parent');
        } while (cur && (cur.isMenuItem || cur.isMenu));
        return last;
    },

    handleMouseLeaveInternal: function (e) {
        var self = this;
        self.callSuper(e);
        // sub menuitem 有时不灵敏
        // var parent = this.get('parent');
        // if (parent && parent.isSubMenu) {
        //  parent.clearShowPopupMenuTimers();
        // }
        if (self.get('autoHideOnMouseLeave')) {
            var rootMenu = self.getRootMenu();
            if (rootMenu !== this) {
                clearTimeout(rootMenu._popupAutoHideTimer);
                rootMenu._popupAutoHideTimer = setTimeout(function () {
                    var item;
                    if ((item = rootMenu.get('highlightedItem'))) {
                        item.set('highlighted', false);
                    }
                }, self.get('parent').get('menuDelay') * 1000);
            }
        }
    },

    isPopupMenu: 1,

    /**
     * Suppose it has focus (as a context menu), then it must hide when lose focus.
     * Protected, should only be overridden by subclasses.
     * @protected
     */
    handleBlurInternal: function (e) {
        var self = this;
        self.callSuper(e);
        self.hide();
    }
}, {
    ATTRS: {
        handleGestureEvents: {
            value: true
        },

        focusable: {
            value: false
        },

        allowTextSelection: {
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

        visible: {
            value: false
        }
    },
    xclass: 'popupmenu'
});