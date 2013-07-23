/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 23 22:58
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 tabs/bar-render
 tabs/bar
 tabs/body
 tabs/tab-render
 tabs/tab
 tabs/panel-render
 tabs/panel
 tabs/render
 tabs
*/

KISSY.add('tabs/bar-render', function (S, Toolbar) {
    return Toolbar.getDefaultRender().extend({
        beforeCreateDom: function (renderData) {
            renderData.elAttrs.role = 'tablist';
        }
    },{
        name:'TabsBarRender'
    });
},{
    requires:['toolbar']
});
/**
 * @ignore
 * TabBar for KISSY.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/bar", function (S, Toolbar, BarRender, undefined) {

    /**
     * @ignore
     */
    var TabBar = Toolbar.extend({

        bindUI: function () {
            var self = this;
            self.on("afterSelectedChange", function (e) {
                if (e.newVal && e.target.isTabsTab) {
                    self.set("selectedTab", e.target);
                }
            });
        },

        syncUI: function () {
            var bar = this,
                children = bar.get("children");
            S.each(children, function (c) {
                if (c.get("selected")) {
                    bar.setInternal("selectedTab", c);
                    return false;
                }
                return undefined;
            });
        },

        handleKeyDownInternal: function (e) {
            var self = this;
            var current = self.get('selectedTab');
            var next = self.getNextItemByKeyDown(e, current);
            if (typeof next === 'boolean') {
                return next;
            } else {
                next.set('selected', true);
                return true;
            }
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
        }

    }, {
        ATTRS: {
            selectedTab: {
            },
            changeType: {
                value: "click"
            },
            defaultChildCfg: {
                value: {
                    xclass: 'tabs-tab'
                }
            },
            xrender: {
                value: BarRender
            }
        },
        xclass: 'tabs-bar'
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
    requires: ['toolbar', './bar-render']
});
/**
 * @ignore
 * Body for tab panels.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/body", function (S, Container, Extension, undefined) {

    var TabBody = Container.extend({

        bindUI: function () {
            var self = this;
            self.on("afterSelectedPanelIndexChange", function (e) {
                var showPanel,
                    children = self.get('children'),
                    newIndex = e.newVal,
                    hidePanel;
                if (children[newIndex]) {
                    if (hidePanel = children[e.prevVal]) {
                        hidePanel.set("selected", false);
                    }
                    self.selectPanelByIndex(newIndex);
                }
            });
        },

        syncUI: function () {
            var self = this,
                children = self.get("children");
            S.each(children, function (c, i) {
                if (c.get("selected")) {
                    self.set("selectedPanelIndex", i);
                    return false;
                }
                return undefined;
            });
        },

        createChild: function (index) {
            return checkLazy(this, 'createChild', index);
        },

        renderChild: function (index) {
            return checkLazy(this, 'renderChild', index);
        },

        selectPanelByIndex: function (newIndex) {
            this.get('children')[newIndex].set("selected", true);
            if (this.get('lazyRender')) {
                // lazy render
                this.renderChild(newIndex);
            }
        }

    }, {
        ATTRS: {
            selectedPanelIndex: {
            },
            allowTextSelection: {
                value: true
            },
            focusable: {
                value: false
            },
            lazyRender: {
            },
            handleMouseEvents: {
                value: false
            },
            defaultChildCfg: {
                value: {
                    xclass: 'tabs-panel'
                }
            }
        },
        xclass: 'tabs-body'
    });

    function checkLazy(self, method, index) {
        if (self.get('lazyRender')) {
            var c = self.get('children')[index];
            if (!c.get('selected')) {
                return c;
            }
        }
        return TabBody.superclass[method].call(self, index);
    }

    return TabBody;

}, {
    requires: ['component/container']
});
/**
 * @ignore
 * Single tab render in tab bar.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/tab-render", function (S, Button) {

    return Button.getDefaultRender().extend({
        beforeCreateDom: function (renderData) {
            var attrs = renderData.elAttrs;
            attrs.role = 'tab';
            if (renderData.selected) {
                attrs['aria-selected'] = true;
                renderData.elCls.push(this.getBaseCssClasses('selected'));
            }
        },
        _onSetSelected: function (v) {
            var el = this.$el;
            var selectedCls = this.getBaseCssClasses('selected');
            el[v ? 'addClass' : 'removeClass'](selectedCls)
                .attr('aria-selected', !!v);
        }
    }, {
        name:'TabsTabRender',
        HTML_PARSER: {
            selected: function (el) {
                return el.hasClass(this.getBaseCssClass('selected'));
            }
        }
    });

}, {
    requires: ['button']
});
/**
 * @ignore
 * Single tab in tab bar.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/tab", function (S, Button, TabRender) {

    /**
     * KISSY.Tabs.Tab
     * @class KISSY.Tabs.Tab
     * @extends KISSY.Button
     */
    return Button.extend({
        isTabsTab: true,
        bindUI: function () {
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
            /**
             * whether selected
             * @cfg {Boolean} selected
             */
            /**
             * @ignore
             */
            selected: {
                view: 1
            },
            xrender: {
                value: TabRender
            }
        },
        xclass: 'tabs-tab'
    });

}, {
    requires: ['button', './tab-render']
});
/**
 * @ignore
 * single tab panel render.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/panel-render", function (S, Container) {

    return Container.getDefaultRender().extend({

        beforeCreateDom: function (renderData) {
            var self = this;
            renderData.elAttrs.role = 'tabpanel';
            if (renderData.selected) {
                renderData.elCls.push(self.getBaseCssClasses('selected'));
            } else {
                renderData.elAttrs['aria-hidden'] = false;
            }
        },

        _onSetSelected: function (v) {
            var el = this.$el;
            var selectedCls = this.getBaseCssClasses('selected');
            el[v ? "addClass" : "removeClass"](selectedCls)
                .attr("aria-hidden", !v);
        }

    }, {
        name: 'TabsPanelRender',
        HTML_PARSER: {
            selected: function (el) {
                return el.hasClass(this.getBaseCssClass('selected'));
            }
        }
    });

}, {
    requires: ['component/container']
});
/**
 * @ignore
 * single tab panel.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/panel", function (S, Container, PanelRender) {

    /**
     * KISSY.Tabs.Panel
     * @class  KISSY.Tabs.Panel
     * @extends KISSY.Component.Control
     */
    return Container.extend({
        isTabsPanel: 1
    }, {
        ATTRS: {
            /**
             * whether selected
             * @cfg {Boolean} selected
             */
            /**
             * @ignore
             */
            selected: {
                view: 1
            },
            focusable: {
                value: false
            },
            allowTextSelection: {
                value: true
            },
            xrender: {
                value: PanelRender
            }
        },
        xclass: 'tabs-panel'
    })

}, {
    requires: ['component/container', './panel-render']
});
/**
 * @ignore
 * Tabs render.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs/render", function (S, Container) {

    var CLS = "top bottom left right";

    return Container.getDefaultRender().extend({

        beforeCreateDom: function (renderData) {
            renderData.elCls
                .push(this.getBaseCssClass(this.control.get('barOrientation')))
        },

        decorateDom: function () {
            var control = this.control;
            control.get('bar').set('changeType', control.get('changeType'));
        },

        '_onSetBarOrientation': function (v) {
            var self = this,
                el = self.$el;
            el.removeClass(self.getBaseCssClass(CLS))
                .addClass(self.getBaseCssClass(v));
        }

    }, {
        name:'TabsRender',
        HTML_PARSER: {
            barOrientation: function (el) {
                var orientation = el[0].className.match(/(top|bottom|left|right)\b/);
                return orientation && orientation[1] || "top";
            }
        }
    });
}, {
    requires: ['component/container']
});
/**
 * @ignore
 * KISSY Tabs Component.
 * @author yiminghe@gmail.com
 */
KISSY.add("tabs", function (S, Container, Bar, Body, Tab, Panel, Render) {

    function setBar(children, barOrientation, bar) {
        children[BarIndexMap[barOrientation]] = bar;
    }

    function setBody(children, barOrientation, body) {
        children[1 - BarIndexMap[barOrientation]] = body;
    }

    /**
     * Tabs for KISSY
     * @class KISSY.Tabs
     * @extends KISSY.Component.Control
     */
    var Tabs = Container.extend({

        initializer: function () {
            var self = this,
                items = self.get('items');

            // items sugar
            if (items) {
                var children = self.get('children'),
                    barOrientation = self.get('barOrientation'),
                    selected,
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

                if (!selected && barChildren.length) {
                    barChildren[0].selected = true;
                    panels[0].selected = true;
                }

                setBar(children, barOrientation, bar);
                setBody(children, barOrientation, body);
            }
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
                barChildren = bar.get('children'),
                body = self.get("body");

            if (typeof index == 'undefined') {
                index = barChildren.length;
            }

            tabItem = {
                content: item.title
            };

            panelItem = {
                content: item.content
            };

            bar.addChild(tabItem, index);

            selectedTab = barChildren[index];

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
                 @type KISSY.Component.Control
                 */tabs.get("bar"),
                barCs = bar.get("children"),
                tab = bar.getChildAt(index),
                body = /**
                 @ignore
                 @type KISSY.Component.Control
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
                getter: function () {
                    return this.get('children')[BarIndexMap[this.get('barOrientation')]];
                }
            },
            body: {
                getter: function () {
                    return this.get('children')[1 - BarIndexMap[this.get('barOrientation')]];
                }
            },

            /**
             * tab bar orientation.
             * eg: 'left' 'right' 'top' 'bottom'
             * @cfg {String} barOrientation
             */
            barOrientation: {
                view: 1,
                value: 'top'
            },

            xrender: {
                value: Render
            }
        },
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

    var BarIndexMap = {
        top: 0,
        left: 0,
        bottom: 1,
        right: 0
    };

    Tabs.ChangeType = Bar.ChangeType;

    Tabs.Bar = Bar;
    Tabs.Body = Body;
    Tabs.Panel = Panel;

    return Tabs;
}, {
    requires: ['component/container', 'tabs/bar', 'tabs/body', 'tabs/tab', 'tabs/panel', 'tabs/render']
});

