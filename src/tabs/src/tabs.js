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
                prefixCls=self.get('prefixCls'),
                tabSelectedCls = self.get("tabSelectedCls"),
                panelSelectedCls = self.get("panelSelectedCls"),
                tabItem,
                panelItem,
                bar = {
                    prefixCls:prefixCls,
                    xclass: 'tabs-bar',
                    changeType: self.get("changeType"),
                    children: []
                },
                body = {
                    prefixCls:prefixCls,
                    xclass: 'tabs-body',
                    children: []
                },
                barChildren = bar.children,
                panels = body.children;

            if (items = self.get("items")) {
                S.each(items, function (item) {
                    selected = selected || item.selected;
                    barChildren.push(tabItem = {
                        content: item.title,
                        selected: item.selected
                    });
                    panels.push(panelItem = {
                        content: item.content,
                        selected: item.selected
                    });
                    if (tabSelectedCls) {
                        tabItem.selectedCls = tabSelectedCls;
                    }
                    if (panelSelectedCls) {
                        panelItem.selectedCls = panelSelectedCls;
                    }
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
            var self = this,
                bar = self.get("bar"),
                selectedTab,
                selectedPanel,
                tabSelectedCls = self.get("tabSelectedCls"),
                panelSelectedCls = self.get("panelSelectedCls"),
                tabItem,
                panelItem,
                body = self.get("body");

            tabItem = {
                content: item.title
            };

            panelItem = {
                content: item.content
            };

            if (tabSelectedCls) {
                tabItem.selectedCls = tabSelectedCls;
            }

            if (panelSelectedCls) {
                panelItem.selectedCls = panelSelectedCls;
            }

            selectedTab = bar.addChild(tabItem, index);

            selectedPanel = body.addChild(panelItem, index);

            if (item.selected) {
                bar.set('selectedTab', selectedTab);
                body.set('selectedPanel', selectedPanel);
            }

            return self;
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

        setSelectedTab: function (tab) {
            var tabs = this,
                bar = tabs.get("bar"),
                body = tabs.get("body");
            bar.set('selectedTab', tab);
            body.set('selectedPanel',
                tabs.getPanelAt(S.indexOf(tab, bar.get('children'))));
            return this;
        },

        setSelectedPanel: function (panel) {
            var tabs = this,
                bar = tabs.get("bar"),
                body = tabs.get("body");
            bar.set('selectedPanel', panel);
            body.set('selectedTab',
                tabs.getTabAt(S.indexOf(panel, body.get('children'))));
            return this;
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
                prefixCls = self.get('prefixCls'),
                bar = el.children("." + prefixCls + "tabs-bar"),
                body = el.children("." + prefixCls + "tabs-body");
            self.set("el", el);
            self.set("bar", new Bar({
                srcNode: bar,
                prefixCls: prefixCls
            }));
            self.set("body", new Body({
                srcNode: body,
                prefixCls: prefixCls
            }));
        },

        bindUI: function () {
            var self = this,
                body = self.get("body"),
                bar = self.get("bar");

            bar.on("afterSelectedTabChange", function (e) {
                self.setSelectedTab(e.newVal);
            });
        }

    }, {
        ATTRS: {

            // helper attribute
            items: {
            },
            changeType: {
            },
            tabSelectedCls: {
            },
            panelSelectedCls: {
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
                    if (v&&!v.isController) {
                        return Component.create(v);
                    }
                },
                valueFn: function () {
                    return Component.create({
                        xclass: 'tabs-bar',
                        prefixCls: this.get('prefixCls')
                    });
                }
            },
            body: {
                setter: function (v) {
                    if (v&&!v.isController) {
                        return Component.create(v);
                    }
                },
                valueFn: function () {
                    return Component.create({
                        xclass: 'tabs-body',
                        prefixCls: this.get('prefixCls')
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
    requires: ['component/base', 'tabs/bar', 'tabs/body', 'tabs/tab', 'tabs/panel', 'tabs/render']
});