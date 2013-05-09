/**
 * @ignore
 * simple menuitem render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitem-render", function (S, Node, Component) {

    return Component.Render.extend({

        initializer: function () {
            var renderData = this.get('renderData');
            this.get('elAttrs')['role'] = renderData.selectable ?
                'menuitemradio' : 'menuitem';
            if (renderData.selected) {
                this.get('elCls').push(this.getCssClassWithState('selected'));
            }
        },

        _onSetSelected: function (v) {
            var self = this,
                el = self.get("el"),
                cls = self.getCssClassWithState("selected");
            el[v ? 'addClass' : 'removeClass'](cls);
        },

        containsElement: function (element) {
            var el = this.get("el");
            return el && ( el[0] == element || el.contains(element));
        }
    }, {
        ATTRS: {
            contentTpl: {
                value: '{{content}}'
            },
            selected: {
                sync: 0
            }
        },
        HTML_PARSER: {
            selectable: function (el) {
                var cls = this.getCssClassWithPrefix("menuitem-selectable");
                return el.hasClass(cls);
            }
        }
    });
}, {
    requires: ['node', 'component/base']
});