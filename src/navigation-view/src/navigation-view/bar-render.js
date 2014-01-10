/**
 * navigation bar render
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var tpl = require('./bar-xtpl');
    var Control = require('component/control');
    return Control.getDefaultRender().extend({
        createDom: function () {
            var selectors = {
                centerEl: '#ks-navigation-bar-center-{id}',
                contentEl: '#ks-navigation-bar-content-{id}'
            };
            if (this.control._withTitle) {
                selectors.titleEl = '#ks-navigation-bar-title-{id}';
            }
            this.fillChildrenElsBySelectors(selectors);
        },
        _onSetTitle: function (v) {
            if (this.control._withTitle) {
                this.control.get('titleEl').html(v);
            }
        },
        _onSetBackText: function (v) {
            if (this.control._backBtn) {
                this.control._backBtn.set('content', v);
            }
        }
    }, {
        ATTRS: {
            contentTpl: {
                value: tpl
            }
        }
    });
});