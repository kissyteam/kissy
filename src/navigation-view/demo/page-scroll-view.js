KISSY.add(function (S, require) {
    var ScrollView = require('scroll-view');
    var ScrollBar = require('scroll-view/plugin/scrollbar');
    return function () {
        return ScrollView.extend({
            onScroll: function (fn) {
                this.__fn = function (e) {
                    fn(e.newVal);
                };
                this.on('afterScrollTopChange', this.__fn);
            },
            getContentEl: function () {
                return this.get('contentEl');
            },
            unScroll: function () {
                this.detach('afterScrollTopChange', this.__fn);
            }
        }, {
            ATTRS: {
                plugins: {
                    valueFn: function () {
                        return [ScrollBar];
                    }
                }
            }
        });
    };
});