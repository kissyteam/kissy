/**
 * @fileOverview Render for ToggleButton
 * @author yiminghe@gmail.com
 */
KISSY.add("button/toggleRender", function (S, Component, ButtonRender) {

    return Component.define(ButtonRender, [], {
        _uiSetChecked:function (v) {
            var self = this,
                cls = self.getComponentCssClassWithState("-checked");
            self.get("el")[v ? 'addClass' : 'removeClass'](cls);
        }
    }, {
        ATTRS:{
            checked:{}
        }
    });

}, {
    requires:['component', './buttonRender']
});