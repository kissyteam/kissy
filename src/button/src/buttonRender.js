/**
 * @fileOverview abstract view for button
 * @author yiminghe@gmail.com
 */
KISSY.add("button/buttonRender", function (S, Component) {
    // http://www.w3.org/TR/wai-aria-practices/
    return Component.Render.extend({
        createDom:function () {
            // set wai-aria role
            this.get("el")
                .attr("role", "button")
                .addClass("ks-inline-block");
        },
        _uiSetTooltip:function (title) {
            this.get("el").attr("title", title);
        },
        _uiSetDescribedby:function (describedby) {
            this.get("el").attr("aria-describedby", describedby);
        },

        _uiSetCollapseSide:function (side) {
            var self = this,
                cls = self.getCssClassWithPrefix("button-collapse-"),
                el = self.get("el");
            el.removeClass(cls + "left " + cls + "right");
            if (side) {
                el.addClass(cls + side);
            }
        }
    }, {
        ATTRS:{
            describedby:{},
            tooltip:{},
            collapseSide:{}
        }
    });
}, {
    requires:['component']
});