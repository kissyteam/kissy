/**
 * menubutton
 * @ignore
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var MenuButton = require('menubutton/control');
    var Select = require('menubutton/select');
    var Option = require('menubutton/option');

    MenuButton.Select = Select;
    MenuButton.Option = Option;
    return MenuButton;
});