/**
 * @ignore
 * KISSY Tabs Component.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs", function (S, Component, Bar, Body, Tab, Panel, Render) {


    /**
     * Tabs for KISSY
     * @class KISSY.Tabs
     * @extends KISSY.Component.Controller
     */
    var Tabs = Component.Controller.extend({

        initializer: function () {
            var self = this,
                selected,
                items,
                prefixCls = self.get('prefixCls'),
                tabItem,
                panelItem,
                bar = {
                    prefixCls: prefixCls,
                    xclass: 'tabs-bar',
                    changeType: self.get("changeType"),
                    children: []
                },
                body = {
                    prefixCls: prefixCls,
                    xclass: 'tabs-body',
                    lazyRender: self.get('lazyRender'),
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

                });
            }

            if (!selected && barChildren.length) {
                barChildren[0].selected = true;
                panels[0].selected = true;
            }

            self.set("bar", bar);
            self.set("body", body);
        },


        /**
         * add one item to tabs
         * @param {Object} item item description
         * @param {String} item.content tab panel html
         * @param {String} item.title tab bar html
         * @param {Number} index insert index
         * @chainable
         */
        addItem: function (item, index) {
            var self = this,
                bar = self.get("bar"),
                selectedTab,
                tabItem,
                panelItem,
                body = self.get("body");

            if (typeof index == 'undefined') {
                index = bar.get('children').length;
            }

            tabItem = {
                content: item.title
            };

            panelItem = {
                content: item.content
            };

            selectedTab = bar.addChild(tabItem, index);

            body.addChild(panelItem, index);

            if (item['selected']) {
                bar.set('selectedTab', selectedTab);
                body.set('selectedPanelIndex', index);
            }

            return self;
        },

        /**
         * remove specified tab from current tabs
         * @param {Number} index
         * @param {Boolean} destroy whether destroy specified tab and panel
         * @chainable
         */
        removeItemAt: function (index, destroy) {
            var tabs = this,
                bar = /**
                 @ignore
                 @type KISSY.Component.Controller
                 */tabs.get("bar"),
                barCs = bar.get("children"),
                tab = bar.getChildAt(index),
                body = /**
                 @ignore
                 @type KISSY.Component.Controller
                 */tabs.get("body");
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

        /**
         * remove item by specified tab
         * @param {KISSY.Tabs.Tab} tab
         * @param {Boolean} destroy whether destroy specified tab and panel
         * @chainable
         */
        'removeItemByTab': function (tab, destroy) {
            var index = S.indexOf(tab, this.get("bar").get("children"));
            return this.removeItemAt(index, destroy);
        },

        /**
         * remove item by specified panel
         * @param {KISSY.Tabs.Panel} panel
         * @param {Boolean} destroy whether destroy specified tab and panel
         * @chainable
         */
        'removeItemByPanel': function (panel, destroy) {
            var index = S.indexOf(panel, this.get("body").get("children"));
            return this.removeItemAt(index, destroy);
        },

        /**
         * get selected tab instance
         * @return {KISSY.Tabs.Tab}
         */
        getSelectedTab: function () {
            var tabs = this,
                bar = tabs.get("bar"),
                child = null;

            S.each(bar.get("children"), function (c) {
                if (c.get("selected")) {
                    child = c;
                    return false;
                }
                return undefined;
            });

            return child;
        },

        /**
         * get selected tab instance
         * @return {KISSY.Tabs.Tab}
         */
        getSelectedPanel: function () {
            var tabs = this,
                body = tabs.get("body"),
                child = null;

            S.each(body.get("children"), function (c) {
                if (c.get("selected")) {
                    child = c;
                    return false;
                }
                return undefined;
            });

            return child;
        },

        /**
         * get all tabs
         * @return {KISSY.Tabs.Tab[]}
         */
        getTabs: function () {
            return   this.get("bar").get("children");
        },

        /**
         * get all tabs
         * @return {KISSY.Tabs.Panel[]}
         */
        getPanels: function () {
            return   this.get("body").get("children");
        },

        /**
         * @ignore
         */
        getTabAt: function (index) {
            return this.get("bar").get("children")[index];
        },

        /**
         * @ignore
         */
        'getPanelAt': function (index) {
            return this.get("body").get("children")[index];
        },

        /**
         * set tab as selected
         * @param {KISSY.Tabs.Tab} tab
         * @chainable
         */
        setSelectedTab: function (tab) {
            var tabs = this,
                bar = tabs.get("bar"),
                body = tabs.get("body");
            bar.set('selectedTab', tab);
            body.set('selectedPanelIndex', S.indexOf(tab, bar.get('children')));
            return this;
        },

        /**
         * set panel as selected
         * @param {KISSY.Tabs.Panel} panel
         * @chainable
         */
        'setSelectedPanel': function (panel) {
            var tabs = this,
                bar = tabs.get("bar"),
                body = tabs.get("body"),
                selectedPanelIndex = S.indexOf(panel, body.get('children'));
            body.set('selectedPanelIndex', selectedPanelIndex);
            bar.set('selectedTab', tabs.getTabAt(selectedPanelIndex));
            return this;
        },

        /**
         * @ignore
         */
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

        /**
         * @ignore
         */
        decorateInternal: function (el) {
            var self = this,
                prefixCls = self.get('prefixCls'),
                changeType = self.get('changeType'),
                bar = el.children("." + prefixCls + "tabs-bar"),
                body = el.children("." + prefixCls + "tabs-body");
            self.set("el", el);
            self.set("bar", new Bar({
                srcNode: bar,
                changeType: changeType,
                prefixCls: prefixCls
            }));
            self.set("body", new Body({
                srcNode: body,
                prefixCls: prefixCls
            }));
        },

        /**
         * @ignore
         */
        bindUI: function () {
            this.on("afterSelectedTabChange", function (e) {
                this.setSelectedTab(e.newVal);
            });

            /**
             * fired when selected tab is changed
             * @event afterSelectedTabChange
             * @member KISSY.Tabs
             * @param {KISSY.Event.CustomEventObject} e
             * @param {KISSY.Tabs.Tab} e.newVal selected tab
             */


            /**
             * fired before selected tab is changed
             * @event beforeSelectedTabChange
             * @member KISSY.Tabs
             * @param {KISSY.Event.CustomEventObject} e
             * @param {KISSY.Tabs.Tab} e.newVal tab to be selected
             */
        }

    }, {
        ATTRS: {

            /**
             *  tabs config, eg: {title:'',content:''}
             * @cfg {Object} item
             */
            /**
             * @ignore
             */
            items: {
            },
            /**
             * tabs trigger event type, mouse or click
             * @cfg {String} changeType
             */
            /**
             * @ignore
             */
            changeType: {
            },
            /**
             * tabs trigger event type, mouse or click
             * @cfg {String} changeType
             */
            /**
             * @ignore
             */
            lazyRender: {
                value: false
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
                    if (v && !v.isController) {
                        v = Component.create(v, this);
                    }
                    if (v) {
                        // allow afterSelectedTabChange to bubble
                        v.addTarget(this);
                    }
                    return v;
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
                    if (v && !v.isController) {
                        return Component.create(v, this);
                    }
                    return v;
                },
                valueFn: function () {
                    return Component.create({
                        xclass: 'tabs-body',
                        prefixCls: this.get('prefixCls')
                    });
                }
            },

            /**
             * tab bar orientation.
             * eg: 'left' 'right' 'top' 'bottom'
             * @cfg {String} barOrientation
             */
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
     * @enum {String} KISSY.Tabs.Orientation
     */
    Tabs.Orientation = {
        /**
         * top
         */
        TOP: 'top',
        /**
         * bottom
         */
        BOTTOM: 'bottom',
        /**
         * left
         */
        LEFT: 'left',
        /**
         * right
         */
        RIGHT: 'right'
    };

    Tabs.ChangeType = Bar.ChangeType;

    Tabs.Bar = Bar;
    Tabs.Body = Body;
    Tabs.Panel = Panel;

    return Tabs;
}, {
    requires: ['component/base', 'tabs/bar', 'tabs/body', 'tabs/tab', 'tabs/panel', 'tabs/render']
});