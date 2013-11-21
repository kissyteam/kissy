KISSY.add(function (S, Control, MyRender) {
    return Control.extend({
        handleClickInternal: function () {
            this.callSuper();
            this.set('checked', !this.get('checked'));
        }
    }, {
        xclass: 'my-control',
        ATTRS: {
            xrender: {
                value: MyRender
            },
            checkEl: {},
            checked: {
                view: 1,
                value: false
            }
        }
    });
}, {
    requires: ['component/control', './render']
});