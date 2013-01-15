/**
 * @ignore
 * TabBar for KISSY.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/bar", function (S, Toolbar) {

    /**
     * @ignore
     */
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

        _onSetSelectedTab: function (v, e) {
            var prev;
            if (v) {
                if (e && (prev = e.prevVal)) {
                    prev.set("selected", false);
                }
                v.set("selected", true);
            }
        },

        _onSetHighlightedItem: function () {
            var self = this;
            TabBar.superclass._onSetHighlightedItem.apply(self, arguments);
            if (self.get('changeType') == 'mouse') {
                self._onSetSelectedTab.apply(self, arguments);
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
            },
            defaultChildXClass: {
                value: 'tabs-tab'
            }
        }
    }, {
        xclass: 'tabs-bar',
        priority: 30
    });

    /**
     * tabs change type
     * @enum {String}  KISSY.Tabs.ChangeType
     */
    TabBar.ChangeType = {
        /**
         * click
         */
        CLICK: "click",
        /**
         * mouse
         */
        MOUSE: "mouse"
    };

    return TabBar;

}, {
    requires: ['toolbar']
});