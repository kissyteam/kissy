KISSY.add('tabs/bar-render', function (S, Toolbar) {
    return Toolbar.getDefaultRender().extend({
        beforeCreateDom: function (renderData) {
            renderData.elAttrs.role = 'tablist';
        }
    },{
        name:'TabsBarRender'
    });
},{
    requires:['toolbar']
});