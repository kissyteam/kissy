/**
 * @ignore
 * Input wrapper for ComboBox component.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Node = require('node');
    var Control = require('component/control');
    var ComboBoxRender = require('./render');
    // provide popupmenu xclass
    require('menu');

    var ComboBox,
        KeyCode = Node.KeyCode;

    /**
     * KISSY ComboBox.
     * xclass: 'combobox'.
     * @extends KISSY.Component.Control
     * @class KISSY.ComboBox
     */
    ComboBox = Control.extend([], {
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

            /**
             * normalize returned data
             * @protected
             * @param data
             */
            'normalizeData': function (data) {
                var self = this,
                    contents, v, i, c;
                if (data && data.length) {
                    data = data.slice(0, self.get('maxItemCount'));
                    if (self.get('format')) {
                        contents = self.get('format').call(self,
                            self.getValueForAutocomplete(), data);
                    } else {
                        contents = [];
                    }
                    for (i = 0; i < data.length; i++) {
                        v = data[i];
                        c = contents[i] = S.mix({
                            content: v,
                            textContent: v,
                            value: v
                        }, contents[i]);
                    }
                    return contents;
                }
                return contents;
            },

            bindUI: function () {
                var self = this,
                    input = self.get('input');

                input.on('valuechange', onValueChange, self);

                /**
                 * fired after combobox 's collapsed attribute is changed.
                 * @event afterCollapsedChange
                 * @param e
                 * @param e.newVal current value
                 * @param e.prevVal previous value
                 */

                self.on('click', onMenuItemClick, self);

                self.get('menu').onRendered(function (menu) {
                    onMenuAfterRenderUI(self, menu);
                });
            },

            destructor: function () {
                this.get('menu').destroy();
            },

            /**
             * get value
             * @protected
             */
            getValueForAutocomplete: function () {
                return this.get('value');
            },

            /**
             * set value
             * @protected
             * @method
             * @member KISSY.ComboBox
             */
            setValueFromAutocomplete: function (value, setCfg) {
                this.set('value', value, setCfg);
            },

            // buffer/bridge between check timer and change logic
            '_onSetValue': function (v, e) {
                var self = this,
                    value;
                // only trigger menu when timer cause change
                if (e.causedByTimer) {
                    value = self.getValueForAutocomplete();
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
                    target,
                    trigger;
                self.callSuper(e);
                target = e.target;
                trigger = self.get('trigger');
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
                            self.setValueFromAutocomplete(self._savedValue);
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
                            self.setValueFromAutocomplete(self._savedValue);
                        }
                        return true;
                    }

                    if (updateInputOnDownUp &&
                        S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP])) {
                        // update menu's active value to input just for show
                        self.setValueFromAutocomplete(highlightedItem.get('textContent'));
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
                    var v = self.getValueForAutocomplete();
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
                    val = self.getValueForAutocomplete();

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
                                (parseInt(menuEl.css('borderLeftWidth')) || 0) +
                                (parseInt(menuEl.css('borderRightWidth')) || 0);
                            menu.set('width', el[0].offsetWidth - borderWidth);
                        }
                        menu.show();
                    }
                }
            }
        },
        {
            ATTRS: {

                /**
                 * Input element of current combobox.
                 * @type {KISSY.NodeList}
                 * @property input
                 */
                /**
                 * @ignore
                 */
                input: {
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
                    view: 1
                },

                /**
                 * trigger arrow element
                 * @ignore
                 */
                trigger: {
                },

                /**
                 * placeholder
                 * @cfg {String} placeholder
                 */
                /**
                 * @ignore
                 */
                placeholder: {
                    view: 1
                },


                /**
                 * label for placeholder in ie
                 * @ignore
                 */
                placeholderEl: {
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
                    view: 1
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
                    value: {
                    },
                    getter: function (v) {
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
                            S.mix(m.get('align'), align, false);
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
                    view: 1,
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
                },

                xrender: {
                    value: ComboBoxRender
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
        var combobox = this;
        delayHide(combobox);
    }

    function onMenuFocusin() {
        var combobox = this;
        // different event sequence
        // ie fire focusin blur
        // others fire blur focusin
        setTimeout(function () {
            clearDismissTimer(combobox);
        }, 0);
    }

    function onMenuMouseOver() {
        var combobox = this;
        // trigger el focus
        combobox.focus();
        // prevent menu from hiding
        clearDismissTimer(combobox);
    }

    function onMenuMouseDown() {
        var combobox = this;
        // consider multi-input
        // input.val(self.get('value'));
        // force change event for cursor keep
        combobox.setValueFromAutocomplete(combobox.getValueForAutocomplete(), {
            force: 1
        });
    }

    function onMenuAfterRenderUI(self, menu) {
        var contentEl;
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
    }

    function onMenuItemClick(e) {
        var item = e.target,
            self = this,
            textContent;
        if (item.isMenuItem) {
            textContent = item.get('textContent');
            self.setValueFromAutocomplete(textContent);
            self._savedValue = textContent;
            self.set('collapsed', true);
        }
    }

    function setInvalid(self, error) {
        var $el = self.$el,
            cls = self.view.getBaseCssClasses('invalid'),
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
        this.set('value', e.newVal, {
            data: {
                causedByTimer: 1
            }
        });
    }

    function renderData(data) {
        var self = this,
            v,
            children = [],
            val,
            matchVal,
            highlightedItem,
            i,
            menu = self.get('menu');

        data = self.normalizeData(data);

        menu.removeChildren(true);

        if ((highlightedItem = menu.get('highlightedItem'))) {
            highlightedItem.set('highlighted', false);
        }

        if (data && data.length) {
            for (i = 0; i < data.length; i++) {
                v = data[i];
                menu.addChild(v);
            }

            children = menu.get('children');

            // make menu item (which textContent is same as input) active
            val = self.getValueForAutocomplete();

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
            if (!matchVal && ( self.get('autoHighlightFirst'))) {
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

    return ComboBox;
});

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