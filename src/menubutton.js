KISSY.add("menubutton", function(S, MenuButton, MenuButtonRender, Select) {
    MenuButton.Render = MenuButtonRender;
    MenuButton.Select = Select;
    return MenuButton;
}, {
    requires:['menubutton/menubutton','menubutton/menubuttonrender','menubutton/select']
});