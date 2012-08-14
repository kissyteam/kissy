/**
 * @fileOverview TabBar for KISSY.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/bar", function (S, Toolbar) {

    var TabBar = Toolbar.extend({

        createDom: function () {
            this.get("el").attr("role", "tablist");
        },

        handleKeyEventInternal: function () {
            var self = this;
            TabBar.superclass.handleKeyEventInternal.apply(self, arguments);
            // even at 'click' type, keyboard should control tabs change.
            // but in mouse mode,
            // it is already handled in 'afterHighlightedItemChange'
            if (self.get("changeType") != 'mouse') {
                self.set("selectedItem", self.get("highlightedItem"));
            }
        },

        handleFocus: function () {
            var self = this;
            TabBar.superclass.handleFocus.apply(self, arguments);
            // restore current highlighted item to selectedItem when focus
            // because highlightedItem loses when mouse out of the whole tabs container
            self.set("highlightedItem", self.get("selectedItem"));
        },

        bindUI: function () {
            var self = this,
                changeType = self.get("changeType");
            self.on("afterSelectedItemChange" +
                (changeType == 'mouse' ? " afterHighlightedItemChange" : ""),
                function (e) {
                    // highlighted may be null
                    // if mouse out of the whole tabs container
                    if (e.newVal) {
                        if (e.prevVal) {
                            e.prevVal.set("selected", false);
                        }
                        e.newVal.set("selected", true);
                    }
                });
            self.on("afterSelectedChange", function (e) {
                if (e.newVal && e.target.isTabsTab) {
                    self.set("selectedItem", e.target);
                }
            });
        }

    }, {
        ATTRS: {
            selectedItem: {
            },
            changeType: {
            }
        }
    }, {
        xclass: 'tabs-bar'
    });

    return TabBar;

}, {
    requires: ['toolbar']
});