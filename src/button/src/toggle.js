/**
 * ToggleButton for KISSY
 * @author yiminghe@gmail.com
 */
KISSY.add('button/toggle', function (S, UIBase, Button, ToggleRender) {

    return UIBase.create(Button, [], {
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
    requires:['uibase', './base', './toggleRender']
});