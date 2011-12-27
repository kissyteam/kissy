/**
 * @fileOverview menubutton
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton", function(S, MenuButton, MenuButtonRender, Select, Option) {
    MenuButton.Render = MenuButtonRender;
    MenuButton.Select = Select;
    MenuButton.Option = Option;
    return MenuButton;
}, {
    requires:['menubutton/base',
        'menubutton/menubuttonrender',
        'menubutton/select',
        'menubutton/option']
});