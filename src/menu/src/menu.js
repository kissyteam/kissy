/**
 * @fileOverview menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu", function (S, Menu, Render, Item, ItemRender, SubMenu, SubMenuRender, Separator, SeparatorRender, PopupMenu, PopupMenuRender, FilterMenu) {
    Menu.Render = Render;
    Menu.Item = Item;
    Item.Render = ItemRender;
    Menu.SubMenu = SubMenu;
    SubMenu.Render = SubMenuRender;
    Menu.Separator = Separator;
    Menu.PopupMenu = PopupMenu;
    PopupMenu.Render = PopupMenuRender;
    Menu.FilterMenu = FilterMenu;
    return Menu;
}, {
    requires:[
        'menu/base',
        'menu/menurender',
        'menu/menuitem',
        'menu/menuitemrender',
        'menu/submenu',
        'menu/submenurender',
        'menu/separator',
        'menu/separatorrender',
        'menu/popupmenu',
        'menu/popupmenurender',
        'menu/filtermenu'
    ]
});