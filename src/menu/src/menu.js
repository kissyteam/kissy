/**
 * @ignore
 * menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu", function (S, Menu, Render, Item, CheckItem, CheckItemRender, ItemRender, SubMenu, SubMenuRender, PopupMenu, PopupMenuRender, FilterMenu) {
    Menu.Render = Render;
    Menu.Item = Item;
    Menu.CheckItem = CheckItem;
    CheckItem.Render = CheckItemRender;
    Item.Render = ItemRender;
    Menu.SubMenu = SubMenu;
    SubMenu.Render = SubMenuRender;
    Menu.PopupMenu = PopupMenu;
    PopupMenu.Render = PopupMenuRender;
    Menu.FilterMenu = FilterMenu;
    return Menu;
}, {
    requires: [
        'menu/base',
        'menu/menu-render',
        'menu/menuitem',
        'menu/check-menuitem',
        'menu/check-menuitem-render',
        'menu/menuitem-render',
        'menu/submenu',
        'menu/submenu-render',
        'menu/popupmenu',
        'menu/popupmenu-render',
        'menu/filtermenu'
    ]
});