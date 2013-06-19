/**
 * menubutton
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton", function(S, MenuButton, Select, Option) {
    MenuButton.Select = Select;
    MenuButton.Option = Option;
    return MenuButton;
}, {
    requires:['menubutton/base',
        'menubutton/select',
        'menubutton/option']
});