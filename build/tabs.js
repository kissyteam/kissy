/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Aug 21 20:57
*/
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
                self.set("selectedTab", self.get("highlightedItem"));
            }
        },

        handleFocus: function () {
            var self = this;
            TabBar.superclass.handleFocus.apply(self, arguments);
            // restore current highlighted item to selectedTab when focus
            // because highlightedItem loses when mouse out of the whole tabs container
            self.set("highlightedItem", self.get("selectedTab"));
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

        bindUI: function () {
            var self = this,
                changeType = self.get("changeType");
            self.on("afterSelectedTabChange" +
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
});/**
 * @fileOverview Body for tab panels.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/body", function (S, Component) {

    return Component.Container.extend({

        setSelectedPanelByIndexInternal: function (index) {
            var self = this, children = self.get("children");
            self.set("selectedPanel", children[index]);
        },

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
            }
        }
    }, {
        xclass: 'tabs-body'
    });

}, {
    requires: ['component']
});/**
 * @fileOverview single tab panel render.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/panel-render", function (S, Component) {

    return Component.Render.extend({

        createDom: function () {
            this.get("el").attr("role", "tabpanel");
        },

        _uiSetSelected: function (v) {
            var el = this.get("el");
            el[v ? "addClass" : "removeClass"](this.get("selectedCls"));
            el.attr("aria-hidden", !v);
        }

    }, {
        ATTRS: {
            selected: {
                value: false
            },
            selectedCls: {
                value: "ks-tabs-panel-selected"
            }
        },

        HTML_PARSER: {
            selected: function (el) {
                return el.hasClass(this.get("selectedCls"));
            }
        }
    }, {
        xclass: 'tabs-panel'
    });

}, {
    requires: ['component']
});/**
 * @fileOverview single tab panel.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/panel", function (S, Component, PanelRender) {

    return Component.Controller.extend({

    }, {
        ATTRS: {
            selected: {
                view: 1
            },
            focusable: {
                value: false
            },
            allowTextSelection: {
                value: true
            },
            selectedCls: {
                view: 1
            },
            xrender: {
                value: PanelRender
            }
        }
    }, {
        xclass: 'tabs-panel'
    })

}, {
    requires: ['component', './panel-render']
});/**
 * @fileOverview Tabs render.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/render", function (S, Component) {
    var CLS = "tabs-top tabs-bottom tabs-left tabs-right";
    return Component.Render.extend({
        _uiSetBarOrientation: function (v) {
            var self = this,
                el = self.get("el");
            el.removeClass(self.getCssClassWithPrefix(CLS))
                .addClass(self.getCssClassWithPrefix("tabs-" + v));
        }
    }, {
        ATTRS: {
            barOrientation: {
                value: 'top'
            }
        },
        HTML_PARSER: {
            barOrientation: function (el) {
                var orientation = el[0].className.match(/tabs-(top|bottom|left|right)\b/);
                return orientation && orientation[1] || "top";
            }
        }
    });
}, {
    requires: ['component']
});/**
 * @fileOverview Single tab render in tab bar.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/tab-render", function (S, Button) {

    return Button.Render.extend({
        createDom: function () {
            this.get("el").attr("role", "tab");
        },
        _uiSetSelected: function (v) {
            var el = this.get("el");
            el[v ? 'addClass' : 'removeClass'](this.get("selectedCls"));
            el.attr('aria-selected', !!v);
        }
    }, {
        ATTRS: {
            selected: {
                value: false
            },
            selectedCls: {
                value: 'ks-tabs-tab-selected'
            }
        },
        HTML_PARSER: {
            selected: function (el) {
                return el.hasClass(this.get("selectedCls"));
            }
        }
    }, {
        xclass: 'tabs-tab'
    });

}, {
    requires: ['button']
});/**
 * @fileOverview Single tab in tab bar.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/tab", function (S, Button, TabRender) {

    return Button.extend({
        isTabsTab: true,
        bindUI: function () {
            this.publish("afterSelectedChange", {
                bubbles: 1
            });
            this.on("click", function () {
                this.set("selected", true);
            });
        }
    }, {
        ATTRS: {
            handleMouseEvents: {
                value: false
            },
            focusable: {
                value: false
            },
            selected: {
                view: 1
            },
            selectedCls: {
                view: 1
            },
            xrender: {
                value: TabRender
            }
        }
    }, {
        xclass: 'tabs-tab',
        priority: 30
    });

}, {
    requires: ['button', './tab-render']
});/**
 * @fileOverview KISSY Tabs Component.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs", function (S, Component, Bar, Body, Tab, Panel, Render) {
    var Tabs = Component.Controller.extend({

        initializer: function () {
            var self = this,
                selected,
                items,
                tabSelectedCls = self.get("tabSelectedCls"),
                panelSelectedCls = self.get("panelSelectedCls"),
                tabItem,
                panelItem,
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
                    barChildren.push(tabItem = {
                        xclass: 'tabs-tab',
                        content: item.title,
                        selected: item.selected
                    });
                    panels.push(panelItem = {
                        xclass: 'tabs-panel',
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
                xclass: 'tabs-tab',
                content: item.title
            };

            panelItem = {
                xclass: 'tabs-panel',
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
                bar = el.children(".ks-tabs-bar"),
                body = el.children(".ks-tabs-body");
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
