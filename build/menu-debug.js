/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:03
*/
/*
combined modules:
menu
menu/control
menu/menuitem
menu/check-menuitem
menu/check-menuitem-xtpl
menu/radio-menuitem
menu/radio-menuitem-xtpl
menu/submenu
menu/submenu-xtpl
menu/popupmenu
*/
KISSY.add('menu', [
    'menu/control',
    'menu/menuitem',
    'menu/check-menuitem',
    'menu/radio-menuitem',
    'menu/submenu',
    'menu/popupmenu'
], function (S, require, exports, module) {
    /**
 * @ignore
 * menu
 * @author yiminghe@gmail.com
 */
    var Menu = require('menu/control');
    Menu.Item = require('menu/menuitem');
    Menu.CheckItem = require('menu/check-menuitem');
    Menu.RadioItem = require('menu/radio-menuitem');
    Menu.SubMenu = require('menu/submenu');
    Menu.PopupMenu = require('menu/popupmenu');
    module.exports = Menu;
});
KISSY.add('menu/control', [
    'util',
    'component/container',
    'component/extension/delegate-children',
    'node'
], function (S, require, exports, module) {
    /**
 * @ignore
 * menu control for kissy,accommodate menu items
 * @author yiminghe@gmail.com
 */
    var util = require('util');
    var Container = require('component/container');
    var DelegateChildrenExtension = require('component/extension/delegate-children');
    var KeyCode = require('node').Event.KeyCode;    /**
 * KISSY Menu.
 * xclass: 'menu'.
 * @class KISSY.Menu
 * @extends KISSY.Component.Container
 */
    /**
 * KISSY Menu.
 * xclass: 'menu'.
 * @class KISSY.Menu
 * @extends KISSY.Component.Container
 */
    module.exports = Container.extend([DelegateChildrenExtension], {
        isMenu: 1,
        beforeCreateDom: function (renderData) {
            renderData.elAttrs.role = 'menu';
        },
        bindUI: function () {
            var self = this;
            self.on('afterHighlightedItemChange', afterHighlightedItemChange, self);
        },
        // 只能允许一个方向，这个属性只是为了记录和排他性选择
        // 只允许调用 menuItem 的 set('highlighted')
        // 不允许调用 menu 的 set('highlightedItem')，内部调用时防止循环更新
        _onSetHighlightedItem: function (v, ev) {
            var highlightedItem;    // ignore v == null
                                    // do not use set('highlightedItem',null) for api
                                    // use this.get('highlightedItem').set('highlighted', false);
            // ignore v == null
            // do not use set('highlightedItem',null) for api
            // use this.get('highlightedItem').set('highlighted', false);
            if (v && ev && (highlightedItem = ev.prevVal)) {
                // in case set highlightedItem null again
                highlightedItem.set('highlighted', false, { data: { byPassSetHighlightedItem: 1 } });
            }
        },
        _onSetVisible: function (v, e) {
            var self = this;
            self.callSuper(v, e);
            var highlightedItem;
            if (!v && (highlightedItem = self.get('highlightedItem'))) {
                highlightedItem.set('highlighted', false);
            }
        },
        getRootMenu: function () {
            return this;
        },
        handleMouseEnterInternal: function (e) {
            var self = this;
            self.callSuper(e);
            var rootMenu = self.getRootMenu();    // maybe called by popupmenu, no submenu
            // maybe called by popupmenu, no submenu
            if (rootMenu !== self && rootMenu._popupAutoHideTimer) {
                clearTimeout(rootMenu._popupAutoHideTimer);
                rootMenu._popupAutoHideTimer = null;
            }
        },
        handleBlurInternal: function (e) {
            var self = this;
            self.callSuper(e);
            var highlightedItem;
            if (highlightedItem = self.get('highlightedItem')) {
                highlightedItem.set('highlighted', false);
            }
        },
        //dir : -1 ,+1
        //skip disabled items
        _getNextEnabledHighlighted: function (index, dir) {
            var children = this.get('children');
            var len = children.length;
            var cur = index;
            do {
                var c = children[cur];
                if (!c.get('disabled') && c.get('visible') !== false) {
                    return children[cur];
                }
                cur = (cur + dir + len) % len;
            } while (cur !== index);
            return undefined;
        },
        /**
     * Attempts to handle a keyboard event;
     * returns true if the event was handled,
     * false otherwise.
     * If the container is enabled, and a child is highlighted,
     * calls the child control's {@code handleKeydown} method to give the control
     * a chance to handle the event first.
     * Protected, should only be overridden by subclasses.
     * @param {KISSY.Event.DomEvent.Object} e Key event to handle.
     * @return {Boolean|undefined} Whether the event was handled by the container (or one of
     *     its children).
     * @protected
     *
     */
        handleKeyDownInternal: function (e) {
            var self = this;    // Give the highlighted control the chance to handle the key event.
            // Give the highlighted control the chance to handle the key event.
            var highlightedItem = self.get('highlightedItem');    // 先看当前活跃 menuitem 是否要处理
            // 先看当前活跃 menuitem 是否要处理
            if (highlightedItem && highlightedItem.handleKeyDownInternal(e)) {
                return true;
            }
            var children = self.get('children');
            var len = children.length;
            if (len === 0) {
                return undefined;
            }
            var index, destIndex, nextHighlighted;    //自己处理了，不要向上处理，嵌套菜单情况
            //自己处理了，不要向上处理，嵌套菜单情况
            switch (e.keyCode) {
            // esc
            case KeyCode.ESC:
                // 清除所有菜单
                if (highlightedItem = self.get('highlightedItem')) {
                    highlightedItem.set('highlighted', false);
                }
                break;    // home
            // home
            case KeyCode.HOME:
                nextHighlighted = self._getNextEnabledHighlighted(0, 1);
                break;    // end
            // end
            case KeyCode.END:
                nextHighlighted = self._getNextEnabledHighlighted(len - 1, -1);
                break;    // up
            // up
            case KeyCode.UP:
                if (!highlightedItem) {
                    destIndex = len - 1;
                } else {
                    index = util.indexOf(highlightedItem, children);
                    destIndex = (index - 1 + len) % len;
                }
                nextHighlighted = self._getNextEnabledHighlighted(destIndex, -1);
                break;    //down
            //down
            case KeyCode.DOWN:
                if (!highlightedItem) {
                    destIndex = 0;
                } else {
                    index = util.indexOf(highlightedItem, children);
                    destIndex = (index + 1 + len) % len;
                }
                nextHighlighted = self._getNextEnabledHighlighted(destIndex, 1);
                break;
            }
            if (nextHighlighted) {
                nextHighlighted.set('highlighted', true, { data: { fromKeyboard: 1 } });
                return true;
            } else {
                return undefined;
            }
        },
        /**
     * Whether this menu contains specified html element.
     * @param {KISSY.Node} element html Element to be tested.
     * @return {Boolean}
     * @protected
     */
        containsElement: function (element) {
            var self = this;
            var $el = self.$el;    // 隐藏当然不包含了
            // 隐藏当然不包含了
            if (!self.get('visible') || !$el) {
                return false;
            }
            if ($el && ($el[0] === element || $el.contains(element))) {
                return true;
            }
            var children = self.get('children');
            for (var i = 0, count = children.length; i < count; i++) {
                var child = children[i];
                if (child.containsElement && child.containsElement(element)) {
                    return true;
                }
            }
            return false;
        }
    }, {
        ATTRS: {
            handleGestureEvents: { value: true },
            focusable: { value: true },
            allowTextSelection: { value: false },
            /**
         * Current highlighted child menu item.
         * @type {KISSY.Menu.Item}
         * @property highlightedItem
         * @readonly
         */
            /**
         * @ignore
         */
            highlightedItem: { value: null },
            defaultChildCfg: {
                valueFn: function () {
                    return { xclass: 'menuitem' };
                }
            }
        },
        xclass: 'menu'
    });    // capture bubbling
    // capture bubbling
    function afterHighlightedItemChange(e) {
        if (e.target.isMenu) {
            var el = this.el, menuItem = e.newVal;
            el.setAttribute('aria-activedescendant', menuItem && menuItem.el.id || '');
        }
    }    /**
 * @ignore
 * 普通菜单可聚焦
 * 通过 tab 聚焦到菜单的根节点，通过上下左右操作子菜单项
 *
 * TODO
 *  - 去除 activeItem. done@2013-03-12
 **/
});




KISSY.add('menu/menuitem', [
    'component/control',
    'node'
], function (S, require, exports, module) {
    /**
 * @ignore
 * menu item ,child component for menu
 * @author yiminghe@gmail.com
 */
    var Control = require('component/control');
    var $ = require('node');    /**
 * @class KISSY.Menu.Item
 * A menu item component which menu is consisted of.
 * xclass: 'menuitem'.
 * @extends KISSY.Component.Control
 */
    /**
 * @class KISSY.Menu.Item
 * A menu item component which menu is consisted of.
 * xclass: 'menuitem'.
 * @extends KISSY.Component.Control
 */
    module.exports = Control.extend({
        isMenuItem: 1,
        beforeCreateDom: function (renderData) {
            renderData.elAttrs.role = 'menuitem';
        },
        // do not set highlighted on mousedown for touch device!
        // only set active in component/control
        /**
     * Perform default action when click on enter on this menuitem.
     * @protected
     */
        handleClickInternal: function (ev) {
            var self = this;
            self.callSuper(ev);    // combobox menu tap penetration
                                   // https://github.com/kissyteam/kissy/issues/533
            // combobox menu tap penetration
            // https://github.com/kissyteam/kissy/issues/533
            ev.preventDefault();
            self.fire('click');
            return true;
        },
        // 只允许调用 menuItem 的 set('highlighted')
        // 不允许调用 menu 的 set('highlightedItem')
        _onSetHighlighted: function (v, e) {
            var self = this, parent = self.get('parent');
            self.callSuper(v, e);
            if (!(e && e.byPassSetHighlightedItem)) {
                if (self.get('rendered')) {
                    parent.set('highlightedItem', v ? self : null);
                } else {
                    if (v) {
                        // do not set null on initializer
                        parent.set('highlightedItem', self);
                    }
                }
            }    // 是否要滚动到当前菜单项(横向，纵向)
            // 是否要滚动到当前菜单项(横向，纵向)
            if (v) {
                var el = self.$el,
                    // 找到向上路径上第一个可以滚动的容器，直到父组件节点（包括）
                    // 找不到就放弃，为效率考虑不考虑 parent 的嵌套可滚动 div
                    p = el.parent(function (e) {
                        return $(e).css('overflow') !== 'visible';
                    }, parent.get('el').parent());
                if (!p) {
                    return;
                }
                el.scrollIntoView(p, {
                    alignWithTop: true,
                    allowHorizontalScroll: true,
                    onlyScrollIfNeeded: true
                });
            }
        },
        /**
     * Check whether this menu item contains specified element.
     * @param {KISSY.Node} element Element to be tested.
     * @protected
     */
        containsElement: function (element) {
            var $el = this.$el;
            return $el && ($el[0] === element || $el.contains(element));
        }
    }, {
        ATTRS: {
            handleGestureEvents: { value: false },
            focusable: { value: false },
            allowTextSelection: { value: false }
        },
        xclass: 'menuitem'
    });
});

KISSY.add('menu/check-menuitem', [
    './menuitem',
    'component/extension/content-box',
    './check-menuitem-xtpl'
], function (S, require, exports, module) {
    /**
 * checkable menu item
 * @ignore
 * @author yiminghe@gmail.com
 */
    var MenuItem = require('./menuitem');
    var ContentBox = require('component/extension/content-box');
    var CheckMenuItemTpl = require('./check-menuitem-xtpl');    /**
 * @class KISSY.Menu.CheckItem
 */
    /**
 * @class KISSY.Menu.CheckItem
 */
    module.exports = MenuItem.extend([ContentBox], {
        beforeCreateDom: function (renderData) {
            if (renderData.checked) {
                renderData.elCls.push(this.getBaseCssClasses('checked'));
            }
        },
        _onSetChecked: function (v) {
            var self = this, cls = self.getBaseCssClasses('checked');
            self.$el[v ? 'addClass' : 'removeClass'](cls);
        },
        handleClickInternal: function (e) {
            var self = this;
            self.set('checked', !self.get('checked'));
            self.callSuper(e);
            return true;
        }
    }, {
        ATTRS: {
            contentTpl: { value: CheckMenuItemTpl },
            /**
         * Whether the menu item is checked.
         * @cfg {Boolean} checked
         */
            /**
         * @ignore
         */
            checked: {
                render: 1,
                sync: 0
            }
        },
        xclass: 'check-menuitem'
    });
});

KISSY.add('menu/check-menuitem-xtpl', [], function (S, require, exports, module) {
    /* Compiled By XTemplate */
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
    module.exports = function checkMenuitemXtpl(scope, buffer, undefined) {
        var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
        var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], rangeCommand = nativeCommands['range'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
        buffer.write('<div class="', 0);
        var option0 = { escape: 1 };
        var params1 = [];
        params1.push('checkbox');
        option0.params = params1;
        var callRet2;
        callRet2 = callFnUtil(tpl, scope, option0, buffer, ['getBaseCssClasses'], 0, 1);
        if (callRet2 && callRet2.isBuffer) {
            buffer = callRet2;
            callRet2 = undefined;
        }
        buffer.write(callRet2, true);
        buffer.write('">\r\n</div>\r\n<div class="', 0);
        var option3 = { escape: 1 };
        var params4 = [];
        params4.push('content');
        option3.params = params4;
        var callRet5;
        callRet5 = callFnUtil(tpl, scope, option3, buffer, ['getBaseCssClasses'], 0, 3);
        if (callRet5 && callRet5.isBuffer) {
            buffer = callRet5;
            callRet5 = undefined;
        }
        buffer.write(callRet5, true);
        buffer.write('">', 0);
        var id6 = scope.resolve(['content'], 0);
        buffer.write(id6, false);
        buffer.write('</div>', 0);
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});
KISSY.add('menu/radio-menuitem', [
    './menuitem',
    'component/extension/content-box',
    './radio-menuitem-xtpl'
], function (S, require, exports, module) {
    /**
 * checkable menu item
 * @ignore
 * @author yiminghe@gmail.com
 */
    var MenuItem = require('./menuitem');
    var ContentBox = require('component/extension/content-box');
    var RadioMenuItemTpl = require('./radio-menuitem-xtpl');    /**
 * @class KISSY.Menu.RadioItem
 */
    /**
 * @class KISSY.Menu.RadioItem
 */
    module.exports = MenuItem.extend([ContentBox], {
        beforeCreateDom: function (renderData) {
            renderData.elAttrs.role = 'menuitemradio';
            if (renderData.selected) {
                renderData.elCls.push(this.getBaseCssClasses('selected'));
            }
        },
        _onSetSelected: function (v) {
            var self = this, cls = self.getBaseCssClasses('selected');
            self.$el[v ? 'addClass' : 'removeClass'](cls);
        },
        handleClickInternal: function (e) {
            var self = this;
            var rootMenu = self.get('parent').getRootMenu();
            var selectedItem = rootMenu.__selectedItem;
            if (selectedItem && selectedItem !== self) {
                selectedItem.set('selected', false);
            }
            rootMenu.__selectedItem = self;
            self.set('selected', true);
            self.callSuper(e);
            return true;
        },
        destructor: function () {
            var parent = this.get('parent');
            var rootMenu = parent && parent.getRootMenu();
            if (rootMenu && rootMenu.__selectedItem === this) {
                rootMenu.__selectedItem = null;
            }
        }
    }, {
        ATTRS: {
            contentTpl: { value: RadioMenuItemTpl },
            /**
         * Whether the menu item is selected.
         * @type {Boolean}
         * @property selected
         */
            /**
         * Whether the menu item is selected.
         * @cfg {Boolean} selected
         */
            /**
         * @ignore
         */
            selected: {
                sync: 0,
                render: 1
            }
        },
        xclass: 'radio-menuitem'
    });
});
KISSY.add('menu/radio-menuitem-xtpl', [], function (S, require, exports, module) {
    /* Compiled By XTemplate */
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
    module.exports = function radioMenuitemXtpl(scope, buffer, undefined) {
        var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
        var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], rangeCommand = nativeCommands['range'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
        buffer.write('<div class="', 0);
        var option0 = { escape: 1 };
        var params1 = [];
        params1.push('radio');
        option0.params = params1;
        var callRet2;
        callRet2 = callFnUtil(tpl, scope, option0, buffer, ['getBaseCssClasses'], 0, 1);
        if (callRet2 && callRet2.isBuffer) {
            buffer = callRet2;
            callRet2 = undefined;
        }
        buffer.write(callRet2, true);
        buffer.write('">\r\n</div>\r\n<div class="', 0);
        var option3 = { escape: 1 };
        var params4 = [];
        params4.push('content');
        option3.params = params4;
        var callRet5;
        callRet5 = callFnUtil(tpl, scope, option3, buffer, ['getBaseCssClasses'], 0, 3);
        if (callRet5 && callRet5.isBuffer) {
            buffer = callRet5;
            callRet5 = undefined;
        }
        buffer.write(callRet5, true);
        buffer.write('">', 0);
        var id6 = scope.resolve(['content'], 0);
        buffer.write(id6, false);
        buffer.write('</div>', 0);
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});
KISSY.add('menu/submenu', [
    'util',
    './submenu-xtpl',
    './menuitem',
    'component/extension/content-box',
    'node'
], function (S, require, exports, module) {
    /**
 * @ignore
 * submenu control for kissy, transfer item's keyCode to menu
 * @author yiminghe@gmail.com
 */
    var util = require('util');
    var SubMenuTpl = require('./submenu-xtpl');
    var MenuItem = require('./menuitem');
    var ContentBox = require('component/extension/content-box');
    var KeyCode = require('node').Event.KeyCode;
    var MENU_DELAY = 0.15;
    function afterHighlightedChange(e) {
        var target = e.target, self = this;    // hover 子菜单，保持该菜单项高亮
        // hover 子菜单，保持该菜单项高亮
        if (target !== self && target.isMenuItem && e.newVal) {
            self.clearHidePopupMenuTimers();
            if (!self.get('highlighted')) {
                self.set('highlighted', true);    // refresh highlightedItem of parent menu
                // refresh highlightedItem of parent menu
                target.set('highlighted', false);
                target.set('highlighted', true);
            }
        }
    }    /**
 * Class representing a submenu that can be added as an item to other menus.
 * xclass: 'submenu'.
 * @extends KISSY.Menu.Item
 * @class KISSY.Menu.SubMenu
 */
    /**
 * Class representing a submenu that can be added as an item to other menus.
 * xclass: 'submenu'.
 * @extends KISSY.Menu.Item
 * @class KISSY.Menu.SubMenu
 */
    module.exports = MenuItem.extend([ContentBox], {
        isSubMenu: 1,
        decorateDom: function (el) {
            var self = this;
            var prefixCls = self.get('prefixCls');
            var popupMenuEl = el.one('.' + prefixCls + 'popupmenu');
            var docBody = popupMenuEl[0].ownerDocument.body;
            docBody.insertBefore(popupMenuEl[0], docBody.firstChild);
            var PopupMenuClass = self.getComponentConstructorByNode(prefixCls, popupMenuEl);
            self.setInternal('menu', new PopupMenuClass({
                srcNode: popupMenuEl,
                prefixCls: prefixCls
            }));
        },
        bindUI: function () {
            var self = this;
            self.on('afterHighlightedChange', afterHighlightedChange, self);
        },
        clearShowPopupMenuTimers: function () {
            var showTimer;
            if (showTimer = this._showTimer) {
                showTimer.cancel();
                this._showTimer = null;
            }
        },
        clearHidePopupMenuTimers: function () {
            var dismissTimer;
            if (dismissTimer = this._dismissTimer) {
                dismissTimer.cancel();
                this._dismissTimer = null;
            }
        },
        clearSubMenuTimers: function () {
            this.clearHidePopupMenuTimers();
            this.clearShowPopupMenuTimers();
        },
        handleMouseLeaveInternal: function () {
            var self = this;
            self.set('highlighted', false, { data: { fromMouse: 1 } });
            self.clearSubMenuTimers();
            var menu = self.get('menu');
            if (menu.get('visible')) {
                // 延迟 highlighted
                self._dismissTimer = util.later(hideMenu, self.get('menuDelay') * 1000, false, self);
            }
        },
        handleMouseEnterInternal: function () {
            var self = this;
            self.set('highlighted', true, { data: { fromMouse: 1 } });
            self.clearSubMenuTimers();
            var menu = self.get('menu');
            if (!menu.get('visible')) {
                self._showTimer = util.later(showMenu, self.get('menuDelay') * 1000, false, self);
            }
        },
        /**
         * Dismisses the submenu on a delay, with the result that the user needs less
         * accuracy when moving to sub menus.
         * @protected
         */
        _onSetHighlighted: function (v, e) {
            var self = this;
            self.callSuper(v, e);    // sync
            // sync
            if (!e) {
                return;
            }
            if (e.fromMouse) {
                return;
            }
            if (v && !e.fromKeyboard) {
                showMenu.call(self);
            } else if (!v) {
                hideMenu.call(self);
            }
        },
        // click ，立即显示
        handleClickInternal: function (e) {
            showMenu.call(this);    //  trigger click event from menuitem
            //  trigger click event from menuitem
            this.callSuper(e);
        },
        /**
         * Handles a key event that is passed to the menu item from its parent because
         * it is highlighted.  If the right key is pressed the sub menu takes control
         * and delegates further key events to its menu until it is dismissed OR the
         * left key is pressed.
         * Protected for subclass overridden.
         * @param {KISSY.Event.DomEvent.Object} e key event.
         * @protected
         * @return {Boolean|undefined} Whether the event was handled.
         */
        handleKeyDownInternal: function (e) {
            var self = this, menu = self.get('menu'), menuChildren, menuChild, hasKeyboardControl_ = menu.get('visible'), keyCode = e.keyCode;
            if (!hasKeyboardControl_) {
                // right
                if (keyCode === KeyCode.RIGHT) {
                    showMenu.call(self);
                    menuChildren = menu.get('children');
                    if (menuChild = menuChildren[0]) {
                        menuChild.set('highlighted', true, { data: { fromKeyboard: 1 } });
                    }
                } else if (keyCode === KeyCode.ENTER) {
                    // enter as click
                    return self.handleClickInternal(e);
                } else {
                    return undefined;
                }
            } else if (!menu.handleKeyDownInternal(e)) {
                // The menu has control and the key hasn't yet been handled, on left arrow
                // we turn off key control.
                // left
                if (keyCode === KeyCode.LEFT) {
                    // refresh highlightedItem of parent menu
                    self.set('highlighted', false);
                    self.set('highlighted', true, { data: { fromKeyboard: 1 } });
                } else {
                    return undefined;
                }
            }
            return true;
        },
        containsElement: function (element) {
            return this.get('menu').containsElement(element);
        },
        destructor: function () {
            var self = this, menu = self.get('menu');
            self.clearSubMenuTimers();
            menu.destroy();
        }
    }, {
        ATTRS: {
            contentTpl: { value: SubMenuTpl },
            /**
             * The delay before opening the sub menu in seconds.  (This number is
             * arbitrary, it would be good to get some user studies or a designer to play
             * with some numbers).
             * Defaults to: 0.15
             * @cfg {Number} menuDelay
             */
            /**
             * @ignore
             */
            menuDelay: { value: MENU_DELAY },
            /**
             * Menu config or instance.
             * @cfg {KISSY.Menu|Object} menu
             */
            /**
             * Menu config or instance.
             * @property menu
             * @type {KISSY.Menu|Object}
             */
            /**
             * @ignore
             */
            menu: {
                getter: function (v) {
                    v = v || {};
                    if (!v.isControl) {
                        v.xclass = v.xclass || 'popupmenu';
                        v = this.createComponent(v);
                        this.setInternal('menu', v);
                    }
                    return v;
                },
                setter: function (m) {
                    if (m.isControl) {
                        m.setInternal('parent', this);
                    }
                }
            }
        },
        xclass: 'submenu'
    });    // # -------------------------------- private start
    // # -------------------------------- private start
    function showMenu() {
        var self = this, menu = self.get('menu');    // does not put this into setter
                                                     // in case set menu before submenu item is  rendered
        // does not put this into setter
        // in case set menu before submenu item is  rendered
        var align = {
                node: this.$el,
                points: [
                    'tr',
                    'tl'
                ],
                overflow: {
                    adjustX: 1,
                    adjustY: 1
                }
            };
        util.mix(menu.get('align'), align, false);
        menu.show();
        self.el.setAttribute('aria-haspopup', menu.get('el').attr('id'));
    }
    function hideMenu() {
        this.get('menu').hide();
    }    // # ------------------------------------ private end
});
KISSY.add('menu/submenu-xtpl', [], function (S, require, exports, module) {
    /* Compiled By XTemplate */
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
    module.exports = function submenuXtpl(scope, buffer, undefined) {
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
        buffer.write('</div>\r\n<span class="', 0);
        var id4 = scope.resolve(['prefixCls'], 0);
        buffer.write(id4, true);
        buffer.write('submenu-arrow">\u25BA</span>', 0);
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});
KISSY.add('menu/popupmenu', [
    'component/extension/align',
    'component/extension/shim',
    './control',
    'component/extension/content-box'
], function (S, require, exports, module) {
    /**
 * @ignore
 * positionable and not focusable menu
 * @author yiminghe@gmail.com
 */
    var AlignExtension = require('component/extension/align');
    var Shim = require('component/extension/shim');
    var Menu = require('./control');
    var ContentBox = require('component/extension/content-box');    /**
 * Popup Menu.
 * xclass: 'popupmenu'.
 * @class KISSY.Menu.PopupMenu
 * @extends KISSY.Menu
 * @mixins KISSY.Component.Extension.Align
 */
    /**
 * Popup Menu.
 * xclass: 'popupmenu'.
 * @class KISSY.Menu.PopupMenu
 * @extends KISSY.Menu
 * @mixins KISSY.Component.Extension.Align
 */
    module.exports = Menu.extend([
        ContentBox,
        Shim,
        AlignExtension
    ], {
        // 根菜单 popupmenu 或者到中间的 menu 菜单
        getRootMenu: function () {
            var self = this, cur = self, last;
            do {
                // 沿着 menu menuitem 链
                last = cur;
                cur = cur.get('parent');
            } while (cur && (cur.isMenuItem || cur.isMenu));
            return last;
        },
        handleMouseLeaveInternal: function (e) {
            var self = this;
            self.callSuper(e);    // sub menuitem 有时不灵敏
                                  // var parent = this.get('parent');
                                  // if (parent && parent.isSubMenu) {
                                  //  parent.clearShowPopupMenuTimers();
                                  // }
            // sub menuitem 有时不灵敏
            // var parent = this.get('parent');
            // if (parent && parent.isSubMenu) {
            //  parent.clearShowPopupMenuTimers();
            // }
            if (self.get('autoHideOnMouseLeave')) {
                var rootMenu = self.getRootMenu();
                if (rootMenu !== this) {
                    clearTimeout(rootMenu._popupAutoHideTimer);
                    rootMenu._popupAutoHideTimer = setTimeout(function () {
                        var item;
                        if (item = rootMenu.get('highlightedItem')) {
                            item.set('highlighted', false);
                        }
                    }, self.get('parent').get('menuDelay') * 1000);
                }
            }
        },
        isPopupMenu: 1,
        /**
     * Suppose it has focus (as a context menu), then it must hide when lose focus.
     * Protected, should only be overridden by subclasses.
     * @protected
     */
        handleBlurInternal: function (e) {
            var self = this;
            self.callSuper(e);
            self.hide();
        }
    }, {
        ATTRS: {
            handleGestureEvents: { value: true },
            focusable: { value: false },
            allowTextSelection: { value: false },
            /**
         * Whether the whole menu tree which contains popup menu hides when mouseleave.
         * Only valid for submenu's popupmenu.
         * Defaults to: false.
         * @cfg {Boolean} autoHideOnMouseLeave
         */
            /**
         * @ignore
         */
            autoHideOnMouseLeave: {},
            visible: { value: false }
        },
        xclass: 'popupmenu'
    });
});

