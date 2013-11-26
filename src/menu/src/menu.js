/**
 * @ignore
 * menu
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Menu = require('menu/control');
    var Item = require('menu/menuitem');
    var CheckItem = require('menu/check-menuitem');
    var SubMenu = require('menu/submenu');
    var PopupMenu = require('menu/popupmenu');

    Menu.Item = Item;
    Menu.CheckItem = CheckItem;
    Menu.SubMenu = SubMenu;
    Menu.PopupMenu = PopupMenu;
    return Menu;
});