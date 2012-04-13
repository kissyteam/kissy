/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Apr 13 14:50
*/
/**
 * Combobox derived from autocomplete
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete/BasicComboBox", function (S, UIBase, BasicAutoComplete, BasicComboBoxRender) {

    // toggle menu show and hide
    function onBtn(e) {
        S.log("mousedown");
        var self = this,
            menu = self.get("menu"),
            domEl = self.get("el")[0];
        if (menu.get("visible")) {
            menu.hide();
        } else {
            domEl.focus();
            self.sendRequest('');
        }
        e && e.halt();
    }

    return  UIBase.create(BasicAutoComplete, {
        bindUI:function () {
            var self = this,
                el = self.get("el"),
                container = self.get("container"),
                button = self.get("button");
            container.on('click', onBtn, self);
            var menuCfg = this.get("menuCfg");
            if (!menuCfg.width) {
                // drop down menu width should add button width!
                menuCfg.width = container.width();
            }
        }
    }, {
        ATTRS:{
            container:{
                view:true
            },
            button:{
                view:true
            }
        },
        DefaultRender:BasicComboBoxRender
    });
}, {
    requires:['uibase', './basic', './BasicComboBoxRender']
});/**
 * Combobox derived from autocomplete
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete/BasicComboBoxRender", function (S, UIBase, AutoCompleteRender, Node) {

    var $ = Node.all, Render;

    return Render = UIBase.create(AutoCompleteRender, {
        createDom:function () {
            var self = this,
                container = $("<span class='" + self.get("prefixCls") + "combobox'></span>"),
                button = $("<a " +
                    // do need keyboard
                    "tabindex='-1' " +
                    "href='javascript:void(\"open\")'  " +
                    // non-ie do not lose focus
                    "onmousedown='return false;' " +
                    "class='" + self.get("prefixCls") +
                    "combobox-button'>&#x25BC;</a>")
                    // ie do not lose focus
                    .unselectable();
            self.__set("container", container);
            self.__set("button", button);
        },
        renderUI:function () {
            var self = this,
                container = self.get('container'),
                button = self.get("button"),
                parent = self.get("el").parent();
            container
                .appendTo(parent)
                .append(self.get("el"))
                .append(button);
        },
        _setFocused:function (v) {
            var self = this;
            Render.superclass._setFocused.apply(self, arguments);
            self.get("container")[v ? "addClass" : "removeClass"](self.get("prefixCls")
                + "combobox-focused");
        },

        destructor:function () {
            this.get("container").remove();
        }
    }, {
        ATTRS:{
            container:{},
            button:{}
        }
    });
}, {
    requires:['uibase', './inputRender', 'node']
});/**
 * export autocomplete
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete", function (S, Menu, AutoComplete, LocalDataSource, RemoteDataSource, Basic, BasicComboBox) {
    AutoComplete.Menu = Menu;
    AutoComplete.LocalDataSource = LocalDataSource;
    AutoComplete.RemoteDataSource = RemoteDataSource;
    AutoComplete.Basic = Basic;
    AutoComplete.BasicComboBox = BasicComboBox;
    return AutoComplete;
}, {
    requires:['autocomplete/menu',
        'autocomplete/input',
        'autocomplete/localDataSource',
        'autocomplete/remoteDataSource',
        'autocomplete/basic',
        'autocomplete/BasicComboBox']
})/**
 * Provide basic api for AutoComplete
 */
KISSY.add("autocomplete/basic", function (S, UIBase, AutoComplete, AutoCompleteMenu, LocalDataSource, RemoteDataSource) {

    /**
     * Provide basic api for AutoComplete Component
     * @class
     * @name Basic
     * @memberOf AutoComplete
     * @extends AutoComplete
     */
    return UIBase.create(AutoComplete, [], {

        initializer:function () {
            var self = this,
                dataSource,
                autoCompleteMenu,
                data;
            if (!self.get("dataSource")) {
                if (data = self.get("data")) {
                    dataSource = new LocalDataSource({
                        data:data,
                        dataSourceCfg:self.get("dataSourceCfg")
                    });
                } else {
                    dataSource = new RemoteDataSource({
                        xhrCfg:self.get("xhrCfg"),
                        dataSourceCfg:self.get("dataSourceCfg")
                    });
                }
                self.__set('dataSource', dataSource);
            }

            if (!self.get("menu")) {
                autoCompleteMenu = new AutoCompleteMenu({
                    prefixCls:self.get("prefixCls")
                });
                self.__set("menu", autoCompleteMenu);
            }
        }
    }, {
        ATTRS:/**
         * @lends AutoComplete.Basic
         */
        {

            /**
             * Whether destroy menu when this destroys.Default true
             * @type Boolean
             */
            destroyMenu:{
                value:true
            },

            /**
             * Array of static data. data and xhrCfg are mutually exclusive.
             * @type Array
             */
            data:{},
            /**
             * xhrCfg IO configuration.same as {@link} IO. data and xhrCfg are mutually exclusive.
             * @type Object
             */
            xhrCfg:{
                value:{}
            },

            /**
             * Extra config for remote dataSource.<br/>
             * {String} dataSourceCfg.cache :
             * Whether server response data is cached<br/>
             * {Function} dataSource.parse :
             * Serve as a parse function to parse server
             * response to return a valid array of data for autoComplete.
             * Used for xhrCfg.<br/>
             * {String} dataSourceCfg.paramName :
             * Used as parameter name to send autoS=Complete input's value to server<br/>
             * {Boolean} dataSourceCfg.allowEmpty <br/>
             * static data:whether return all data when input is empty.default:true<br/>
             * whether send empty to server when input val is empty.default:false
             * @type Object
             */
            dataSourceCfg:{
                value:{}
            }
        }
    }, "AutoComplete_Basic");

}, {
    requires:['uibase', './input', './menu', './localDataSource', './remoteDataSource']
});/**
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

    function alignWithTokenImmediately(self) {
        var inputDesc = self._getInputDesc(),
            tokens = inputDesc.tokens,
            menu = self.get("menu"),
            cursorPosition = inputDesc.cursorPosition,
            tokenIndex = inputDesc.tokenIndex,
            tokenCursorPosition,
            el = self.get("el");
        tokenCursorPosition = tokens.slice(0, tokenIndex).join("").length;
        if (tokenCursorPosition > 0) {
            // behind separator
            ++tokenCursorPosition;
        }
        el.prop("selectionStart", tokenCursorPosition);
        el.prop("selectionEnd", tokenCursorPosition);
        var cursorOffset = el.prop("KsCursorOffset");
        el.prop("selectionStart", cursorPosition);
        el.prop("selectionEnd", cursorPosition);
        menu.set("xy", [cursorOffset.left, cursorOffset.top]);
    }

    function alignImmediately(self) {
        if (self.get("multiple") &&
            self.get("alignWithCursor")) {
            alignWithTokenImmediately(self);
        } else {
            alignMenuImmediately(self);
        }
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
                    var autoCompleteMenu = self.get("menu");
                    if (autoCompleteMenu) {
                        autoCompleteMenu.hide();
                    }
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
                    autoCompleteMenu._hideForAutoComplete();
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
                    autoCompleteMenu.set("width",
                        menuCfg.width === undefined ?
                            self.get("el").css("width") :
                            menuCfg.width);
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
                alignImmediately(self);
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
                // Whether or not the first row should be highlighted by default.
                if (self.get("autoHighlight") && children.length) {
                    menu.set("highlightedItem", children[0]);
                }
            },

            _onWindowResize:function () {
                alignImmediately(this);
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
                    // token can not be empty
                    if (token && separator.indexOf(token.charAt(0)) != -1) {
                        // remove separator
                        return token.substring(1);
                    }
                    if (
                        self.get("autoCompleteOnInitial") &&
                            // cursor is at the beginning of textarea
                            // whether to trigger autoComplete
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
                    whitespace = self.get("whitespace"),
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
                 * If separator wrapped by literal chars,separator become normal chars.
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
                autoHighlight:{
                }
            },
            DefaultRender:AutoCompleteRender
        },
        "AutoComplete"
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
 **//**
 * render aria properties to input element
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete/inputRender", function (S, UIBase, Component) {
    return UIBase.create(Component.Render, [], {
        renderUI:function () {
            var el = this.get("el");
            el.attr({
                "aria-haspopup":true,
                "aria-autocomplete":"list",
                "autocomplete":"off",
                role:"combobox"
            });
        },

        _uiSetAriaOwns:function (v) {
            this.get("el").attr("aria-owns", v);
        },

        _uiSetAriaExpanded:function (v) {
            this.get("el").attr("aria-expanded", v);
        }
    }, {
        ATTRS:{
            ariaOwns:{
            },
            ariaExpanded:{
            },
            elTagName:{
                value:'input'
            }
        }
    });
}, {
    requires:['uibase', 'component']
});/**
 * local dataSource
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete/localDataSource", function (S) {

    /**
     * Local dataSource for autoComplete
     * @memberOf AutoComplete
     * @class
     * @param {Object} cfg config
     * @param {Array} cfg.data array of static data for autoComplete
     * @param {Object} cfg.dataSourceCfg dataSource config
     * @param {Function} cfg.dataSourceCfg.parse parse data
     */
    function LocalDataSource(cfg) {
        LocalDataSource.superclass.constructor.apply(this, arguments);
    }

    function parser(inputVal, data) {
        var ret = [],
            count = 0;
        if (!inputVal) {
            return data;
        }
        S.each(data, function (d) {
            if (d.indexOf(inputVal) != -1) {
                ret.push(d);
            }
            count++;
        });

        return ret;
    }

    LocalDataSource.ATTRS = {
        data:{
            value:[]
        },
        dataSourceCfg:{
            value:{}
        }
    };

    S.extend(LocalDataSource, S.Base, {
        /**
         * Datasource interface. How to get data for autoComplete
         * @function
         * @name AutoComplete.LocalDataSource#fetchData
         * @param {String} inputVal current active input's value
         * @param {Function} callback callback to notify autoComplete when data is ready
         * @param {Object} context callback's execution context
         */
        fetchData:function (inputVal, callback, context) {
            var dataSourceCfg = this.get("dataSourceCfg"),
                parse = dataSourceCfg.parse || parser,
                data = this.get("data");
            data = parse(inputVal, data);
            callback.call(context, data);
        }
    });

    return LocalDataSource;
});/**
 * autoComplete menu.
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete/menu", function (S, Event, UIBase, Component, Menu, AutoCompleteMenuRender) {


    var AutoCompleteMenu;

    /**
     * DropDown menu for autoComplete input.
     * @name Menu
     * @memberOf AutoComplete
     * @extends Menu.PopupMenu
     * @class
     */
    AutoCompleteMenu = UIBase.create(Menu.PopupMenu,
        /**
         * @lends AutoComplete.Menu#
         */
        {

            // current input which causes this menu to show
            _input:null,

            // 所以注册过的 input，为 0 时可能会删除整个 menu
            _inputs:null,

            /**
             * attach one input or textarea to this autoComplete logic
             * @param {AutoComplete} input input or textarea wrapper instance
             */
            attachInput:function (input) {
                var self = this;
                self._inputs = self._inputs || [];
                if (!S.inArray(input, self._inputs)) {
                    self._inputs.push(input);
                }
            },

            /**
             * detach existing input or textarea from this autoComplete logic
             * @param {AutoComplete} input previous attached input or textarea instance
             */
            detachInput:function (input, destroy) {
                var self = this,
                    _inputs = self._inputs,
                    index = S.indexOf(input, _inputs || []);
                if (index != -1) {
                    _inputs.splice(index, 1);
                }
                if (destroy && (!_inputs || _inputs.length == 0)) {
                    self.destroy();
                }
            },

            bindUI:function () {
                var self = this;

                self.on("show", function () {
                    var input = self._input;
                    input.set("ariaOwns", self.get("el").attr("id"));
                    input.set("ariaExpanded", true);
                });

                self.on("hide", function () {
                    var input = self._input;
                    input.set("ariaOwns", self.get("el").attr("id"));
                    input.set("ariaExpanded", false);
                });

                self.on("click", function (e) {
                    var item = e.target;
                    var input = self._input;
                    // stop valuechange event
                    input._stopNotify = 1;
                    input.set("selectedItem", item);
                    self.hide();
                    setTimeout(
                        function () {
                            input._stopNotify = 0;
                        },
                        // valuechange interval
                        50
                    );
                });

                var reAlign = S.buffer(function () {
                    var self = this,
                        _input = self._input;
                    if (_input && self.get("visible")) {
                        _input._onWindowResize();
                    }
                }, 50);

                self.__reAlign = reAlign;

                Event.on(window, "resize", reAlign, self);

                var el = self.get("el");
                var contentEl = self.get("contentEl");

                el.on("focusin", function () {
                    self._clearDismissTimer();
                });

                el.on("focusout", function () {
                    self._hideForAutoComplete();
                });

                contentEl.on("mouseover", function () {
                    var input = self._input;
                    // trigger el focusous
                    input.get("el")[0].focus();
                    // prevent menu from hiding
                    self._clearDismissTimer();
                });
            },

            _clearDismissTimer:function () {
                var self = this;
                if (self._dismissTimer) {
                    clearTimeout(self._dismissTimer);
                    self._dismissTimer = null;
                }
            },

            _hideForAutoComplete:function () {
                var self = this;
                self._dismissTimer = setTimeout(function () {
                    self._immediateHideForAutoComplete();
                }, 30);
            },

            _immediateHideForAutoComplete:function () {
                var self = this;
                self.removeChildren(true);
                self.hide();
            },

            destructor:function () {
                var self = this;
                Event.remove(window, "resize", self.__reAlign, self);
                S.each(self._inputs, function (inp) {
                    inp.__set("menu", null);
                });
                self._inputs = null;
            }
        }, {
            DefaultRender:AutoCompleteMenuRender,
            ATTRS:{
                head:{
                    view:true
                },
                foot:{
                    view:true
                }
            }
        },
        "AutoComplete_Menu"
    );

    Component.UIStore.setUIByClass("autocomplete-menu", {
        priority:Component.UIStore.PRIORITY.LEVEL1,
        ui:AutoCompleteMenu
    });

    return AutoCompleteMenu;
}, {
    requires:['event', 'uibase', 'component', 'menu', './menuRender']
});
/**
 * 2012-03-26 yiminghe@gmail.com
 *  - refer http://www.w3.org/TR/wai-aria-practices/#autocomplete
 **//**
 * autoComplete menu render
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete/menuRender", function (S, UIBase, Menu) {
    var $ = S.all;
    return UIBase.create(Menu.PopupMenu.Render, [], {
        createDom:function () {
            var self = this,
                el = self.get("el"),
                head = $("<div class='" +
                    self.get("prefixCls") + "autocomplete-menu-header"
                    + "'></div>"),
                foot = $("<div class='" +
                    self.get("prefixCls") + "autocomplete-menu-footer"
                    + "'></div>");
            el.prepend(head);
            el.append(foot);
            self.__set("head", head);
            self.__set("foot", foot);
        }
    }, {
        ATTRS:{
            head:{
                view:true
            },
            foot:{
                view:true
            }
        }
    });
}, {
    requires:['uibase', 'menu']
});/**
 * remote datasource
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete/remoteDataSource", function (S, IO) {

    /**
     * dataSource which wrap {@link IO} utility.
     * @class
     * @memberOf AutoComplete
     * @param {Object} cfg configs
     * @param {Object} cfg.xhrCfg IO configuration.same as {@link} IO
     * @param {Object} cfg.dataSourceCfg dataSource configs
     * @param {String} cfg.dataSourceCfg.paramName
     * Used as parameter name to send autoS=Complete input's value to server
     * @param {String} cfg.dataSourceCfg.cache Whether server response data is cached
     * @param {Boolean} cfg.dataSourceCfg.allowEmpty whether send empty to server when input val is empty.default:false
     * @param {Function} cfg.dataSourceCfg.parse Serve as a parse function to parse server
     * response to return a valid array of data for autoComplete.
     */
    function RemoteDataSource(cfg) {
        var self = this;
        RemoteDataSource.superclass.constructor.apply(self, arguments);
        self.io = null;
        self.caches = {};
    }

    RemoteDataSource.ATTRS = {
        dataSourceCfg:{
            value:{}
        },
        xhrCfg:{
            value:{}
        }
    };

    S.extend(RemoteDataSource, S.Base, {
        /**
         * Datasource interface. How to get data for autoComplete
         * @function
         * @name AutoComplete.RemoteDataSource#fetchData
         * @param {String} inputVal current active input's value
         * @param {Function} callback callback to notify autoComplete when data is ready
         * @param {Object} context callback's execution context
         */
        fetchData:function (inputVal, callback, context) {
            var self = this,
                v,
                dataSourceCfg = self.get("dataSourceCfg");
            if (self.io) {
                // abort previous request
                self.io.abort();
                self.io = null;
            }
            if (!inputVal && dataSourceCfg.allowEmpty !== true) {
                return callback.call(context, []);
            }
            if (dataSourceCfg.cache) {
                if (v = self.caches[inputVal]) {
                    return callback.call(context, v);
                }
            }
            var xhrCfg = self.get("xhrCfg");
            xhrCfg.data = xhrCfg.data || {};
            xhrCfg.data[dataSourceCfg['paramName']] = inputVal;
            xhrCfg.success = function (data) {
                if (dataSourceCfg.parse) {
                    data = dataSourceCfg.parse(inputVal, data);
                }
                self.__set("data", data);
                if (dataSourceCfg.cache) {
                    self.caches[inputVal] = data;
                }
                callback.call(context, data);
            };
            self.io = IO(xhrCfg);
        }
    });

    return RemoteDataSource;
}, {
    requires:['ajax']
});
