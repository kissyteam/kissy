KISSY.add(function (S, Control) {
    return Control.ATTRS.xrender.value.extend({
        beforeCreateDom: function (renderData, selectors) {
            selectors.checkEl = '#ks-my-control-{id}';
        },
        _onSetChecked: function (v) {
            var cls = this.getBaseCssClasses('checked');
            this.control.get('checkEl')[v ? 'addClass' : 'removeClass'](cls);
        }
    }, {
        HTML_PARSER: {
            checkEl: function (el) {
                return el.one('.' + this.getBaseCssClass('check'));
            },
            checked:function(el){
                return el.one('.' + this.getBaseCssClass('check')).hasClass(this.getBaseCssClass('checked'));
            }
        },
        ATTRS: {
            contentTpl: {
                value: '<div id="ks-my-control-{{id}}" class="{{getBaseCssClasses \'check\'}} ' +
                    '{{#if checked}}' +
                    '{{getBaseCssClasses \'checked\'}}' +
                    '{{/if}}' +
                    '">' +
                    '</div>'
            }
        }
    });
}, {
    requires: ['component/control']
});