/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:03
*/
/*
combined modules:
menubutton
menubutton/control
menubutton/menubutton-xtpl
menubutton/select
menubutton/option
*/
KISSY.add('menubutton', [
    'menubutton/control',
    'menubutton/select',
    'menubutton/option'
], function (S, require, exports, module) {
    /**
 * menubutton
 * @ignore
 * @author yiminghe@gmail.com
 */
    var MenuButton = require('menubutton/control');
    var Select = require('menubutton/select');
    MenuButton.Select = Select;
    MenuButton.Option = require('menubutton/option');
    module.exports = MenuButton;
});
KISSY.add('menubutton/control', [
    'button',
    'component/extension/content-box',
    'node',
    './menubutton-xtpl',
    'util'
], function (S, require, exports, module) {
    /**
 * combination of menu and button ,similar to native select
 * @ignore
 * @author yiminghe@gmail.com
 */
    var Button = require('button');
    var ContentBox = require('component/extension/content-box');
    var KeyCode = require('node').Event.KeyCode;
    var MenuButtonTpl = require('./menubutton-xtpl');
    var util = require('util');    /**
 * A menu button component, consist of a button and a drop down popup menu.
 * xclass: 'menu-button'.
 * @class KISSY.MenuButton
 * @extends KISSY.Button
 */
    /**
 * A menu button component, consist of a button and a drop down popup menu.
 * xclass: 'menu-button'.
 * @class KISSY.MenuButton
 * @extends KISSY.Button
 */
    module.exports = Button.extend([ContentBox], {
        isMenuButton: 1,
        decorateDom: function (el) {
            var self = this, prefixCls = self.get('prefixCls');
            var popupMenuEl = el.one('.' + prefixCls + 'popupmenu');
            var docBody = popupMenuEl[0].ownerDocument.body;
            docBody.insertBefore(popupMenuEl[0], docBody.firstChild);
            var PopupMenuClass = this.getComponentConstructorByNode(prefixCls, popupMenuEl);
            self.setInternal('menu', new PopupMenuClass({
                srcNode: popupMenuEl,
                prefixCls: prefixCls
            }));
        },
        beforeCreateDom: function (renderData) {
            util.mix(renderData.elAttrs, {
                'aria-expanded': 'false',
                'aria-haspopup': 'true'
            });
        },
        _onSetCollapsed: function (v) {
            var self = this, menu = self.get('menu');
            var el = self.$el;
            var cls = self.getBaseCssClass('open');
            el[v ? 'removeClass' : 'addClass'](cls).attr('aria-expanded', !v);
            if (v) {
                menu.hide();
            } else {
                if (!menu.get('visible')) {
                    // same as submenu
                    // in case menu is changed after menubutton is rendered
                    var align = {
                            node: el,
                            points: [
                                'bl',
                                'tl'
                            ],
                            overflow: {
                                adjustX: 1,
                                adjustY: 1
                            }
                        };
                    util.mix(menu.get('align'), align, false);
                    if (self.get('matchElWidth')) {
                        menu.render();
                        var menuEl = menu.get('el');
                        var borderWidth = (parseInt(menuEl.css('borderLeftWidth'), 10) || 0) + (parseInt(menuEl.css('borderRightWidth'), 10) || 0);
                        menu.set('width', menu.get('align').node[0].offsetWidth - borderWidth);
                    }
                    menu.show();
                    el.attr('aria-haspopup', menu.get('el').attr('id'));
                }
            }
        },
        bindUI: function () {
            var self = this;
            self.on('afterHighlightedItemChange', onMenuAfterHighlightedItemChange, self);
            self.on('click', onMenuItemClick, self);
        },
        /**
     * Handle keydown/up event.
     * If drop down menu is visible then handle event to menu.
     * Returns true if the event was handled, falsy otherwise.
     * Protected, should only be overridden by subclasses.
     * @param {KISSY.Event.DomEvent.Object} e key event to handle.
     * @return {Boolean|undefined} True Whether the key event was handled.
     * @protected
     */
        handleKeyDownInternal: function (e) {
            var self = this, keyCode = e.keyCode, type = String(e.type), menu = self.get('menu');    // space 只在 keyup 时处理
            // space 只在 keyup 时处理
            if (keyCode === KeyCode.SPACE) {
                // Prevent page scrolling in Chrome.
                e.preventDefault();
                if (type !== 'keyup') {
                    return undefined;
                }
            } else if (type !== 'keydown') {
                return undefined;
            }    //转发给 menu 处理
            //转发给 menu 处理
            if (menu.get('rendered') && menu.get('visible')) {
                var handledByMenu = menu.handleKeyDownInternal(e);    // esc
                // esc
                if (keyCode === KeyCode.ESC) {
                    self.set('collapsed', true);
                    return true;
                }
                return handledByMenu;
            }    // Menu is closed, and the user hit the down/up/space key; open menu.
            // Menu is closed, and the user hit the down/up/space key; open menu.
            if (keyCode === KeyCode.SPACE || keyCode === KeyCode.DOWN || keyCode === KeyCode.UP) {
                self.set('collapsed', false);
                return true;
            }
            return undefined;
        },
        /**
     * Perform default action for menubutton.
     * Toggle the drop down menu to show or hide.
     * Protected, should only be overridden by subclasses.
     * @protected
     *
     */
        handleClickInternal: function () {
            var self = this;    // does not fire click from menubutton
                                // self.callSuper(e);
            // does not fire click from menubutton
            // self.callSuper(e);
            self.set('collapsed', !self.get('collapsed'));
        },
        /**
     * Handles blur event.
     * When it loses keyboard focus, close the drop dow menu.
     * @param {KISSY.Event.DomEvent.Object} e Blur event.
     * Protected, should only be overridden by subclasses.
     * @protected
     *
     */
        handleBlurInternal: function (e) {
            var self = this;
            self.callSuper(e);    // such as : click the document
            // such as : click the document
            self.set('collapsed', true);
        },
        /**
     * Adds a new menu item at the end of the menu.
     * @param {KISSY.Menu.Item} item Menu item to add to the menu.
     * @param {Number} index position to insert
     */
        addItem: function (item, index) {
            var menu = this.get('menu');
            menu.addChild(item, index);
        },
        /**
     * Remove a existing menu item from drop down menu.
     * @param c {KISSY.Menu.Item} Existing menu item.
     * @param [destroy=true] {Boolean} Whether destroy removed menu item.
     */
        removeItem: function (c, destroy) {
            var menu = this.get('menu');
            menu.removeChild(c, destroy);
        },
        /**
     * Remove all menu items from drop down menu.
     * @param [destroy] {Boolean} Whether destroy removed menu items.
     */
        removeItems: function (destroy) {
            var menu = this.get('menu');
            if (menu) {
                if (menu.removeChildren) {
                    menu.removeChildren(destroy);
                } else if (menu.children) {
                    menu.children = [];
                }
            }
        },
        /**
     * Returns the child menu item of drop down menu at the given index, or null if the index is out of bounds.
     * @param {Number} index 0-based index.
     */
        getItemAt: function (index) {
            var menu = this.get('menu');
            return menu.get('rendered') && menu.getChildAt(index);
        },
        // 禁用时关闭已显示菜单
        _onSetDisabled: function (v) {
            this.callSuper(v);
            if (!v) {
                this.set('collapsed', true);
            }
        },
        destructor: function () {
            this.get('menu').destroy();
        }
    }, {
        ATTRS: {
            handleGestureEvents: { value: true },
            focusable: { value: true },
            allowTextSelection: { value: false },
            contentTpl: { value: MenuButtonTpl },
            /**
         * Whether drop down menu is same width with button.
         * Defaults to: true.
         * @cfg {Boolean} matchElWidth
         */
            /**
         * @ignore
         */
            matchElWidth: { value: true },
            /**
         * Whether hide drop down menu when click drop down menu item.
         * eg: u do not want to set true when menu has checked menuitem.
         * Defaults to: false
         * @cfg {Boolean} collapseOnClick
         */
            /**
         * @ignore
         */
            collapseOnClick: { value: false },
            /**
         * Drop down menu associated with this menubutton.
         * @cfg {KISSY.Menu|Object} menu
         */
            /**
         * Drop down menu associated with this menubutton.
         * @property {KISSY.Menu} menu
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
            },
            /**
         * Whether drop menu is shown.
         * @property {Boolean} collapsed
         */
            /**
         * @ignore
         */
            collapsed: {
                value: true,
                render: 1,
                sync: 0
            }
        },
        xclass: 'menu-button'
    });
    function onMenuItemClick(e) {
        if (e.target.isMenuItem && this.get('collapseOnClick')) {
            this.set('collapsed', true);
        }
    }
    function onMenuAfterHighlightedItemChange(e) {
        if (e.target.isMenu) {
            var el = this.el, menuItem = e.newVal;
            el.setAttribute('aria-activedescendant', menuItem && menuItem.el.id || '');
        }
    }
});



KISSY.add('menubutton/menubutton-xtpl', [], function (S, require, exports, module) {
    /* Compiled By XTemplate */
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
    module.exports = function menubuttonXtpl(scope, buffer, undefined) {
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
        buffer.write('</div>\r\n<div class="', 0);
        var option4 = { escape: 1 };
        var params5 = [];
        params5.push('dropdown');
        option4.params = params5;
        var callRet6;
        callRet6 = callFnUtil(tpl, scope, option4, buffer, ['getBaseCssClasses'], 0, 2);
        if (callRet6 && callRet6.isBuffer) {
            buffer = callRet6;
            callRet6 = undefined;
        }
        buffer.write(callRet6, true);
        buffer.write('">\r\n    <div class="', 0);
        var option7 = { escape: 1 };
        var params8 = [];
        params8.push('dropdown-inner');
        option7.params = params8;
        var callRet9;
        callRet9 = callFnUtil(tpl, scope, option7, buffer, ['getBaseCssClasses'], 0, 3);
        if (callRet9 && callRet9.isBuffer) {
            buffer = callRet9;
            callRet9 = undefined;
        }
        buffer.write(callRet9, true);
        buffer.write('">\r\n    </div>\r\n</div>', 0);
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});

KISSY.add('menubutton/select', [
    'node',
    './control',
    'util'
], function (S, require, exports, module) {
    /**
 * @ignore
 * manage a list of single-select options
 * @author yiminghe@gmail.com
 */
    var $ = require('node');
    var MenuButton = require('./control');
    var util = require('util');
    function getSelectedItem(self) {
        var menu = self.get('menu'), cs = menu.children || menu.get && menu.get('children') || [], value = self.get('value'), c, i;
        for (i = 0; i < cs.length; i++) {
            c = cs[i];
            if (getItemValue(c) === value) {
                return c;
            }
        }
        return null;
    }    // c: Option
         // c.get('value')
         // c: Object
         // c.value
    // c: Option
    // c.get('value')
    // c: Object
    // c.value
    function getItemValue(c) {
        var v;
        if (c) {
            if (c.get) {
                if ((v = c.get('value')) === undefined) {
                    v = c.get('textContent') || c.get('content');
                }
            } else {
                if ((v = c.value) === undefined) {
                    v = c.textContent || c.content;
                }
            }
        }
        return v;
    }
    function deSelectAllExcept(self) {
        var menu = self.get('menu'), value = self.get('value'), cs = menu && menu.get && menu.get('children');
        util.each(cs, function (c) {
            if (c && c.set) {
                c.set('selected', getItemValue(c) === value);
            }
        });
    }    // different from menubutton by highlighting the currently selected option on open menu.
    // different from menubutton by highlighting the currently selected option on open menu.
    function _handleMenuShow(e) {
        var self = this, selectedItem = getSelectedItem(self), m = self.get('menu');
        if (e.target === m) {
            var item = selectedItem || m.getChildAt(0);
            if (item) {
                item.set('highlighted', true);
            }    // 初始化选中
            // 初始化选中
            if (selectedItem) {
                selectedItem.set('selected', true);
            }
        }
    }
    function _updateCaption(self) {
        var item = getSelectedItem(self), textContent = item && (item.textContent || item.get && item.get('textContent')), content = item && (item.content || item.get && item.get('content'));    // 可能设置到 select content 的内容并不和 menuitem 的内容完全一致
        // 可能设置到 select content 的内容并不和 menuitem 的内容完全一致
        self.set('content', textContent || content || self.get('defaultCaption'));
    }    /*
 Handle click on drop down menu.
 Set selected menu item as current selectedItem and hide drop down menu.
 Protected, should only be overridden by subclasses.
 */
    /*
 Handle click on drop down menu.
 Set selected menu item as current selectedItem and hide drop down menu.
 Protected, should only be overridden by subclasses.
 */
    function handleMenuClick(e) {
        var self = this, target = e.target;
        if (target.isMenuItem) {
            var newValue = getItemValue(target), oldValue = self.get('value');
            self.set('value', newValue);
            if (newValue !== oldValue) {
                self.fire('change', {
                    prevVal: oldValue,
                    newVal: newValue
                });
            }
        }
    }    /**
 * Select component which supports single selection from a drop down menu
 * with semantics similar to native HTML select.
 * xclass: 'select'.
 * @class KISSY.MenuButton.Select
 * @extends KISSY.MenuButton
 */
    /**
 * Select component which supports single selection from a drop down menu
 * with semantics similar to native HTML select.
 * xclass: 'select'.
 * @class KISSY.MenuButton.Select
 * @extends KISSY.MenuButton
 */
    var Select = MenuButton.extend({
            bindUI: function () {
                this.on('click', handleMenuClick, this);
                this.on('show', _handleMenuShow, this);
            },
            /**
         * Removes all menu items from current select, and set selectedItem to null.
         *
         */
            removeItems: function () {
                var self = this;
                self.callSuper.apply(self, arguments);
                self.set('value', null);
            },
            /**
         * Remove specified item from current select.
         * If specified item is selectedItem, then set selectedItem to null.
         * @param c {KISSY.MenuButton.Option} Existing menu item.
         * @param [destroy=true] {Boolean} Whether destroy removed menu item.
         */
            removeItem: function (c, destroy) {
                var self = this;
                self.callSuper(c, destroy);
                if (c.get('value') === self.get('value')) {
                    self.set('value', null);
                }
            },
            _onSetValue: function () {
                var self = this;
                deSelectAllExcept(self);
                _updateCaption(self);
            },
            _onSetDefaultCaption: function () {
                _updateCaption(this);
            }
        }, {
            ATTRS: {
                /**
             * Get current select 's value.
             */
                value: {},
                /**
             * Default caption to be shown when no option is selected.
             * @type {String}
             */
                defaultCaption: { value: '' },
                collapseOnClick: { value: true }
            },
            /**
         * Generate a select component from native select element.
         * @param {HTMLElement} element Native html select element.
         * @param {Object} cfg Extra configuration for current select component.
         * @member KISSY.MenuButton.Select
         */
            decorate: function (element, cfg) {
                element = $(element);
                cfg = cfg || {};
                cfg.elBefore = element;
                var name, allItems = [], select, selectedItem = null, curValue = element.val(), options = element.all('option');
                options.each(function (option) {
                    var item = {
                            xclass: 'option',
                            content: option.text(),
                            elCls: option.attr('class'),
                            value: option.val()
                        };
                    if (curValue === option.val()) {
                        selectedItem = {
                            content: item.content,
                            value: item.value
                        };
                    }
                    allItems.push(item);
                });
                cfg.menu = cfg.menu || cfg.menuCfg || {};
                cfg.menu.children = allItems;
                delete cfg.menuCfg;
                select = new Select(util.mix(cfg, selectedItem)).render();
                if (name = element.attr('name')) {
                    var input = $('<input' + ' type="hidden"' + ' name="' + name + '" value="' + curValue + '">').insertBefore(element, undefined);
                    select.on('afterValueChange', function (e) {
                        input.val(e.newVal || '');
                    });
                }
                element.remove();
                return select;
            },
            xclass: 'select'
        });
    module.exports = Select;    /*
 TODO
 how to emulate multiple ?
 */
});
KISSY.add('menubutton/option', ['menu'], function (S, require, exports, module) {
    /**
 * represent a menu option , just make it selectable and can have select status
 * @ignore
 * @author yiminghe@gmail.com
 */
    var Menu = require('menu');    /**
 * Option for Select component.
 * xclass: 'option'.
 * @class KISSY.MenuButton.Option
 * @extends KISSY.Menu.Item
 */
    /**
 * Option for Select component.
 * xclass: 'option'.
 * @class KISSY.MenuButton.Option
 * @extends KISSY.Menu.Item
 */
    module.exports = Menu.RadioItem.extend({}, {
        ATTRS: {
            /**
         * String will be used as select 's content if selected.
         * @type {String}
         */
            textContent: {}
        },
        xclass: 'option'
    });
});
