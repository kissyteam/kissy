/**
 * @fileOverview Input wrapper for ComboBox component.
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/base", function (S, Event, Component, ComboBoxMenu, ComboBoxRender, _, undefined) {
    var ComboBox,
        KeyCodes = Event.KeyCodes,
        ALIGN = {
            points:["bl", "tl"],
            overflow:{
                adjustX:1,
                adjustY:1
            }
        };

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

    function constructMenu(self) {
        var menuCfg = self.get("menuCfg");
        var m = new ComboBoxMenu(S.mix({
            prefixCls:self.get("prefixCls")
        }, self.get("menuCfg")));
        self.__set("menu", m);
        return m;
    }

    function alignMenuImmediately(self) {
        var menu = self.get("menu"),
            menuCfg = self.get("menuCfg") || {};
        menu.set("align", S.merge({
            node:self.get("el")
        }, ALIGN, menuCfg.align));
    }

    function alignWithTokenImmediately(self) {
        var inputDesc = self._getInputDesc(),
            tokens = inputDesc.tokens,
            menu = self.get("menu"),
            cursorPosition = inputDesc.cursorPosition,
            tokenIndex = inputDesc.tokenIndex,
            tokenCursorPosition,
            input = self.get("input");
        tokenCursorPosition = tokens.slice(0, tokenIndex).join("").length;
        if (tokenCursorPosition > 0) {
            // behind separator
            ++tokenCursorPosition;
        }
        input.prop("selectionStart", tokenCursorPosition);
        input.prop("selectionEnd", tokenCursorPosition);
        var cursorOffset = input.prop("KsCursorOffset");
        input.prop("selectionStart", cursorPosition);
        input.prop("selectionEnd", cursorPosition);
        menu.set("xy", [cursorOffset.left, cursorOffset.top]);
    }

    function alignImmediately(self) {
        if (self.get("multiple") && self.get("alignWithCursor")) {
            alignWithTokenImmediately(self);
        } else {
            alignMenuImmediately(self);
        }
    }

    function onTriggerClick() {
        var self = this,
            input = self.get("input"),
            menu = getMenu(self);

        if (menu && menu.get("visible")) {
            self.set('collapsed', true);
        } else {
            input[0].focus();
            self.sendRequest('');
        }
    }

    function onTriggerMouseDown(e) {
        e.preventDefault();
    }

    /**
     * Input/Textarea Wrapper for comboBox.
     * xclass: 'combobox'.
     * @name ComboBox
     * @extends Component.Controller
     * @class
     */
    ComboBox = Component.Controller.extend(
        /**
         * @lends ComboBox
         */
        {

            // user's input text
            _savedInputValue:null,

            _stopNotify:0,

            bindUI:function () {
                var self = this,
                    input = self.get("input");
                input.on("valuechange", self._onValueChange, self);
            },

            _uiSetHasTrigger:function (v) {
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

            /**
             * fetch comboBox list by value and show comboBox list
             * @param {String} value value for fetching comboBox list
             */
            sendRequest:function (value) {
                var self = this,
                    dataSource = self.get("dataSource");
                dataSource.fetchData(value, self._renderData, self);
            },

            _onValueChange:function () {
                var self = this;
                if (self._stopNotify) {
                    return;
                }
                var value = self._getValue();
                if (value === undefined) {
                    self.set("collapsed", true);
                    return;
                }
                self._savedInputValue = value;
                S.log("value change: " + value);
                self.sendRequest(value);
            },

            _uiSetCollapsed:function (v) {
                var self = this,
                    menuCfg = self.get("menuCfg"),
                    comboBoxMenu = getMenu(self);
                if (comboBoxMenu) {
                    if (v) {
                        comboBoxMenu.hide();
                    } else {
                        comboBoxMenu.show();
                        if (menuCfg.width == null) {
                            comboBoxMenu.set("width", self.get("el").width());
                        }
                        if (!self.get("ariaOwns")) {
                            self.set("ariaOwns", comboBoxMenu.get("el")[0].id)
                        }
                    }
                }
            },

            handleBlur:function () {
                var self = this;
                ComboBox.superclass.handleBlur.apply(self, arguments);
                var comboBoxMenu = getMenu(self);
                // S.log("input blur!!!!!!!");
                if (comboBoxMenu) {
                    // 通知 menu
                    comboBoxMenu._hideForComboBox();
                }
            },

            _renderData:function (data) {
                var self = this,
                    v,
                    contents,
                    i,
                    comboBoxMenu = getMenu(self, 1) || constructMenu(self);

                comboBoxMenu.removeChildren(true);

                if (data && data.length) {
                    data = data.slice(0, self.get("maxItemCount"));
                    if (self.get("format")) {
                        contents = self.get("format").call(self, self._getValue(), data);
                    } else {
                        contents = [];
                    }
                    for (i = 0; i < data.length; i++) {
                        v = data[i];
                        comboBoxMenu.addChild(S.mix({
                            xclass:'menuitem',
                            content:v,
                            textContent:v,
                            value:v
                        }, contents[i]))
                    }
                    _showMenu(self);
                } else {
                    self.set("collapsed", true);
                }
            },

            _onWindowResize:function () {
                alignImmediately(this);
            },

            handleKeyEventInternal:function (e) {
                var self = this,
                    input = self.get("input"),
                    comboBoxMenu = getMenu(self);

                if (!comboBoxMenu) {
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

                if (comboBoxMenu.get("visible")) {
                    var handledByMenu = comboBoxMenu.handleKeydown(e);

                    if (updateInputOnDownUp) {
                        if (S.inArray(e.keyCode, [KeyCodes.DOWN, KeyCodes.UP])) {
                            // update menu's active value to input just for show
                            self._setValue(comboBoxMenu.get("activeItem").get("textContent"));
                        }
                    }
                    // esc
                    if (e.keyCode == KeyCodes.ESC) {
                        self.set("collapsed", true);
                        if (updateInputOnDownUp) {
                            // restore original user's input text
                            self._setValue(self._savedInputValue);
                        }
                        return true;
                    }

                    // tab
                    // if menu is open and an menuitem is highlighted, see as click/enter
                    if (e.keyCode == KeyCodes.TAB) {
                        if (activeItem = comboBoxMenu.get("activeItem")) {
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
                    S.log("refetch : " + self._getValue());
                    self.sendRequest(self._getValue());
                    return true;
                }
            },

            _uiSetSelectedItem:function (item) {
                var self = this;
                if (item) {
                    var textContent = item.get("textContent");
                    self._setValue(textContent + self.get("strAppendedOnComplete"));
                    self._savedInputValue = textContent;
                    /**
                     * @name ComboBox#click
                     * @description fired when user select from suggestion list
                     * @event
                     * @param e
                     * @param e.target Selected menuItem
                     */
                    self.fire("click", {
                        target:item
                    });
                }
            },

            /**
             * Consider multiple mode , get token at current cursor position
             */
            _getValue:function () {
                var self = this,
                    input = self.get("input"),
                    inputVal = input.val();
                if (self.get("multiple")) {
                    var inputDesc = self._getInputDesc();
                    var tokens = inputDesc.tokens,
                        tokenIndex = inputDesc.tokenIndex;
                    var separator = self.get("separator");
                    var token = tokens[tokenIndex] || "";
                    // only if token starts with separator , then token has meaning!
                    // token can not be empty
                    if (token && separator.indexOf(token.charAt(0)) != -1) {
                        // remove separator
                        return token.substring(1);
                    }
                    if (// cursor is at the beginning of textarea
                    // whether to trigger comboBox
                        self.get("queryAtStart") &&
                            (tokenIndex == 0 || tokenIndex == -1)
                        ) {
                        return token;
                    }
                    return undefined;
                } else {
                    return inputVal;
                }
            },

            _setValue:function (value) {
                var self = this,
                    input = self.get("input");
                if (self.get("multiple")) {
                    var inputDesc = self._getInputDesc();
                    var tokens = inputDesc.tokens,
                        tokenIndex = Math.max(0, inputDesc.tokenIndex);

                    var separator = self.get("separator");
                    var cursorPosition;
                    var appendSeparatorOnComplete = self.get("appendSeparatorOnComplete");

                    var token = tokens[tokenIndex];

                    if (token && separator.indexOf(token.charAt(0)) != -1) {
                        tokens[tokenIndex] = token.charAt(0);
                    } else {
                        tokens[tokenIndex] = "";
                    }

                    tokens[tokenIndex] += value;

                    var nextToken = tokens[tokenIndex + 1];

                    // appendSeparatorOnComplete if next token does not start with separator
                    if (appendSeparatorOnComplete &&
                        (!nextToken || separator.indexOf(nextToken.charAt(0)) == -1 )) {
                        tokens[tokenIndex] += separator.charAt(0);
                    }

                    cursorPosition = tokens.slice(0, tokenIndex + 1).join("").length;

                    input.val(tokens.join(""));

                    input.prop("selectionStart", cursorPosition);
                    input.prop("selectionEnd", cursorPosition);
                } else {
                    input.val(value);
                }
            },

            _getInputDesc:function () {
                var self = this,
                    input = self.get("input"),
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
                    tokens:tokens,
                    cursorPosition:cursorPosition,
                    tokenIndex:tokenIndex
                };
            }
        },
        {
            ATTRS:/**
             * @lends ComboBox
             */
            {

                input:{
                    view:true
                },

                trigger:{
                    view:true
                },

                /**
                 * Whether show combobox trigger.
                 * Default: true.
                 * @type Boolean
                 */
                hasTrigger:{
                    value:true,
                    view:true
                },

                /**
                 * ComboBox dropDown menuList
                 * @type ComboBox.Menu
                 */
                menu:{
                    setter:function (m) {
                        if (m instanceof ComboBoxMenu) {
                            m.__set("parent", this);
                        }
                    }
                },

                /**
                 * aria-owns.ReadOnly.
                 * @type String
                 * @private
                 */
                ariaOwns:{
                    view:true
                },

                /**
                 * Whether combobox menu is hidden.
                 * @type Boolean
                 */
                collapsed:{
                    view:true
                },

                /**
                 * dataSource for comboBox.
                 * @type ComboBox.LocalDataSource|ComboBox.RemoteDataSource|Object
                 */
                dataSource:{
                    // 和 input 关联起来，input可以有很多，每个数据源可以不一样，但是 menu 共享
                    setter:function (c) {
                        return Component.create(c);
                    }
                },

                /**
                 * maxItemCount max count of data to be shown
                 * @type Number
                 */
                maxItemCount:{
                    value:99999
                },

                /**
                 * Config comboBox menu list.For Configuration when new.
                 * {Number} menuCfg.width :
                 * Config comboBox menu list's alignment.
                 * Default to current active input's width.<br/>
                 * {Object} menuCfg.align :
                 * Config comboBox menu list's alignment.
                 * Same with {@link Component.UIBase.Align#align} .
                 * Default : align current input's bottom left edge
                 * with comboBox list's top left edge.
                 * @type Object
                 */
                menuCfg:{
                    value:{
                        // width
                        // align
                    }
                },
                /**
                 * Format function to return array of
                 * html/text/menu item attributes from array of data.
                 * @type {Function}
                 */
                format:{
                },

                /**
                 * Readonly.User selected menu item by click or enter on highlighted suggested menu item
                 * @type Menu.Item
                 */
                selectedItem:{
                },

                /**
                 * Whether allow multiple input,separated by separator
                 * Default : false
                 * @type Boolean
                 */
                multiple:{
                },

                /**
                 * Separator chars used to separator multiple inputs.
                 * Default: ;,
                 * @type String
                 */
                separator:{
                    value:",;"
                },

                /**
                 * Whether whitespace is part of toke value.
                 * Default true
                 * @type Boolean
                 */
                whitespace:{
                    value:true
                },

                /**
                 * Whether append separator after auto-completed value.
                 * Default true
                 * @type Boolean
                 */
                appendSeparatorOnComplete:{
                    value:true
                },

                /**
                 * Whether query at start of input when allow multiple.
                 * Default: true.
                 * @type Boolean
                 */
                queryAtStart:{
                    value:true
                },

                /**
                 * Whether update input's value at keydown or up when combobox menu shows.
                 * Default true
                 * @type Boolean
                 */
                updateInputOnDownUp:{
                    value:true
                },

                /**
                 * If separator wrapped by literal chars,separator become normal chars.
                 * Default : "
                 * @type String
                 */
                literal:{
                    value:"\""
                },

                /**
                 * Whether align menu with individual token after separated by separator.
                 * Default : false
                 * @type Boolean
                 */
                alignWithCursor:{
                },

                /**
                 * Whether or not the first row should be highlighted by default.
                 * Default : false
                 * @type Boolean
                 */
                autoHighlightFirst:{
                },

                /**
                 * String appended to selected value after click combobox item.
                 * @type String
                 */
                strAppendedOnComplete:{
                    value:""
                },
                xrender:{
                    value:ComboBoxRender
                }
            }
        },
        {
            xclass:'combobox',
            priority:10
        }
    );


    // #----------------------- private start

    function _showMenu(self) {
        var children,
            val,
            i,
            menu = self.get("menu");
        menu._clearDismissTimer();
        alignImmediately(self);
        self.set("collapsed", false);
        // make menu item (which textContent is same as input) active
        children = menu.get("children");
        val = self._getValue();
        for (i = 0; i < children.length; i++) {
            if (children[i].get("textContent") == val) {
                menu.set("highlightedItem", children[i]);
                return;
            }
        }
        // Whether or not the first row should be highlighted by default.
        if (self.get("autoHighlightFirst")) {
            for (i = 0; i < children.length; i++) {
                if (!children[i].get("disabled")) {
                    menu.set("highlightedItem", children[i]);
                    break;
                }
            }
        }
    }

    // #------------------------private end

    return ComboBox;
}, {
    requires:[
        'event',
        'component',
        './menu',
        './baseRender',
        'input-selection'
    ]
});

/**
 * TODO auto-complete menu 对齐当前输入位置
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