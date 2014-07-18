/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:03
*/
/*
combined modules:
filter-menu
filter-menu/render-xtpl
*/
KISSY.add('filter-menu', [
    'menu',
    './filter-menu/render-xtpl',
    'component/extension/content-box',
    'util'
], function (S, require, exports, module) {
    /**
 * @ignore
 * menu where items can be filtered based on user keyboard input
 * @author yiminghe@gmail.com
 */
    var Menu = require('menu');
    var FilterMenuTpl = require('./filter-menu/render-xtpl');
    var HIT_CLS = 'menuitem-hit';
    var ContentBox = require('component/extension/content-box');
    var util = require('util');    /**
 * Filter Menu for KISSY.
 * xclass: 'filter-menu'.
 * @extends KISSY.Menu
 * @class KISSY.FilterMenu
 */
    /**
 * Filter Menu for KISSY.
 * xclass: 'filter-menu'.
 * @extends KISSY.Menu
 * @class KISSY.FilterMenu
 */
    module.exports = Menu.extend([ContentBox], {
        bindUI: function () {
            var self = this, filterInput = self.get('filterInput');    /*监控键盘事件*/
            /*监控键盘事件*/
            filterInput.on('input', self.handleFilterEvent, self);
        },
        handleMouseEnterInternal: function (e) {
            var self = this;
            self.callSuper(e);    // 权益解决,filter input focus 后会滚动到牌聚焦处,select 则不会
                                  // 如果 filtermenu 的菜单项被滚轮滚到后面,点击触发不了,会向前滚动到 filter input
            // 权益解决,filter input focus 后会滚动到牌聚焦处,select 则不会
            // 如果 filtermenu 的菜单项被滚轮滚到后面,点击触发不了,会向前滚动到 filter input
            self.getKeyEventTarget()[0].select();
        },
        handleFilterEvent: function () {
            var self = this, str, filterInput = self.get('filterInput'), highlightedItem = self.get('highlightedItem');    /* 根据用户输入过滤 */
            /* 根据用户输入过滤 */
            self.set('filterStr', filterInput.val());
            str = filterInput.val();
            if (self.get('allowMultiple')) {
                str = str.replace(/^.+,/, '');
            }
            if (!str && highlightedItem) {
                highlightedItem.set('highlighted', false);
            } else if (str && (!highlightedItem || !highlightedItem.get('visible'))) {
                // 尽量保持原始高亮
                // 如果没有高亮项或者高亮项因为过滤被隐藏了
                // 默认选择符合条件的第一项
                highlightedItem = self._getNextEnabledHighlighted(0, 1);
                if (highlightedItem) {
                    highlightedItem.set('highlighted', true);
                }
            }
        },
        _onSetFilterStr: function (v) {
            // 过滤条件变了立即过滤
            this.filterItems(v);
        },
        _onSetPlaceholder: function (v) {
            this.get('placeholderEl').html(v);
        },
        getKeyEventTarget: function () {
            return this.get('filterInput');
        },
        /**
         * Specify how to filter items.
         * @param {String} str User input.
         */
        filterItems: function (str) {
            var self = this, prefixCls = self.get('prefixCls'), _placeholderEl = self.get('placeholderEl'), filterInput = self.get('filterInput');    // 有过滤条件提示隐藏,否则提示显示
            // 有过滤条件提示隐藏,否则提示显示
            _placeholderEl[str ? 'hide' : 'show']();
            if (self.get('allowMultiple')) {
                var enteredItems = [], lastWord;    // \uff0c => ，
                // \uff0c => ，
                var match = str.match(/(.+)[,\uff0c]\s*([^\uff0c,]*)/);    // 已经确认的项
                                                                           // , 号之前的项必定确认
                // 已经确认的项
                // , 号之前的项必定确认
                var items = [];
                if (match) {
                    items = match[1].split(/[,\uff0c]/);
                }    // 逗号结尾
                     // 如果可以补全,那么补全最后一项为第一个高亮项
                // 逗号结尾
                // 如果可以补全,那么补全最后一项为第一个高亮项
                if (/[,\uff0c]$/.test(str)) {
                    enteredItems = [];
                    if (match) {
                        enteredItems = items;    //待补全的项
                        //待补全的项
                        lastWord = items[items.length - 1];
                        var item = self.get('highlightedItem'), content = item && item.get('content');    // 有高亮而且最后一项不为空补全
                        // 有高亮而且最后一项不为空补全
                        if (content && content.indexOf(lastWord) > -1 && lastWord) {
                            enteredItems[enteredItems.length - 1] = content;
                        }
                        filterInput.val(enteredItems.join(',') + ',');
                    }
                    str = '';
                } else {
                    // 需要菜单过滤的过滤词,在最后一个 , 后面
                    if (match) {
                        str = match[2] || '';
                    }    // 没有 , 则就是当前输入的
                         // else{ str=str}
                         //记录下
                    // 没有 , 则就是当前输入的
                    // else{ str=str}
                    //记录下
                    enteredItems = items;
                }
                var oldEnteredItems = self.get('enteredItems');    // 发生变化,长度变化和内容变化等同
                // 发生变化,长度变化和内容变化等同
                if (oldEnteredItems.length !== enteredItems.length) {
                    // S.log('enteredItems : ');
                    // S.log(enteredItems);
                    self.set('enteredItems', enteredItems);
                }
            }
            var children = self.get('children'), strExp = str && new RegExp(util.escapeRegExp(str), 'ig');    // 过滤所有子组件
            // 过滤所有子组件
            util.each(children, function (c) {
                var content = c.get('content');
                if (!str) {
                    // 没有过滤条件
                    // 恢复原有内容
                    // 显示出来
                    c.get('el').html(content);
                    c.set('visible', true);
                } else {
                    if (content.indexOf(str) > -1) {
                        // 如果符合过滤项
                        // 显示
                        c.set('visible', true);    // 匹配子串着重 input-wrap
                        // 匹配子串着重 input-wrap
                        c.get('el').html(content.replace(strExp, function (m) {
                            return '<span class="' + prefixCls + HIT_CLS + '">' + m + '<' + '/span>';
                        }));
                    } else {
                        // 不符合
                        // 隐藏
                        c.set('visible', false);
                    }
                }
            });
        },
        /**
         * Reset user input.
         */
        reset: function () {
            var self = this;
            self.set('filterStr', '');
            self.set('enteredItems', []);
            self.get('filterInput').val('');
        }
    }, {
        ATTRS: {
            handleGestureEvents: { value: true },
            focusable: { value: true },
            allowTextSelection: { value: true },
            contentTpl: { value: FilterMenuTpl },
            filterInput: {
                selector: function () {
                    return '.' + this.getBaseCssClass('input');
                }
            },
            filterInputWrap: {
                selector: function () {
                    return '.' + this.getBaseCssClass('input-wrap');
                }
            },
            /**
             * Hit info string
             * @cfg {String} placeholder
             */
            /**
             * @ignore
             */
            placeholder: {
                render: 1,
                sync: 0,
                parse: function () {
                    var placeholderEl = this.get('placeholderEl');
                    return placeholderEl && placeholderEl.html();
                }
            },
            placeholderEl: {
                selector: function () {
                    return '.' + this.getBaseCssClass('placeholder');
                }
            },
            /**
             * Filter string
             * @cfg {String} filterStr
             */
            /**
             * @ignore
             */
            filterStr: {},
            /**
             * user entered string list when allowMultiple.
             * @type {String[]}
             * @ignore
             */
            enteredItems: { value: [] },
            /**
             * Whether to allow input multiple.
             * @cfg {Boolean} allowMultiple
             */
            /**
             * @ignore
             */
            allowMultiple: { value: false }
        },
        xclass: 'filter-menu'
    });
});

KISSY.add('filter-menu/render-xtpl', [], function (S, require, exports, module) {
    /* Compiled By XTemplate */
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
    module.exports = function renderXtpl(scope, buffer, undefined) {
        var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
        var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], rangeCommand = nativeCommands['range'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
        buffer.write('<div class="', 0);
        var option0 = { escape: 1 };
        var params1 = [];
        params1.push('input-wrap');
        option0.params = params1;
        var callRet2;
        callRet2 = callFnUtil(tpl, scope, option0, buffer, ['getBaseCssClasses'], 0, 1);
        if (callRet2 && callRet2.isBuffer) {
            buffer = callRet2;
            callRet2 = undefined;
        }
        buffer.write(callRet2, true);
        buffer.write('">\r\n    <div class="', 0);
        var option3 = { escape: 1 };
        var params4 = [];
        params4.push('placeholder');
        option3.params = params4;
        var callRet5;
        callRet5 = callFnUtil(tpl, scope, option3, buffer, ['getBaseCssClasses'], 0, 2);
        if (callRet5 && callRet5.isBuffer) {
            buffer = callRet5;
            callRet5 = undefined;
        }
        buffer.write(callRet5, true);
        buffer.write('">\r\n        ', 0);
        var id6 = scope.resolve(['placeholder'], 0);
        buffer.write(id6, true);
        buffer.write('\r\n    </div>\r\n    <input class="', 0);
        var option7 = { escape: 1 };
        var params8 = [];
        params8.push('input');
        option7.params = params8;
        var callRet9;
        callRet9 = callFnUtil(tpl, scope, option7, buffer, ['getBaseCssClasses'], 0, 5);
        if (callRet9 && callRet9.isBuffer) {
            buffer = callRet9;
            callRet9 = undefined;
        }
        buffer.write(callRet9, true);
        buffer.write('"\r\n            autocomplete="off"/>\r\n</div>\r\n<div class="', 0);
        var option10 = { escape: 1 };
        var params11 = [];
        params11.push('content');
        option10.params = params11;
        var callRet12;
        callRet12 = callFnUtil(tpl, scope, option10, buffer, ['getBaseCssClasses'], 0, 8);
        if (callRet12 && callRet12.isBuffer) {
            buffer = callRet12;
            callRet12 = undefined;
        }
        buffer.write(callRet12, true);
        buffer.write('">', 0);
        var id13 = scope.resolve(['content'], 0);
        buffer.write(id13, false);
        buffer.write('</div>', 0);
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});

