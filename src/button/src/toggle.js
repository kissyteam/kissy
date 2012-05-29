/**
 * @fileOverview ToggleButton for KISSY
 * @author yiminghe@gmail.com
 */
KISSY.add('button/toggle', function (S, Button, ToggleRender) {

    return Button.extend({
        performActionInternal:function () {
            var self = this;
            self.set("checked", !self.get("checked"));
            self.constructor.superclass.performActionInternal.apply(self, arguments);
        }
    }, {
        DefaultRender:ToggleRender,
        ATTRS:{
            checked:{
                value:false,
                view:true
            }
        }
    }, {
        xclass:'toggle-button',
        priority:30
    });

}, {
    requires:['./base', './toggleRender']
});