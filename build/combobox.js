/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 18 14:58
*/
/**
 * @ignore
 *  Input wrapper for ComboBox component.
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
                    align = S.clone(menu.get("align"));
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
                        input[0].focus();
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
                    activeItem,
                    handledByMenu,
                    menu = getMenu(self);

                if (!menu) {
                    return undefined;
                }

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

                if (menu.get("visible")) {
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

                    activeItem = menu.get("activeItem");

                    if (updateInputOnDownUp &&
                        S.inArray(e.keyCode, [KeyCodes.DOWN, KeyCodes.UP])) {
                        // update menu's active value to input just for show
                        this.setValueInternal(activeItem.get("textContent"));
                    }

                    // tab
                    // if menu is open and an menuitem is highlighted, see as click/enter
                    if (e.keyCode == KeyCodes.TAB && activeItem) {
                        // click activeItem
                        activeItem.performActionInternal();
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
                    input ,
                    inputValue;
                if (self.get("placeholder")) {
                    input = self.get("input");
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
                    var item = e.target,
                        textContent = item.get('textContent');
                    // stop valuechange event
                    self._stopNotify = 1;
                    self['setValueInternal'](textContent);
                    self._savedInputValue = textContent;
                    self.set("collapsed", true);
                    setTimeout(
                        function () {
                            self._stopNotify = 0;
                        },
                        // valuechange interval, hack
                        50
                    );
                });

                win.on("resize", self.__repositionBuffer = S.buffer(reposition, 50), self);

                el = menu.get("el");
                contentEl = menu.get("contentEl");

                // menu has input!
                el.on("focusout", delayHide, self);
                el.on("focusin", clearDismissTimer, self);

                contentEl.on("mouseover", onMenuMouseOver, self);

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
                        if (m && m['isController']) {
                            m.setInternal("parent", this);
                        }
                    }
                },

                defaultChildXClass: {
                    value: 'popupmenu'
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

    function onMenuMouseOver() {
        var self = this;
        // trigger el focus
        self.get("input")[0].focus();
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
        if (m && !m['isController']) {
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
            // 先 render，监听 width 变化事件
            menu.render();
            self.bindMenu();
            // 根据 el 自动调整大小
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

        menu.set("highlightedItem", null);

        if (data && data.length) {
            for (i = 0; i < data.length; i++) {
                v = data[i];
                children.push(menu.addChild(v));
            }

            // make menu item (which textContent is same as input) active
            val = self['getValueInternal']();
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
 **//**
 * @ignore
 *  Export ComboBox.
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox", function (S, ComboBox, MultiValueComboBox, FilterSelect, LocalDataSource, RemoteDataSource) {
    ComboBox.LocalDataSource = LocalDataSource;
    ComboBox.RemoteDataSource = RemoteDataSource;
    ComboBox.FilterSelect = FilterSelect;
    ComboBox.MultiValueComboBox = MultiValueComboBox;
    return ComboBox;
}, {
    requires: [
        'combobox/base',
        'combobox/multi-value-combobox',
        'combobox/filter-select',
        'combobox/LocalDataSource',
        'combobox/RemoteDataSource'
    ]
});/**
 * @ignore
 * get cursor position of input
 * @author yiminghe@gmail.com
 */
KISSY.add('combobox/cursor', function (S, DOM) {

    var FAKE_DIV_HTML = "<div style='" +
            "z-index:-9999;" +
            "overflow:hidden;" +
            "position: fixed;" +
            "left:-9999px;" +
            "top:-9999px;" +
            "opacity:0;" +
            // firefox default normal,need to force to use pre-wrap
            "white-space:pre-wrap;" +
            "word-wrap:break-word;" +
            "'></div>",
        FAKE_DIV,
        MARKER = "<span>" +
            // must has content
            // or else <br/><span></span> can not get right coordinates
            "x" +
            "</span>",
        STYLES = [
            'paddingLeft',
            'paddingTop', 'paddingBottom',
            'paddingRight',
            'marginLeft',
            'marginTop',
            'marginBottom',
            'marginRight',
            'borderLeftStyle',
            'borderTopStyle',
            'borderBottomStyle',
            'borderRightStyle',
            'borderLeftWidth',
            'borderTopWidth',
            'borderBottomWidth',
            'borderRightWidth',
            'line-height',
            'outline',
            'height',
            'fontFamily',
            'fontSize',
            'fontWeight',
            'fontVariant',
            'fontStyle'
        ],
        supportInputScrollLeft,
        findSupportInputScrollLeft;

    function getFakeDiv(elem) {
        var fake = FAKE_DIV, body;
        if (!fake) {
            fake = DOM.create(FAKE_DIV_HTML);
        }
        if (String(elem.type) == 'textarea') {
            DOM.css(fake, "width", DOM.css(elem, "width"));
        } else {
            // input does not wrap at all
            DOM.css(fake, "width", 9999);
        }
        S.each(STYLES, function (s) {
            DOM.css(fake, s, DOM.css(elem, s));
        });
        if (!FAKE_DIV) {
            body = elem.ownerDocument.body;
            body.insertBefore(fake, body.firstChild);
        }
        FAKE_DIV = fake;
        return fake;
    }

    findSupportInputScrollLeft = function () {
        var doc = document,
            input = DOM.create("<input>");
        DOM.css(input, {
            width: 1,
            position: "absolute",
            left: -9999,
            top: -9999
        });
        input.value = "123456789";
        doc.body.appendChild(input);
        input.focus();
        supportInputScrollLeft = !!(input.scrollLeft > 0);
        DOM.remove(input);
        findSupportInputScrollLeft = S.noop;
        alert(supportInputScrollLeft);
    };

    // firefox not support, chrome support
    supportInputScrollLeft = false;

    return function (elem) {
        elem = DOM.get(elem);
        var doc = elem.ownerDocument,
            elemOffset,
            range,
            fake,
            selectionStart,
            offset,
            marker,
            elemScrollTop = elem.scrollTop,
            elemScrollLeft = elem.scrollLeft;
        if (doc.selection) {
            range = doc.selection.createRange();
            return {
                // http://msdn.microsoft.com/en-us/library/ie/ms533540(v=vs.85).aspx
                // or simple range.offsetLeft for textarea
                left: range.boundingLeft + elemScrollLeft + DOM.scrollLeft(),
                top: range.boundingTop + elemScrollTop + range.boundingHeight + DOM.scrollTop()
            };
        }

        elemOffset = DOM.offset(elem);

        // input does not has scrollLeft
        // so just get the position of the beginning of input
        if (!supportInputScrollLeft && elem.type != 'textarea') {
            elemOffset.top += elem.offsetHeight;
            return elemOffset;
        }

        fake = getFakeDiv(elem);

        selectionStart = elem.selectionStart;

        fake.innerHTML = S.escapeHTML(elem.value.substring(0, selectionStart - 1)) +
            // marker
            MARKER;

        // can not set fake to scrollTop，marker is always at bottom of marker
        // when cursor at the middle of textarea , error occurs
        // fake.scrollTop = elemScrollTop;
        // fake.scrollLeft = elemScrollLeft;
        offset = elemOffset;

        // offset.left += 500;
        DOM.offset(fake, offset);
        marker = fake.lastChild;
        offset = DOM.offset(marker);
        offset.top += DOM.height(marker);
        // at the start of textarea , just fetch marker's left
        if (selectionStart > 0) {
            offset.left += DOM.width(marker);
        }

        // so minus scrollTop/Left
        offset.top -= elemScrollTop;
        offset.left -= elemScrollLeft;

        // offset.left -= 500;
        return offset;
    };
}, {
    requires: ['dom']
});/**
 * @ignore
 *  filter select from combobox
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/filter-select", function (S, Combobox) {

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
     * validate combobox input by dataSource
     * @class KISSY.ComboBox.FilterSelect
     * @extends KISSY.ComboBox
     */
    var FilterSelect = Combobox.extend({
        validate: function (callback) {
            var self = this;
            FilterSelect.superclass.validate.call(self, function (error, val) {
                if (!error) {
                    self.get("dataSource").fetchData(val, function (data) {
                        var d = valInAutoCompleteList(val, self.normalizeData(data));
                        callback(d ? "" : self.get("invalidMessage"), val, d);
                    });
                } else {
                    callback(error, val);
                }
            });
        }
    }, {
        ATTRS: {
            /**
             * when does not match show invalidMessage
             * @cfg {String} invalidMessage
             */
            /**
             * @ignore
             */
            invalidMessage: {
                value: 'invalid input'
            }
        }
    });

    return FilterSelect;

}, {
    requires: ['./base']
});/**
 * @ignore
 *  Local dataSource for ComboBox
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/LocalDataSource", function (S) {

    /**
     * Local dataSource for comboBox.
     * xclass: 'combobox-LocalDataSource'.
     * @extends KISSY.Base
     * @class KISSY.ComboBox.LocalDataSource
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

    LocalDataSource.ATTRS = {
        /**
         * array of static data for comboBox
         * @cfg {Object[]} data
         */
        /**
         * @ignore
         */
        data:{
            value:[]
        },
        /**
         * parse data function.
         * Defaults to: index of match.
         * @cfg {Function} parse
         */
        parse:{
            value:parser
        }
    };

    S.extend(LocalDataSource, S.Base,{
        /**
         * Data source interface. How to get data for comboBox.
         * @param {String} inputVal current active input's value
         * @param {Function} callback callback to notify comboBox when data is ready
         * @param {Object} context callback 's execution context
         */
        fetchData:function (inputVal, callback, context) {
            var parse = this.get("parse"),
                data = this.get("data");
            data = parse(inputVal, data);
            callback.call(context, data);
        }
    });

    return LocalDataSource;
}, {
    requires:['component/base']
});/**
 * @ignore
 *  Input wrapper for ComboBox component.
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/multi-value-combobox", function (S, getCursor, ComboBox) {
    var SUFFIX = 'suffix',
        rWhitespace = /\s|\xa0/;

    function strContainsChar(str, c) {
        return c && str.indexOf(c) != -1;
    }

    /**
     * KISSY MultiValueComboBox.
     * xclass: 'multi-value-combobox'.
     * @extends KISSY.ComboBox
     * @class KISSY.ComboBox.MultiValueComboBox
     */
    return ComboBox.extend({

            getValueInternal: function () {
                var self = this,
                    input = self.get("input"),
                    inputDesc = getInputDesc(self),
                    tokens = inputDesc.tokens,
                    tokenIndex = inputDesc.tokenIndex,
                    separator = self.get("separator"),
                    separatorType = self.get("separatorType"),
                    token = tokens[tokenIndex],
                    l = token.length - 1;

                if (separatorType != SUFFIX) {
                    if (strContainsChar(separator, token.charAt(0))) {
                        token = token.slice(1);
                    } else {
                        // 无效输入，前缀模式无前缀
                        return undefined;
                    }
                }

                else if (separatorType == SUFFIX && strContainsChar(separator, token.charAt(l))) {
                    token = token.slice(0, l);
                }

                return token;
            },

            setValueInternal: function (value) {
                var self = this,
                    input = self.get("input"),
                    inputDesc = getInputDesc(self),
                    tokens = inputDesc.tokens,
                    tokenIndex = Math.max(0, inputDesc.tokenIndex),
                    separator = self.get("separator"),
                    cursorPosition,
                    l,
                    separatorType = self.get("separatorType"),
                    nextToken = tokens[tokenIndex + 1] || "",
                    token = tokens[tokenIndex];

                if (separatorType != SUFFIX) {
                    tokens[tokenIndex] = token.charAt(0) + value;
                    if (nextToken && rWhitespace.test(nextToken.charAt(0))) {
                    } else {
                        // 自动加空白间隔
                        tokens[tokenIndex] += ' ';
                    }
                } else {
                    tokens[tokenIndex] = value;
                    l = token.length - 1;
                    // 尽量补上后缀
                    if (strContainsChar(separator, token.charAt(l))) {
                        tokens[tokenIndex] += token.charAt(l);
                    } else if (separator.length == 1) {
                        // 自动加后缀
                        tokens[tokenIndex] += separator;
                    }
                }

                cursorPosition = tokens.slice(0, tokenIndex + 1).join("").length;

                input.val(tokens.join(""));

                input.prop("selectionStart", cursorPosition);
                input.prop("selectionEnd", cursorPosition);
            },

            'alignInternal': function () {
                if (!this.get('alignWithCursor')) {
                    ComboBox.prototype.alignInternal.apply(this, arguments);
                    return;
                }
                var self = this,
                    inputDesc = getInputDesc(self),
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
                cursorOffset = getCursor(input);
                input.prop("selectionStart", cursorPosition);
                input.prop("selectionEnd", cursorPosition);
                menu.set("xy", [cursorOffset.left, cursorOffset.top]);
            }
        },
        {
            ATTRS: {

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
                }
            }
        }, {
            xclass: 'multi-value-combobox',
            priority: 20
        });

    // #----------------------- private start

    function getInputDesc(self) {
        var input = self.get("input"),
            inputVal = input.val(),
            tokens = [],
            cache = [],
            literal = self.get("literal"),
            separator = self.get("separator"),
            separatorType = self.get("separatorType"),
            inLiteral = false,
        // 每个空格算作独立 token
            allowWhitespaceAsStandaloneToken = separatorType != SUFFIX,
            cursorPosition = input.prop('selectionStart'),
            i,
            c,
            tokenIndex = -1;

        for (i = 0; i < inputVal.length; i++) {
            c = inputVal.charAt(i);
            if (literal) {
                if (c == literal) {
                    inLiteral = !inLiteral;
                }
            }
            if (inLiteral) {
                cache.push(c);
                continue;
            }
            if (i == cursorPosition) {
                // current token index
                tokenIndex = tokens.length;
            }

            // whitespace is not part of token value
            // then separate
            if (allowWhitespaceAsStandaloneToken && rWhitespace.test(c)) {
                if (cache.length) {
                    tokens.push(cache.join(""));
                }
                cache = [];
                cache.push(c);
            } else if (strContainsChar(separator, c)) {
                if (separatorType == SUFFIX) {
                    cache.push(c);
                    if (cache.length) {
                        tokens.push(cache.join(""));
                    }
                    cache = [];
                } else {
                    if (cache.length) {
                        tokens.push(cache.join(""));
                    }
                    cache = [];
                    cache.push(c);
                }
            } else {
                cache.push(c);
            }
        }

        if (cache.length) {
            tokens.push(cache.join(""));
        }

        // 至少有一个
        if (!tokens.length) {
            tokens.push('');
        }

        if (tokenIndex == -1) {
            // 后缀末尾
            // ,^
            if (separatorType == SUFFIX && strContainsChar(separator, c)) {
                tokens.push('');
            }
            tokenIndex = tokens.length - 1;
        }
        return {
            tokens: tokens,
            cursorPosition: cursorPosition,
            tokenIndex: tokenIndex
        };
    }

    // #------------------------private end
}, {
    requires: [
        './cursor',
        './base'
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
 **//**
 * @ignore
 *  Remote datasource for ComboBox
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/RemoteDataSource", function (S, IO) {

    /**
     * dataSource which wrap {@link KISSY.IO} utility.
     * xclass: 'combobox-RemoteDataSource'.
     * @class KISSY.ComboBox.RemoteDataSource
     * @extends KISSY.Base
     */
    function RemoteDataSource() {
        var self = this;
        RemoteDataSource.superclass.constructor.apply(self, arguments);
        self.io = null;
        self.caches = {};
    }

    RemoteDataSource.ATTRS = {
        /**
         * Used as parameter name to send combobox input's value to server.
         * Defaults to: 'q'
         * @cfg  {String} paramName
         */
        /**
         * @ignore
         */
        paramName: {
            value: 'q'
        },
        /**
         * whether send empty to server when input val is empty.
         * Defaults to: false
         * @cfg {Boolean} allowEmpty
         */
        /**
         * @ignore
         */
        allowEmpty: {},
        /**
         * Whether server response data is cached.
         * Defaults to: false
         * @cfg {Boolean} cache
         */
        /**
         * @ignore
         */
        cache: {},
        /**
         * Serve as a parse function to parse server
         * response to return a valid array of data for comboBox.
         * @cfg {Function} parse
         */
        /**
         * @ignore
         */
        parse: {},
        /**
         * IO configuration.same as {@link KISSY.IO}
         * @cfg {Object} xhrCfg
         */
        /**
         * @ignore
         */
        xhrCfg: {
            value: {}
        }
    };

    S.extend(RemoteDataSource, S.Base, {
        /**
         * Data source interface. How to get data for comboBox
         * @param {String} inputVal current active input's value
         * @param {Function} callback callback to notify comboBox when data is ready
         * @param {Object} context callback 's execution context
         */
        fetchData: function (inputVal, callback, context) {
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
                self.setInternal("data", data);
                if (cache) {
                    self.caches[inputVal] = data;
                }
                callback.call(context, data);
            };
            self.io = IO(xhrCfg);
        }
    });
    return RemoteDataSource;
}, {
    requires: ['ajax']
});/**
 * @ignore
 *  Render aria properties to input element.
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/render", function (S, Component, undefined) {

    var $ = S.all,
        tpl = '<div class="{prefixCls}combobox-input-wrap">' +
            '</div>',
        triggerTpl = '<div class="{prefixCls}combobox-trigger">' +
            '<div class="{prefixCls}combobox-trigger-inner">&#x25BC;</div>' +
            '</div>',
        inputTpl = '<input ' +
            'aria-haspopup="true" ' +
            'aria-autocomplete="list" ' +
            'aria-haspopup="true" ' +
            'role="autocomplete" ' +
            'autocomplete="off" ' +
            'class="{prefixCls}combobox-input" />';

    var ComboboxRender = Component.Render.extend({

        createDom: function () {
            var self = this,
                wrap,
                input = self.get("input"),
                inputId,
                prefixCls = self.get('prefixCls'),
                el = self.get("el"),
                trigger = self.get("trigger");

            if (!self.get("srcNode")) {
                el.append(S.substitute(tpl, {
                    prefixCls: prefixCls
                }));
                wrap = el.one("." + prefixCls + "combobox-input-wrap");
                input = input || S.all(S.substitute(inputTpl, {
                    prefixCls: prefixCls
                }));
                wrap.append(input);
                self.setInternal("input", input);
            }

            if (!trigger) {
                self.setInternal("trigger", S.all(S.substitute(triggerTpl, {
                    prefixCls: prefixCls
                })));
            }

            self.get("trigger").unselectable(/**
             @type {HTMLElement}
             @ignore
             */undefined);

            var invalidEl = $("<div " +
                "class='" + prefixCls + "combobox-invalid-el'>" +
                "<div class='" + prefixCls + "combobox-invalid-inner'></div>" +
                "</div>").insertBefore(input.parent(/**
                 @type {HTMLElement}
                 @ignore
                 */undefined, undefined), /**
                 @type {HTMLElement}
                 @ignore
                 */undefined);
            self.setInternal("invalidEl", invalidEl);

            var placeholder;

            if (placeholder = self.get("placeholder")) {
                if (!(inputId = input.attr("id"))) {
                    input.attr("id", inputId = S.guid("ks-combobox-input"));
                }
                self.setInternal('placeholderEl', $('<label for="' +
                    inputId + '" ' +
                    'class="' + prefixCls + 'combobox-placeholder">' +
                    placeholder + '</label>').appendTo(el));
            }
        },

        getKeyEventTarget: function () {
            return this.get("input");
        },

        _onSetCollapsed: function (v) {
            this.get("input").attr("aria-expanded", v);
        },

        '_onSetHasTrigger': function (t) {
            var trigger = this.get("trigger");
            if (t) {
                this.get("el").prepend(trigger);
            } else {
                trigger.remove();
            }
        },

        _onSetDisabled: function (v) {
            ComboboxRender.superclass._onSetDisabled.apply(this, arguments);
            this.get("input").attr("disabled", v);
        }

    }, {
        ATTRS: {
            collapsed: {
                value: true
            },

            hasTrigger: {
                value: true
            },

            input: {
            },

            trigger: {
            },

            placeholder: {
            },

            placeholderEl: {

            },

            invalidEl: {
            }
        },
        HTML_PARSER: {
            input: function (el) {
                return el.one("." + this.get('prefixCls') + "combobox-input");
            },
            trigger: function (el) {
                return el.one("." + this.get('prefixCls') + "combobox-trigger");
            }
        }
    });

    return ComboboxRender;
}, {
    requires: ['component/base']
});
