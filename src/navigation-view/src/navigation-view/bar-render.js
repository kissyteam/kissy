/**
 * navigation bar render
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var tpl = require('./bar-xtpl');
    var Control = require('component/control');
    return Control.getDefaultRender().extend({
        createDom: function () {
            this.fillChildrenElsBySelectors({
                titleEl: '#ks-navigation-bar-title-{id}',
                contentEl: '#ks-navigation-bar-content-{id}',
                backEl: '#ks-navigation-bar-back-{id}'
            });
        },
        _onSetTitle: function (v) {
            this.control.get('titleEl').html(v);
        },
        _onSetBackText: function (v) {
            this.control.get('backEl').html(v);
        }
    }, {
        ATTRS: {
            contentTpl: {
                value: tpl
            }
        }
    });
});