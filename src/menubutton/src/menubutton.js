/**
 * menubutton
 * @ignore
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton", function(S, MenuButton, Select, Option) {
    MenuButton.Select = Select;
    MenuButton.Option = Option;
    return MenuButton;
}, {
    requires:['menubutton/control',
        'menubutton/select',
        'menubutton/option']
});