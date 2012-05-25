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
        'menu/menuRender',
        'menu/menuitem',
        'menu/menuitemRender',
        'menu/submenu',
        'menu/submenuRender',
        'menu/separator',
        'menu/separatorRender',
        'menu/popupmenu',
        'menu/popupmenuRender',
        'menu/filtermenu'
    ]
});