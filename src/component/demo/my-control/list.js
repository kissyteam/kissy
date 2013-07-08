KISSY.add('my-control/list', function (S, Container) {
    return Container.extend({}, {
        xclass:'my-list',
        ATTRS: {
            focusable: {
                value: false
            }
        }
    });
}, {
    requires: ['component/container']
});