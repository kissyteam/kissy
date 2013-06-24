/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jun 24 21:41
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 combobox/cursor
 combobox/multi-value-combobox
 combobox/filter-select
 combobox/local-data-source
 combobox/remote-data-source
 combobox
*/

/**
 * @ignore
 * get cursor position of input
 * @author yiminghe@gmail.com
 */
KISSY.add('combobox/cursor', function (S, Node) {

    var $ = Node.all,
        FAKE_DIV_HTML = "<div style='" +
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
        var fake = FAKE_DIV;
        if (!fake) {
            fake = $(FAKE_DIV_HTML);
        }
        if (String(elem.type) == 'textarea') {
            fake.css("width", elem.css("width"));
        } else {
            // input does not wrap at all
            fake.css("width", 9999);
        }
        S.each(STYLES, function (s) {
            fake.css(s, elem.css(s));
        });
        if (!FAKE_DIV) {
            fake.insertBefore(elem[0].ownerDocument.body.firstChild);
        }
        FAKE_DIV = fake;
        return fake;
    }

    findSupportInputScrollLeft = function () {
        var doc = document,
            input = $("<input>");
        input.css({
            width: 1,
            position: "absolute",
            left: -9999,
            top: -9999
        });
        input.val("123456789");
        input.appendTo(doc.body);
        input[0].focus();
        supportInputScrollLeft = !!(input[0].scrollLeft > 0);
        input.remove();
        findSupportInputScrollLeft = S.noop;
    };

    // firefox not support, chrome support
    supportInputScrollLeft = false;

    return function (elem) {
        var $elem = $(elem);
        elem = $elem[0];
        var doc = elem.ownerDocument,
            $doc = $(doc),
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
                left: range.boundingLeft + elemScrollLeft +
                    $doc.scrollLeft(),
                top: range.boundingTop + elemScrollTop +
                    range.boundingHeight + $doc.scrollTop()
            };
        }

        elemOffset = $elem.offset();

        // input does not has scrollLeft
        // so just get the position of the beginning of input
        if (!supportInputScrollLeft && elem.type != 'textarea') {
            elemOffset.top += elem.offsetHeight;
            return elemOffset;
        }

        fake = getFakeDiv($elem);

        selectionStart = elem.selectionStart;

        fake.html(S.escapeHtml(elem.value.substring(0, selectionStart - 1)) +
            // marker
            MARKER);

        // can not set fake to scrollTop，marker is always at bottom of marker
        // when cursor at the middle of textarea , error occurs
        // fake.scrollTop = elemScrollTop;
        // fake.scrollLeft = elemScrollLeft;
        offset = elemOffset;

        // offset.left += 500;
        fake.offset(offset);
        marker = fake.last();
        offset = marker.offset();
        offset.top += marker.height();
        // at the start of textarea , just fetch marker's left
        if (selectionStart > 0) {
            offset.left += marker.width();
        }

        // so minus scrollTop/Left
        offset.top -= elemScrollTop;
        offset.left -= elemScrollLeft;

        // offset.left -= 500;
        return offset;
    };

}, {
    requires: ['node']
});
/**
 * @ignore
 * Input wrapper for ComboBox component.
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/multi-value-combobox", function (S, getCursor, ComboBox) {

    var SUFFIX = 'suffix',
        rWhitespace = /\s|\xa0/;

    function strContainsChar(str, c) {
        return c && str.indexOf(c) != -1;
    }

    function beforeVisibleChange(e) {
        if (e.newVal && e.target == this.get('menu')) {
            this.alignWithCursor();
        }
    }

    /**
     * KISSY MultiValueComboBox.
     * @extends KISSY.ComboBox
     * @class KISSY.ComboBox.MultiValueComboBox
     */
    return ComboBox.extend({

            syncUI: function () {
                var self = this,
                    menu;
                if (self.get('alignWithCursor')) {
                    menu = self.get('menu');
                    menu.setInternal('align',null);
                    menu.on('beforeVisibleChange', beforeVisibleChange, this);
                }
            },

            getValueForAutocomplete: function () {

                var self = this,
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

            setValueFromAutocomplete: function (value, setCfg) {
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
                    } else if (value) {
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

                self.set('value', tokens.join(""), setCfg);

                input.prop("selectionStart", cursorPosition);
                input.prop("selectionEnd", cursorPosition);
            },

            'alignWithCursor': function () {
                var self = this;
                // does not support align with separator
                // will cause ime error
                var menu = self.get("menu"),
                    cursorOffset,
                    input = self.get("input");
                cursorOffset = getCursor(input);
                menu.move(cursorOffset.left, cursorOffset.top);
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
            },
            xclass: 'multi-value-combobox'
        });

    // #----------------------- private start

    function getInputDesc(self) {
        var input = self.get("input"),
            inputVal = self.get('value'),
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
 **/
/**
 * @ignore
 * filter select from combobox
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
});
/**
 * @ignore
 * Local dataSource for ComboBox
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/local-data-source", function (S) {

    /**
     * Local dataSource for comboBox.
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
});
/**
 * @ignore
 * Remote datasource for ComboBox
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/remote-data-source", function (S, Io) {

    /**
     * dataSource which wrap {@link KISSY.Io} utility.
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
         * Io configuration.same as {@link KISSY.Io}
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
            self.io = Io(xhrCfg);
        }
    });
    return RemoteDataSource;
}, {
    requires: ['io']
});
/**
 * @ignore
 * Export ComboBox.
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
        'combobox/local-data-source',
        'combobox/remote-data-source'
    ]
});

