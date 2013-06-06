/**
 * @ignore
 * Input wrapper for ComboBox component.
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/base", function (S, Node, Component, ComboBoxRender, Menu, undefined) {
    var ComboBox,
        $ = Node.all,
        KeyCode = Node.KeyCode,
        ALIGN = {
            points: ["bl", "tl"],
            overflow: {
                adjustX: 1,
                adjustY: 1
            }
        },
        win = $(S.Env.host);

    /**
     * KISSY ComboBox.
     * xclass: 'combobox'.
     * @extends KISSY.Component.Controller
     * @class KISSY.ComboBox
     */
    ComboBox = Component.Controller.extend({

            // user's input text.
            // for restore after press esc key
            // if update input when press down or up key
            _savedInputValue: null,

            /**
             * normalize returned data
             * @protected
             * @param data
             */
            'normalizeData': function (data) {
                var self = this,
                    contents, v, i, c;
                if (data && data.length) {
                    data = data.slice(0, self.get("maxItemCount"));
                    if (self.get("format")) {
                        contents = self.get("format").call(self, self['getValueInternal'](), data);
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
                    input = self.get("input");

                input.on("valuechange", onValueChange, self);

                /**
                 * fired after combobox 's collapsed attribute is changed.
                 * @event afterCollapsedChange
                 * @param e
                 * @param e.newVal current value
                 * @param e.prevVal previous value
                 */

                self.on('click', onMenuItemClick, self);

                // need a handler for each instance
                // or else will not register duplicate handler
                win.on("resize", self.__repositionBuffer = S.buffer(reposition, 50), self);

                self.on('afterRenderUI', onMenuAfterRenderUI, self);
            },

            /**
             * get value
             * @protected
             */
            getValueInternal: function () {
                return this.get('input').val();
            },

            /**
             * set value
             * @protected
             * @method
             * @member KISSY.ComboBox
             */
            setValueInternal: function (value) {
                this.set('inputValue', value);
            },

            // buffer/bridge between check timer and change logic
            '_onSetInputValue': function (v, e) {
                // only trigger menu when timer cause change
                if (e.causeByTimer) {
                    var self = this,
                        value;
                    value = self['getValueInternal']();
                    if (value === undefined) {
                        self.set("collapsed", true);
                        return;
                    }
                    self._savedInputValue = value;
                    // S.log("value change: " + value);
                    self.sendRequest(value);
                }
            },

            /**
             * align menu
             * @protected
             */
            'alignInternal': function () {
                var self = this,
                    menu = self.get("menu"),
                    align = menu.get("align");
                delete align.node;
                align = S.clone(align);
                align.node = self.get("el");
                S.mix(align, ALIGN, false);
                menu.set("align", align);
            },

            handleFocus: function () {
                var self = this,
                    placeholderEl;
                if (self.get('invalidEl')) {
                    setInvalid(self, false);
                }
                if (placeholderEl = self.get("placeholderEl")) {
                    placeholderEl.hide();
                }
            },

            handleBlur: function () {
                var self = this,
                    placeholderEl = self.get("placeholderEl"),
                    input = self.get("input");
                ComboBox.superclass.handleBlur.apply(self, arguments);
                delayHide.call(self);
                if (self.get('invalidEl')) {
                    self.validate(function (error, val) {
                        if (error) {
                            if (!self.get("focused") && val == input.val()) {
                                setInvalid(self, error);
                            }
                        } else {
                            setInvalid(self, false);
                        }
                    });
                }
                if (placeholderEl && !input.val()) {
                    placeholderEl.show();
                }
            },

            handleMouseDown: function (e) {
                var self = this,
                    input,
                    target,
                    trigger;
                ComboBox.superclass.handleMouseDown.apply(self, arguments);
                target = e.target;
                trigger = self.get("trigger");
                if (trigger && (trigger[0] == target || trigger.contains(target))) {
                    input = self.get("input");
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

            handleKeyEventInternal: function (e) {
                var self = this,
                    updateInputOnDownUp,
                    input,
                    keyCode = e.keyCode,
                    highlightedItem,
                    handledByMenu,
                    menu = getMenu(self);

                input = self.get("input");
                updateInputOnDownUp = self.get("updateInputOnDownUp");

                if (menu && menu.get("visible")) {

                    highlightedItem = menu.get("highlightedItem");

                    // https://github.com/kissyteam/kissy/issues/371
                    // combobox: input should be involved in key press sequence
                    if (updateInputOnDownUp && highlightedItem) {
                        var menuChildren = menu.get('children');
                        if (keyCode == KeyCode.DOWN &&
                            highlightedItem == getFirstEnabledItem(menuChildren.concat().reverse())
                            ||
                            keyCode == KeyCode.UP &&
                                highlightedItem == getFirstEnabledItem(menuChildren)
                            ) {
                            self.setValueInternal(self._savedInputValue);
                            highlightedItem.set('highlighted', false);
                            return true;
                        }
                    }

                    handledByMenu = menu['handleKeydown'](e);

                    highlightedItem = menu.get("highlightedItem");

                    // esc
                    if (keyCode == KeyCode.ESC) {
                        self.set("collapsed", true);
                        if (updateInputOnDownUp) {
                            // combobox will change input value
                            // but it does not need to reload data
                            // restore original user's input text
                            self.setValueInternal(self._savedInputValue);
                        }
                        return true;
                    }

                    if (updateInputOnDownUp &&
                        S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP])) {
                        // update menu's active value to input just for show
                        self.setValueInternal(highlightedItem.get("textContent"));
                    }

                    // tab
                    // if menu is open and an menuitem is highlighted, see as click/enter
                    if (keyCode == KeyCode.TAB && highlightedItem) {
                        // click highlightedItem
                        highlightedItem.performActionInternal();
                        // only prevent focus change in multiple mode
                        if (self.get("multiple")) {
                            return true;
                        }
                    }

                    return handledByMenu;
                } else if (keyCode == KeyCode.DOWN || keyCode == KeyCode.UP) {
                    // re-fetch, consider multiple input
                    // S.log("refetch : " + getValue(self));
                    var v = self.getValueInternal();
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
                    val = self.getValueInternal();

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
                    dataSource = self.get("dataSource");
                dataSource.fetchData(value, renderData, self);
            },

            _onSetCollapsed: function (v) {
                var self = this;
                if (v) {
                    hideMenu(self);
                } else {
                    showMenu(self);
                }
            },

            destructor: function () {
                var self = this,
                    repositionBuffer = self.__repositionBuffer;
                if (repositionBuffer) {
                    win.detach("resize", repositionBuffer, self);
                    repositionBuffer.stop();
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
                    view: 1
                },

                /**
                 * initial value for input
                 * @cfg {String} inputValue
                 */
                /**
                 * @ignore
                 */
                inputValue: {
                    value: '',
                    sync: 0,
                    view: 1
                },

                /**
                 * trigger arrow element
                 * @ignore
                 */
                trigger: {
                    view: 1
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
                    view: 1
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
                    view: 1
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
                    value: {},
                    setter: function (m) {
                        if (m && m.isController) {
                            m.setInternal('parent', this);
                        }
                    }
                },

                defaultChildCfg: {
                    value: {
                        xclass: 'popupmenu'
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
                    sync: 0
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
            }
        },
        {
            xclass: 'combobox'
        }
    );


    // #----------------------- private start

    function getFirstEnabledItem(children) {
        for (var i = 0; i < children.length; i++) {
            if (!children[i].get('disabled')) {
                return children[i];
            }
        }
        return null;
    }

    function onMenuAfterRenderUI(e) {
        var self = this,
            el,
            contentEl,
            menu = self.get("menu");
        if (e.target == menu) {
            el = menu.get("el");
            contentEl = menu.get("contentEl");
            // menu has input!
            el.on("focusout", delayHide, self);
            el.on("focusin", clearDismissTimer, self);
            contentEl.on("mouseover", onMenuMouseOver, self);
            // cause valuechange
            // if click menuitem while chinese input is open(xu -> '')
            contentEl.on('mousedown', function () {
                self.setValueInternal(self.getValueInternal());
            });
        }
    }

    function onMenuItemClick(e) {
        var item = e.target,
            self = this,
            textContent;
        if (item.isMenuItem) {
            textContent = item.get('textContent');
            self.setValueInternal(textContent);
            self._savedInputValue = textContent;
            self.set("collapsed", true);
        }
    }

    function onMenuMouseOver() {
        var self = this;
        // trigger el focus
        self.focus();
        // prevent menu from hiding
        clearDismissTimer.call(self);
    }

    function setInvalid(self, error) {
        var el = self.get("el"),
            cls = self.get('view').getBaseCssClasses('invalid'),
            invalidEl = self.get("invalidEl");
        if (error) {
            el.addClass(cls);
            invalidEl.attr("title", error);
            invalidEl.show();
        } else {
            el.removeClass(cls);
            invalidEl.hide();
        }
    }

    function getMenu(self, init) {
        var m = self.get("menu");
        if (m && !m.isController) {
            if (init) {
                m = self.createChild(m);
                self.setInternal("menu", m);
            } else {
                return null;
            }
        }
        return m;
    }

    function hideMenu(self) {
        var menu = getMenu(self);
        if (menu) {
            menu.hide();
        }
    }

    function reposition() {
        var self = this,
            menu = getMenu(self);
        if (menu && menu.get("visible")) {
            self['alignInternal']();
        }
    }

    function delayHide() {
        var self = this;
        self._focusoutDismissTimer = setTimeout(function () {
            self.set("collapsed", true);
        }, 30);
    }

    function clearDismissTimer() {
        var self = this,
            t;
        setTimeout(function () {
            if (t = self._focusoutDismissTimer) {
                clearTimeout(t);
                self._focusoutDismissTimer = null;
            }
        }, 10);
    }

    function showMenu(self) {
        var el = self.get("el"),
            menu = getMenu(self, 1);

        // 保证显示前已经 bind 好 menu 事件
        clearDismissTimer.call(self);

        if (menu && !menu.get("visible")) {
            if (self.get("matchElWidth")) {
                menu.render();
                var menuEl = menu.get('el');
                var borderWidth =
                    (parseInt(menuEl.css('borderLeftWidth')) || 0) +
                        (parseInt(menuEl.css('borderRightWidth')) || 0);
                menu.set("width", el[0].offsetWidth - borderWidth);
            }
            menu.show();
            self.get("input").attr("aria-owns", menu.get("el").attr('id'));
        }
    }

    function onValueChange() {
        this.set('inputValue', this.get('input').val(), {
            data: {
                causeByTimer: 1
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
            menu = getMenu(self, 1);

        data = self['normalizeData'](data);

        menu.removeChildren(true);

        if (highlightedItem = menu.get('highlightedItem')) {
            highlightedItem.set('highlighted', false);
        }

        if (data && data.length) {
            for (i = 0; i < data.length; i++) {
                v = data[i];
                children.push(menu.addChild(v));
            }

            // make menu item (which textContent is same as input) active
            val = self['getValueInternal']();
            if (self.get('highlightMatchItem')) {
                for (i = 0; i < children.length; i++) {
                    if (children[i].get("textContent") == val) {
                        children[i].set('highlighted', true);
                        matchVal = true;
                        break;
                    }
                }
            }
            // Whether or not the first row should be highlighted by default.
            if (!matchVal && self.get("autoHighlightFirst")) {
                for (i = 0; i < children.length; i++) {
                    if (!children[i].get("disabled")) {
                        children[i].set('highlighted', true);
                        break;
                    }
                }
            }
            self.set("collapsed", false);
            // 2012-12-28: in case autocomplete list becomes shorted or longer
            reposition.call(self);
        } else {
            self.set("collapsed", true);
        }
    }

    // #------------------------private end

    return ComboBox;
}, {
    requires: [
        'node',
        'component/base',
        './render',
        'menu'
    ]
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