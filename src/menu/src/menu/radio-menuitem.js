/**
 * checkable menu item
 * @ignore
 * @author yiminghe@gmail.com
 */

var MenuItem = require('./menuitem');
var ContentBox = require('component/extension/content-box');
var RadioMenuItemTpl = require('./radio-menuitem-xtpl');

/**
 * @class KISSY.Menu.RadioItem
 */
module.exports = MenuItem.extend([ContentBox], {
    beforeCreateDom: function (renderData) {
        renderData.elAttrs.role = 'menuitemradio';
        if (renderData.selected) {
            renderData.elCls.push(this.getBaseCssClasses('selected'));
        }
    },

    _onSetSelected: function (v) {
        var self = this,
            cls = self.getBaseCssClasses('selected');
        self.$el[v ? 'addClass' : 'removeClass'](cls);
    },

    handleClickInternal: function (e) {
        var self = this;
        var rootMenu = self.get('parent').getRootMenu();
        var selectedItem = rootMenu.__selectedItem;
        if (selectedItem && selectedItem !== self) {
            selectedItem.set('selected', false);
        }
        rootMenu.__selectedItem = self;
        self.set('selected', true);
        self.callSuper(e);
        return true;
    },

    destructor: function () {
        var parent = this.get('parent');
        var rootMenu = parent && parent.getRootMenu();
        if (rootMenu && rootMenu.__selectedItem === this) {
            rootMenu.__selectedItem = null;
        }
    }
}, {
    ATTRS: {
        contentTpl: {
            value: RadioMenuItemTpl
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
            sync: 0,
            render: 1
        }
    },
    xclass: 'radio-menuitem'
});