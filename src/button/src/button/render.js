/**
 * @ignore
 * abstract view for button
 * @author yiminghe@gmail.com
 */
KISSY.add("button/render", function (S, Component) {
    // http://www.w3.org/TR/wai-aria-practices/
    return Component.Render.extend({
        initializer: function () {
            // set wai-aria role
            var self = this;
            var renderData = self.renderData;
            if (renderData) {
                var controller = self.controller;
                var attrs = controller.get('elAttrs');
                S.mix(attrs, {
                    role: 'button',
                    title: renderData.tooltip,
                    'aria-describedby': renderData.describedby
                });
                if (renderData.checked) {
                    controller.get('elCls').push(self.getBaseCssClasses("checked"));
                }
            }
        },
        _onSetChecked: function (v) {
            var self = this,
                el = self.el,
                cls = self.getBaseCssClasses("checked");
            el[v ? 'addClass' : 'removeClass'](cls);
        },
        '_onSetTooltip': function (title) {
            this.el.attr("title", title);
        },
        '_onSetDescribedby': function (describedby) {
            this.el.attr("aria-describedby", describedby);
        }
    },{
        name:'ButtonRender'
    });
}, {
    requires: ['component/base']
});