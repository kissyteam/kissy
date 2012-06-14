/**
 * @fileOverview Render for ToggleButton
 * @author yiminghe@gmail.com
 */
KISSY.add("button/toggleRender", function (S, ButtonRender) {

    return ButtonRender.extend({
        _uiSetChecked:function (v) {
            var self = this,
                cls = self.getComponentCssClassWithState("-checked");
            self.get("el")[v ? 'addClass' : 'removeClass'](cls);
        }
    }, {
        ATTRS:{
            checked:{
                value:false
            }
        }
    });

}, {
    requires:[ './buttonRender']
});