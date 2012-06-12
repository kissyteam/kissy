/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 13 00:25
*/
/**
 * @fileOverview Local dataSource for ComboBox
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/LocalDataSource", function (S, Component) {

    /**
     * Local dataSource for comboBox
     * @memberOf ComboBox
     * @class
     * @param {Object} cfg config
     * @param {Array} cfg.data array of static data for comboBox
     * @param {Function} cfg.parse parse data
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
        parse:{
            value:parser
        }
    };

    S.extend(LocalDataSource, S.Base, {
        /**
         * Datasource interface. How to get data for comboBox
         * @function
         * @name ComboBox.LocalDataSource#fetchData
         * @param {String} inputVal current active input's value
         * @param {Function} callback callback to notify comboBox when data is ready
         * @param {Object} context callback's execution context
         */
        fetchData:function (inputVal, callback, context) {
            var parse = this.get("parse"),
                data = this.get("data");
            data = parse(inputVal, data);
            callback.call(context, data);
        }
    });

    Component.Manager.setConstructorByXClass("combobox-LocalDataSource", LocalDataSource);

    return LocalDataSource;
}, {
    requires:['component']
});/**
 * @fileOverview Remote datasource for ComboBox
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/RemoteDataSource", function (S, IO, Component) {

    /**
     * dataSource which wrap {@link IO} utility.
     * @class
     * @memberOf ComboBox
     * @param {Object} cfg configs
     * @param {Object} cfg.xhrCfg IO configuration.same as {@link} IO
     * @param {String} cfg.paramName
     * Used as parameter name to send autoS=Complete input's value to server
     * @param {String} cfg.cache Whether server response data is cached
     * @param {Boolean} cfg.allowEmpty whether send empty to server when input val is empty.default:false
     * @param {Function} cfg.parse Serve as a parse function to parse server
     * response to return a valid array of data for comboBox.
     */
    function RemoteDataSource(cfg) {
        var self = this;
        RemoteDataSource.superclass.constructor.apply(self, arguments);
        self.io = null;
        self.caches = {};
    }

    RemoteDataSource.ATTRS = {
        paramName:{},
        allowEmpty:{},
        cache:{},
        parse:{},
        xhrCfg:{
            value:{}
        }
    };

    S.extend(RemoteDataSource, S.Base, {
        /**
         * Datasource interface. How to get data for comboBox
         * @function
         * @name ComboBox.RemoteDataSource#fetchData
         * @param {String} inputVal current active input's value
         * @param {Function} callback callback to notify comboBox when data is ready
         * @param {Object} context callback 's execution context
         */
        fetchData:function (inputVal, callback, context) {
            var self = this,
                v,
                paramName = self.get("paramName"),
                parse = self.get("parse"),
                cache = self.get("cache"),
                allowEmpty = self.get("allowEmpty");
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
            var xhrCfg = self.get("xhrCfg");
            xhrCfg.data = xhrCfg.data || {};
            xhrCfg.data[paramName] = inputVal;
            xhrCfg.success = function (data) {
                if (parse) {
                    data = parse(inputVal, data);
                }
                self.__set("data", data);
                if (cache) {
                    self.caches[inputVal] = data;
                }
                callback.call(context, data);
            };
            self.io = IO(xhrCfg);
        }
    });

    Component.Manager.setConstructorByXClass("combobox-RemoteDataSource", RemoteDataSource);

    return RemoteDataSource;
}, {
    requires:['ajax', 'component']
});/**
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
                    trigger = self.get("trigger"),
                    input = self.get("input");
                input.on("valuechange", self._onValueChange, self);
                trigger.on("click", function () {
                    S.log("xx");
                    var menu = getMenu(self);

                    S.log(menu && menu.get("visible") || "ai");
                    if (menu && menu.get("visible")) {
                        self.set('collapsed', true);
                    } else {
                        input[0].focus();
                        self.sendRequest('');
                    }
                });
                trigger.on("mousedown", function (e) {
                    e.preventDefault();
                });
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
 **//**
 * @fileOverview Render aria properties to input element.
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/baseRender", function (S, Component) {

    var tpl = '<div class="ks-combobox-trigger">' +
            '<div class="ks-combobox-trigger-inner">&#x25BC;</div>' +
            '</div>' +
            '<div class="ks-combobox-input-wrap">' +
            '</div>',
        inputTpl = '<input ' +
            'aria-haspopup="true" ' +
            'aria-combobox="list" ' +
            'aria-haspopup="true" ' +
            'role="combobox" ' +
            'combobox="off" ' +
            'class="ks-combobox-input" />';

    return Component.Render.extend({

        createDom:function () {
            var self = this, el = self.get("el");
            if (!self.get("srcNode")) {
                el.append(tpl);
                var wrap = el.one(".ks-combobox-input-wrap");
                var input = self.get("input") || S.all(inputTpl);
                wrap.append(input);
                self.__set("input", input);
                self.__set("trigger", el.one(".ks-combobox-trigger"));
            }
            self.get("trigger").unselectable();
        },

        _uiSetAriaOwns:function (v) {
            this.get("input").attr("aria-owns", v);
        },

        getKeyEventTarget:function () {
            return this.get("input");
        },

        _uiSetCollapsed:function (v) {
            this.get("input").attr("aria-expanded", v);
        },

        _uiSetHasTrigger:function (t) {
            this.get("trigger")[t ? 'show' : 'hide']();
        }
    }, {
        ATTRS:{
            ariaOwns:{},
            collapsed:{},
            hasTrigger:{},
            input:{},
            trigger:{}
        },
        HTML_PARSER:{
            input:function (el) {
                return el.one(".ks-combobox-input");
            },
            trigger:function (el) {
                return el.one(".ks-combobox-trigger");
            }
        }
    });
}, {
    requires:['component']
});/**
 * @fileOverview Export ComboBox.
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox", function (S, Menu, ComboBox, LocalDataSource, RemoteDataSource) {
    ComboBox.Menu = Menu;
    ComboBox.LocalDataSource = LocalDataSource;
    ComboBox.RemoteDataSource = RemoteDataSource;
    return ComboBox;
}, {
    requires:[
        'combobox/menu',
        'combobox/base',
        'combobox/LocalDataSource',
        'combobox/RemoteDataSource'
    ]
})/**
 * @fileOverview ComboBox menu constroller.
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/menu", function (S, Event, Menu, ComboBoxMenuRender) {


    var ComboBoxMenu,
        window = S.Env.host;

    /**
     * DropDown menu for comboBox input.
     * xclass: 'combobox-menu'.
     * @name Menu
     * @memberOf ComboBox
     * @extends Menu.PopupMenu
     * @class
     */
    ComboBoxMenu = Menu.PopupMenu.extend(
        /**
         * @lends ComboBox.Menu#
         */
        {
            /**
             * Bind event once after menu initialize and before menu shows.
             * Bind only one time!
             * @protected
             */
            bindUI:function () {
                var self = this;

                self.on("click", function (e) {
                    var item = e.target;
                    var input = self.get("parent");
                    // stop valuechange event
                    input._stopNotify = 1;
                    input.set("selectedItem", item);
                    input.set("collapsed", true);
                    setTimeout(
                        function () {
                            input._stopNotify = 0;
                        },
                        // valuechange interval
                        50
                    );
                });

                var reAlign = S.buffer(function () {
                    var self = this;
                    if (self.get("visible")) {
                        self.get("parent")._onWindowResize();
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
                    self._hideForComboBox();
                });

                contentEl.on("mouseover", function () {
                    var input = self.get("parent");
                    // trigger el focusous
                    input.get("input")[0].focus();
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

            _hideForComboBox:function () {
                var self = this;
                self._dismissTimer = setTimeout(function () {
                    self.get("parent").set("collapsed", true);
                }, 30);
            },

            destructor:function () {
                var self = this;
                Event.remove(window, "resize", self.__reAlign, self);
            }
        }, {
            ATTRS:{
                head:{
                    view:true
                },
                foot:{
                    view:true
                },
                xrender:{
                    value:ComboBoxMenuRender
                }
            }
        }, {
            xclass:'combobox-menu',
            priority:40
        });

    return ComboBoxMenu;
}, {
    requires:['event', 'menu', './menuRender']
});
/**
 * 2012-03-26 yiminghe@gmail.com
 *  - refer http://www.w3.org/TR/wai-aria-practices/#combobox
 **//**
 * @fileOverview ComboBox menu render
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/menuRender", function (S, Menu) {
    var $ = S.all;
    return Menu.PopupMenu.Render.extend({
        createDom:function () {
            var self = this,
                el = self.get("el"),
                head = $("<div class='ks-combobox-menu-header"
                    + "'></div>"),
                foot = $("<div class='ks-combobox-menu-footer"
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
    requires:['menu']
});
