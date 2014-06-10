var Control = require('component/control');
var MyRender = require('./render');

module.exports = Control.extend({
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
            render: 1,
            value: false
        }
    }
});