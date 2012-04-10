/**
 * input wrapper for autoComplete component
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete/input", function (S, Event, UIBase, Component, Menu, AutoCompleteRender, _, undefined) {
    var AutoComplete,
        KeyCodes = Event.KeyCodes;

    var ALIGN = {
        points:["bl", "tl"],
        overflow:{
            failX:1,
            failY:1,
            adjustX:1,
            adjustY:1
        }
    };

    function alignMenuImmediately(self) {
        var menu = self.get("menu"),
            menuCfg = self.get("menuCfg") || {};
        menu.set("align", S.merge({
            node:self.get("el")
        }, ALIGN, menuCfg.align));
    }

    /**
     * Input/Textarea Wrapper for autoComplete
     * @name AutoComplete
     * @extends Component.Controller
     * @class
     */
    AutoComplete = UIBase.create(Component.Controller, [],
        /**
         * @lends AutoComplete
         */
        {
            __CLASS:"AutoComplete",

            // user's input text
            _savedInputValue:null,

            _stopNotify:0,

            bindUI:function () {
                var self = this,
                    el = self.get("el");
                el.on("valuechange", self._onValueChange, self);
            },
            /**
             * fetch autoComplete list by value and show autoComplete list
             * @param {String} value value for fetching autoComplete list
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
                    return;
                }
                self._savedInputValue = value;
                S.log("value change: " + value);
                self.sendRequest(value);
            },

            _handleBlur:function () {
                AutoComplete.superclass._handleBlur.apply(this, arguments);
                var autoCompleteMenu = this.get("menu");
                // S.log("input blur!!!!!!!");
                if (autoCompleteMenu) {
                    // 通知 menu
                    autoCompleteMenu._onInputBlur();
                }
            },

            _renderData:function (data) {
                var self = this,
                    autoCompleteMenu = self.get("menu");
                autoCompleteMenu.removeChildren(true);
                if (data && data.length) {
                    data = data.slice(0, self.get("maxItemCount"));
                    var menuCfg = self.get("menuCfg") || {};
                    var v;
                    // 同步当前 width
                    autoCompleteMenu.set("width", menuCfg.width || self.get("el").css("width"));
                    var contents;
                    if (self.get("format")) {
                        contents = self.get("format").call(self,
                            self._getValue(),
                            data);
                    } else {
                        contents = [];
                    }
                    for (var i = 0; i < data.length; i++) {
                        v = data[i];
                        autoCompleteMenu.addChild(new Menu.Item(S.mix({
                            prefixCls:self.get("prefixCls") + "autocomplete-",
                            content:v,
                            textContent:v,
                            value:v
                        }, contents[i])))
                    }
                    self._showMenu();
                } else {
                    autoCompleteMenu.hide();
                }
            },

            _showMenu:function () {
                var self = this;
                var menu = self.get("menu");
                menu._input = self;
                menu._clearDismissTimer();
                alignMenuImmediately(self);
                menu.show();
                // make menu item (which textContent is same as input) active
                var children = menu.get("children"),
                    val = self._getValue();
                for (var i = 0; i < children.length; i++) {
                    if (children[i].get("textContent") == val) {
                        menu.set("highlightedItem", children[i]);
                        return;
                    }
                }
            },

            _onWindowResize:function () {
                alignMenuImmediately(this);
            },

            _handleKeyEventInternal:function (e) {
                var self = this,
                    el = self.get("el"),
                    autoCompleteMenu = self.get("menu");
                if (!autoCompleteMenu) {
                    return;
                }
                var updateInputOnDownUp = self.get("updateInputOnDownUp");

                if (updateInputOnDownUp) {
                    // autocomplete will change input value
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
                if (autoCompleteMenu.get("visible")) {
                    var handledByMenu = autoCompleteMenu._handleKeydown(e);

                    if (updateInputOnDownUp) {
                        if (S.inArray(e.keyCode, [KeyCodes.DOWN, KeyCodes.UP])) {
                            // update menu's active value to input just for show
                            self._setValue(autoCompleteMenu.get("activeItem").get("textContent"));
                        }
                    }
                    // esc
                    if (e.keyCode == KeyCodes.ESC) {
                        autoCompleteMenu.hide();
                        if (updateInputOnDownUp) {
                            // restore original user's input text
                            self._setValue(self._savedInputValue);
                        }
                        return true;
                    }

                    // tab
                    // if menu is open and an menuitem is highlighted, see as click/enter
                    if (e.keyCode == KeyCodes.TAB) {
                        if (activeItem = autoCompleteMenu.get("activeItem")) {
                            activeItem._performInternal();
                            // only prevent focus change in multiple mode
                            if (self.get("multiple")) {
                                return true;
                            }
                        }
                    }
                    return handledByMenu;
                } else if ((e.keyCode == KeyCodes.DOWN || e.keyCode == KeyCodes.UP) &&
                    self.get("reFetchOnDownUp")) {
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
                    self._setValue(textContent);
                    self._savedInputValue = textContent;
                    /**
                     * @name AutoComplete#select
                     * @description fired when user select from suggestion list
                     * @event
                     * @param e
                     * @param e.value value of selected menuItem
                     * @param e.content content of selected menuItem
                     * @param e.input current active input
                     */
                    self.fire("select", {
                        value:item.get("value"),
                        content:item.get("content"),
                        textContent:textContent
                    });
                }
            },

            /**
             * Consider multiple mode , get token at current cursor position
             */
            _getValue:function () {
                var self = this,
                    el = self.get("el"),
                    inputVal = el.val();
                if (self.get("multiple")) {

                    var inputDesc = self._getInputDesc();
                    var tokens = inputDesc.tokens, tokenIndex = inputDesc.tokenIndex;
                    var separator = self.get("separator");
                    var token = tokens[tokenIndex] || "";
                    // only if token starts with separator , then token has meaning!
                    if (separator.indexOf(token.charAt(0)) != -1) {
                        // remove separator
                        return token.substring(1);
                    }
                    if (self.get("autoCompleteOnInitial") && tokenIndex == 0) {
                        return token;
                    }
                    return undefined;
                } else {
                    return inputVal;
                }
            },

            _setValue:function (value) {
                var self = this;
                var el = self.get("el");
                if (self.get("multiple")) {
                    var inputDesc = self._getInputDesc();
                    var tokens = inputDesc.tokens, tokenIndex = inputDesc.tokenIndex;
                    var separator = self.get("separator");
                    var cursorPosition;
                    var appendSeparatorOnComplete = self.get("appendSeparatorOnComplete");

                    var token = tokens[tokenIndex];

                    if (separator.indexOf(token.charAt(0)) != -1) {
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

                    el.val(tokens.join(""));

                    el.prop("selectionStart", cursorPosition);
                    el.prop("selectionEnd", cursorPosition);
                } else {
                    el.val(value);
                }
            },

            _getInputDesc:function () {
                var self = this,
                    el = self.get("el"),
                    inputVal = el.val(),
                    tokens = [],
                    cache = [],
                    literal = self.get("literal"),
                    separator = self.get("separator"),
                    inLiteral = false,
                    //whitespace = self.get("whitespace"),
                    cursorPosition = el.prop('selectionStart'),
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
//                        if (!whitespace && /\s|\xa0/.test(c)) {
//                            tokens.push(cache.join(""));
//                            cache = [];
//                        }

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
                    tokenIndex:tokenIndex
                };
            },

            destructor:function () {
                var self = this,
                    autoCompleteMenu = self.get("menu");
                autoCompleteMenu.detachInput(self, self.get("destroyMenu"));
                self.__set("menu", null);
            }
        },
        {
            ATTRS:/**
             * @lends AutoComplete
             */
            {
                focusable:{
                    value:true
                },

                handleMouseEvents:{
                    value:false
                },

                allowTextSelection_:{
                    value:true
                },

                /**
                 * Whether destroy menu when this destroys.Default false
                 * @type Boolean
                 */
                destroyMenu:{
                    value:false
                },

                /**
                 * AutoComplete dropDown menuList
                 * @type AutoComplete.Menu
                 */
                menu:{
                    setter:function (m) {
                        if (m) {
                            m.attachInput(this);
                        }
                    }
                },

                /**
                 * aria-owns.ReadOnly.
                 * @type String
                 */
                ariaOwns:{
                    view:true
                },

                /**
                 * aria-expanded.ReadOnly.
                 * @type String
                 */
                ariaExpanded:{
                    view:true
                },

                /**
                 * dataSource for autoComplete.For Configuration when new.
                 * @type AutoComplete.LocalDataSource|AutoComplete.RemoteDataSource
                 */
                dataSource:{
                    // 和 input 关联起来，input可以有很多，每个数据源可以不一样，但是 menu 共享
                },

                /**
                 * maxItemCount max count of data to be shown
                 * @type Number
                 */
                maxItemCount:{
                    value:99999
                },

                /**
                 * Config autoComplete menu list.For Configuration when new.
                 * {Number} menuCfg.width :
                 * Config autoComplete menu list's alignment.
                 * Default to current active input's width.<br/>
                 * {Object} menuCfg.align :
                 * Config autoComplete menu list's alignment.
                 * Same with {@link UIBase.Align#align} .
                 * Default : align current input's bottom left edge
                 * with autoComplete list's top left edge.
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
                 * separator chars used to separator multiple inputs.
                 * Default: ;,
                 * @type String
                 */
                separator:{
                    value:",;"
                },

                /**
                 * Whether whitespace is part of toke value.
                 * Default false
                 * @type Boolean
                 */
//                whitespace:{
//                    value:false
//                },

                /**
                 * Whether append separator after auto-completed value.
                 * Default true
                 * @type Boolean
                 */
                appendSeparatorOnComplete:{
                    value:true
                },

                /**
                 * Whether update input's value at keydown or up when autocomplete menu shows.
                 * Default true
                 * @type Boolean
                 */
                updateInputOnDownUp:{
                    value:true
                },

                /**
                 * Whether stop keydown and up to re-fetch autoComplete menu
                 * based on current value.
                 * Default : true
                 * @type Boolean
                 */
                reFetchOnDownUp:{
                    value:true
                },

                /**
                 * If separator wrapped by literal chars,separator become narmal chars.
                 * Default : "
                 * @type String
                 */
                literal:{
                    value:"\""
                },

                /**
                 * Whether autoComplete on initial even there is no separator.
                 * Default : true
                 * @type Boolean
                 */
                autoCompleteOnInitial:{
                    value:true
                }
            },
            DefaultRender:AutoCompleteRender
        }
    );

    Component.UIStore.setUIByClass("autocomplete-input", {
        priority:Component.UIStore.PRIORITY.LEVEL1,
        ui:AutoComplete
    });

    return AutoComplete;
}, {
    requires:[
        'event',
        'uibase',
        'component',
        'menu',
        './inputRender',
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