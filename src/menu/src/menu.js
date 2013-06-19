/**
 * @ignore
 * menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu", function (S, Menu,
                            Item, CheckItem,

                             SubMenu,
                             PopupMenu,
                             FilterMenu) {
    Menu.Item = Item;
    Menu.CheckItem = CheckItem;
    Menu.SubMenu = SubMenu;
    Menu.PopupMenu = PopupMenu;
    Menu.FilterMenu = FilterMenu;
    return Menu;
}, {
    requires: [
        'menu/base',
        'menu/menuitem',
        'menu/check-menuitem',
        'menu/submenu',
        'menu/popupmenu',
        'menu/filtermenu'
    ]
});