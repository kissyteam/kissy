/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Jul 16 11:08
*/
/**
 * @fileOverview root node represent a simple tree
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/base", function (S, Component, BaseNode, TreeRender, TreeMgr) {

    /*多继承
     1. 继承基节点（包括可装饰儿子节点功能）
     2. 继承 mixin 树管理功能
     3. 继承 mixin 儿子事件代理功能
     */

    /**
     * @name Tree
     * @class
     * KISSY Tree.
     * xclass: 'tree'.
     * @extends Tree.Node
     */
    return BaseNode.extend([Component.DelegateChildren, TreeMgr],
        /**
         * @lends Tree#
         */
        {
            /**
             * See {@link Tree.Node#expandAll}
             */
            expandAll:function () {
                return BaseNode.prototype.expandAll.apply(this, arguments);
            }
        }, {
            ATTRS:{
                xrender:{
                    value:TreeRender
                }
            }
        }, {
            xclass:'tree',
            priority:30
        });

}, {
    requires:['component', './basenode', './treeRender', './treemgr']
});

/**
 * Refer:
 *  - http://www.w3.org/TR/wai-aria-practices/#TreeView
 *
 * note bug:
 *  1. checked tree 根节点总是 selected ！
 *  2. 根节点 hover 后取消不了了
 **//**
 * @fileOverview abstraction of tree node ,root and other node will extend it
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/basenode", function (S, Node, Component, BaseNodeRender) {
    var $ = Node.all,
        KeyCodes = Node.KeyCodes;

    /**
     * @class
     * Tree Node.
     * xclass: 'treeitem'.
     * @name Node
     * @memberOf Tree
     * @extends Component.Controller
     */
    var BaseNode = Component.Controller.extend(
        /*
         * 可多继承从某个子节点开始装饰儿子组件
         */
        [Component.DecorateChild],
        /**
         * @lends Tree.Node#
         */
        {

            initializer:function () {

                var self = this;

                self.on("addChild", function (e) {
                    var c = e.child,
                        tree = self.get("tree");
                    c.set("depth", self.get('depth') + 1);
                    if (tree) {
                        recursive(tree, c, '_register');
                    }
                    refreshCssForSelfAndChildren(self);
                });

                function recursive(tree, node, action) {
                    tree[action](node);
                    var children = node.get("children"), i, c;
                    for (i = 0; i < children.length; i++) {
                        c = children[i];
                        if (action == '_register') {
                            c.set("depth", node.get('depth') + 1);
                        }
                        tree[action](c);
                    }
                }

                self.on("removeChild", function (e) {
                    var tree = self.get("tree");
                    if (tree) {
                        recursive(tree, e.child, '_unRegister');
                    }
                    refreshCssForSelfAndChildren(self);
                });

            },

            bindUI:function () {
                this.publish("click expand collapse", {
                    bubbles:1
                });
            },

            syncUI:function () {
                // 集中设置样式
                refreshCss(this);
            },

            _keyNav:function (e) {
                var self = this,
                    processed = true,
                    tree = self.get("tree"),
                    expanded = self.get("expanded"),
                    nodeToBeSelected,
                    isLeaf = self.get("isLeaf"),
                    children = self.get("children"),
                    keyCode = e.keyCode;

                // 顺序统统为前序遍历顺序
                switch (keyCode) {
                    // home
                    // 移到树的顶层节点
                    case KeyCodes.HOME:
                        nodeToBeSelected = tree;
                        break;

                    // end
                    // 移到最后一个可视节点
                    case KeyCodes.END:
                        nodeToBeSelected = getLastVisibleDescendant(tree);
                        break;

                    // 上
                    // 当前节点的上一个兄弟节点的最后一个可显示节点
                    case KeyCodes.UP:
                        nodeToBeSelected = getPreviousVisibleNode(self);
                        break;

                    // 下
                    // 当前节点的下一个可显示节点
                    case KeyCodes.DOWN:
                        nodeToBeSelected = getNextVisibleNode(self);
                        break;

                    // 左
                    // 选择父节点或 collapse 当前节点
                    case KeyCodes.LEFT:
                        if (expanded && (children.length || isLeaf === false)) {
                            self.set("expanded", false);
                        } else {
                            nodeToBeSelected = self.get("parent");
                        }
                        break;

                    // 右
                    // expand 当前节点
                    case KeyCodes.RIGHT:
                        if (children.length || isLeaf === false) {
                            if (!expanded) {
                                self.set("expanded", true);
                            } else {
                                nodeToBeSelected = children[0];
                            }
                        }
                        break;

                    default:
                        processed = false;
                        break;
                }

                if (nodeToBeSelected) {
                    nodeToBeSelected.select();
                }

                return processed;
            },

            next:function () {
                var self = this,
                    parent = self.get("parent"),
                    siblings,
                    index;
                if (!parent) {
                    return null;
                }
                siblings = parent.get('children');
                index = S.indexOf(self, siblings);
                if (index == siblings.length - 1) {
                    return null;
                }
                return siblings[index + 1];
            },

            prev:function () {
                var self = this,
                    parent = self.get("parent"),
                    siblings,
                    index;
                if (!parent) {
                    return null;
                }
                siblings = parent.get('children');
                index = S.indexOf(self, siblings);
                if (index === 0) {
                    return null;
                }
                return siblings[index - 1];
            },

            /**
             * Select current tree node.
             */
            select:function () {
                var self = this;
                self.get("tree").set("selectedItem", self);
            },

            performActionInternal:function (e) {

                var self = this,
                    target = $(e.target),
                    type = e.type,
                    expanded = self.get("expanded"),
                    tree = self.get("tree");
                tree.get("el")[0].focus();
                if (target.equals(self.get("expandIconEl"))) {
                    // 忽略双击
                    if (type != 'dblclick') {
                        self.set("expanded", !expanded);
                    }
                } else if (type == 'dblclick') {
                    self.set("expanded", !expanded);
                }
                else {
                    self.select();
                    self.fire("click");
                }
            },

            // 默认 addChild，这里需要设置 tree 属性
            decorateChildrenInternal:function (UI, c) {
                var self = this;
                self.addChild(new UI({
                    srcNode:c,
                    prefixCls:self.get("prefixCls")
                }));
            },

            removeChild:function (c) {
                var self = this,
                    tree = self.get("tree");
                tree._unRegister(c);
                S.each(c.get("children"), function (cc) {
                    tree._unRegister(cc);
                });
                BaseNode.superclass.removeChild.apply(self, S.makeArray(arguments));
                refreshCssForSelfAndChildren(self);
            },

            _uiSetExpanded:function (v) {
                var self = this,
                    tree = self.get("tree");
                if (self.get("rendered")) {
                    refreshCss(self);
                    self.fire(v ? "expand" : "collapse");
                }
            },

            /**
             * Expand all descend nodes of current node
             */
            expandAll:function () {
                var self = this;
                self.set("expanded", true);
                S.each(self.get("children"), function (c) {
                    c.expandAll();
                });
            },

            /**
             * Collapse all descend nodes of current node
             */
            collapseAll:function () {
                var self = this;
                self.set("expanded", false);
                S.each(self.get("children"), function (c) {
                    c.collapseAll();
                });
            }
        },

        {
            ATTRS:/**
             * @lends Tree.Node#
             */
            {
                xrender:{
                    value:BaseNodeRender
                },
                // 事件代理
                handleMouseEvents:{
                    value:false
                },

                /**
                 * Only For Config.
                 * Whether to force current tree node as a leaf.
                 * @defaultfalse.
                 * It will change as children are added.
                 * @type Boolean
                 */
                isLeaf:{
                    view:1
                },

                /**
                 * Element for expand icon.
                 * @type {NodeList}
                 */
                expandIconEl:{
                    view:1
                },

                /**
                 * Element for icon.
                 * @type {NodeList}
                 */
                iconEl:{
                    view:1
                },

                /**
                 * Whether current tree node is selected.
                 * @type Boolean
                 */
                selected:{
                    view:1
                },

                /**
                 * Whether current tree node is expanded.
                 * @type Boolean.
                 * @default false.
                 */
                expanded:{
                    view:1
                },

                /**
                 * Whether current tree node is collapsed.
                 * @type Boolean.
                 * @default true.
                 */
                collapsed:{
                    getter:function () {
                        return !this.get("expanded");
                    },
                    setter:function (v) {
                        this.set("expanded", !v);
                    }
                },

                /**
                 * Html title for current tree node.
                 * @type String
                 */
                tooltip:{
                    view:1
                },

                /**
                 * Tree instance current tree node belongs to.
                 * @type Tree
                 */
                tree:{
                    getter:function () {
                        var from = this;
                        while (from && !from.__isTree) {
                            from = from.get("parent");
                        }
                        return from;
                    }
                },

                /**
                 * depth of node.
                 * @type Number
                 */
                depth:{
                    view:1
                },
                focusable:{
                    value:false
                },
                decorateChildCls:{
                    value:"ks-tree-children"
                }
            }
        }, {
            xclass:'treeitem',
            priority:10
        });


    // # ------------------- private start

    function isNodeSingleOrLast(self) {
        var parent = self.get("parent"),
            children = parent && parent.get("children"),
            lastChild = children && children[children.length - 1];

        // 根节点
        // or
        // 父亲的最后一个子节点
        return !lastChild || lastChild == self;
    }

    function isNodeLeaf(self) {
        var isLeaf = self.get("isLeaf");
        // 强制指定了 isLeaf，否则根据儿子节点集合自动判断
        return !(isLeaf === false || (isLeaf === undefined && self.get("children").length));

    }

    function getLastVisibleDescendant(self) {
        var children = self.get("children");
        // 没有展开或者根本没有儿子节点，可视的只有自己
        if (!self.get("expanded") || !children.length) {
            return self;
        }
        // 可视的最后一个子孙
        return getLastVisibleDescendant(children[children.length - 1]);
    }

    // not same with _4e_previousSourceNode in editor !
    function getPreviousVisibleNode(self) {
        var prev = self.prev();
        if (!prev) {
            prev = self.get("parent");
        } else {
            prev = getLastVisibleDescendant(prev);
        }
        return prev;
    }

    // similar to _4e_nextSourceNode in editor
    function getNextVisibleNode(self) {
        var children = self.get("children"),
            n,
            parent;
        if (self.get("expanded") && children.length) {
            return children[0];
        }
        // 没有展开或者根本没有儿子节点
        // 深度遍历的下一个
        n = self.next();
        parent = self;
        while (!n && (parent = parent.get("parent"))) {
            n = parent.next();
        }
        return n;
    }

    /*
     每次添加/删除节点，都检查自己以及自己子孙 class
     每次 expand/collapse，都检查
     */
    function refreshCss(self) {
        if (self.get && self.get("view")) {
            self.get("view").refreshCss(isNodeSingleOrLast(self), isNodeLeaf(self));
        }
    }

    function refreshCssForSelfAndChildren(self) {
        var children = self.get('children'),
            len = self.get('children').length;
        refreshCss(self);
        S.each(children, function (c, index) {
            // 一个 c 初始化成功了
            // 可能其他 c 仍是 { xclass }
            if (c.get) {
                refreshCss(c);
                var el = c.get("el");
                el.attr("aria-posinset", index + 1);
                el.attr("aria-setsize", len);
            }
        });
    }

    // # ------------------- private end

    return BaseNode;

}, {
    requires:['node', 'component', './basenodeRender']
});

/**
 * TODO
 *  tree 不能很好的结合 xclass
 *//**
 * @fileOverview common render for node
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/basenodeRender", function (S, Node, Component) {

    //<div class='ks-treeitem'>
    //<div class='ks-treeitem-row'>
    //<div class='ks-tree-icon ks-tree-expand-icon ks-tree-expand-icon-t'></div>
    //<div class='ks-tree-icon ks-treeitem-checked0'></div>
    //<div class='ks-tree-icon ks-tree-file-icon'></div>
    //<span class='ks-treeitem-content'></span>
    //</div>
    //</div>

    var $ = Node.all,
        SELECTED_CLS = "ks-treeitem-selected",
        COMMON_ICON_CLS = "ks-tree-icon",
        ROW_CLS = "ks-treeitem-row",
        COMMON_EXPAND_ICON_CLS = "ks-tree-expand-icon",
        INLINE_BLOCK_CLS = "ks-inline-block",
        COMMON_EXPAND_EL_CLS = "ks-tree-expand-icon-{t}",

    // refreshCss 实际使用顺序
    // expandIconEl
    // iconEl
    // contentEl
        EXPAND_ICON_EL_FILE_CLS = [
            COMMON_ICON_CLS,
            COMMON_EXPAND_ICON_CLS,
            INLINE_BLOCK_CLS,
            COMMON_EXPAND_EL_CLS
        ].join(" "),
        EXPAND_ICON_EL_FOLDER_EXPAND_CLS = [
            COMMON_ICON_CLS,
            COMMON_EXPAND_ICON_CLS,
            INLINE_BLOCK_CLS,
            COMMON_EXPAND_EL_CLS + "minus"
        ].join(" "),
        EXPAND_ICON_EL_FOLDER_COLLAPSE_CLS = [
            COMMON_ICON_CLS,
            COMMON_EXPAND_ICON_CLS,
            INLINE_BLOCK_CLS,
            COMMON_EXPAND_EL_CLS + "plus"
        ].join(" "),
        ICON_EL_FILE_CLS = [
            COMMON_ICON_CLS,
            "ks-tree-file-icon",
            INLINE_BLOCK_CLS
        ].join(" "),
        ICON_EL_FOLDER_EXPAND_CLS = [
            COMMON_ICON_CLS,
            "ks-tree-expanded-folder-icon",
            INLINE_BLOCK_CLS
        ].join(" "),
        ICON_EL_FOLDER_COLLAPSE_CLS = [
            COMMON_ICON_CLS,
            "ks-tree-collapsed-folder-icon",
            INLINE_BLOCK_CLS
        ].join(" "),
    // 实际使用，结束

        CONTENT_EL_CLS = "ks-treeitem-content",
        CHILDREN_CLS = "ks-tree-children",
        CHILDREN_CLS_L = "ks-tree-lchildren";

    return Component.Render.extend({

        refreshCss:function (isNodeSingleOrLast, isNodeLeaf) {
            var self = this,
                expanded = self.get("expanded"),
                iconEl = self.get("iconEl"),
                iconElCss,
                expandElCss,
                expandIconEl = self.get("expandIconEl"),
                childrenEl = self.get("childrenEl");

            if (isNodeLeaf) {
                iconElCss = ICON_EL_FILE_CLS;
                expandElCss = EXPAND_ICON_EL_FILE_CLS;
            } else {
                if (expanded) {
                    iconElCss = ICON_EL_FOLDER_EXPAND_CLS;
                    expandElCss = EXPAND_ICON_EL_FOLDER_EXPAND_CLS;
                } else {
                    iconElCss = ICON_EL_FOLDER_COLLAPSE_CLS;
                    expandElCss = EXPAND_ICON_EL_FOLDER_COLLAPSE_CLS;
                }
            }

            iconEl.attr("class", iconElCss);
            expandIconEl.attr("class", S.substitute(expandElCss, {
                "t":isNodeSingleOrLast ? "l" : "t"
            }));
            if (childrenEl) {
                childrenEl.attr("class", (isNodeSingleOrLast ? CHILDREN_CLS_L : CHILDREN_CLS));
            }
        },

        createDom:function () {
            var self = this,
                el = self.get("el"),
                id,
                rowEl,
                expandIconEl,
                iconEl,
                contentEl = self.get("contentEl");

            rowEl = $("<div class='" + ROW_CLS + "'/>");

            id = contentEl.attr("id");

            if (!id) {
                contentEl.attr("id", id = S.guid("ks-treeitem"));
            }

            expandIconEl = $("<div>").appendTo(rowEl);

            iconEl = $("<div>").appendTo(rowEl);

            contentEl.appendTo(rowEl);

            el.attr({
                "role":"treeitem",
                "aria-labelledby":id
            }).prepend(rowEl);

            self.__set("rowEl", rowEl);
            self.__set("expandIconEl", expandIconEl);
            self.__set("iconEl", iconEl);
        },

        _uiSetExpanded:function (v) {
            var self = this,
                childrenEl = self.get("childrenEl");
            if (childrenEl) {
                childrenEl[v ? "show" : "hide"]();
            }
            self.get("el").attr("aria-expanded", v);
        },

        _uiSetSelected:function (v) {
            var self = this,
                rowEl = self.get("rowEl");
            rowEl[v ? "addClass" : "removeClass"](SELECTED_CLS);
            self.get("el").attr("aria-selected", v);
        },

        _uiSetDepth:function (v) {
            this.get("el").attr("aria-level", v);
        },

        _uiSetTooltip:function (v) {
            this.get("el").attr("title", v);
        },

        /**
         * 内容容器节点，子树节点都插到这里
         * 默认调用 Component.Render.prototype.getContentElement 为当前节点的容器
         * 而对于子树节点，它有自己的子树节点容器（单独的div），而不是儿子都直接放在自己的容器里面
         * @protected
         * @return {NodeList}
         */
        getContentElement:function () {
            var self = this, c;
            if (c = self.get("childrenEl")) {
                return c;
            }
            c = $("<div " + (self.get("expanded") ? "" : "style='display:none'")
                + " role='group'><" + "/div>")
                .appendTo(self.get("el"));
            self.__set("childrenEl", c);
            return c;
        }
    }, {
        ATTRS:{
            childrenEl:{},
            expandIconEl:{},
            tooltip:{},
            iconEl:{},
            expanded:{
                value:false
            },
            rowEl:{},
            depth:{
                value:0
            },
            contentEl:{
                valueFn:function () {
                    return $("<span id='" + S.guid("ks-treeitem") + "' class='" + CONTENT_EL_CLS + "'/>");
                }
            },
            isLeaf:{},
            selected:{}
        },

        HTML_PARSER:{
            childrenEl:function (el) {
                return el.children("." + CHILDREN_CLS);
            },
            contentEl:function (el) {
                return el.children("." + CONTENT_EL_CLS);
            },
            isLeaf:function (el) {
                var self = this;
                if (el.hasClass(self.getCssClassWithPrefix("treeitem-leaf"))) {
                    return true;
                }
                if (el.hasClass(self.getCssClassWithPrefix("treeitem-folder"))) {
                    return false;
                }
            },
            expanded:function (el) {
                var children = el.one(".ks-tree-children");
                if (!children) {
                    return false;
                }
                return children.css("display") != "none";
            }
        }

    });

}, {
    requires:['node', 'component']
});/**
 * @fileOverview checkable tree node
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/checknode", function (S, Node, BaseNode, CheckNodeRender) {
    var $ = Node.all,
        PARTIAL_CHECK = 2,
        CHECK = 1,
        EMPTY = 0;

    /**
     * @name CheckNode
     * @memberOf Tree
     * @class
     * Checked tree node.
     * xclass: 'check-treeitem'.
     * @extends Tree.Node
     */
    var CheckNode = BaseNode.extend(
        /**
         * @lends Tree.CheckNode#
         */
        {

            /**
             * See {@link Tree.Node#expandAll}
             */
            expandAll:function () {
                return CheckNode.superclass.expandAll.apply(this, arguments);
            },

            performActionInternal:function (e) {

                var self = this,
                    checkState,
                    expanded = self.get("expanded"),
                    expandIconEl = self.get("expandIconEl"),
                    tree = self.get("tree"),
                    target = $(e.target);

                // 需要通知 tree 获得焦点
                tree.get("el")[0].focus();

                if (e.type == "dblclick") {
                    // 双击在 +- 号上无效
                    if (target.equals(expandIconEl)) {
                        return;
                    }
                    // 双击在 checkbox 上无效
                    if (target.equals(self.get("checkIconEl"))) {
                        return;
                    }
                    // 双击在字或者图标上，切换 expand
                    self.set("expanded", !expanded);
                }

                // 点击在 +- 号，切换状态
                if (target.equals(expandIconEl)) {
                    self.set("expanded", !expanded);
                    return;
                }

                // 单击任何其他地方都切换 check 状态
                checkState = self.get("checkState");

                if (checkState == CHECK) {
                    checkState = EMPTY;
                } else {
                    checkState = CHECK;
                }

                self.set("checkState", checkState);

                self.fire("click");
            },

            _uiSetCheckState:function (s) {
                var self = this,
                    parent = self.get("parent"),
                    checkCount,
                    i,
                    c,
                    cState,
                    cs;

                if (s == CHECK || s == EMPTY) {
                    S.each(self.get("children"), function (c) {
                        c.set("checkState", s);
                    });
                }

                // 每次状态变化都通知 parent 沿链检查，一层层向上通知
                // 效率不高，但是结构清晰
                if (parent) {
                    checkCount = 0;
                    cs = parent.get("children");
                    for (i = 0; i < cs.length; i++) {
                        c = cs[i];
                        cState = c.get("checkState");
                        // 一个是部分选，父亲必定是部分选，立即结束
                        if (cState == PARTIAL_CHECK) {
                            parent.set("checkState", PARTIAL_CHECK);
                            return;
                        } else if (cState == CHECK) {
                            checkCount++;
                        }
                    }

                    // 儿子都没选，父亲也不选
                    if (checkCount === 0) {
                        parent.set("checkState", EMPTY);
                    } else
                    // 儿子全都选了，父亲也全选
                    if (checkCount == cs.length) {
                        parent.set("checkState", CHECK);
                    }
                    // 有的儿子选了，有的没选，父亲部分选
                    else {
                        parent.set("checkState", PARTIAL_CHECK);
                    }
                }
            }
        }, {
            ATTRS:/**
             * @lends Tree.CheckNode#
             */
            {
                checkIconEl:{
                    view:1
                },

                /**
                 * Enums for check states.
                 * CheckNode.PARTIAL_CHECK: checked partly.
                 * CheckNode.CHECK: checked completely.
                 * CheckNode.EMPTY: not checked.
                 * @type Number
                 */
                checkState:{
                    view:1
                },

                xrender:{
                    value:CheckNodeRender
                }
            }
        }, {
            xclass:"check-treeitem",
            priority:20
        });

    S.mix(CheckNode,
        /**
         * @lends Tree.CheckNode
         */
        {
            /**
             * checked partly.
             */
            PARTIAL_CHECK:PARTIAL_CHECK,
            /**
             * checked completely.
             */
            CHECK:CHECK,
            /**
             * not checked at all.
             */
            EMPTY:EMPTY
        });

    return CheckNode;
}, {
    requires:['node', './basenode', './checknodeRender']
});/**
 * @fileOverview check node render
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/checknodeRender", function (S, Node, BaseNodeRender) {
    var $ = Node.all,
        ICON_CLS = "ks-tree-icon",
        CHECK_CLS = "ks-treeitem-checked",
        ALL_STATES_CLS = "ks-treeitem-checked0 ks-treeitem-checked1 ks-treeitem-checked2",
        INLINE_BLOCK = " ks-inline-block";
    return BaseNodeRender.extend({

        createDom:function () {
            var self = this,
                expandIconEl = self.get("expandIconEl"),
                checkIconEl = $("<div class='" + ICON_CLS + INLINE_BLOCK + "'/>").insertAfter(expandIconEl);
            self.__set("checkIconEl", checkIconEl);
        },

        _uiSetCheckState:function (s) {
            var self = this,
                checkIconEl = self.get("checkIconEl");
            checkIconEl.removeClass(ALL_STATES_CLS).addClass(CHECK_CLS + s);
        }

    }, {
        ATTRS:{
            checkIconEl:{},
            checkState:{
                // check 的三状态
                // 0 一个不选
                // 1 儿子有选择
                // 2 全部都选了
                value:0
            }
        }
    });
}, {
    requires:['node', './basenodeRender']
});/**
 * @fileOverview root node represent a check tree
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/checktree", function (S, Component, CheckNode, CheckTreeRender, TreeMgr) {
    /**
     * @name CheckTree
     * @extends Tree.CheckNode
     * @class
     * KISSY Checked Tree.
     * xclass: 'check-tree'.
     * @memberOf Tree
     */
    var CheckTree = CheckNode.extend([Component.DelegateChildren, TreeMgr],
        /**
         * @lends Tree.CheckTree#
         */
        {
            /**
             * See {@link Tree.Node#expandAll}
             */
            expandAll:function () {
                return CheckTree.superclass.expandAll.apply(this, arguments);
            },

            _uiSetFocused:function () {
                // check tree 没有 selectedItem 概念，也没有选中状态
            }
        }, {
            ATTRS:/**
             * @lends Tree.CheckTree#
             */
            {
                /**
                 * Readonly. Render class.
                 * @type function
                 */
                xrender:{
                    value:CheckTreeRender
                }
            }
        }, {
            xclass:'check-tree',
            priority:40
        });
    return CheckTree;

}, {
    requires:['component', './checknode', './checktreeRender', './treemgr']
});/**
 * @fileOverview root node render for checktree
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/checktreeRender", function (S, CheckNodeRender, TreeMgrRender) {
    return CheckNodeRender.extend([TreeMgrRender]);
}, {
    requires:['./checknodeRender', './treemgrRender']
});/**
 * @fileOverview tree component for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add('tree', function (S, Tree, TreeNode, CheckNode, CheckTree) {
    Tree.Node = TreeNode;
    Tree.CheckNode = CheckNode;
    Tree.CheckTree = CheckTree;
    return Tree;
}, {
    requires:["tree/base", "tree/basenode", "tree/checknode", "tree/checktree"]
});/**
 * @fileOverview root node render
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/treeRender", function (S, BaseNodeRender, TreeMgrRender) {
    return BaseNodeRender.extend([TreeMgrRender]);
}, {
    requires:['./basenodeRender', './treemgrRender']
});/**
 * @fileOverview tree management utils
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/treemgr", function (S, Event) {

    function TreeMgr() {
    }

    TreeMgr.ATTRS =
    /**
     * @lends Tree#
     */
    {
        /**
         * Whether show root node.
         * @defaulttrue.
         * @type Boolean
         */
        showRootNode:{
            value:true,
            view:1
        },
        /**
         * Current selected tree node.
         * @type Tree.Node
         */
        selectedItem:{},

        // only root node is focusable
        focusable:{
            value:true
        }
    };

    function getIdFromNode(c) {
        var el = c.get("el"),
            id = el.attr("id");
        if (!id) {
            el.attr("id", id = S.guid("tree-node"));
        }
        return id;
    }

    S.augment(TreeMgr, {

        __isTree:1,

        /*
         加快从事件代理获取原事件节点
         */
        __getAllNodes:function () {
            var self = this;
            if (!self._allNodes) {
                self._allNodes = {};
            }
            return self._allNodes;
        },

        _register:function (c) {
            this.__getAllNodes()[getIdFromNode(c)] = c;
        },

        _unRegister:function (c) {
            delete this.__getAllNodes()[getIdFromNode(c)];
        },

        handleKeyEventInternal:function (e) {
            var current = this.get("selectedItem");
            if (e.keyCode == Event.KeyCodes.ENTER) {
                // 传递给真正的单个子节点
                return current.performActionInternal(e);
            }
            return current._keyNav(e);
        },

        // 重写 delegateChildren ，缓存加快从节点获取对象速度
        getOwnerControl:function (node, e) {
            var self = this,
                n,
                allNodes = self.__getAllNodes(),
                elem = self.get("el")[0];
            while (node && node !== elem) {
                if (n = allNodes[node.id]) {
                    return n;
                }
                node = node.parentNode;
            }
            // 最终自己处理
            return self;
        },

        // 单选
        _uiSetSelectedItem:function (n, ev) {
            if (ev.prevVal) {
                ev.prevVal.set("selected", false);
            }
            n.set("selected", true);
        },

        _uiSetFocused:function (v) {
            var self = this;
            // 得到焦点时没有选择节点
            // 默认选择自己
            if (v && !self.get("selectedItem")) {
                self.select();
            }
        }
    });

    return TreeMgr;
}, {
    requires:['event']
});/**
 * @fileOverview tree management utils render
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/treemgrRender", function (S) {

    function TreeMgrRender() {
    }

    TreeMgrRender.ATTRS = {
        // 默认 true
        // 是否显示根节点
        showRootNode:{
        }
    };

    S.augment(TreeMgrRender, {
        __renderUI:function () {
            var self = this;
            self.get("el").attr("role", "tree")[0]['hideFocus'] = true;
            self.get("rowEl").addClass("ks-tree-row");
        },

        _uiSetShowRootNode:function (v) {
            this.get("rowEl")[v ? "show" : "hide"]();
        }
    });

    return TreeMgrRender;
});
