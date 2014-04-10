KISSY.add(function (S, Control, XTemplate) {
    return Control.getDefaultRender().extend({
        beforeCreateDom: function (renderData, selectors) {
            selectors.checkEl = '#ks-my-control-{id}';
        },
        _onSetChecked: function (v) {
            var cls = this.getBaseCssClasses('checked');
            this.control.get('checkEl')[v ? 'addClass' : 'removeClass'](cls);
        }
    }, {
        ATTRS: {
            checkEl: {
                selector: function () {
                    return '.' + this.getBaseCssClass('check');
                }
            },
            checked: {
                parse: function () {
                    return this.get('checkEl').hasClass(this.getBaseCssClass('checked'));
                }
            },
            XTemplate: {
                value: XTemplate
            },
            contentTpl: {
                value: '<div class="{{getBaseCssClasses (\'check\')}} ' +
                    '{{#if (checked)}}' +
                    '{{getBaseCssClasses (\'checked\')}}' +
                    '{{/if}}' +
                    '">' +
                    '</div>'
            }
        }
    });
}, {
    requires: ['component/control', 'xtemplate']
});