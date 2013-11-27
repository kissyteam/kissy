/**
 * @ignore
 * abstract view for button
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S,require) {
    var Control=require('component/control');
    // http://www.w3.org/TR/wai-aria-practices/
    return Control.getDefaultRender().extend({
        beforeCreateDom: function (renderData) {
            var self = this;
            S.mix(renderData.elAttrs, {
                role: 'button',
                title: renderData.tooltip,
                'aria-describedby': renderData.describedby
            });
            if (renderData.checked) {
                renderData.elCls.push(self.getBaseCssClasses('checked'));
            }
        },
        _onSetChecked: function (v) {
            var self = this,
                cls = self.getBaseCssClasses('checked');
            self.$el[v ? 'addClass' : 'removeClass'](cls);
        },
        '_onSetTooltip': function (title) {
            this.el.setAttribute('title', title);
        },
        '_onSetDescribedby': function (describedby) {
            this.el.setAttribute('aria-describedby', describedby);
        }
    }, {
        name: 'ButtonRender'
    });
});