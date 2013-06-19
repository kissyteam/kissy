KISSY.add('toolbar/render', function (S, Container) {
    return Container.ATTRS.xrender.value.extend({
        beforeCreateDom: function (renderData) {
            renderData.elAttrs.role = 'toolbar';
        }
    });
}, {
    requires: ['component/container']
});