/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Jul 2 11:41
*/
/**
 * @fileOverview Input wrapper for ComboBox component.
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/base", function (S, Node, Component, ComboBoxRender, _, Menu, undefined) {
    var ComboBox,
        $ = Node.all,
        KeyCodes = Node.KeyCodes,
        ALIGN = {
            points:["bl", "tl"],
            overflow:{
                adjustX:1,
                adjustY:1
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
            _savedInputValue:null,

            _stopNotify:0,

            bindUI:function () {
                var self = this,
                    input = self.get("input");
                input.on("valuechange", onValueChange, self);

                /**
                 * @name ComboBox#afterCollapsedChange
                 * @description fired after combobox 's collapsed attribute is changed.
                 * @event
                 * @param e
                 * @param e.newVal current value
                 * @param e.prevVal previous value
                 */

            },

            bindMenu:function () {
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
                dataSource.fetchData(value, renderData, self);
            },

            _uiSetCollapsed:function (v) {
                if (v) {
                    hideMenu(this);
                } else {
                    showMenu(this);
                }
            },

            handleBlur:function () {
                var self = this;
                ComboBox.superclass.handleBlur.apply(self, arguments);
                delayHide.call(self);
            },

            handleKeyEventInternal:function (e) {
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

            _selectItem:function (item) {
                var self = this;
                if (item) {
                    var textContent = item.get("textContent"),
                        separatorType = self.get("separatorType");
                    setValue(self, textContent + (separatorType == SUFFIX ? "" : " "));
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

            destructor:function () {
                win.detach("resize", repositionBuffer, this);
            }
        },
        {
            ATTRS:/**
             * @lends ComboBox#
             */
            {

                /**
                 * Input element of current combobox.
                 * @type NodeList
                 */
                input:{
                    view:1
                },

                trigger:{
                    view:1
                },

                /**
                 * Whether show combobox trigger.
                 * Default: true.
                 * @type Boolean
                 */
                hasTrigger:{
                    view:1
                },

                /**
                 * ComboBox dropDown menuList
                 * @type Menu.PopupMenu
                 */
                menu:{
                    value:{
                        xclass:'popupmenu'
                    },
                    setter:function (m) {
                        if (m instanceof Component.Controller) {
                            m.__set("parent", this);
                        }
                    }
                },

                /**
                 * Whether combobox menu is hidden.
                 * @type Boolean
                 */
                collapsed:{
                    view:1
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
                 * Whether drop down menu is same width with input.
                 * Default: true.
                 * @type {Boolean}
                 */
                matchElWidth:{
                    value:true
                },

                /**
                 * Format function to return array of
                 * html/text/menu item attributes from array of data.
                 * @type {Function}
                 */
                format:{
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
                 * Separator type.
                 * After value( 'suffix' ) or before value( 'prefix' ).
                 * @type String
                 */
                separatorType:{
                    value:SUFFIX
                },

                /**
                 * Whether whitespace is part of toke value.
                 * Default true
                 * @type Boolean
                 * @private
                 */
                whitespace:{
                    valueFn:function () {
                        return this.get("separatorType") == SUFFIX;
                    }
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

    function renderData(data) {
        var self = this,
            v,
            children = [],
            val,
            contents,
            matchVal,
            i,
            menu = getMenu(self, 1);


        menu.removeChildren(true);

        if (data && data.length) {
            data = data.slice(0, self.get("maxItemCount"));
            if (self.get("format")) {
                contents = self.get("format").call(self, getValue(self), data);
            } else {
                contents = [];
            }
            for (i = 0; i < data.length; i++) {
                v = data[i];
                children.push(menu.addChild(S.mix({
                    xclass:'menuitem',
                    content:v,
                    textContent:v,
                    value:v
                }, contents[i])));
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
        var self = this,
            input = self.get("input");
        if (!self.get('collapsed')) {
            self.set('collapsed', true);
        } else {
            input[0].focus();
            self.sendRequest('');
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
            tokens:tokens,
            cursorPosition:cursorPosition,
            tokenIndex:tokenIndex
        };
    }

    // #------------------------private end

    return ComboBox;
}, {
    requires:[
        'node',
        'component',
        './baseRender',
        'input-selection',
        'menu'
    ]
});

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
 **//**
 * @fileOverview Render aria properties to input element.
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/baseRender", function (S, Component) {

    var tpl = '<div class="ks-combobox-input-wrap">' +
            '</div>',
        triggerTpl = '<div class="ks-combobox-trigger">' +
            '<div class="ks-combobox-trigger-inner">&#x25BC;</div>' +
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
            var self = this,
                wrap,
                input,
                el = self.get("el"),
                trigger = self.get("trigger");

            if (!self.get("srcNode")) {
                el.append(tpl);
                wrap = el.one(".ks-combobox-input-wrap");
                input = self.get("input") || S.all(inputTpl);
                wrap.append(input);
                self.__set("input", input);
            }
            if (!trigger) {
                self.__set("trigger", S.all(triggerTpl));
            }

            self.get("trigger").unselectable();
        },

        getKeyEventTarget:function () {
            return this.get("input");
        },

        _uiSetCollapsed:function (v) {
            this.get("input").attr("aria-expanded", v);
        },

        _uiSetHasTrigger:function (t) {
            var trigger = this.get("trigger");
            if (t) {
                this.get("el").prepend(trigger);
            } else {
                trigger.remove();
            }
        }
    }, {
        ATTRS:{
            collapsed:{},
            hasTrigger:{
                value:true
            },
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
KISSY.add("combobox", function (S, ComboBox, LocalDataSource, RemoteDataSource) {
    ComboBox.LocalDataSource = LocalDataSource;
    ComboBox.RemoteDataSource = RemoteDataSource;
    return ComboBox;
}, {
    requires:[
        'combobox/base',
        'combobox/LocalDataSource',
        'combobox/RemoteDataSource'
    ]
})/**
 * @fileOverview Local dataSource for ComboBox
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/LocalDataSource", function (S, Component) {

    /**
     * @name LocalDataSource
     * @memberOf ComboBox
     * @extends Base
     * @class
     * Local dataSource for comboBox.
     * xclass: 'combobox-LocalDataSource'.
     */
    function LocalDataSource() {
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

    LocalDataSource.ATTRS =
    /**
     * @lends ComboBox.LocalDataSource#
     */
    {
        /**
         * array of static data for comboBox
         * @type Object[]
         */
        data:{
            value:[]
        },
        /**
         * parse data function.
         * Default: index of match.
         * @type Function
         */
        parse:{
            value:parser
        }
    };

    S.extend(LocalDataSource, S.Base,
        /**
         * @lends ComboBox.LocalDataSource#
         */
        {
        /**
         * Data source interface. How to get data for comboBox
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
     * @name RemoteDataSource
     * @class
     * dataSource which wrap {@link IO} utility.
     * xclass: 'combobox-RemoteDataSource'.
     * @extends Base
     * @memberOf ComboBox
     */
    function RemoteDataSource() {
        var self = this;
        RemoteDataSource.superclass.constructor.apply(self, arguments);
        self.io = null;
        self.caches = {};
    }

    RemoteDataSource.ATTRS =
    /**
     * @lends ComboBox.RemoteDataSource#
     */
    {
        /**
         * Used as parameter name to send combobox input's value to server
         * @type String
         */
        paramName:{
            value:'q'
        },
        /**
         * whether send empty to server when input val is empty.default:false
         * @type Boolean
         */
        allowEmpty:{},
        /**
         * Whether server response data is cached.default:false
         * @type Boolean
         */
        cache:{},
        /**
         * Serve as a parse function to parse server
         * response to return a valid array of data for comboBox.
         * @type Function
         */
        parse:{},
        /**
         * IO configuration.same as {@link} IO
         * @type Object
         */
        xhrCfg:{
            value:{}
        }
    };

    S.extend(RemoteDataSource, S.Base,
        /**
         * @lends ComboBox.RemoteDataSource#
         */{
            /**
             * Data source interface. How to get data for comboBox
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
});
