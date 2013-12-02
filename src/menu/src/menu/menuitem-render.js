/**
 * @ignore
 * simple menuitem render
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Control = require('component/control');
    return Control.getDefaultRender().extend({
        beforeCreateDom: function (renderData) {
            renderData.elAttrs.role = renderData.selectable ?
                'menuitemradio' : 'menuitem';
            if (renderData.selected) {
                renderData.elCls.push(this.getBaseCssClasses('selected'));
            }
        },

        _onSetSelected: function (v) {
            var self = this,
                cls = self.getBaseCssClasses('selected');
            self.$el[v ? 'addClass' : 'removeClass'](cls);
        },

        containsElement: function (element) {
            var $el = this.$el;
            return $el && ( $el[0] === element || $el.contains(element));
        }
    }, {
        HTML_PARSER: {
            selectable: function (el) {
                return el.hasClass(this.getBaseCssClass('selectable'));
            }
        }
    });
});