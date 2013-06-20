/**
 * @ignore
 * menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu", function (S, Menu,
                            Item, CheckItem,

                             SubMenu,
                             PopupMenu) {
    Menu.Item = Item;
    Menu.CheckItem = CheckItem;
    Menu.SubMenu = SubMenu;
    Menu.PopupMenu = PopupMenu;
    return Menu;
}, {
    requires: [
        'menu/base',
        'menu/menuitem',
        'menu/check-menuitem',
        'menu/submenu',
        'menu/popupmenu'
    ]
});