KISSY.add('tabs/bar-render', function (S, Toolbar) {
    return Toolbar.ATTRS.xrender.value.extend({
        beforeCreateDom: function (renderData) {
            renderData.elAttrs.role = 'tablist';
        }
    },{
        name:'TabsBarRender'
    });
},{
    requires:['toolbar']
});