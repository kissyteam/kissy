/**
 * @fileOverview container for tab panels.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/body", function (S, Component) {

    return Component.Container.extend({

    }, {
        ATTRS: {
            focusable: {
                value: false
            },
            handleMouseEvents: {
                value: false
            },
            delegateChildren: {
                value: false
            }
        }
    },{
        xclass:'tabs-body'
    });

}, {
    requires: ['component']
});