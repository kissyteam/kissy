/**
 * @ignore
 * abstract view for button
 * @author yiminghe@gmail.com
 */
KISSY.add("button/render", function (S, Controller) {
    // http://www.w3.org/TR/wai-aria-practices/
    return Controller.ATTRS.xrender.value.extend({
        beforeCreateDom: function (renderData) {
            var self = this;
            S.mix(renderData.elAttrs, {
                role: 'button',
                title: renderData.tooltip,
                'aria-describedby': renderData.describedby
            });
            if (renderData.checked) {
                renderData.elCls.push(self.getBaseCssClasses("checked"));
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
    }, {
        name: 'ButtonRender'
    });
}, {
    requires: ['component/controller']
});