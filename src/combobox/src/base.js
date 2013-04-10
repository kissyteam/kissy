/**
 * @ignore
 * Input wrapper for ComboBox component.
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/base", function (S, Node, Component, ComboBoxRender, Menu, undefined) {
    var ComboBox,
        $ = Node.all,
        KeyCodes = Node.KeyCodes,
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

            // user's input text
            _savedInputValue: null,

            _stopNotify: 0,

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
                this.get('input').val(value);
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
                setInvalid(self, false);
                if (placeholderEl = self.get("placeholderEl")) {
                    placeholderEl.hide();
                }
            },

            handleBlur: function () {
                var self = this,
                    placeholderEl = self.get("placeholderEl"),
                    input;
                ComboBox.superclass.handleBlur.apply(self, arguments);
                delayHide.call(self);
                input = self.get("input");
                self.validate(function (error, val) {
                    if (error) {
                        if (!self.get("focused") && val == input.val()) {
                            setInvalid(self, error);
                        }
                    } else {
                        setInvalid(self, false);
                    }
                });
                if (placeholderEl && !input.val()) {
                    placeholderEl.show();
                }
            },

            handleMouseDown: function (e) {
                var self = this,
                    input,
                    target,
                    trigger ,
                    hasTrigger;
                ComboBox.superclass.handleMouseDown.apply(self, arguments);
                target = e.target;
                trigger = self.get("trigger");
                hasTrigger = self.get('hasTrigger');
                if (hasTrigger && (trigger[0] == target || trigger.contains(target))) {
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
                    highlightedItem,
                    handledByMenu,
                    menu = getMenu(self);

                input = self.get("input");
                updateInputOnDownUp = self.get("updateInputOnDownUp");

                if (updateInputOnDownUp) {
                    // combobox will change input value
                    // but it does not need to reload data
                    if (S.inArray(e.keyCode, [
                        KeyCodes.UP,
                        KeyCodes.DOWN,
                        KeyCodes.ESC
                    ])) {
                        self._stopNotify = 1;
                    } else {
                        self._stopNotify = 0;
                    }
                }

                if (menu && menu.get("visible")) {
                    handledByMenu = menu['handleKeydown'](e);

                    // esc
                    if (e.keyCode == KeyCodes.ESC) {
                        self.set("collapsed", true);
                        if (updateInputOnDownUp) {
                            // restore original user's input text
                            self['setValueInternal'](self._savedInputValue);
                        }
                        return true;
                    }

                    highlightedItem = menu.get("highlightedItem");

                    if (updateInputOnDownUp &&
                        S.inArray(e.keyCode, [KeyCodes.DOWN, KeyCodes.UP])) {
                        // update menu's active value to input just for show
                        this.setValueInternal(highlightedItem.get("textContent"));
                    }

                    // tab
                    // if menu is open and an menuitem is highlighted, see as click/enter
                    if (e.keyCode == KeyCodes.TAB && highlightedItem) {
                        // click highlightedItem
                        highlightedItem.performActionInternal();
                        // only prevent focus change in multiple mode
                        if (self.get("multiple")) {
                            return true;
                        }
                    }

                    return handledByMenu;
                } else if (e.keyCode == KeyCodes.DOWN || e.keyCode == KeyCodes.UP) {
                    // re-fetch, consider multiple input
                    // S.log("refetch : " + getValue(self));
                    self.sendRequest(this.getValueInternal());
                    return true;
                }
                return  undefined;
            },

            syncUI: function () {
                var self = this,
                    input = self.get("input"),
                    inputValue = self.get("inputValue");
                if (inputValue != undefined) {
                    input.val(inputValue);
                }
                if (self.get("placeholder")) {
                    if (!input.val()) {
                        self.get("placeholderEl").show();
                    }
                }
            },

            validate: function (callback) {
                var self = this,
                    validator = self.get('validator'),
                    val = self.get("input").val();

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
                    view: 1
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

                xrender: {
                    value: ComboBoxRender
                }
            }
        },
        {
            xclass: 'combobox',
            priority: 10
        }
    );


    // #----------------------- private start

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
        }
    }

    function onMenuItemClick(e) {
        var item = e.target,
            self = this,
            textContent;
        if (item.isMenuItem) {
            textContent = item.get('textContent');
            // stop valuechange event
            self._stopNotify = 1;
            self['setValueInternal'](textContent);
            self._savedInputValue = textContent;
            self.set("collapsed", true);
            // valuechange interval, hack
            setTimeout(function () {
                self._stopNotify = 0;
            }, 50);
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
            cls = self.get("prefixCls") + "combobox-invalid",
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
                m = Component.create(m, self);
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
        var self = this, t;
        if (t = self._focusoutDismissTimer) {
            clearTimeout(t);
            self._focusoutDismissTimer = null;
        }
    }

    function showMenu(self) {
        var el = self.get("el"),
            menu = getMenu(self, 1);

        // 保证显示前已经 bind 好 menu 事件
        clearDismissTimer.call(self);

        if (menu && !menu.get("visible")) {
            if (self.get("matchElWidth")) {
                menu.set("width", el.innerWidth());
            }
            menu.show();
            self.get("input").attr("aria-owns", menu.get("el").attr('id'));
        }
    }

    function onValueChange() {
        var self = this,
            value;
        if (self._stopNotify) {
            return;
        }
        value = self['getValueInternal']();
        if (value === undefined) {
            self.set("collapsed", true);
            return;
        }
        self._savedInputValue = value;
        // S.log("value change: " + value);
        self.sendRequest(value);
    }

    function renderData(data) {
        var self = this,
            v,
            children = [],
            val,
            matchVal,
            i,
            menu = getMenu(self, 1);

        data = self['normalizeData'](data);

        menu.removeChildren(true);

        if (menu.get('highlightedItem')) {
            menu.get('highlightedItem').set('highlighted', false);
        }

        if (data && data.length) {
            for (i = 0; i < data.length; i++) {
                v = data[i];
                children.push(menu.addChild(v));
            }

            // make menu item (which textContent is same as input) active
            val = self['getValueInternal']();
            for (i = 0; i < children.length; i++) {
                if (children[i].get("textContent") == val) {
                    children[i].set('highlighted', true);
                    matchVal = true;
                    break;
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