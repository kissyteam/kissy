/**
 * @fileOverview ToggleButton for KISSY
 * @author yiminghe@gmail.com
 */
KISSY.add('button/toggle', function (S, Component, Button, ToggleRender) {

    return Component.define(Button, [], {
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
    });

}, {
    requires:['component', './base', './toggleRender']
});