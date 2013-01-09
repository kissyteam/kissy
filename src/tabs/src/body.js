/**
 * @ignore
 * Body for tab panels.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/body", function (S, Component) {

    return Component.Container.extend({

        renderUI: function () {
            var self = this,
                children = self.get("children");
            S.each(children, function (c) {
                if (c.get("selected")) {
                    self.set("selectedPanel", c);
                }
            });
        },

        bindUI: function () {
            this.on("afterSelectedPanelChange", function (e) {
                if (e.newVal) {
                    if (e.prevVal) {
                        e.prevVal.set("selected", false);
                    }
                    e.newVal.set("selected", true);
                }
            });
        }

    }, {
        ATTRS: {
            selectedPanel: {
            },
            allowTextSelection: {
                value: true
            },
            focusable: {
                value: false
            },
            handleMouseEvents: {
                value: false
            },
            delegateChildren: {
                value: false
            },
            defaultChildXClass: {
                value: 'tabs-panel'
            }
        }
    }, {
        xclass: 'tabs-body'
    });

}, {
    requires: ['component/base']
});