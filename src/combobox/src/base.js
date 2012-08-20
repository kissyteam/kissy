/**
 * @fileOverview Input wrapper for ComboBox component.
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/base", function (S, Node, Component, ComboBoxRender, _, Menu, undefined) {
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
            win = $(S.Env.host),
            SUFFIX = 'suffix';

        function getMenu(self, init) {
            var m = self.get("menu");
            if (m && m.xclass) {
                if (init) {
                    m = Component.create(m, self);
                    self.__set("menu", m);
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

        function alignMenuImmediately(self) {
            var menu = self.get("menu");
            var align = S.clone(menu.get("align"));
            align.node = self.get("el");
            S.mix(align, ALIGN, false);
            menu.set("align", align);
        }

        function alignWithTokenImmediately(self) {
            var inputDesc = getInputDesc(self),
                tokens = inputDesc.tokens,
                menu = self.get("menu"),
                cursorPosition = inputDesc.cursorPosition,
                tokenIndex = inputDesc.tokenIndex,
                tokenCursorPosition,
                cursorOffset,
                input = self.get("input");
            tokenCursorPosition = tokens.slice(0, tokenIndex).join("").length;
            if (tokenCursorPosition > 0) {
                // behind separator
                ++tokenCursorPosition;
            }
            input.prop("selectionStart", tokenCursorPosition);
            input.prop("selectionEnd", tokenCursorPosition);
            cursorOffset = input.prop("KsCursorOffset");
            input.prop("selectionStart", cursorPosition);
            input.prop("selectionEnd", cursorPosition);
            menu.set("xy", [cursorOffset.left, cursorOffset.top]);
        }

        function reposition() {
            var self = this,
                menu = getMenu(self);
            if (menu && menu.get("visible")) {
                if (self.get("multiple") && self.get("alignWithCursor")) {
                    alignWithTokenImmediately(self);
                } else {
                    alignMenuImmediately(self);
                }
            }
        }

        var repositionBuffer = S.buffer(reposition, 50);

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
                // 先 render，监听 width 变化事件
                menu.render();
                self.bindMenu();
                // 根据 el 自动调整大小
                if (self.get("matchElWidth")) {
                    menu.set("width", el.innerWidth());
                }
                menu.show();
                reposition.call(self);
                self.get("input").attr("aria-owns", menu.get("el")[0].id);
            }
        }

        function valInAutoCompleteList(inputVal, _saveData) {
            var valid = false;
            if (_saveData) {
                for (var i = 0; i < _saveData.length; i++) {
                    if (_saveData[i].textContent == inputVal) {
                        return _saveData[i];
                    }
                }
            }
            return valid;
        }

        /**
         * @name ComboBox
         * @extends Component.Controller
         * @class
         * KISSY ComboBox.
         * xclass: 'combobox'.
         */
        ComboBox = Component.Controller.extend(
            /**
             * @lends ComboBox#
             */
            {

                // user's input text
                _savedInputValue: null,

                _stopNotify: 0,

                bindUI: function () {
                    var self = this,
                        placeholderEl,
                        input = self.get("input");

                    input.on("valuechange", onValueChange, self);

                    if (self.get("invalidEl")) {
                        input.on("blur", function () {
                            if (!self.get("disabled")) {
                                self.checkValid(function (d, val) {
                                    if (val == input.val() && input[0].ownerDocument.activeElement != input[0]) {
                                        self._setInvalid(!d);
                                    }
                                });
                            }
                        });
                        input.on("focus", function () {
                            if (!self.get("disabled")) {
                                self._setInvalid(false);
                            }
                        });
                    }

                    if (placeholderEl = self.get("placeholderEl")) {
                        input.on("focus", function () {
                            if (!self.get("disabled")) {
                                placeholderEl.hide();
                            }
                        });

                        input.on("blur", function () {
                            if (!self.get("disabled")) {
                                if (!input.val()) {
                                    placeholderEl.show();
                                }
                            }
                        });
                    }

                    /**
                     * @name ComboBox#afterCollapsedChange
                     * @description fired after combobox 's collapsed attribute is changed.
                     * @event
                     * @param e
                     * @param e.newVal current value
                     * @param e.prevVal previous value
                     */

                },

                syncUI: function () {
                    if (this.get("placeholder")) {
                        var self = this,
                            input = self.get("input"),
                            inputValue = self.get("inputValue");

                        if (inputValue != undefined) {
                            input.val(inputValue);
                        }

                        if (!input.val()) {
                            self.get("placeholderEl").show();
                        }
                    }
                },

                checkValid: function (callback) {
                    var self = this,
                        val = self.get("input").val();

                    self.get("dataSource").fetchData(val, function (data) {
                        var d = valInAutoCompleteList(val, normalizeData(data, self));
                        callback(d, val);
                    });
                },

                bindMenu: function () {
                    var self = this,
                        el,
                        contentEl,
                        menu = self.get("menu");

                    menu.on("click", function (e) {
                        var item = e.target;
                        // stop valuechange event
                        self._stopNotify = 1;
                        self._selectItem(item);
                        self.set("collapsed", true);
                        setTimeout(
                            function () {
                                self._stopNotify = 0;
                            },
                            // valuechange interval
                            50
                        );
                    });

                    win.on("resize", repositionBuffer, self);

                    el = menu.get("el");
                    contentEl = menu.get("contentEl");

                    el.on("focusout", delayHide, self);
                    el.on("focusin", clearDismissTimer, self);

                    contentEl.on("mouseover", function () {
                        // trigger el focus
                        self.get("input")[0].focus();
                        // prevent menu from hiding
                        clearDismissTimer.call(self);
                    });


                    self.bindMenu = S.noop;
                },

                _uiSetHasTrigger: function (v) {
                    var self = this,
                        trigger = self.get("trigger");
                    if (v) {
                        trigger.on("click", onTriggerClick, self);
                        trigger.on("mousedown", onTriggerMouseDown);
                    } else {
                        trigger.detach("click", onTriggerClick, self);
                        trigger.detach("mousedown", onTriggerMouseDown);
                    }
                },

                _setInvalid: function (v) {
                    var self = this,
                        el = self.get("el"),
                        cls = self.get("prefixCls") + "combobox-invalid",
                        invalidEl = self.get("invalidEl");
                    if (v) {
                        el.addClass(cls);
                        invalidEl.show();
                    } else {
                        el.removeClass(cls);
                        invalidEl.hide();
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

                _uiSetCollapsed: function (v) {
                    if (v) {
                        hideMenu(this);
                    } else {
                        showMenu(this);
                    }
                },

                handleBlur: function () {
                    var self = this;
                    ComboBox.superclass.handleBlur.apply(self, arguments);
                    delayHide.call(self);
                },

                handleKeyEventInternal: function (e) {
                    var self = this,
                        input = self.get("input"),
                        menu = getMenu(self);

                    if (!menu) {
                        return;
                    }

                    var updateInputOnDownUp = self.get("updateInputOnDownUp");

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

                    var activeItem;

                    if (menu.get("visible")) {
                        var handledByMenu = menu.handleKeydown(e);

                        if (updateInputOnDownUp) {
                            if (S.inArray(e.keyCode, [KeyCodes.DOWN, KeyCodes.UP])) {
                                // update menu's active value to input just for show
                                setValue(self, menu.get("activeItem").get("textContent"));
                            }
                        }
                        // esc
                        if (e.keyCode == KeyCodes.ESC) {
                            self.set("collapsed", true);
                            if (updateInputOnDownUp) {
                                // restore original user's input text
                                setValue(self, self._savedInputValue);
                            }
                            return true;
                        }

                        // tab
                        // if menu is open and an menuitem is highlighted, see as click/enter
                        if (e.keyCode == KeyCodes.TAB) {
                            if (activeItem = menu.get("activeItem")) {
                                activeItem.performActionInternal();
                                // only prevent focus change in multiple mode
                                if (self.get("multiple")) {
                                    return true;
                                }
                            }
                        }
                        return handledByMenu;
                    } else if ((e.keyCode == KeyCodes.DOWN || e.keyCode == KeyCodes.UP)) {
                        // re-fetch , consider multiple input
                        S.log("refetch : " + getValue(self));
                        self.sendRequest(getValue(self));
                        return true;
                    }
                },

                _selectItem: function (item) {
                    var self = this;
                    if (item) {
                        var textContent = item.get("textContent"),
                            separatorType = self.get("separatorType");
                        setValue(self, textContent + (separatorType == SUFFIX ? "" : " "));
                        self._savedInputValue = textContent;
                        /**
                         * @name ComboBox#click
                         * @description fired when user select from suggestion list (bubbled from menuItem)
                         * @event
                         * @param e
                         * @param e.target Selected menuItem
                         */
                    }
                },

                getInputValue: function () {
                    return this.get("input").val();
                },

                destructor: function () {
                    win.detach("resize", repositionBuffer, this);
                }
            },
            {
                ATTRS: /**
                 * @lends ComboBox#
                 */
                {

                    /**
                     * Input element of current combobox.
                     * @type {NodeList}
                     */
                    input: {
                        view: 1
                    },

                    /**
                     * trigger arrow element
                     */
                    trigger: {
                        view: 1
                    },

                    /**
                     * placeholder
                     */
                    placeholder: {
                        view: 1
                    },

                    /**
                     * label for placeholder in ie
                     * @private
                     */
                    placeholderEl: {
                        view: 1
                    },


                    /**
                     * whether combobox validates and message when invalidate fails
                     */
                    invalidMessage: {
                        view: 1
                    },

                    /**
                     * invalid tag el
                     */
                    invalidEl: {
                        view: 1
                    },

                    /**
                     * @protected
                     */
                    allowTextSelection: {
                        value: true
                    },

                    /**
                     * Whether show combobox trigger.
                     * @default true.
                     * @type {Boolean}
                     */
                    hasTrigger: {
                        view: 1
                    },

                    /**
                     * ComboBox dropDown menuList
                     * @type {Menu.PopupMenu}
                     */
                    menu: {
                        value: {
                            xclass: 'popupmenu'
                        },
                        setter: function (m) {
                            if (m instanceof Component.Controller) {
                                m.__set("parent", this);
                            }
                        }
                    },

                    /**
                     * Whether combobox menu is hidden.
                     * @type {Boolean}
                     */
                    collapsed: {
                        view: 1
                    },

                    /**
                     * dataSource for comboBox.
                     * @type {ComboBox.LocalDataSource|ComboBox.RemoteDataSource|Object}
                     */
                    dataSource: {
                        // 和 input 关联起来，input可以有很多，每个数据源可以不一样，但是 menu 共享
                        setter: function (c) {
                            return Component.create(c);
                        }
                    },

                    /**
                     * maxItemCount max count of data to be shown
                     * @type {Number}
                     */
                    maxItemCount: {
                        value: 99999
                    },

                    /**
                     * Whether drop down menu is same width with input.
                     * @default true.
                     * @type {Boolean}
                     */
                    matchElWidth: {
                        value: true
                    },

                    /**
                     * Format function to return array of
                     * html/text/menu item attributes from array of data.
                     * @type {Function}
                     */
                    format: {
                    },

                    /**
                     * Whether allow multiple input,separated by separator
                     * @default false
                     * @type {Boolean}
                     */
                    multiple: {
                    },

                    /**
                     * Separator chars used to separator multiple inputs.
                     * @default ;,
                     * @type {String}
                     */
                    separator: {
                        value: ",;"
                    },

                    /**
                     * Separator type.
                     * After value( 'suffix' ) or before value( 'prefix' ).
                     * @type {String}
                     */
                    separatorType: {
                        value: SUFFIX
                    },

                    /**
                     * Whether whitespace is part of toke value.
                     * Default true
                     * @type {Boolean}
                     * @private
                     */
                    whitespace: {
                        valueFn: function () {
                            return this.get("separatorType") == SUFFIX;
                        }
                    },

                    /**
                     * Whether update input's value at keydown or up when combobox menu shows.
                     * Default true
                     * @type {Boolean}
                     */
                    updateInputOnDownUp: {
                        value: true
                    },

                    /**
                     * If separator wrapped by literal chars,separator become normal chars.
                     * @default "
                     * @type {String}
                     */
                    literal: {
                        value: "\""
                    },

                    /**
                     * Whether align menu with individual token after separated by separator.
                     * @default false
                     * @type {Boolean}
                     */
                    alignWithCursor: {
                    },

                    /**
                     * Whether or not the first row should be highlighted by default.
                     * @default false
                     * @type {Boolean}
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


        function setValue(self, value) {
            var input = self.get("input");
            if (self.get("multiple")) {
                var inputDesc = getInputDesc(self),
                    tokens = inputDesc.tokens,
                    tokenIndex = Math.max(0, inputDesc.tokenIndex),
                    separator = self.get("separator"),
                    cursorPosition,
                    separatorType = self.get("separatorType"),
                    token = tokens[tokenIndex];

                if (token && separator.indexOf(token.charAt(0)) != -1) {
                    tokens[tokenIndex] = token.charAt(0);
                } else {
                    tokens[tokenIndex] = "";
                }

                tokens[tokenIndex] += value;

                var nextToken = tokens[tokenIndex + 1];

                // appendSeparatorOnComplete if next token does not start with separator
                if (separatorType == SUFFIX && (!nextToken || separator.indexOf(nextToken.charAt(0)) == -1 )) {
                    tokens[tokenIndex] += separator.charAt(0);
                }

                cursorPosition = tokens.slice(0, tokenIndex + 1).join("").length;

                input.val(tokens.join(""));

                input.prop("selectionStart", cursorPosition);
                input.prop("selectionEnd", cursorPosition);
            } else {
                input.val(value);
            }
        }


        /**
         * Consider multiple mode , get token at current cursor position
         */
        function getValue(self) {
            var input = self.get("input"),
                inputVal = input.val();
            if (self.get("multiple")) {
                var inputDesc = getInputDesc(self);
                var tokens = inputDesc.tokens,
                    tokenIndex = inputDesc.tokenIndex;
                var separator = self.get("separator");
                var separatorType = self.get("separatorType");
                var token = tokens[tokenIndex] || "";
                // only if token starts with separator , then token has meaning!
                // token can not be empty
                if (token && separator.indexOf(token.charAt(0)) != -1) {
                    // remove separator
                    return token.substring(1);
                }
                // cursor is at the beginning of textarea
                if (separatorType == SUFFIX && (tokenIndex == 0 || tokenIndex == -1)) {
                    return token;
                }
                return undefined;
            } else {
                return inputVal;
            }
        }


        function onValueChange() {
            var self = this;
            if (self._stopNotify) {
                return;
            }
            var value = getValue(self);
            if (value === undefined) {
                self.set("collapsed", true);
                return;
            }
            self._savedInputValue = value;
            S.log("value change: " + value);
            self.sendRequest(value);
        }

        function normalizeData(data, self) {
            var contents, v, i, c;
            if (data && data.length) {
                data = data.slice(0, self.get("maxItemCount"));
                if (self.get("format")) {
                    contents = self.get("format").call(self, getValue(self), data);
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
        }

        function renderData(data) {

            var self = this,
                v,
                children = [],
                val,
                matchVal,
                i,
                menu = getMenu(self, 1);

            data = normalizeData(data, self);

            menu.removeChildren(true);

            if (data && data.length) {
                for (i = 0; i < data.length; i++) {
                    v = data[i];
                    children.push(menu.addChild(S.mix({
                        xclass: 'menuitem'
                    }, v)));
                }

                // make menu item (which textContent is same as input) active
                val = getValue(self);
                for (i = 0; i < children.length; i++) {
                    if (children[i].get("textContent") == val) {
                        menu.set("highlightedItem", children[i]);
                        matchVal = true;
                        break;
                    }
                }
                // Whether or not the first row should be highlighted by default.
                if (!matchVal && self.get("autoHighlightFirst")) {
                    for (i = 0; i < children.length; i++) {
                        if (!children[i].get("disabled")) {
                            menu.set("highlightedItem", children[i]);
                            break;
                        }
                    }
                }
                self.set("collapsed", false);
            } else {
                self.set("collapsed", true);
            }
        }

        function onTriggerClick() {
            if (!this.get("disabled")) {
                var self = this,
                    input = self.get("input");
                if (!self.get('collapsed')) {
                    self.set('collapsed', true);
                } else {
                    input[0].focus();
                    self.sendRequest('');
                }
            }
        }

        function onTriggerMouseDown(e) {
            e.preventDefault();
        }

        function getInputDesc(self) {
            var input = self.get("input"),
                inputVal = input.val(),
                tokens = [],
                cache = [],
                literal = self.get("literal"),
                separator = self.get("separator"),
                inLiteral = false,
                whitespace = self.get("whitespace"),
                cursorPosition = input.prop('selectionStart'),
                tokenIndex = -1;

            for (var i = 0; i < inputVal.length; i++) {
                var c = inputVal.charAt(i);
                if (i == cursorPosition) {
                    // current token index
                    tokenIndex = tokens.length;
                }
                if (!inLiteral) {
                    // whitespace is not part of token value
                    // then separate
                    if (!whitespace && /\s|\xa0/.test(c)) {
                        tokens.push(cache.join(""));
                        cache = [];
                    }

                    if (separator.indexOf(c) != -1) {
                        tokens.push(cache.join(""));
                        cache = [];
                    }
                }
                if (literal) {
                    if (c == literal) {
                        inLiteral = !inLiteral;
                    }
                }
                cache.push(c);
            }

            if (cache.length) {
                tokens.push(cache.join(""));
            }
            if (tokenIndex == -1) {
                tokenIndex = tokens.length - 1;
            }
            return {
                tokens: tokens,
                cursorPosition: cursorPosition,
                tokenIndex: tokenIndex
            };
        }

        // #------------------------private end

        return ComboBox;
    }

    ,
    {
        requires: [
            'node',
            'component',
            './render',
            'input-selection',
            'menu'
        ]
    }
)
;

/**
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