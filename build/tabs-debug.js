/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:05
*/
/*
combined modules:
tabs
tabs/bar
tabs/body
tabs/tab
tabs/tab-xtpl
tabs/panel
*/
KISSY.add('tabs', [
    'component/container',
    'tabs/bar',
    'tabs/body',
    'tabs/tab',
    'tabs/panel',
    'util'
], function (S, require, exports, module) {
    /**
 * @ignore
 * KISSY Tabs Component.
 * @author yiminghe@gmail.com
 */
    var Container = require('component/container');
    var Bar = require('tabs/bar');
    var Body = require('tabs/body');
    require('tabs/tab');
    var Panel = require('tabs/panel');
    var CLS = 'top bottom left right';
    var util = require('util');
    var BarIndexMap = {
            top: 0,
            left: 0,
            bottom: 1,
            right: 0
        };
    function setBar(children, barOrientation, bar) {
        children[BarIndexMap[barOrientation]] = bar;
    }
    function setBody(children, barOrientation, body) {
        children[1 - BarIndexMap[barOrientation]] = body;
    }
    function afterTabClose(e) {
        this.removeItemByTab(e.target);
    }
    function afterSelectedTabChange(e) {
        this.setSelectedTab(e.newVal);
    }
    function fromTabItemConfigToTabConfig(item) {
        var ret = {};
        ret.content = item.title;
        ret.selected = item.selected;
        ret.closable = item.closable;
        return ret;
    }    /**
 * Tabs for KISSY
 * @class KISSY.Tabs
 * @extends KISSY.Component.Container
 */
    /**
 * Tabs for KISSY
 * @class KISSY.Tabs
 * @extends KISSY.Component.Container
 */
    var Tabs = Container.extend({
            initializer: function () {
                var self = this, items = self.get('items');    // items sugar
                // items sugar
                if (items) {
                    var children = self.get('children'), barOrientation = self.get('barOrientation'), selected, prefixCls = self.get('prefixCls'), tabItem, panelItem, bar = {
                            prefixCls: prefixCls,
                            xclass: 'tabs-bar',
                            changeType: self.get('changeType'),
                            children: []
                        }, body = {
                            prefixCls: prefixCls,
                            xclass: 'tabs-body',
                            lazyRender: self.get('lazyRender'),
                            children: []
                        }, barChildren = bar.children, panels = body.children;
                    util.each(items, function (item) {
                        selected = selected || item.selected;
                        barChildren.push(tabItem = fromTabItemConfigToTabConfig(item));
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
            beforeCreateDom: function (renderData) {
                renderData.elCls.push(this.getBaseCssClass(this.get('barOrientation')));
            },
            decorateDom: function () {
                this.get('bar').set('changeType', this.get('changeType'));
            },
            bindUI: function () {
                this.on('afterSelectedTabChange', afterSelectedTabChange);
                this.on('afterTabClose', afterTabClose);    /**
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
                                                            /**
         * fired when tab is closed
         * @event afterTabClose
         * @member KISSY.Tabs
         * @param {KISSY.Event.CustomEvent.Object} e
         * @param {KISSY.Tabs.Tab} e.target closed tab
         */
                                                            /**
         * fired before tab is closed
         * @event beforeTabClose
         * @member KISSY.Tabs
         * @param {KISSY.Event.CustomEvent.Object} e
         * @param {KISSY.Tabs.Tab} e.target tab to be closed
         */
            },
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
            /**
         * fired when tab is closed
         * @event afterTabClose
         * @member KISSY.Tabs
         * @param {KISSY.Event.CustomEvent.Object} e
         * @param {KISSY.Tabs.Tab} e.target closed tab
         */
            /**
         * fired before tab is closed
         * @event beforeTabClose
         * @member KISSY.Tabs
         * @param {KISSY.Event.CustomEvent.Object} e
         * @param {KISSY.Tabs.Tab} e.target tab to be closed
         */
            /**
     * add one item to tabs
     * @param {Object} item item description
     * @param {String} item.content tab panel html
     * @param {String} item.title tab bar html
     * @param {String} item.closable whether this tab is closable
     * @param {Number} index insert index
     * @chainable
     */
            addItem: function (item, index) {
                var self = this, bar = self.get('bar'), selectedTab, tabItem, panelItem, barChildren = bar.get('children'), body = self.get('body');
                if (typeof index === 'undefined') {
                    index = barChildren.length;
                }
                tabItem = fromTabItemConfigToTabConfig(item);
                panelItem = { content: item.content };
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
                var self = this, bar = /**
             @ignore
             @type KISSY.Component.Control
             */
                    self.get('bar'), barCs = bar.get('children'), tab = bar.getChildAt(index), body = /**
             @ignore
             @type KISSY.Component.Control
             */
                    self.get('body');
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
                return self;
            },
            /**
     * remove item by specified tab
     * @param {KISSY.Tabs.Tab} tab
     * @param {Boolean} destroy whether destroy specified tab and panel
     * @chainable
     */
            removeItemByTab: function (tab, destroy) {
                var index = util.indexOf(tab, this.get('bar').get('children'));
                return this.removeItemAt(index, destroy);
            },
            /**
     * remove item by specified panel
     * @param {KISSY.Tabs.Panel} panel
     * @param {Boolean} destroy whether destroy specified tab and panel
     * @chainable
     */
            removeItemByPanel: function (panel, destroy) {
                var index = util.indexOf(panel, this.get('body').get('children'));
                return this.removeItemAt(index, destroy);
            },
            /**
     * get selected tab instance
     * @return {KISSY.Tabs.Tab}
     */
            getSelectedTab: function () {
                var self = this, bar = self.get('bar'), child = null;
                util.each(bar.get('children'), function (c) {
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
                var self = this, body = self.get('body'), child = null;
                util.each(body.get('children'), function (c) {
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
                return this.get('bar').get('children');
            },
            /**
     * get all tabs
     * @return {KISSY.Tabs.Panel[]}
     */
            getPanels: function () {
                return this.get('body').get('children');
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
            getPanelAt: function (index) {
                return this.get('body').get('children')[index];
            },
            /**
     * set tab as selected
     * @param {KISSY.Tabs.Tab} tab
     * @chainable
     */
            setSelectedTab: function (tab) {
                var self = this, bar = self.get('bar'), body = self.get('body');
                bar.set('selectedTab', tab);
                body.set('selectedPanelIndex', util.indexOf(tab, bar.get('children')));
                return this;
            },
            /**
     * set panel as selected
     * @param {KISSY.Tabs.Panel} panel
     * @chainable
     */
            setSelectedPanel: function (panel) {
                var self = this, bar = self.get('bar'), body = self.get('body'), selectedPanelIndex = util.indexOf(panel, body.get('children'));
                body.set('selectedPanelIndex', selectedPanelIndex);
                bar.set('selectedTab', self.getTabAt(selectedPanelIndex));
                return this;
            },
            _onSetBarOrientation: function (v) {
                var self = this, el = self.$el;
                el.removeClass(self.getBaseCssClass(CLS)).addClass(self.getBaseCssClass(v));
            }
        }, {
            ATTRS: {
                handleGestureEvents: { value: false },
                allowTextSelection: { value: true },
                focusable: { value: false },
                /**
         * tabs config, eg: {title:'', content:'', selected:false, closable:false}
         * @cfg {Object} item
         */
                /**
         * @ignore
         */
                items: {},
                /**
         * tabs trigger event type, mouse or click
         * @cfg {String} changeType
         */
                /**
         * @ignore
         */
                changeType: {},
                /**
         * whether allow tab to lazy render
         * @cfg {Boolean} lazyRender
         */
                /**
         * @ignore
         */
                lazyRender: { value: false },
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
                    render: 1,
                    sync: 0,
                    value: 'top',
                    parse: function (el) {
                        var orientation = el[0].className.match(/(top|bottom|left|right)\b/);
                        return orientation && orientation[1] || undefined;
                    }
                }
            },
            xclass: 'tabs'
        });    /**
 * Tab bar orientation.
 * @enum {String} KISSY.Tabs.Orientation
 */
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
    module.exports = Tabs;
});

KISSY.add('tabs/bar', [
    'toolbar',
    'util'
], function (S, require, exports, module) {
    /**
 * @ignore
 * TabBar for KISSY.
 * @author yiminghe@gmail.com
 */
    var Toolbar = require('toolbar');
    var util = require('util');    /**
 * tab bar container for tab tabs.xclass: 'tabs-bar'.
 * @class  KISSY.Tabs.Bar
 * @extends KISSY.Toolbar
 */
    /**
 * tab bar container for tab tabs.xclass: 'tabs-bar'.
 * @class  KISSY.Tabs.Bar
 * @extends KISSY.Toolbar
 */
    var TabBar = Toolbar.extend({
            beforeCreateDom: function (renderData) {
                renderData.elAttrs.role = 'tablist';
            },
            bindUI: function () {
                var self = this;
                self.on('afterSelectedChange', function (e) {
                    if (e.newVal && e.target.isTabsTab) {
                        self.set('selectedTab', e.target);
                    }
                });
            },
            syncUI: function () {
                var self = this, children = self.get('children');
                util.each(children, function (c) {
                    if (c.get('selected')) {
                        self.setInternal('selectedTab', c);
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
                        prev.set('selected', false);
                    }
                    v.set('selected', true);
                }
            },
            _onSetHighlightedItem: function (v, e) {
                var self = this;
                self.callSuper(v, e);
                if (self.get('changeType') === 'mouse') {
                    self._onSetSelectedTab.apply(self, arguments);
                }
            }
        }, {
            ATTRS: {
                selectedTab: {},
                changeType: { value: 'click' },
                defaultChildCfg: {
                    valueFn: function () {
                        return { xclass: 'tabs-tab' };
                    }
                }
            },
            xclass: 'tabs-bar'
        });    /**
 * tabs change type
 * @enum {String}  KISSY.Tabs.ChangeType
 */
    /**
 * tabs change type
 * @enum {String}  KISSY.Tabs.ChangeType
 */
    TabBar.ChangeType = {
        /**
     * click
     */
        CLICK: 'click',
        /**
     * mouse
     */
        MOUSE: 'mouse'
    };
    module.exports = TabBar;
});


KISSY.add('tabs/body', [
    'component/container',
    'util'
], function (S, require, exports, module) {
    /**
 * @ignore
 * Body for tab panels.
 * @author yiminghe@gmail.com
 */
    var Container = require('component/container');
    var util = require('util');    /**
 * tab body container for tab panels.xclass: 'tabs-body'.
 * @class  KISSY.Tabs.Body
 * @extends KISSY.Component.Container
 */
    /**
 * tab body container for tab panels.xclass: 'tabs-body'.
 * @class  KISSY.Tabs.Body
 * @extends KISSY.Component.Container
 */
    var TabBody = Container.extend({
            bindUI: function () {
                var self = this;
                self.on('afterSelectedPanelIndexChange', function (e) {
                    var children = self.get('children'), newIndex = e.newVal, hidePanel;
                    if (children[newIndex]) {
                        if (hidePanel = children[e.prevVal]) {
                            hidePanel.set('selected', false);
                        }
                        self.selectPanelByIndex(newIndex);
                    }
                });
            },
            syncUI: function () {
                var self = this, children = self.get('children');
                util.each(children, function (c, i) {
                    if (c.get('selected')) {
                        self.set('selectedPanelIndex', i);
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
                this.get('children')[newIndex].set('selected', true);
                if (this.get('lazyRender')) {
                    // lazy render
                    this.renderChild(newIndex);
                }
            }
        }, {
            ATTRS: {
                allowTextSelection: { value: true },
                focusable: { value: false },
                handleGestureEvents: { value: false },
                selectedPanelIndex: {},
                lazyRender: {},
                defaultChildCfg: {
                    valueFn: function () {
                        return { xclass: 'tabs-panel' };
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
    module.exports = TabBody;
});
KISSY.add('tabs/tab', [
    'button',
    './tab-xtpl',
    'component/extension/content-box'
], function (S, require, exports, module) {
    /**
 * @ignore
 * Single tab in tab bar.
 * @author yiminghe@gmail.com
 */
    var Button = require('button');
    var TabTpl = require('./tab-xtpl');
    var ContentBox = require('component/extension/content-box');
    function close() {
        this.fire('afterTabClose');
    }    /**
 * KISSY.Tabs.Tab. xclass:'tabs-tab'
 * @class KISSY.Tabs.Tab
 * @extends KISSY.Button
 */
    /**
 * KISSY.Tabs.Tab. xclass:'tabs-tab'
 * @class KISSY.Tabs.Tab
 * @extends KISSY.Button
 */
    module.exports = Button.extend([ContentBox], {
        initializer: function () {
            this.publish('beforeTabClose', {
                defaultFn: close,
                defaultTargetOnly: true
            });
        },
        isTabsTab: true,
        beforeCreateDom: function (renderData) {
            var attrs = renderData.elAttrs;
            attrs.role = 'tab';
            if (renderData.selected) {
                attrs['aria-selected'] = true;
                renderData.elCls.push(this.getBaseCssClasses('selected'));
            }
            if (renderData.closable) {
                renderData.elCls.push(this.getBaseCssClasses('closable'));
            }
        },
        handleClickInternal: function (e) {
            var self = this;
            if (self.get('closable')) {
                if (e.target === self.get('closeBtn')[0]) {
                    self.fire('beforeTabClose');
                    return;
                }
            }
            self.callSuper(e);
            self.set('selected', true);
        },
        _onSetSelected: function (v) {
            var el = this.$el;
            var selectedCls = this.getBaseCssClasses('selected');
            el[v ? 'addClass' : 'removeClass'](selectedCls).attr('aria-selected', !!v);
        }
    }, {
        ATTRS: {
            allowTextSelection: { value: false },
            focusable: { value: false },
            handleGestureEvents: { value: false },
            contentTpl: { value: TabTpl },
            /**
         * whether closable
         * @cfg {Boolean} closable
         */
            /**
         * @ignore
         */
            closable: {
                value: false,
                render: 1,
                sync: 0,
                parse: function () {
                    return !!this.get('closeBtn');
                }
            },
            closeBtn: {
                selector: function () {
                    return '.' + this.getBaseCssClass('close');
                }
            },
            /**
         * whether selected
         * @cfg {Boolean} selected
         */
            /**
         * @ignore
         */
            selected: {
                render: 1,
                sync: 0,
                parse: function (el) {
                    return el.hasClass(this.getBaseCssClass('selected'));
                }
            }
        },
        xclass: 'tabs-tab'
    });
});

KISSY.add('tabs/tab-xtpl', [], function (S, require, exports, module) {
    /* Compiled By XTemplate */
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
    module.exports = function tabXtpl(scope, buffer, undefined) {
        var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
        var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], rangeCommand = nativeCommands['range'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
        buffer.write('<div class="', 0);
        var option0 = { escape: 1 };
        var params1 = [];
        params1.push('content');
        option0.params = params1;
        var callRet2;
        callRet2 = callFnUtil(tpl, scope, option0, buffer, ['getBaseCssClasses'], 0, 1);
        if (callRet2 && callRet2.isBuffer) {
            buffer = callRet2;
            callRet2 = undefined;
        }
        buffer.write(callRet2, true);
        buffer.write('">', 0);
        var id3 = scope.resolve(['content'], 0);
        buffer.write(id3, false);
        buffer.write('</div>\r\n', 0);
        var option4 = { escape: 1 };
        var params5 = [];
        var id6 = scope.resolve(['closable'], 0);
        params5.push(id6);
        option4.params = params5;
        option4.fn = function (scope, buffer) {
            buffer.write('\r\n<span class="', 0);
            var option7 = { escape: 1 };
            var params8 = [];
            params8.push('close');
            option7.params = params8;
            var callRet9;
            callRet9 = callFnUtil(tpl, scope, option7, buffer, ['getBaseCssClasses'], 0, 3);
            if (callRet9 && callRet9.isBuffer) {
                buffer = callRet9;
                callRet9 = undefined;
            }
            buffer.write(callRet9, true);
            buffer.write('">close</span>\r\n', 0);
            return buffer;
        };
        buffer = ifCommand.call(tpl, scope, option4, buffer, 2);
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});

KISSY.add('tabs/panel', ['component/container'], function (S, require, exports, module) {
    /**
 * @ignore
 * single tab panel.
 * @author yiminghe@gmail.com
 */
    var Container = require('component/container');    /**
 * KISSY.Tabs.Panel.xclass: 'tabs-panel'.
 * @class  KISSY.Tabs.Panel
 * @extends KISSY.Component.Container
 */
    /**
 * KISSY.Tabs.Panel.xclass: 'tabs-panel'.
 * @class  KISSY.Tabs.Panel
 * @extends KISSY.Component.Container
 */
    module.exports = Container.extend({
        isTabsPanel: 1,
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
            el[v ? 'addClass' : 'removeClass'](selectedCls).attr('aria-hidden', !v);
        }
    }, {
        ATTRS: {
            allowTextSelection: { value: true },
            focusable: { value: false },
            handleGestureEvents: { value: false },
            /**
         * whether selected
         * @cfg {Boolean} selected
         */
            /**
         * @ignore
         */
            selected: {
                render: 1,
                sync: 0,
                parse: function (el) {
                    return el.hasClass(this.getBaseCssClass('selected'));
                }
            }
        },
        xclass: 'tabs-panel'
    });
});
