KISSY.add(function (S, require) {
    var Control = require('component/control');
    var $ = require('node').all;
    var win = $(window);
    return function () {
        return Control.extend({
            onScroll: function (fn) {
                var self = this;
                var parent = self.get('parent');
                this.__fn = function () {
                    if (parent.get('activeView') === self) {
                        fn(win.scrollTop());
                    }
                };
                win.on('scroll', this.__fn, this);
            },
            getContentEl: function () {
                return this.get('el');
            },
            unScroll: function () {
                win.detach('scroll', this.__fn, this);
            },
            sync: function () {
            },
            destructor: function () {
                win.detach('scroll', this.__fn, this);
            }
        });
    };
});