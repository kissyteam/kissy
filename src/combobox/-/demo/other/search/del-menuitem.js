var Menu = require('menu');
var $ = require('node');
module.exports = Menu.Item.extend({
    createDom: function () {
        this.$el.append('<span class="del">del</span>');
    },
    handleClickInternal: function (e) {
        var self = this;
        if ($(e.target).closest('.del', this.el)) {
            self.fire('delete');
        } else {
            self.fire('click');
        }
        return true;
    }
}, {
    xclass: 'del-menuitem'
});
