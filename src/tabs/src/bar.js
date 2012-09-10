/**
 * @fileOverview TabBar for KISSY.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/bar", function (S, Toolbar) {

    var TabBar = Toolbar.extend({

        createDom: function () {
            this.get("el").attr("role", "tablist");
        },

        handleKeyEventInternal: function (e) {
            var self = this;
            var current = self.get('selectedTab');
            var next = self.getNextItemByKeyEventInternal(e, current);
            if (S.isBoolean(next)) {
                return next;
            } else {
                next.set('selected', true);
                return true;
            }
        },


        renderUI: function () {
            var bar = this,
                children = bar.get("children");
            S.each(children, function (c) {
                if (c.get("selected")) {
                    bar.set("selectedTab", c);
                }
            });
        },

        _uiSetSelectedTab: function (v, e) {
            var prev;
            if (v) {
                if (e&&(prev = e.prevVal)) {
                    prev.set("selected", false);
                }
                v.set("selected", true);
            }
        },

        _uiSetHighlightedItem: function () {
            var self = this;
            TabBar.superclass._uiSetHighlightedItem.apply(self, arguments);
            if (self.get('changeType') == 'mouse') {
                self._uiSetSelectedTab.apply(self, arguments);
            }
        },

        bindUI: function () {
            var self = this;
            self.on("afterSelectedChange", function (e) {
                if (e.newVal && e.target.isTabsTab) {
                    self.set("selectedTab", e.target);
                }
            });
        }

    }, {
        ATTRS: {
            selectedTab: {
            },
            changeType: {
                value: "click"
            }
        }
    }, {
        xclass: 'tabs-bar',
        priority: 30
    });

    /**
     * Tab change type.
     * @enum {String}
     */
    TabBar.changeType = {
        CLICK: "click",
        MOUSE: "mouse"
    };

    return TabBar;

}, {
    requires: ['toolbar']
});