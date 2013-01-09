/**
 * @ignore
 *  abstract view for button
 * @author yiminghe@gmail.com
 */
KISSY.add("button/buttonRender", function (S, Component) {
    // http://www.w3.org/TR/wai-aria-practices/
    return Component.Render.extend({
        createDom:function () {
            // set wai-aria role
            this.get("el")
                .attr("role", "button");
        },
        _onSetChecked:function (v) {
            var self = this,
                el = self.get("el"),
                cls = self.getCssClassWithState("-checked");
            el[v ? 'addClass' : 'removeClass'](cls);
        },
        _onSetTooltip:function (title) {
            this.get("el").attr("title", title);
        },
        '_onSetDescribedby':function (describedby) {
            this.get("el").attr("aria-describedby", describedby);
        }
    }, {
        ATTRS:{
            describedby:{},
            tooltip:{},
            checked:{}
        }
    });
}, {
    requires:['component/base']
});