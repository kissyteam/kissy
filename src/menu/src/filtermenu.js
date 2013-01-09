/**
 * @ignore
 * menu where items can be filtered based on user keyboard input
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/filtermenu", function (S, Component, Menu, FilterMenuRender) {

    var HIT_CLS = "menuitem-hit";

    // 转义正则特殊字符,返回字符串用来构建正则表达式
    function regExpEscape(s) {
        return s.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
            replace(/\x08/g, '\\x08');
    }

    /**
     *
     * Filter Menu for KISSY.
     * xclass: 'filter-menu'.
     * @extends KISSY.Menu
     * @class KISSY.Menu.FilterMenu
     */
    var FilterMenu = Menu.extend([Component.DecorateChild], {
            bindUI: function () {
                var self = this,
                    view = self.get("view"),
                    filterInput = view.get("filterInput");
                /*监控键盘事件*/
                filterInput.on("keyup", self.handleFilterEvent, self);
            },

            handleMouseEnter: function () {
                var self = this;
                FilterMenu.superclass.handleMouseEnter.apply(self, arguments);
                // 权益解决,filter input focus 后会滚动到牌聚焦处,select 则不会
                // 如果 filtermenu 的菜单项被滚轮滚到后面,点击触发不了,会向前滚动到 filter input
                self.getKeyEventTarget()[0].select();
            },

            handleFilterEvent: function () {
                var self = this,
                    view = self.get("view"),
                    filterInput = view.get("filterInput"),
                    highlightedItem = self.get("highlightedItem");
                /* 根据用户输入过滤 */
                self.set("filterStr", filterInput.val());

                // 如果没有高亮项或者高亮项因为过滤被隐藏了
                // 默认选择符合条件的第一项
                if (!highlightedItem || !highlightedItem.get("visible")) {
                    self.set("highlightedItem",
                        self._getNextEnabledHighlighted(0, 1));
                }
            },

            '_onSetFilterStr': function (v) {
                // 过滤条件变了立即过滤
                this.filterItems(v);
            },

            /**
             * Specify how to filter items.
             * @param {String} str User input.
             */
            filterItems: function (str) {
                var self = this,
                    prefixCls = self.get('prefixCls'),
                    view = self.get("view"),
                    _labelEl = view.get("labelEl"),
                    filterInput = view.get("filterInput");

                // 有过滤条件提示隐藏,否则提示显示
                _labelEl[str ? "hide" : "show"]();

                if (self.get("allowMultiple")) {
                    var enteredItems = [],
                        lastWord;
                    // \uff0c => ，
                    var match = str.match(/(.+)[,\uff0c]\s*([^\uff0c,]*)/);
                    // 已经确认的项
                    // , 号之前的项必定确认

                    var items = [];

                    if (match) {
                        items = match[1].split(/[,\uff0c]/);
                    }

                    // 逗号结尾
                    // 如果可以补全,那么补全最后一项为第一个高亮项
                    if (/[,\uff0c]$/.test(str)) {
                        enteredItems = [];
                        if (match) {
                            enteredItems = items;
                            //待补全的项
                            lastWord = items[items.length - 1];
                            var item = self.get("highlightedItem"),
                                content = item && item.get("content");
                            // 有高亮而且最后一项不为空补全
                            if (content && content.indexOf(lastWord) > -1
                                && lastWord) {
                                enteredItems[enteredItems.length - 1] = content;
                            }
                            filterInput.val(enteredItems.join(",") + ",");
                        }
                        str = '';
                    } else {
                        // 需要菜单过滤的过滤词,在最后一个 , 后面
                        if (match) {
                            str = match[2] || "";
                        }
                        // 没有 , 则就是当前输入的
                        // else{ str=str}

                        //记录下
                        enteredItems = items;
                    }
                    var oldEnteredItems = self.get("enteredItems");
                    // 发生变化,长度变化和内容变化等同
                    if (oldEnteredItems.length != enteredItems.length) {
                        S.log("enteredItems : ");
                        S.log(enteredItems);
                        self.set("enteredItems", enteredItems);
                    }
                }

                var children = self.get("children"),
                    strExp = str && new RegExp(regExpEscape(str), "ig");

                // 过滤所有子组件
                S.each(children, function (c) {
                    var content = c.get("content");
                    if (!str) {
                        // 没有过滤条件
                        // 恢复原有内容
                        // 显示出来
                        c.get("el").html(content);
                        c.set("visible", true);
                    } else {
                        if (content.indexOf(str) > -1) {
                            // 如果符合过滤项
                            // 显示
                            c.set("visible", true);
                            // 匹配子串着重 wrap
                            c.get("el").html(content.replace(strExp, function (m) {
                                return "<span class='" + prefixCls + HIT_CLS + "'>" + m + "<" + "/span>";
                            }));
                        } else {
                            // 不符合
                            // 隐藏
                            c.set("visible", false);
                        }
                    }
                });
            },

            /**
             * Reset user input.
             */
            reset: function () {
                var self = this,
                    view = self.get("view");
                self.set("filterStr", "");
                self.set("enteredItems", []);
                var filterInput = view && view.get("filterInput");
                filterInput && filterInput.val("");
            },

            destructor: function () {
                var view = this.get("view");
                var filterInput = view && view.get("filterInput");
                filterInput && filterInput.detach();
            }

        },
        {
            ATTRS: {

                allowTextSelection: {
                    value: true
                },

                /**
                 * Hit info string
                 * @cfg {String} label
                 */
                /**
                 * @ignore
                 */
                label: {
                    view: 1
                },

                /**
                 * Filter string
                 * @cfg {String} filterStr
                 */
                /**
                 * @ignore
                 */
                filterStr: {
                },

                /**
                 * user entered string list when allowMultiple.
                 * @type {String[]}
                 * @ignore
                 */
                enteredItems: {
                    value: []
                },

                /**
                 * Whether to allow input multiple.
                 * @cfg {Boolean} allowMultiple
                 */
                /**
                 * @ignore
                 */
                allowMultiple: {
                    value: false
                },

                decorateChildCls: {
                    valueFn: function () {
                        return this.get("prefixCls") + "menu-content"
                    }
                },

                xrender: {
                    value: FilterMenuRender
                }
            }
        }, {
            xclass: 'filter-menu',
            priority: 20
        });

    return FilterMenu;
}, {
    requires: ['component/base', './base', './filtermenu-render']
});