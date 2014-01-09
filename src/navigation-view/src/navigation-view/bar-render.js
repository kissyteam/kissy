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
                centerEl: '#ks-navigation-bar-center-{id}',
                contentEl: '#ks-navigation-bar-content-{id}'
            });
        },
        _onSetTitle: function (v) {
            this.control.get('titleEl').html(v);
        },
        _onSetBackText: function (v) {
            this.control.get('backButton').set('content',v);
        }
    }, {
        ATTRS: {
            contentTpl: {
                value: tpl
            }
        }
    });
});