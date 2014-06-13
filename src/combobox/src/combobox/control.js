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
var ComboboxTpl = require('./combobox-xtpl');
// provide popupmenu xclass
require('menu');

var ComboBox,
    KeyCode = $.Event.KeyCode;

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
        this.publish('afterRenderData', {
            bubbles: false
        });
    },

    // user's input text.
    // for restore after press esc key
    // if update input when press down or up key
    _savedValue: null,

    bindUI: function () {
        var self = this,
            input = self.get('input');

        input.on('input', onValueChange, self);

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
        var self = this,
            contents, v, i, c;
        if (data && data.length) {
            data = data.slice(0, self.get('maxItemCount'));
            if (self.get('format')) {
                contents = self.get('format').call(self,
                    self.getCurrentValue(), data);
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
        var self = this,
            clearEl = self.get('clearEl'),
            value;
        // only trigger menu when timer cause change
        if (e.causedByInputEvent) {
            value = self.getCurrentValue();
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
    },

    handleFocusInternal: function () {
        var self = this,
            placeholderEl;
        clearDismissTimer(self);
        if (self.get('invalidEl')) {
            setInvalid(self, false);
        }
        if ((placeholderEl = self.get('placeholderEl'))) {
            placeholderEl.hide();
        }
    },

    handleBlurInternal: function (e) {
        var self = this,
            placeholderEl = self.get('placeholderEl');
        self.callSuper(e);
        delayHide(self);
        if (self.get('invalidEl')) {
            self.validate(function (error, val) {
                if (error) {
                    if (!self.get('focused') && (val === self.get('value'))) {
                        setInvalid(self, error);
                    }
                } else {
                    setInvalid(self, false);
                }
            });
        }
        if (placeholderEl && !self.get('value')) {
            placeholderEl.show();
        }
    },

    handleMouseDownInternal: function (e) {
        var self = this,
            target, clearEl, trigger;
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
            self.get('input').val('');
            // re send request
            self.setCurrentValue('', {
                data: {
                    causedByInputEvent: 1
                }
            });
            clearEl.hide();
        }
    },

    handleKeyDownInternal: function (e) {
        var self = this,
            updateInputOnDownUp,
            input,
            keyCode = e.keyCode,
            highlightedItem,
            handledByMenu,
            menu = self.get('menu');

        input = self.get('input');
        updateInputOnDownUp = self.get('updateInputOnDownUp');

        if (menu.get('visible')) {

            highlightedItem = menu.get('highlightedItem');

            // https://github.com/kissyteam/kissy/issues/371
            // combobox: input should be involved in key press sequence
            if (updateInputOnDownUp && highlightedItem) {
                var menuChildren = menu.get('children');
                if (keyCode === KeyCode.DOWN &&
                    highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse()) ||
                    keyCode === KeyCode.UP &&
                    highlightedItem === getFirstEnabledItem(menuChildren)
                    ) {
                    self.setCurrentValue(self._savedValue);
                    highlightedItem.set('highlighted', false);
                    return true;
                }
            }

            handledByMenu = menu.handleKeyDownInternal(e);

            highlightedItem = menu.get('highlightedItem');

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

            if (updateInputOnDownUp &&
                util.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP])) {
                // update menu's active value to input just for show
                self.setCurrentValue(highlightedItem.get('textContent'));
            }

            // tab
            // if menu is open and an menuitem is highlighted, see as click/enter
            if (keyCode === KeyCode.TAB && highlightedItem) {
                // click highlightedItem
                highlightedItem.handleClickInternal(e);
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
        return  undefined;
    },

    validate: function (callback) {
        var self = this,
            validator = self.get('validator'),
            val = self.getCurrentValue();

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
        var self = this,
            dataSource = self.get('dataSource');
        dataSource.fetchData(value, renderData, self);
    },

    getKeyEventTarget: function () {
        return this.get('input');
    },

    _onSetCollapsed: function (v) {
        var self = this,
            el = self.$el,
            menu = self.get('menu');
        if (v) {
            menu.hide();
        } else {
            // 保证显示前已经 bind 好 menu 事件
            clearDismissTimer(self);
            if (!menu.get('visible')) {
                if (self.get('matchElWidth')) {
                    menu.render();
                    var menuEl = menu.get('el');
                    var borderWidth =
                        (parseInt(menuEl.css('borderLeftWidth'), 10) || 0) +
                        (parseInt(menuEl.css('borderRightWidth'), 10) || 0);
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
        contentTpl: {
            value: ComboboxTpl
        },

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
                return ('.' + this.getBaseCssClass('input'));
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
                return ('.' + this.getBaseCssClass('placeholder'));
            }
        },

        clearEl: {
            selector: function () {
                return ('.' + this.getBaseCssClass('clear'));
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
        validator: {
        },

        /**
         * invalid tag el
         * @ignore
         */
        invalidEl: {
            selector: function () {
                return '.' + this.getBaseCssClass('invalid-el');
            }
        },

        allowTextSelection: {
            value: true
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
                        points: ['bl', 'tl'],
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
        dataSource: {
            // 和 input 关联起来，input可以有很多，每个数据源可以不一样，但是 menu 共享
        },

        /**
         * maxItemCount max count of data to be shown
         * @cfg {Number} maxItemCount
         */
        /**
         * @ignore
         */
        maxItemCount: {
            value: 99999
        },

        /**
         * Whether drop down menu is same width with input.
         * Defaults to: true.
         * @cfg {Boolean} matchElWidth
         */
        /**
         * @ignore
         */
        matchElWidth: {
            value: true
        },

        /**
         * Format function to return array of
         * html/text/menu item attributes from array of data.
         * @cfg {Function} format
         */
        /**
         * @ignore
         */
        format: {
        },

        /**
         * Whether update input's value at keydown or up when combobox menu shows.
         * Default to: true
         * @cfg {Boolean} updateInputOnDownUp
         */
        /**
         * @ignore
         */
        updateInputOnDownUp: {
            value: true
        },

        /**
         * Whether or not the first row should be highlighted by default.
         * Defaults to: false
         * @cfg {Boolean} autoHighlightFirst
         */
        /**
         * @ignore
         */
        autoHighlightFirst: {
        },

        /**
         * whether highlight item when item content is same with user input.
         * Defaults to: true
         * @cfg {Boolean} highlightMatchItem
         */
        /**
         * @ignore
         */
        highlightMatchItem: {
            value: true
        }
    },
    xclass: 'combobox'
});

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
    var self = this;
    // different event sequence
    // ie fire focusin blur
    // others fire blur focusin
    setTimeout(function () {
        clearDismissTimer(self);
    }, 0);
}

function onMenuMouseOver() {
    var self = this;
    // trigger el focus
    self.focus();
    // prevent menu from hiding
    clearDismissTimer(self);
}

function onMenuMouseDown() {
    var self = this;
    // consider multi-input
    // input.val(self.get('value'));
    // force change event for cursor keep
    self.setCurrentValue(self.getCurrentValue(), {
        force: 1
    });
}

function onMenuAfterRenderUI(e) {
    var self = this,
        contentEl;
    var menu = self.get('menu');
    if (!e || menu === e.target) {
        var input = self.get('input');
        var el = menu.get('el');
        contentEl = menu.get('contentEl');
        input.attr('aria-owns', el.attr('id'));
        // menu has input!
        el.on('focusout', onMenuFocusout, self);
        el.on('focusin', onMenuFocusin, self);
        contentEl.on('mouseover', onMenuMouseOver, self);
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
        var borderWidth = (parseInt(menuEl.css('borderLeftWidth'), 10) || 0) +
            (parseInt(menuEl.css('borderRightWidth'), 10) || 0);
        menu.set('width', el[0].offsetWidth - borderWidth);
    }
}

function onMenuItemClick(e) {
    var item = e.target,
        self = this,
        textContent;
    if (item.isMenuItem) {
        textContent = item.get('textContent');
        self.setCurrentValue(textContent);
        self._savedValue = textContent;
        self.set('collapsed', true);
    }
}

function setInvalid(self, error) {
    var $el = self.$el,
        cls = self.getBaseCssClasses('invalid'),
        invalidEl = self.get('invalidEl');
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
        },
        // ie6 needs longer timeout
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
    this.setCurrentValue(e.target.value, {
        data: {
            causedByInputEvent: 1
        }
    });
}

function renderData(data) {
    var self = this,
        start,
        children = [],
        val,
        matchVal,
        i,
        menu = self.get('menu');

    data = self.normalizeData(data);

    menu.removeChildren(true);

    if (data && data.length) {
        start = util.now();
        menu.addChildren(data);
        logger.info('render menu cost: ' + (util.now() - start) + ' ms');

        children = menu.get('children');

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
        }

        // Whether or not the first row should be highlighted by default.
        if (!matchVal && self.get('autoHighlightFirst')) {
            for (i = 0; i < children.length; i++) {
                if (!children[i].get('disabled')) {
                    children[i].set('highlighted', true);
                    break;
                }
            }
        }
        self.set('collapsed', false);
        // after menu is rendered
        self.fire('afterRenderData');
    } else {
        self.set('collapsed', true);
    }
}

// #------------------------private end

module.exports = ComboBox;

/**
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