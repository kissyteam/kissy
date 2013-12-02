/**
 * @ignore
 * KISSY Tabs Component.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Container = require('component/container');
    var Bar = require('tabs/bar');
    var Body = require('tabs/body');
    require('tabs/tab');
    var Panel = require('tabs/panel');
    var Render = require('tabs/render');


    function setBar(children, barOrientation, bar) {
        children[BarIndexMap[barOrientation]] = bar;
    }

    function setBody(children, barOrientation, body) {
        children[1 - BarIndexMap[barOrientation]] = body;
    }

    /**
     * Tabs for KISSY
     * @class KISSY.Tabs
     * @extends KISSY.Component.Container
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
                        changeType: self.get('changeType'),
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
                bar = self.get('bar'),
                selectedTab,
                tabItem,
                panelItem,
                barChildren = bar.get('children'),
                body = self.get('body');

            if (typeof index === 'undefined') {
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

            if (item.selected) {
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
                 */tabs.get('bar'),
                barCs = bar.get('children'),
                tab = bar.getChildAt(index),
                body = /**
                 @ignore
                 @type KISSY.Component.Control
                 */tabs.get('body');
            if (tab.get('selected')) {
                if (barCs.length === 1) {
                    bar.set('selectedTab', null);
                } else if (index === 0) {
                    bar.set('selectedTab', bar.getChildAt(index + 1));
                } else {
                    bar.set('selectedTab', bar.getChildAt(index - 1));
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
            var index = S.indexOf(tab, this.get('bar').get('children'));
            return this.removeItemAt(index, destroy);
        },

        /**
         * remove item by specified panel
         * @param {KISSY.Tabs.Panel} panel
         * @param {Boolean} destroy whether destroy specified tab and panel
         * @chainable
         */
        'removeItemByPanel': function (panel, destroy) {
            var index = S.indexOf(panel, this.get('body').get('children'));
            return this.removeItemAt(index, destroy);
        },

        /**
         * get selected tab instance
         * @return {KISSY.Tabs.Tab}
         */
        getSelectedTab: function () {
            var tabs = this,
                bar = tabs.get('bar'),
                child = null;

            S.each(bar.get('children'), function (c) {
                if (c.get('selected')) {
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
                body = tabs.get('body'),
                child = null;

            S.each(body.get('children'), function (c) {
                if (c.get('selected')) {
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
            return   this.get('bar').get('children');
        },

        /**
         * get all tabs
         * @return {KISSY.Tabs.Panel[]}
         */
        getPanels: function () {
            return   this.get('body').get('children');
        },

        /**
         * @ignore
         */
        getTabAt: function (index) {
            return this.get('bar').get('children')[index];
        },

        /**
         * @ignore
         */
        'getPanelAt': function (index) {
            return this.get('body').get('children')[index];
        },

        /**
         * set tab as selected
         * @param {KISSY.Tabs.Tab} tab
         * @chainable
         */
        setSelectedTab: function (tab) {
            var tabs = this,
                bar = tabs.get('bar'),
                body = tabs.get('body');
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
                bar = tabs.get('bar'),
                body = tabs.get('body'),
                selectedPanelIndex = S.indexOf(panel, body.get('children'));
            body.set('selectedPanelIndex', selectedPanelIndex);
            bar.set('selectedTab', tabs.getTabAt(selectedPanelIndex));
            return this;
        },

        /**
         * @ignore
         */
        bindUI: function () {
            this.on('afterSelectedTabChange', function (e) {
                this.setSelectedTab(e.newVal);
            });

            /**
             * fired when selected tab is changed
             * @event afterSelectedTabChange
             * @member KISSY.Tabs
             * @param {KISSY.Event.CustomEvent.Object} e
             * @param {KISSY.Tabs.Tab} e.newVal selected tab
             */


            /**
             * fired before selected tab is changed
             * @event beforeSelectedTabChange
             * @member KISSY.Tabs
             * @param {KISSY.Event.CustomEvent.Object} e
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
             * whether allow tab to lazy render
             * @cfg {Boolean} lazyRender
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
});