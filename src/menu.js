KISSY.add("menu", function(S, Menu, Render, Item, ItemRender) {
    Menu.ItemRender = ItemRender;
    Menu.Render = Render;
    Menu.Item = Item;
    return Menu;
}, {
    requires:[
        'menu/menu',
        'menu/menurender',
        'menu/menuitem',
        'menu/menuitemrender'
    ]
});