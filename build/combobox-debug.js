/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 13:53
*/
/*
combined modules:
combobox
combobox/control
combobox/combobox-xtpl
combobox/local-data-source
combobox/remote-data-source
*/
KISSY.add('combobox', [
    'combobox/control',
    'combobox/local-data-source',
    'combobox/remote-data-source'
], function (S, require, exports, module) {
    /**
 * @ignore
 * Export ComboBox.
 * @author yiminghe@gmail.com
 */
    var ComboBox = require('combobox/control');
    var LocalDataSource = require('combobox/local-data-source');
    var RemoteDataSource = require('combobox/remote-data-source');
    ComboBox.LocalDataSource = LocalDataSource;
    ComboBox.RemoteDataSource = RemoteDataSource;
    module.exports = ComboBox;
});
KISSY.add('combobox/control', [
    'util',
    'logger-manager',
    'node',
    'component/control',
    './combobox-xtpl',
    'menu'
], function (S, require, exports, module) {
    /**
 * @ignore
 * Input wrapper for ComboBox component.
 * @author yiminghe@gmail.com
 */
    var util = require('util');
    var LoggerManager = require('logger-manager');
    var logger = LoggerManager.getLogger('combobox');
    var $ = require('node');
    var Control = require('component/control');
    var ComboboxTpl = require('./combobox-xtpl');    // provide popupmenu xclass
    // provide popupmenu xclass
    require('menu');
    var ComboBox, KeyCode = $.Event.KeyCode;    /**
 * KISSY ComboBox.
 * xclass: 'combobox'.
 * @extends KISSY.Component.Control
 * @class KISSY.ComboBox
 */
    /**
 * KISSY ComboBox.
 * xclass: 'combobox'.
 * @extends KISSY.Component.Control
 * @class KISSY.ComboBox
 */
    ComboBox = Control.extend({
        initializer: function () {
            /**
         * fired after data is rendered into combobox menu
         * @event afterRenderData
         */
            this.publish('afterRenderData', { bubbles: false });
        },
        // user's input text.
        // for restore after press esc key
        // if update input when press down or up key
        _savedValue: null,
        bindUI: function () {
            var self = this, input = self.get('input');
            input.on('input', onValueChange, self);    /**
         * fired after combobox 's collapsed attribute is changed.
         * @event afterCollapsedChange
         * @param e
         * @param e.newVal current value
         * @param e.prevVal previous value
         */
            /**
         * fired after combobox 's collapsed attribute is changed.
         * @event afterCollapsedChange
         * @param e
         * @param e.newVal current value
         * @param e.prevVal previous value
         */
            self.on('click', onMenuItemClick, self);
            var menu = self.get('menu');
            if (menu.get('rendered')) {
                onMenuAfterRenderUI.call(self);
            } else {
                menu.on('afterRenderUI', onMenuAfterRenderUI, self);
            }
        },
        destructor: function () {
            var self = this;
            self.get('menu').destroy();
            self.$el.getWindow().detach('resize', onWindowResize, self);
        },
        /**
     * normalize returned data
     * @protected
     * @param data
     */
        normalizeData: function (data) {
            var self = this, contents, v, i, c;
            if (data && data.length) {
                data = data.slice(0, self.get('maxItemCount'));
                if (self.get('format')) {
                    contents = self.get('format').call(self, self.getCurrentValue(), data);
                } else {
                    contents = [];
                }
                for (i = 0; i < data.length; i++) {
                    v = data[i];
                    c = contents[i] = util.mix({
                        content: v,
                        textContent: v,
                        value: v
                    }, contents[i]);
                }
                return contents;
            }
            return contents;
        },
        /**
     * get value
     * @protected
     */
        getCurrentValue: function () {
            return this.get('value');
        },
        /**
     * set value
     * @protected
     * @method
     * @member KISSY.ComboBox
     */
        setCurrentValue: function (value, setCfg) {
            this.set('value', value, setCfg);
        },
        // buffer/bridge between check timer and change logic
        _onSetValue: function (v, e) {
            var self = this, clearEl = self.get('clearEl'), value;    // only trigger menu when timer cause change
            // only trigger menu when timer cause change
            if (e.causedByInputEvent) {
                value = self.getCurrentValue();    // undefined means invalid input value
                // undefined means invalid input value
                if (value === undefined) {
                    self.set('collapsed', true);
                    return;
                }
                self._savedValue = value;
                self.sendRequest(value);
            } else {
                self.get('input').val(v);
            }
            if (v && clearEl) {
                clearEl.show();
            } else if (!v && clearEl) {
                clearEl.hide();
            }
            var placeholderEl = self.get('placeholderEl');
            if (placeholderEl) {
                if (!v) {
                    placeholderEl.show();
                } else {
                    placeholderEl.hide();
                }
            }
        },
        handleFocusInternal: function () {
            var self = this;
            clearDismissTimer(self);
            if (self.get('invalidEl')) {
                setInvalid(self, false);
            }
        },
        handleBlurInternal: function (e) {
            var self = this;
            self.callSuper(e);
            delayHide(self);
            if (self.get('invalidEl')) {
                self.validate(function (error, val) {
                    if (error) {
                        if (!self.get('focused') && val === self.get('value')) {
                            setInvalid(self, error);
                        }
                    } else {
                        setInvalid(self, false);
                    }
                });
            }
        },
        handleMouseDownInternal: function (e) {
            var self = this, target, clearEl, trigger;
            self.callSuper(e);
            target = e.target;
            trigger = self.get('trigger');
            clearEl = self.get('clearEl');
            if (trigger && (trigger[0] === target || trigger.contains(target))) {
                if (self.get('collapsed')) {
                    // fetch data
                    self.focus();
                    self.sendRequest('');
                } else {
                    // switch from open to collapse
                    self.set('collapsed', true);
                }
                e.preventDefault();
            } else if (clearEl && (clearEl[0] === target || clearEl.contains(target))) {
                self.get('input').val('');    // re send request
                // re send request
                self.setCurrentValue('', { data: { causedByInputEvent: 1 } });
                clearEl.hide();
            }
        },
        handleKeyDownInternal: function (e) {
            var self = this, updateInputOnDownUp, input, keyCode = e.keyCode, highlightedItem, handledByMenu, menu = self.get('menu');
            input = self.get('input');
            updateInputOnDownUp = self.get('updateInputOnDownUp');
            if (menu.get('visible')) {
                highlightedItem = menu.get('highlightedItem');    // https://github.com/kissyteam/kissy/issues/371
                                                                  // combobox: input should be involved in key press sequence
                // https://github.com/kissyteam/kissy/issues/371
                // combobox: input should be involved in key press sequence
                if (updateInputOnDownUp && highlightedItem) {
                    var menuChildren = menu.get('children');
                    if (keyCode === KeyCode.DOWN && highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse()) || keyCode === KeyCode.UP && highlightedItem === getFirstEnabledItem(menuChildren)) {
                        self.setCurrentValue(self._savedValue);
                        highlightedItem.set('highlighted', false);
                        return true;
                    }
                }
                handledByMenu = menu.handleKeyDownInternal(e);
                highlightedItem = menu.get('highlightedItem');    // esc
                // esc
                if (keyCode === KeyCode.ESC) {
                    self.set('collapsed', true);
                    if (updateInputOnDownUp) {
                        // combobox will change input value
                        // but it does not need to reload data
                        // restore original user's input text
                        self.setCurrentValue(self._savedValue);
                    }
                    return true;
                }
                if (updateInputOnDownUp && util.inArray(keyCode, [
                        KeyCode.DOWN,
                        KeyCode.UP
                    ])) {
                    // update menu's active value to input just for show
                    self.setCurrentValue(highlightedItem.get('textContent'));
                }    // tab
                     // if menu is open and an menuitem is highlighted, see as click/enter
                // tab
                // if menu is open and an menuitem is highlighted, see as click/enter
                if (keyCode === KeyCode.TAB && highlightedItem) {
                    // click highlightedItem
                    highlightedItem.handleClickInternal(e);    // only prevent focus change in multiple mode
                    // only prevent focus change in multiple mode
                    if (self.get('multiple')) {
                        return true;
                    }
                }
                return handledByMenu;
            } else if (keyCode === KeyCode.DOWN || keyCode === KeyCode.UP) {
                // re-fetch, consider multiple input
                var v = self.getCurrentValue();
                if (v !== undefined) {
                    self.sendRequest(v);
                    return true;
                }
            }
            return undefined;
        },
        validate: function (callback) {
            var self = this, validator = self.get('validator'), val = self.getCurrentValue();
            if (validator) {
                validator(val, function (error) {
                    callback(error, val);
                });
            } else {
                callback(false, val);
            }
        },
        /**
     * fetch comboBox list by value and show comboBox list
     * @param {String} value value for fetching comboBox list
     */
        sendRequest: function (value) {
            var self = this, dataSource = self.get('dataSource');
            dataSource.fetchData(value, renderData, self);
        },
        getKeyEventTarget: function () {
            return this.get('input');
        },
        _onSetCollapsed: function (v) {
            var self = this, el = self.$el, menu = self.get('menu');
            if (v) {
                menu.hide();
            } else {
                // 保证显示前已经 bind 好 menu 事件
                clearDismissTimer(self);
                if (!menu.get('visible')) {
                    if (self.get('matchElWidth')) {
                        menu.render();
                        var menuEl = menu.get('el');
                        var borderWidth = (parseInt(menuEl.css('borderLeftWidth'), 10) || 0) + (parseInt(menuEl.css('borderRightWidth'), 10) || 0);
                        menu.set('width', el[0].offsetWidth - borderWidth);
                    }
                    menu.show();
                }
            }
            this.get('input').attr('aria-expanded', !v);
        },
        _onSetDisabled: function (v, e) {
            this.callSuper(v, e);
            this.get('input').attr('disabled', v);
        }
    }, {
        ATTRS: {
            handleGestureEvents: { value: true },
            focusable: { value: true },
            allowTextSelection: { value: true },
            contentTpl: { value: ComboboxTpl },
            /**
         * Input element of current combobox.
         * @type {KISSY.Node}
         * @property input
         */
            /**
         * @ignore
         */
            input: {
                selector: function () {
                    return '.' + this.getBaseCssClass('input');
                }
            },
            /**
         * initial value for input
         * @cfg {String} inputValue
         */
            /**
         * @ignore
         */
            value: {
                value: '',
                sync: 0,
                render: 1,
                parse: function () {
                    return this.get('input').val();
                }
            },
            /**
         * trigger arrow element
         * @ignore
         */
            trigger: {
                selector: function () {
                    return '.' + this.getBaseCssClass('trigger');
                }
            },
            /**
         * placeholder
         * @cfg {String} placeholder
         */
            /**
         * @ignore
         */
            placeholder: {
                render: 1,
                sync: 0,
                parse: function () {
                    var placeHolder = this.get('placeholderEl');
                    return placeHolder && placeHolder.html();
                }
            },
            /**
         * label for placeholder in ie
         * @ignore
         */
            placeholderEl: {
                selector: function () {
                    return '.' + this.getBaseCssClass('placeholder');
                }
            },
            clearEl: {
                selector: function () {
                    return '.' + this.getBaseCssClass('clear');
                }
            },
            /**
         * custom validation function
         * @type Function
         * @property validator
         */
            /**
         * @ignore
         */
            validator: {},
            /**
         * invalid tag el
         * @ignore
         */
            invalidEl: {
                selector: function () {
                    return '.' + this.getBaseCssClass('invalid-el');
                }
            },
            /**
         * Whether show combobox trigger.
         * Defaults to: true.
         * @cfg {Boolean} hasTrigger
         */
            /**
         * @ignore
         */
            hasTrigger: {
                value: true,
                sync: 0,
                render: 1
            },
            /**
         * ComboBox dropDown menuList or config
         * @cfg {KISSY.Menu.PopupMenu|Object} menu
         */
            /**
         * ComboBox dropDown menuList or config
         * @property menu
         * @type {KISSY.Menu.PopupMenu}
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
                        var align = {
                                node: this.$el,
                                points: [
                                    'bl',
                                    'tl'
                                ],
                                overflow: {
                                    adjustX: 1,
                                    adjustY: 1
                                }
                            };
                        util.mix(m.get('align'), align, false);
                    }
                }
            },
            /**
         * Whether combobox menu is hidden.
         * @type {Boolean}
         * @property collapsed
         */
            /**
         * @ignore
         */
            collapsed: {
                render: 1,
                sync: 0,
                value: true
            },
            /**
         * dataSource for comboBox.
         * @cfg {KISSY.ComboBox.LocalDataSource|KISSY.ComboBox.RemoteDataSource|Object} dataSource
         */
            /**
         * @ignore
         */
            dataSource: {},
            // 和 input 关联起来，input可以有很多，每个数据源可以不一样，但是 menu 共享
            /**
         * maxItemCount max count of data to be shown
         * @cfg {Number} maxItemCount
         */
            /**
         * @ignore
         */
            maxItemCount: { value: 99999 },
            /**
         * Whether drop down menu is same width with input.
         * Defaults to: true.
         * @cfg {Boolean} matchElWidth
         */
            /**
         * @ignore
         */
            matchElWidth: { value: true },
            /**
         * Format function to return array of
         * html/text/menu item attributes from array of data.
         * @cfg {Function} format
         */
            /**
         * @ignore
         */
            format: {},
            /**
         * Whether update input's value at keydown or up when combobox menu shows.
         * Default to: true
         * @cfg {Boolean} updateInputOnDownUp
         */
            /**
         * @ignore
         */
            updateInputOnDownUp: { value: true },
            /**
         * Whether or not the first row should be highlighted by default.
         * Defaults to: false
         * @cfg {Boolean} autoHighlightFirst
         */
            /**
         * @ignore
         */
            autoHighlightFirst: {},
            /**
         * whether highlight item when item content is same with user input.
         * Defaults to: true
         * @cfg {Boolean} highlightMatchItem
         */
            /**
         * @ignore
         */
            highlightMatchItem: { value: true }
        },
        xclass: 'combobox'
    });    // #----------------------- private start
    // #----------------------- private start
    function getFirstEnabledItem(children) {
        for (var i = 0; i < children.length; i++) {
            if (!children[i].get('disabled')) {
                return children[i];
            }
        }
        return null;
    }
    function onMenuFocusout() {
        delayHide(this);
    }
    function onMenuFocusin() {
        var self = this;    // different event sequence
                            // ie fire focusin blur
                            // others fire blur focusin
        // different event sequence
        // ie fire focusin blur
        // others fire blur focusin
        setTimeout(function () {
            clearDismissTimer(self);
        }, 0);
    }
    function onMenuMouseOver() {
        var self = this;    // trigger el focus
        // trigger el focus
        self.focus();    // prevent menu from hiding
        // prevent menu from hiding
        clearDismissTimer(self);
    }
    function onMenuMouseDown() {
        var self = this;    // consider multi-input
                            // input.val(self.get('value'));
                            // force change event for cursor keep
        // consider multi-input
        // input.val(self.get('value'));
        // force change event for cursor keep
        self.setCurrentValue(self.getCurrentValue(), { force: 1 });
    }
    function onMenuAfterRenderUI(e) {
        var self = this, contentEl;
        var menu = self.get('menu');
        if (!e || menu === e.target) {
            var input = self.get('input');
            var el = menu.get('el');
            contentEl = menu.get('contentEl');
            input.attr('aria-owns', el.attr('id'));    // menu has input!
            // menu has input!
            el.on('focusout', onMenuFocusout, self);
            el.on('focusin', onMenuFocusin, self);
            contentEl.on('mouseover', onMenuMouseOver, self);    // cause valuechange
                                                                 // if click menuitem while chinese input is open(xu -> '')
            // cause valuechange
            // if click menuitem while chinese input is open(xu -> '')
            contentEl.on('mousedown', onMenuMouseDown, self);
            if (self.get('matchElWidth')) {
                el.getWindow().on('resize', onWindowResize, self);
            }
        }
    }
    function onWindowResize() {
        var self = this;
        var menu = self.get('menu');
        if (menu.get('visible')) {
            var el = self.get('el');
            var menuEl = menu.get('el');
            var borderWidth = (parseInt(menuEl.css('borderLeftWidth'), 10) || 0) + (parseInt(menuEl.css('borderRightWidth'), 10) || 0);
            menu.set('width', el[0].offsetWidth - borderWidth);
        }
    }
    function onMenuItemClick(e) {
        var item = e.target, self = this, textContent;
        if (item.isMenuItem) {
            textContent = item.get('textContent');
            self.setCurrentValue(textContent);
            self._savedValue = textContent;
            self.set('collapsed', true);
        }
    }
    function setInvalid(self, error) {
        var $el = self.$el, cls = self.getBaseCssClasses('invalid'), invalidEl = self.get('invalidEl');
        if (error) {
            $el.addClass(cls);
            invalidEl.attr('title', error);
            invalidEl.show();
        } else {
            $el.removeClass(cls);
            invalidEl.hide();
        }
    }
    function delayHide(self) {
        if (self._focusoutDismissTimer) {
            return;
        }
        self._focusoutDismissTimer = setTimeout(function () {
            // ie6 bug
            if (self._focusoutDismissTimer) {
                self.set('collapsed', true);
            }
        }, // ie6 needs longer timeout
        50);
    }
    function clearDismissTimer(self) {
        var t = self._focusoutDismissTimer;
        if (t) {
            clearTimeout(t);
            self._focusoutDismissTimer = null;
        }
    }
    function onValueChange(e) {
        this.setCurrentValue(e.target.value, { data: { causedByInputEvent: 1 } });
    }
    function renderData(data) {
        var self = this, start, children = [], val, matchVal, i, menu = self.get('menu');
        data = self.normalizeData(data);
        menu.removeChildren(true);
        if (data && data.length) {
            start = util.now();
            menu.addChildren(data);
            logger.info('render menu cost: ' + (util.now() - start) + ' ms');
            children = menu.get('children');    // make menu item (which textContent is same as input) active
            // make menu item (which textContent is same as input) active
            val = self.getCurrentValue();
            if (self.get('highlightMatchItem')) {
                for (i = 0; i < children.length; i++) {
                    if (children[i].get('textContent') === val) {
                        children[i].set('highlighted', true);
                        matchVal = true;
                        break;
                    }
                }
            }    // Whether or not the first row should be highlighted by default.
            // Whether or not the first row should be highlighted by default.
            if (!matchVal && self.get('autoHighlightFirst')) {
                for (i = 0; i < children.length; i++) {
                    if (!children[i].get('disabled')) {
                        children[i].set('highlighted', true);
                        break;
                    }
                }
            }
            self.set('collapsed', false);    // after menu is rendered
            // after menu is rendered
            self.fire('afterRenderData');
        } else {
            self.set('collapsed', true);
        }
    }    // #------------------------private end
    // #------------------------private end
    module.exports = ComboBox;    /**
 * @ignore
 *
 * !TODO
 *  - menubutton combobox 抽象提取 picker (extjs)
 *
 *
 * 2012-05
 * auto-complete menu 对齐当前输入位置
 *  - http://kirblog.idetalk.com/2010/03/calculating-cursor-position-in-textarea.html
 *  - https://github.com/kir/js_cursor_position
 *
 * 2012-04-01 可能 issue :
 *  - 用户键盘上下键高亮一些选项，
 *    input 值为高亮项的 textContent,那么点击 body 失去焦点，
 *    到底要不要设置 selectedItem 为当前高亮项？
 *    additional note:
 *    1. tab 时肯定会把当前高亮项设置为 selectedItem
 *    2. 鼠标时不会把高亮项的 textContent 设到 input 上去
 *    1,2 都没问题，关键是键盘结合鼠标时怎么个处理？或者不考虑算了！
 **/
});




KISSY.add('combobox/combobox-xtpl', [], function (S, require, exports, module) {
    /* Compiled By XTemplate */
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
    module.exports = function comboboxXtpl(scope, buffer, undefined) {
        var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
        var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], rangeCommand = nativeCommands['range'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
        buffer.write('<div class="', 0);
        var option0 = { escape: 1 };
        var params1 = [];
        params1.push('invalid-el');
        option0.params = params1;
        var callRet2;
        callRet2 = callFnUtil(tpl, scope, option0, buffer, ['getBaseCssClasses'], 0, 1);
        if (callRet2 && callRet2.isBuffer) {
            buffer = callRet2;
            callRet2 = undefined;
        }
        buffer.write(callRet2, true);
        buffer.write('">\r\n    <div class="', 0);
        var option3 = { escape: 1 };
        var params4 = [];
        params4.push('invalid-inner');
        option3.params = params4;
        var callRet5;
        callRet5 = callFnUtil(tpl, scope, option3, buffer, ['getBaseCssClasses'], 0, 2);
        if (callRet5 && callRet5.isBuffer) {
            buffer = callRet5;
            callRet5 = undefined;
        }
        buffer.write(callRet5, true);
        buffer.write('"></div>\r\n</div>\r\n\r\n', 0);
        var option6 = { escape: 1 };
        var params7 = [];
        var id8 = scope.resolve(['hasTrigger'], 0);
        params7.push(id8);
        option6.params = params7;
        option6.fn = function (scope, buffer) {
            buffer.write('\r\n<div class="', 0);
            var option9 = { escape: 1 };
            var params10 = [];
            params10.push('trigger');
            option9.params = params10;
            var callRet11;
            callRet11 = callFnUtil(tpl, scope, option9, buffer, ['getBaseCssClasses'], 0, 6);
            if (callRet11 && callRet11.isBuffer) {
                buffer = callRet11;
                callRet11 = undefined;
            }
            buffer.write(callRet11, true);
            buffer.write('">\r\n    <div class="', 0);
            var option12 = { escape: 1 };
            var params13 = [];
            params13.push('trigger-inner');
            option12.params = params13;
            var callRet14;
            callRet14 = callFnUtil(tpl, scope, option12, buffer, ['getBaseCssClasses'], 0, 7);
            if (callRet14 && callRet14.isBuffer) {
                buffer = callRet14;
                callRet14 = undefined;
            }
            buffer.write(callRet14, true);
            buffer.write('">&#x25BC;</div>\r\n</div>\r\n', 0);
            return buffer;
        };
        buffer = ifCommand.call(tpl, scope, option6, buffer, 5);
        buffer.write('\r\n\r\n<div class="', 0);
        var option15 = { escape: 1 };
        var params16 = [];
        params16.push('input-wrap');
        option15.params = params16;
        var callRet17;
        callRet17 = callFnUtil(tpl, scope, option15, buffer, ['getBaseCssClasses'], 0, 11);
        if (callRet17 && callRet17.isBuffer) {
            buffer = callRet17;
            callRet17 = undefined;
        }
        buffer.write(callRet17, true);
        buffer.write('">\r\n\r\n    <input id="ks-combobox-input-', 0);
        var id18 = scope.resolve(['id'], 0);
        buffer.write(id18, true);
        buffer.write('"\r\n           aria-haspopup="true"\r\n           aria-autocomplete="list"\r\n           aria-haspopup="true"\r\n           role="autocomplete"\r\n           aria-expanded="false"\r\n\r\n    ', 0);
        var option19 = { escape: 1 };
        var params20 = [];
        var id21 = scope.resolve(['disabled'], 0);
        params20.push(id21);
        option19.params = params20;
        option19.fn = function (scope, buffer) {
            buffer.write('\r\n    disabled\r\n    ', 0);
            return buffer;
        };
        buffer = ifCommand.call(tpl, scope, option19, buffer, 20);
        buffer.write('\r\n\r\n    autocomplete="off"\r\n    class="', 0);
        var option22 = { escape: 1 };
        var params23 = [];
        params23.push('input');
        option22.params = params23;
        var callRet24;
        callRet24 = callFnUtil(tpl, scope, option22, buffer, ['getBaseCssClasses'], 0, 25);
        if (callRet24 && callRet24.isBuffer) {
            buffer = callRet24;
            callRet24 = undefined;
        }
        buffer.write(callRet24, true);
        buffer.write('"\r\n\r\n    value="', 0);
        var id25 = scope.resolve(['value'], 0);
        buffer.write(id25, true);
        buffer.write('"\r\n    />\r\n\r\n\r\n    <label for="ks-combobox-input-', 0);
        var id26 = scope.resolve(['id'], 0);
        buffer.write(id26, true);
        buffer.write('"\r\n            style=\'display:', 0);
        var option27 = { escape: 1 };
        var params28 = [];
        var id29 = scope.resolve(['value'], 0);
        params28.push(id29);
        option27.params = params28;
        option27.fn = function (scope, buffer) {
            buffer.write('none', 0);
            return buffer;
        };
        option27.inverse = function (scope, buffer) {
            buffer.write('block', 0);
            return buffer;
        };
        buffer = ifCommand.call(tpl, scope, option27, buffer, 32);
        buffer.write(';\'\r\n    class="', 0);
        var option30 = { escape: 1 };
        var params31 = [];
        params31.push('placeholder');
        option30.params = params31;
        var callRet32;
        callRet32 = callFnUtil(tpl, scope, option30, buffer, ['getBaseCssClasses'], 0, 33);
        if (callRet32 && callRet32.isBuffer) {
            buffer = callRet32;
            callRet32 = undefined;
        }
        buffer.write(callRet32, true);
        buffer.write('">\r\n    ', 0);
        var id33 = scope.resolve(['placeholder'], 0);
        buffer.write(id33, true);
        buffer.write('\r\n    </label>\r\n\r\n    <div class="', 0);
        var option34 = { escape: 1 };
        var params35 = [];
        params35.push('clear');
        option34.params = params35;
        var callRet36;
        callRet36 = callFnUtil(tpl, scope, option34, buffer, ['getBaseCssClasses'], 0, 37);
        if (callRet36 && callRet36.isBuffer) {
            buffer = callRet36;
            callRet36 = undefined;
        }
        buffer.write(callRet36, true);
        buffer.write('"\r\n         unselectable="on"\r\n         ', 0);
        var option37 = { escape: 1 };
        var params38 = [];
        var id39 = scope.resolve(['value'], 0);
        params38.push(!id39);
        option37.params = params38;
        option37.fn = function (scope, buffer) {
            buffer.write('\r\n         style="display:none"\r\n         ', 0);
            return buffer;
        };
        buffer = ifCommand.call(tpl, scope, option37, buffer, 39);
        buffer.write('\r\n         onmousedown="return false;"><div\r\n            class="', 0);
        var option40 = { escape: 1 };
        var params41 = [];
        params41.push('clear-inner');
        option40.params = params41;
        var callRet42;
        callRet42 = callFnUtil(tpl, scope, option40, buffer, ['getBaseCssClasses'], 0, 43);
        if (callRet42 && callRet42.isBuffer) {
            buffer = callRet42;
            callRet42 = undefined;
        }
        buffer.write(callRet42, true);
        buffer.write('">clear</div></div>\r\n</div>\r\n', 0);
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});

KISSY.add('combobox/local-data-source', [
    'attribute',
    'util'
], function (S, require, exports, module) {
    /**
 * @ignore
 * Local dataSource for ComboBox
 * @author yiminghe@gmail.com
 */
    var Attribute = require('attribute');
    var util = require('util');    /**
 * Local dataSource for comboBox.
 * @extends KISSY.Base
 * @class KISSY.ComboBox.LocalDataSource
 */
    /**
 * Local dataSource for comboBox.
 * @extends KISSY.Base
 * @class KISSY.ComboBox.LocalDataSource
 */
    module.exports = Attribute.extend({
        /**
     * Data source interface. How to get data for comboBox.
     * @param {String} inputVal current active input's value
     * @param {Function} callback callback to notify comboBox when data is ready
     * @param {Object} context callback 's execution context
     */
        fetchData: function (inputVal, callback, context) {
            var parse = this.get('parse'), data = this.get('data');
            data = parse(inputVal, data);
            callback.call(context, data);
        }
    }, {
        ATTRS: {
            /**
         * array of static data for comboBox
         * @cfg {Object[]} data
         */
            /**
         * @ignore
         */
            data: { value: [] },
            /**
         * parse data function.
         * Defaults to: index of match.
         * @cfg {Function} parse
         */
            parse: { value: parser }
        }
    });
    function parser(inputVal, data) {
        var ret = [], count = 0;
        if (!inputVal) {
            return data;
        }
        util.each(data, function (d) {
            if (d.indexOf(inputVal) !== -1) {
                ret.push(d);
            }
            count++;
        });
        return ret;
    }
});

KISSY.add('combobox/remote-data-source', [
    'io',
    'attribute'
], function (S, require, exports, module) {
    /**
 * @ignore
 * Remote datasource for ComboBox
 * @author yiminghe@gmail.com
 */
    var IO = require('io');
    var Attribute = require('attribute');    /**
 * dataSource which wrap {@link KISSY.IO} utility.
 * @class KISSY.ComboBox.RemoteDataSource
 * @extends KISSY.Base
 */
    /**
 * dataSource which wrap {@link KISSY.IO} utility.
 * @class KISSY.ComboBox.RemoteDataSource
 * @extends KISSY.Base
 */
    module.exports = Attribute.extend({
        /**
     * Data source interface. How to get data for comboBox
     * @param {String} inputVal current active input's value
     * @param {Function} callback callback to notify comboBox when data is ready
     * @param {Object} context callback 's execution context
     */
        fetchData: function (inputVal, callback, context) {
            var self = this, v, paramName = self.get('paramName'), parse = self.get('parse'), cache = self.get('cache'), allowEmpty = self.get('allowEmpty');
            self.caches = self.caches || {};
            if (self.io) {
                // abort previous request
                self.io.abort();
                self.io = null;
            }
            if (!inputVal && allowEmpty !== true) {
                return callback.call(context, []);
            }
            if (cache) {
                if (v = self.caches[inputVal]) {
                    return callback.call(context, v);
                }
            }
            var xhrCfg = self.get('xhrCfg');
            xhrCfg.data = xhrCfg.data || {};
            xhrCfg.data[paramName] = inputVal;
            xhrCfg.success = function (data) {
                if (parse) {
                    data = parse(inputVal, data);
                }
                self.setInternal('data', data);
                if (cache) {
                    self.caches[inputVal] = data;
                }
                callback.call(context, data);
            };
            self.io = IO(xhrCfg);
            return undefined;
        }
    }, {
        ATTRS: {
            /**
         * Used as parameter name to send combobox input's value to server.
         * Defaults to: 'q'
         * @cfg  {String} paramName
         */
            /**
         * @ignore
         */
            paramName: { value: 'q' },
            /**
         * whether send empty to server when input val is empty.
         * Defaults to: false
         * @cfg {Boolean} allowEmpty
         */
            /**
         * @ignore
         */
            allowEmpty: {},
            /**
         * Whether server response data is cached.
         * Defaults to: false
         * @cfg {Boolean} cache
         */
            /**
         * @ignore
         */
            cache: {},
            /**
         * Serve as a parse function to parse server
         * response to return a valid array of data for comboBox.
         * @cfg {Function} parse
         */
            /**
         * @ignore
         */
            parse: {},
            /**
         * IO configuration.same as {@link KISSY.IO}
         * @cfg {Object} xhrCfg
         */
            /**
         * @ignore
         */
            xhrCfg: {
                valueFn: function () {
                    return {};
                }
            }
        }
    });
});
