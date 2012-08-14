/**
 * @fileOverview Single tab in tab bar.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/tab", function (S, Button) {

    return Button.extend({

    }, {
        ATTRS: {
            handleMouseEvents: {
                value: false
            },
            focusable: {
                value: false
            },
            checkable: {value: true}
        }
    }, {
        xclass: 'tabs-tab'
    });

}, {
    requires: ['button']
});