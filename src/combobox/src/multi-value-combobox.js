/**
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
 **/