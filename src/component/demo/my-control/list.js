var Container = require('component/container');
module.exports = Container.extend({}, {
    xclass: 'my-list',
    ATTRS: {
        focusable: {
            value: false
        }
    }
});