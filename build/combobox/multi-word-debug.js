/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 13:53
*/
/*
combined modules:
combobox/multi-word
combobox/multi-word/cursor
*/
KISSY.add('combobox/multi-word', [
    './multi-word/cursor',
    'combobox'
], function (S, require, exports, module) {
    /**
 * @ignore
 * Input wrapper for ComboBox component.
 * @author yiminghe@gmail.com
 */
    var SUFFIX = 'suffix', rWhitespace = /\s|\xa0/;
    var getCursor = require('./multi-word/cursor');
    var ComboBox = require('combobox');
    function strContainsChar(str, c) {
        return c && str.indexOf(c) !== -1;
    }
    function beforeVisibleChange(e) {
        if (e.newVal && e.target === this.get('menu')) {
            this.alignWithCursor();
        }
    }    /**
 * KISSY MultiWordComboBox.
 * @extends KISSY.ComboBox
 * @class KISSY.ComboBox.MultiWordComboBox
 */
    /**
 * KISSY MultiWordComboBox.
 * @extends KISSY.ComboBox
 * @class KISSY.ComboBox.MultiWordComboBox
 */
    module.exports = ComboBox.extend({
        syncUI: function () {
            var self = this, menu;
            if (self.get('alignWithCursor')) {
                menu = self.get('menu');
                menu.setInternal('align', null);
                menu.on('beforeVisibleChange', beforeVisibleChange, this);
            }
        },
        getCurrentValue: function () {
            var self = this, inputDesc = getInputDesc(self), tokens = inputDesc.tokens, tokenIndex = inputDesc.tokenIndex, separator = self.get('separator'), separatorType = self.get('separatorType'), token = tokens[tokenIndex], l = token.length - 1;
            if (separatorType !== SUFFIX) {
                if (strContainsChar(separator, token.charAt(0))) {
                    token = token.slice(1);
                } else {
                    // 无效输入，前缀模式无前缀
                    return undefined;
                }
            } else if (separatorType === SUFFIX && strContainsChar(separator, token.charAt(l))) {
                token = token.slice(0, l);
            }
            return token;
        },
        setCurrentValue: function (value, setCfg) {
            var self = this, input = self.get('input'), inputDesc = getInputDesc(self), tokens = inputDesc.tokens, tokenIndex = Math.max(0, inputDesc.tokenIndex), separator = self.get('separator'), cursorPosition, l, separatorType = self.get('separatorType'), nextToken = tokens[tokenIndex + 1] || '', token = tokens[tokenIndex];
            if (separatorType !== SUFFIX) {
                tokens[tokenIndex] = token.charAt(0) + value;
                if (value && !(nextToken && rWhitespace.test(nextToken.charAt(0)))) {
                    // 自动加空白间隔
                    tokens[tokenIndex] += ' ';
                }
            } else {
                tokens[tokenIndex] = value;
                l = token.length - 1;    // 尽量补上后缀
                // 尽量补上后缀
                if (strContainsChar(separator, token.charAt(l))) {
                    tokens[tokenIndex] += token.charAt(l);
                } else if (separator.length === 1) {
                    // 自动加后缀
                    tokens[tokenIndex] += separator;
                }
            }
            cursorPosition = tokens.slice(0, tokenIndex + 1).join('').length;
            self.set('value', tokens.join(''), setCfg);
            input.prop('selectionStart', cursorPosition);
            input.prop('selectionEnd', cursorPosition);
        },
        alignWithCursor: function () {
            var self = this;    // does not support align with separator
                                // will cause ime error
            // does not support align with separator
            // will cause ime error
            var menu = self.get('menu'), cursorOffset, input = self.get('input');
            cursorOffset = getCursor(input);
            menu.move(cursorOffset.left, cursorOffset.top);
        }
    }, {
        ATTRS: {
            /**
         * Separator chars used to separator multiple inputs.
         * Defaults to: ;,
         * @cfg {String} separator
         */
            /**
         * @ignore
         */
            separator: { value: ',;' },
            /**
         * Separator type.
         * After value( 'suffix' ) or before value( 'prefix' ).
         * Defaults to: 'suffix'
         * @cfg {String} separatorType
         */
            /**
         * @ignore
         */
            separatorType: { value: SUFFIX },
            /**
         * If separator wrapped by literal chars,separator become normal chars.
         * Defaults to: "
         * @cfg {String} literal
         */
            /**
         * @ignore
         */
            literal: { value: '"' },
            /**
         * Whether align menu with individual token after separated by separator.
         * Defaults to: false
         * @cfg {Boolean} alignWithCursor
         */
            /**
         * @ignore
         */
            alignWithCursor: {}
        },
        xclass: 'multi-value-combobox'
    });    // #----------------------- private start
    // #----------------------- private start
    function getInputDesc(self) {
        var input = self.get('input'), inputVal = self.get('value'), tokens = [], cache = [], literal = self.get('literal'), separator = self.get('separator'), separatorType = self.get('separatorType'), inLiteral = false,
            // 每个空格算作独立 token
            allowWhitespaceAsStandaloneToken = separatorType !== SUFFIX, cursorPosition = input.prop('selectionStart'), i, c, tokenIndex = -1;
        for (i = 0; i < inputVal.length; i++) {
            c = inputVal.charAt(i);
            if (literal) {
                if (c === literal) {
                    inLiteral = !inLiteral;
                }
            }
            if (inLiteral) {
                cache.push(c);
                continue;
            }
            if (i === cursorPosition) {
                // current token index
                tokenIndex = tokens.length;
            }    // whitespace is not part of token value
                 // then separate
            // whitespace is not part of token value
            // then separate
            if (allowWhitespaceAsStandaloneToken && rWhitespace.test(c)) {
                if (cache.length) {
                    tokens.push(cache.join(''));
                }
                cache = [];
                cache.push(c);
            } else if (strContainsChar(separator, c)) {
                if (separatorType === SUFFIX) {
                    cache.push(c);
                    if (cache.length) {
                        tokens.push(cache.join(''));
                    }
                    cache = [];
                } else {
                    if (cache.length) {
                        tokens.push(cache.join(''));
                    }
                    cache = [];
                    cache.push(c);
                }
            } else {
                cache.push(c);
            }
        }
        if (cache.length) {
            tokens.push(cache.join(''));
        }    // 至少有一个
        // 至少有一个
        if (!tokens.length) {
            tokens.push('');
        }
        if (tokenIndex === -1) {
            // 后缀末尾
            // ,^
            if (separatorType === SUFFIX && strContainsChar(separator, c)) {
                tokens.push('');
            }
            tokenIndex = tokens.length - 1;
        }
        return {
            tokens: tokens,
            cursorPosition: cursorPosition,
            tokenIndex: tokenIndex
        };
    }    // #------------------------private end
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
});
KISSY.add('combobox/multi-word/cursor', [
    'util',
    'node'
], function (S, require, exports, module) {
    /**
 * @ignore
 * get cursor position of input
 * @author yiminghe@gmail.com
 */
    var util = require('util');
    var $ = require('node'), FAKE_DIV_HTML = '<div style="' + 'z-index:-9999;' + 'overflow:hidden;' + 'position: fixed;' + 'left:-9999px;' + 'top:-9999px;' + 'opacity:0;' + // firefox default normal,need to force to use pre-wrap
        'white-space:pre-wrap;' + 'word-wrap:break-word;' + '"></div>', FAKE_DIV, MARKER = '<span>' + // must has content
        // or else <br/><span></span> can not get right coordinates
        'x' + '</span>', STYLES = [
            'paddingLeft',
            'paddingTop',
            'paddingBottom',
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
        ], supportInputScrollLeft, findSupportInputScrollLeft;
    function getFakeDiv(elem) {
        var fake = FAKE_DIV;
        if (!fake) {
            fake = $(FAKE_DIV_HTML);
        }
        if (String(elem[0].type.toLowerCase()) === 'textarea') {
            fake.css('width', elem.css('width'));
        } else {
            // input does not wrap at all
            fake.css('width', 9999);
        }
        util.each(STYLES, function (s) {
            fake.css(s, elem.css(s));
        });
        if (!FAKE_DIV) {
            fake.insertBefore(elem[0].ownerDocument.body.firstChild);
        }
        FAKE_DIV = fake;
        return fake;
    }
    findSupportInputScrollLeft = function () {
        var doc = document, input = $('<input>');
        input.css({
            width: 1,
            position: 'absolute',
            left: -9999,
            top: -9999
        });
        input.val('123456789');
        input.appendTo(doc.body);
        input[0].focus();
        supportInputScrollLeft = input[0].scrollLeft > 0;
        input.remove();
        findSupportInputScrollLeft = function () {
        };
    };    // firefox not support, chrome support
    // firefox not support, chrome support
    supportInputScrollLeft = false;
    module.exports = function (elem) {
        var $elem = $(elem);
        elem = $elem[0];
        var doc = elem.ownerDocument, $doc = $(doc), elemOffset, range, fake, selectionStart, offset, marker, elemScrollTop = elem.scrollTop, elemScrollLeft = elem.scrollLeft;
        if (doc.selection) {
            range = doc.selection.createRange();
            return {
                // http://msdn.microsoft.com/en-us/library/ie/ms533540(v=vs.85).aspx
                // or simple range.offsetLeft for textarea
                left: range.boundingLeft + elemScrollLeft + $doc.scrollLeft(),
                top: range.boundingTop + elemScrollTop + range.boundingHeight + $doc.scrollTop()
            };
        }
        elemOffset = $elem.offset();    // input does not has scrollLeft
                                        // so just get the position of the beginning of input
        // input does not has scrollLeft
        // so just get the position of the beginning of input
        if (!supportInputScrollLeft && elem.type !== 'textarea') {
            elemOffset.top += elem.offsetHeight;
            return elemOffset;
        }
        fake = getFakeDiv($elem);
        selectionStart = elem.selectionStart;
        fake.html(util.escapeHtml(elem.value.substring(0, selectionStart - 1)) + // marker
        MARKER);    // can not set fake to scrollTop，marker is always at bottom of marker
                    // when cursor at the middle of textarea , error occurs
                    // fake.scrollTop = elemScrollTop;
                    // fake.scrollLeft = elemScrollLeft;
        // can not set fake to scrollTop，marker is always at bottom of marker
        // when cursor at the middle of textarea , error occurs
        // fake.scrollTop = elemScrollTop;
        // fake.scrollLeft = elemScrollLeft;
        offset = elemOffset;    // offset.left += 500;
        // offset.left += 500;
        fake.offset(offset);
        marker = fake.last();
        offset = marker.offset();
        offset.top += marker.height();    // at the start of textarea , just fetch marker's left
        // at the start of textarea , just fetch marker's left
        if (selectionStart > 0) {
            offset.left += marker.width();
        }    // so minus scrollTop/Left
        // so minus scrollTop/Left
        offset.top -= elemScrollTop;
        offset.left -= elemScrollLeft;    // offset.left -= 500;
        // offset.left -= 500;
        return offset;
    };
});


