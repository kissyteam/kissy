/**
 * @fileOverview ToggleButton for KISSY
 * @author yiminghe@gmail.com
 */
KISSY.add('button/toggle', function (S, Button, ToggleRender) {

    var ToggleButton = Button.extend({
        performActionInternal:function () {
            var self = this;
            self.set("checked", !self.get("checked"));
            ToggleButton.superclass.performActionInternal.apply(self, arguments);
        }
    }, {
        ATTRS:{
            checked:{
                view:1
            },
            xrender:{
                value:ToggleRender
            }
        }
    }, {
        xclass:'toggle-button',
        priority:30
    });

    return ToggleButton;

}, {
    requires:['./base', './toggleRender']
});