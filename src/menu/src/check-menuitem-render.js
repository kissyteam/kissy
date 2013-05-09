/**
 * checkable menu item render
 * @author yiminghe@gmail.com
 */
KISSY.add('menu/check-menuitem-render', function (S, MenuItemRender) {
    return MenuItemRender.extend({
        initializer: function () {
            if (this.get('checked')) {
                this.get('elCls').push(self.getCssClassWithState("checked"));
            }
            this.get('childrenElSelectors')['contentEl'] =
                '#{prefixCls}menuitem-content{id}';
        },
        _onSetChecked: function (v) {
            var self = this,
                el = self.get("el"),
                cls = self.getCssClassWithState("checked");
            el[v ? 'addClass' : 'removeClass'](cls);
        }
    }, {
        ATTRS: {
            contentTpl: {
                value: '<div class="{{prefixCls}}menuitem-checkbox"></div>' +
                    '<div id="{{prefixCls}}menuitem-content{{id}}"' +
                    ' class="{{prefixCls}}menuitem-content">{{content}}</div>'
            },
            checked: {
                sync: 0
            }
        }
    })
}, {
    requires: ['./menuitem-render']
});