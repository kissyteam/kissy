/**
 * @fileOverview Body for tab panels.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/body", function (S, Component) {

    return Component.Container.extend({

        setSelectedPanelByIndexInternal: function (index) {
            var self = this, children = self.get("children");
            self.set("selectedPanel", children[index]);
        },

        bindUI: function () {
            this.on("afterSelectedPanelChange", function (e) {
                if (e.prevVal) {
                    e.prevVal.set("selected", false);
                }
                e.newVal.set("selected", true);
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
            }
        }
    }, {
        xclass: 'tabs-body'
    });

}, {
    requires: ['component']
});