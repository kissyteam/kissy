KISSY.add(function (S, require) {
    var Toolbar = require('toolbar');

    return Toolbar.getDefaultRender().extend({
        beforeCreateDom: function (renderData) {
            renderData.elAttrs.role = 'tablist';
        }
    }, {
        name: 'TabsBarRender'
    });
});