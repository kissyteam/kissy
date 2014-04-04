KISSY.add(function (S, require) {
    var Menu = require('menu');
    var Node = require('node');
    var $ = Node.all;
    return Menu.Item.extend({
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
});