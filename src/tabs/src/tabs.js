/**
 * @fileOverview KISSY Tabs Component.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs", function (S, Component, Bar, Body, Tab, Panel, Render) {
    var Tabs = Component.Controller.extend({

        initializer: function () {
            var self = this,
                selected,
                items,
                bar = {
                    xclass: 'tabs-bar',
                    changeType: self.get("changeType"),
                    children: []
                },
                body = {
                    xclass: 'tabs-body',
                    children: []
                },
                barChildren = bar.children,
                panels = body.children;

            if (items = self.get("items")) {
                S.each(items, function (item) {
                    selected = selected || item.selected;
                    barChildren.push({
                        xclass: 'tabs-tab',
                        content: item.title,
                        selected: item.selected
                    });
                    panels.push({
                        xclass: 'tabs-panel',
                        content: item.content,
                        selected: item.selected
                    });
                });
            }

            if (!selected && barChildren.length) {
                barChildren[0].selected = true;
                panels[0].selected = true;
            }

            self.set("bar", bar);
            self.set("body", body);
        },


        addItem: function (item, index) {
            var tabs = this,
                bar = tabs.get("bar"),
                selectedTab,
                selectedPanel,
                body = tabs.get("body");

            selectedTab = bar.addChild({
                xclass: 'tabs-tab',
                content: item.title
            }, index);

            selectedPanel = body.addChild({
                xclass: 'tabs-panel',
                content: item.content
            }, index);

            if (item.selected) {
                bar.set('selectedTab', selectedTab);
                body.set('selectedPanel', selectedPanel);
            }

            return tabs;
        },

        removeItemAt: function (index, destroy) {
            var tabs = this,
                bar = tabs.get("bar"),
                barCs = bar.get("children"),
                tab = bar.getChildAt(index),
                body = tabs.get("body");
            if (tab.get("selected")) {
                if (barCs.length == 1) {
                    bar.set("selectedTab", null);
                } else if (index == 0) {
                    bar.set("selectedTab", bar.getChildAt(index + 1));
                } else {
                    bar.set("selectedTab", bar.getChildAt(index - 1));
                }
            }
            bar.removeChild(bar.getChildAt(index), destroy);
            body.removeChild(body.getChildAt(index), destroy);
            return tabs;
        },

        removeItemByTab: function (tab) {
            var index = S.indexOf(tab, this.get("bar").get("children"));
            return this.removeItemAt(index);
        },

        removeItemByPanel: function (panel) {
            var index = S.indexOf(panel, this.get("body").get("children"));
            return this.removeItemAt(index);
        },

        getSelectedTab: function () {
            var tabs = this,
                bar = tabs.get("bar"),
                child = null;

            S.each(bar.get("children"), function (c) {
                if (c.get("selected")) {
                    child = c;
                    return false;
                }
            });

            return child;
        },

        getTabs: function () {
            return   this.get("bar").get("children");
        },

        getPanels: function () {
            return   this.get("body").get("children");
        },

        getTabAt: function (index) {
            return this.get("bar").get("children")[index];
        },

        getPanelAt: function (index) {
            return this.get("body").get("children")[index];
        },

        getSelectedPanel: function () {
            var tabs = this,
                body = tabs.get("body"),
                child = null;

            S.each(body.get("children"), function (c) {
                if (c.get("selected")) {
                    child = c;
                    return false;
                }
            });

            return child;
        },

        renderUI: function () {

            var self = this,
                barOrientation = self.get("barOrientation"),
                el = self.get("el"),
                body = self.get("body"),
                bar = self.get("bar");
            bar.set("render", el);
            body.set("render", el);

            if (barOrientation == 'bottom') {
                body.render();
                bar.render();
            } else {
                bar.render();
                body.render();
            }
        },

        decorateInternal: function (el) {
            var self = this,
                bar = el.one(".ks-tabs-bar"),
                body = el.one(".ks-tabs-body");
            self.set("el", el);
            self.set("bar", new Bar({
                srcNode: bar
            }));
            self.set("body", new Body({
                srcNode: body
            }));
        },

        bindUI: function () {
            var self = this,
                body = self.get("body"),
                bar = self.get("bar");

            bar.on("afterSelectedTabChange", function (e) {
                body.setSelectedPanelByIndexInternal(S.indexOf(e.newVal, bar.get("children")));
            });
        }

    }, {
        ATTRS: {

            // helper attribute
            items: {
            },
            changeType: {
            },


            // real attribute
            handleMouseEvents: {
                value: false
            },
            allowTextSelection: {
                value: true
            },
            focusable: {
                value: false
            },
            bar: {
                setter: function (v) {
                    if (!(v instanceof Component.Controller)) {
                        return Component.create(v);
                    }
                },
                valueFn: function () {
                    return Component.create({
                        xclass: 'tabs-bar'
                    });
                }
            },
            body: {
                setter: function (v) {
                    if (!(v instanceof Component.Controller)) {
                        return Component.create(v);
                    }
                },
                valueFn: function () {
                    return Component.create({
                        xclass: 'tabs-body'
                    });
                }
            },
            barOrientation: {
                view: 1
            },
            xrender: {
                value: Render
            }
        }
    }, {
        xclass: 'tabs'
    });

    /**
     * Tab bar orientation.
     * @enum {String}
     */
    Tabs.Orientation = {
        TOP: 'top',
        BOTTOM: 'bottom',
        LEFT: 'left',
        RIGHT: 'right'
    };

    Tabs.Bar = Bar;
    Tabs.Body = Body;
    Tabs.Panel = Panel;

    return Tabs;
}, {
    requires: ['component', 'tabs/bar', 'tabs/body', 'tabs/tab', 'tabs/panel', 'tabs/render']
});