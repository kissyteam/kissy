/**
 * @ignore
 * @fileOverview Input wrapper for ComboBox component.
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/base", function (S, cursor, Node, Component, ComboBoxRender,Menu, undefined) {
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
            normalizeData: function (data) {
                var self = this, contents, v, i, c;
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

            },

            handleFocus: function () {
                var self = this, placeholderEl;
                setInvalid(self, false);
                if (placeholderEl = self.get("placeholderEl")) {
                    placeholderEl.hide();
                }
            },

            handleBlur: function () {
                var self = this;
                ComboBox.superclass.handleBlur.apply(self, arguments);
                delayHide.call(self);
                var placeholderEl,
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
                if ((placeholderEl = self.get("placeholderEl")) && !input.val()) {
                    placeholderEl.show();
                }
            },

            handleMouseDown: function (e) {
                ComboBox.superclass.handleMouseDown.apply(this, arguments);
                var self = this,
                    input,
                    target = e.target,
                    trigger = self.get("trigger"),
                    hasTrigger = self.get('hasTrigger');
                if (hasTrigger && (trigger[0] == target || trigger.contains(target))) {
                    input = self.get("input");
                    if (!self.get('collapsed')) {
                        self.set('collapsed', true);
                    } else {
                        input[0].focus();
                        self.sendRequest('');
                    }
                    e.preventDefault();
                }
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

            bindMenu: function () {
                var self = this,
                    el,
                    contentEl,
                    menu = self.get("menu");

                menu.on("click", function (e) {
                    var item = e.target;
                    // stop valuechange event
                    self._stopNotify = 1;
                    selectItem(self, item);
                    self.set("collapsed", true);
                    setTimeout(
                        function () {
                            self._stopNotify = 0;
                        },
                        // valuechange interval
                        50
                    );
                });

                self.__repositionBuffer = S.buffer(reposition, 50);

                win.on("resize", self.__repositionBuffer, self);

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
                if (v) {
                    hideMenu(this);
                } else {
                    showMenu(this);
                }
            },

            destructor: function () {
                var self = this;
                win.detach("resize", self.__repositionBuffer, this);
                self.__repositionBuffer.stop();
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
                    value: {
                        xclass: 'popupmenu'
                    },
                    setter: function (m) {
                        if (m instanceof Component.Controller) {
                            m.setInternal("parent", this);
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
                    setter: function (c) {
                        return Component.create(c);
                    }
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
                 * Whether allow multiple input,separated by separator
                 * Defaults to: false
                 * @cfg {Boolean} multiple
                 */
                /**
                 * @ignore
                 */
                multiple: {
                },

                /**
                 * Separator chars used to separator multiple inputs.
                 * Defaults to: ;,
                 * @cfg {String} separator
                 */
                /**
                 * @ignore
                 */
                separator: {
                    value: ",;"
                },

                /**
                 * Separator type.
                 * After value( 'suffix' ) or before value( 'prefix' ).
                 * Defaults to: 'suffix'
                 * @cfg {String} separatorType
                 */
                /**
                 * @ignore
                 */
                separatorType: {
                    value: SUFFIX
                },

                /**
                 * Whether whitespace is part of toke value.
                 * Default to: true
                 * @cfg {Boolean} whitespace
                 * @private
                 */
                /**
                 * @ignore
                 */
                whitespace: {
                    valueFn: function () {
                        return this.get("separatorType") == SUFFIX;
                    }
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
                 * If separator wrapped by literal chars,separator become normal chars.
                 * Defaults to: "
                 * @cfg {String} literal
                 */
                /**
                 * @ignore
                 */
                literal: {
                    value: "\""
                },

                /**
                 * Whether align menu with individual token after separated by separator.
                 * Defaults to: false
                 * @cfg {Boolean} alignWithCursor
                 */
                /**
                 * @ignore
                 */
                alignWithCursor: {
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

    function selectItem(self, item) {
        if (item) {
            var textContent = item.get("textContent"),
                separatorType = self.get("separatorType");
            setValue(self, textContent + (separatorType == SUFFIX ? "" : " "));
            self._savedInputValue = textContent;
            /**
             * fired when user select from suggestion list (bubbled from menuItem)
             * @event click
             * @param e
             * @param e.target Selected menuItem
             */
        }
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
        if (m && m.xclass) {
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

    function alignMenuImmediately(self) {
        var menu = self.get("menu"),
            align = S.clone(menu.get("align"));
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
        cursorOffset = cursor(input);
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

        data = self.normalizeData(data);

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
}, {
    requires: [
        './cursor',
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