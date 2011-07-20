/**
 *  menu where items can be filtered based on user keyboard input
 *  @author yiminghe@gmail.com
 */
KISSY.add("menu/filtermenu", function(S, UIBase, Menu, FilterMenuRender) {

    var HIT_CLS = "{prefixCls}menuitem-hit";

    // 转义正则特殊字符，返回字符串用来构建正则表达式
    function regExpEscape(s) {
        return s.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
            replace(/\x08/g, '\\x08');
    }

    return UIBase.create(Menu, {
            bindUI:function() {
                var self = this;
                var view = self.get("view");
                var filterInput = view.get("filterInput");
                /*监控键盘事件*/
                filterInput.on("keyup", self.handleFilterEvent, self);
            },

            handleFilterEvent:function() {
                var self = this;
                var view = self.get("view");
                var filterInput = view.get("filterInput");
                /* 根据用户输入过滤 */
                self.set("filterStr", filterInput.val());
                var highlightedItem = self.get("highlightedItem");
                // 如果没有高亮项或者高亮项因为过滤被隐藏了
                // 默认选择符合条件的第一项
                if (!highlightedItem || !highlightedItem.get("visible")) {
                    self.set("highlightedItem", self._getNextEnabledHighlighted(0, 1));
                }
            },

            _uiSetFilterStr:function(v) {
                // 过滤条件变了立即过滤
                this.filterItems(v);
            },

            filterItems:function(str) {
                var self = this;
                var view = self.get("view");
                var _labelEl = view.get("labelEl");
                var filterInput = view.get("filterInput");

                // 有过滤条件提示隐藏，否则提示显示
                _labelEl[str ? "hide" : "show"]();

                if (self.get("allowMultiple")) {
                    var enteredItems = [],
                        lastWord;

                    var match = str.match(/(.+)[,，]\s*([^，,]*)/);
                    // 已经确认的项
                    // , 号之前的项必定确认

                    var items = [];

                    if (match) {
                        items = match[1].split(/[,，]/);
                    }

                    // 逗号结尾
                    // 如果可以补全，那么补全最后一项为第一个高亮项
                    if (/[,，]$/.test(str)) {
                        enteredItems = [];
                        if (match) {
                            enteredItems = items;
                            //待补全的项
                            lastWord = items[items.length - 1];
                            var item = self.get("highlightedItem");
                            var content = item && item.get("caption");
                            // 有高亮而且最后一项不为空补全
                            if (content && content.indexOf(lastWord) > -1 && lastWord) {
                                enteredItems[enteredItems.length - 1] = content;
                            }
                            filterInput.val(enteredItems.join(",") + ",");
                        }
                        str = '';
                    } else {
                        // 需要菜单过滤的过滤词，在最后一个 , 后面
                        if (match) {
                            str = match[2] || "";
                        }
                        // 没有 , 则就是当前输入的
                        // else{ str=str}

                        //记录下
                        enteredItems = items;
                    }
                    var oldEnteredItems = self.get("enteredItems");
                    // 发生变化，长度变化和内容变化等同
                    if (oldEnteredItems.length != enteredItems.length) {
                        S.log("enteredItems : ");
                        S.log(enteredItems);
                        self.set("enteredItems", enteredItems);
                    }
                }

                var children = self.get("children");

                var strExp = str && new RegExp(regExpEscape(str), "ig");

                // 匹配项样式类
                var hit = S.substitute(HIT_CLS, {
                    prefixCls:this.get("prefixCls")
                });

                // 过滤所有子组件
                S.each(children, function(c) {
                    var content = c.get("caption"),
                        view = c.get("view");
                    if (!str) {
                        // 没有过滤条件
                        // 恢复原有内容
                        // 显示出来
                        view.set("content", content);
                        c.set("visible", true);
                    } else {
                        if (content.indexOf(str) > -1) {
                            // 如果符合过滤项
                            // 显示
                            c.set("visible", true);
                            // 匹配子串着重 wrap
                            c.get("view").set("content", content.replace(strExp, function(m) {
                                return "<span class='" + hit + "'>" + m + "</span>";
                            }));
                        } else {
                            // 不符合
                            // 隐藏
                            c.set("visible", false);
                        }
                    }
                });
            },

            decorateInternal:function(el) {
                var self = this,prefixCls = this.get("prefixCls");
                self.set("el", el);
                var menuContent = el.one("." + prefixCls + "menu-content");
                self.decorateChildren(menuContent);
            },

            destructor:function() {
                var view = this.get("view");
                var filterInput = view && view.get("filterInput");
                filterInput && filterInput.detach();
            }

        },
        {
            ATTRS:{
                label:{
                    view:true
                },

                filterStr:{
                },

                enteredItems:{
                    value:[]
                },

                allowMultiple:{
                    value:false
                }
            },
            DefaultRender:FilterMenuRender
        }
    );

}, {
    requires:['uibase','./menu','./filtermenurender']
});