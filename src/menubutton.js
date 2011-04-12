KISSY.add("menubutton", function(S, MenuButton, MenuButtonRender) {
    MenuButton.Render = MenuButtonRender;
    return MenuButton;
}, {
    requires:['menubutton/menubutton','menubutton/menubuttonrender']
});