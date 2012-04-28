/**
 * Render for ToggleButton
 */
KISSY.add("button/toggleRender", function (S, UIBase, ButtonRender) {

    return UIBase.create(ButtonRender, [], {
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
    requires:['uibase', './buttonRender']
});