/**
 * sub-view for navigation-view
 */
KISSY.add(function (S, require) {
    var Control = require('component/control');

    return Control.extend({
        isActiveView: function () {
            return this.get('parent').get('activeView') === this;
        },

        _onSetTitle: function (v) {
            if (this.isActiveView()) {
                this.get('parent').get('bar').set('title', v);
            }
        }
    }, {
        xclass: 'navigation-sub-view',

        ATTRS: {
            handleMouseEvents: {
                value: false
            },

            title: {
                value: '...'
            },

            focusable: {
                value: false
            }
        }
    });
});