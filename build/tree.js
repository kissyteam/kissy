/*
Copyright 2012, KISSY UI Library v1.30
MIT Licensed
build time: Dec 20 22:28
*/
/**
 * @fileOverview root node represent a simple tree
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/base", function (S, Component, TreeNode, TreeRender, TreeManager) {

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
    return TreeNode.extend([TreeManager], {}, {
        ATTRS: {
            xrender: {
                value: TreeRender
            },

            defaultChildXClass: {
                value: 'tree-node'
            }
        }
    }, {
        xclass: 'tree',
        priority: 30
    });

}, {
    requires: ['component/base', './node', './tree-render', './tree-manager']
});

/*
 Refer:
 - http://www.w3.org/TR/wai-aria-practices/#TreeView

 note bug:
 1. checked tree 根节点总是 selected ！
 2. 根节点 hover 后取消不了了



 支持 aria
 重用组件框架
 键盘操作指南

 tab 到树，自动选择根节点

 上下键在可视节点间深度遍历
 左键
 已展开节点：关闭节点
 已关闭节点: 移动到父亲节点
 右键
 已展开节点：移动到该节点的第一个子节点
 已关闭节点: 无效
 enter : 触发 click 事件
 home : 移动到根节点
 end : 移动到前序遍历最后一个节点
 *//**
 * @fileOverview check node render
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/check-node-render", function (S, Node, TreeNodeRender) {
    var $ = Node.all,
        CHECK_CLS = "tree-node-checked",
        ALL_STATES_CLS = "tree-node-checked0 tree-node-checked1 tree-node-checked2";
    return TreeNodeRender.extend({

        createDom:function () {
            var self = this,
                expandIconEl = self.get("expandIconEl"),
                checkIconEl = $("<div>").insertAfter(expandIconEl);
            self.setInternal("checkIconEl", checkIconEl);
        },

        _onSetCheckState:function (s) {
            var self = this,
                checkIconEl = self.get("checkIconEl");
            checkIconEl.removeClass(self.getCssClassWithPrefix(ALL_STATES_CLS))
                .addClass(self.getCssClassWithPrefix(CHECK_CLS) + s);
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
    requires:['node', './node-render']
});/**
 * @fileOverview checkable tree node
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/check-node", function (S, Node, TreeNode, CheckNodeRender) {
    var $ = Node.all,
        PARTIAL_CHECK = 2,
        CHECK = 1,
        EMPTY = 0;

    /**
     * @name CheckNode
     * @memberOf Tree
     * @class
     * Checked tree node.
     * xclass: 'check-tree-node'.
     * @extends Tree.Node
     */
    var CheckNode = TreeNode.extend({
        performActionInternal: function (e) {

            var self = this,
                checkState,
                expanded = self.get("expanded"),
                expandIconEl = self.get("expandIconEl"),
                tree = self.get("tree"),
                target = $(e.target);

            // 需要通知 tree 获得焦点
            tree.get("el")[0].focus();

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

        _onSetCheckState: function (s) {
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
        ATTRS: /**
         * @lends Tree.CheckNode#
         */
        {
            checkIconEl: {
                view: 1
            },

            /**
             * Enums for check states.
             * CheckNode.PARTIAL_CHECK: checked partly.
             * CheckNode.CHECK: checked completely.
             * CheckNode.EMPTY: not checked.
             * @type {Number}
             */
            checkState: {
                view: 1
            },

            xrender: {
                value: CheckNodeRender
            },

            defaultChildXClass: {
                value: 'check-tree-node'
            }
        }
    }, {
        xclass: "check-tree-node",
        priority: 20
    });

    S.mix(CheckNode,
        /**
         * @lends Tree.CheckNode
         */
        {
            /**
             * checked partly.
             */
            PARTIAL_CHECK: PARTIAL_CHECK,
            /**
             * checked completely.
             */
            CHECK: CHECK,
            /**
             * not checked at all.
             */
            EMPTY: EMPTY
        });

    return CheckNode;
}, {
    requires: ['node', './node', './check-node-render']
});/**
 * @fileOverview root node render for check-tree
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/check-tree-render", function (S, CheckNodeRender, TreeManagerRender) {
    return CheckNodeRender.extend([TreeManagerRender]);
}, {
    requires:['./check-node-render', './tree-manager-render']
});/**
 * @fileOverview root node represent a check tree
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/check-tree", function (S, Component, CheckNode, CheckTreeRender, TreeManager) {
    /**
     * @name CheckTree
     * @extends Tree.CheckNode
     * @class
     * KISSY Checked Tree.
     * xclass: 'check-tree'.
     * @memberOf Tree
     */
    var CheckTree = CheckNode.extend([TreeManager], {
        _onSetFocused: function () {
            // check tree 没有 selectedItem 概念，也没有选中状态
        }
    }, {
        ATTRS: /**
         * @lends Tree.CheckTree#
         */
        {
            /**
             * Readonly. Render class.
             * @type {Function}
             */
            xrender: {
                value: CheckTreeRender
            },

            defaultChildXClass: {
                value: 'check-tree-node'
            }
        }
    }, {
        xclass: 'check-tree',
        priority: 40
    });
    return CheckTree;

}, {
    requires: ['component/base', './check-node', './check-tree-render', './tree-manager']
});/**
 * @fileOverview common render for node
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/node-render", function (S, Node, Component) {

    //<div class='ks-tree-node'>
    //<div class='ks-tree-node-row'>
    //<div class='ks-tree-expand-icon-t'></div>
    //<div class='ks-tree-node-checked0'></div>
    //<div class='ks-tree-file-icon'></div>
    //<span class='ks-tree-node-content'></span>
    //</div>
    //</div>

    var $ = Node.all,
        SELECTED_CLS = "tree-node-selected",
        ROW_CLS = "tree-node-row",
        COMMON_EXPAND_EL_CLS = "tree-expand-icon-{t}",

    // refreshCss 实际使用顺序
    // expandIconEl
    // iconEl
    // contentEl
        EXPAND_ICON_EL_FILE_CLS = [
            COMMON_EXPAND_EL_CLS
        ].join(" "),
        EXPAND_ICON_EL_FOLDER_EXPAND_CLS = [
            COMMON_EXPAND_EL_CLS + "minus"
        ].join(" "),
        EXPAND_ICON_EL_FOLDER_COLLAPSE_CLS = [
            COMMON_EXPAND_EL_CLS + "plus"
        ].join(" "),
        ICON_EL_FILE_CLS = [
            "tree-file-icon"
        ].join(" "),
        ICON_EL_FOLDER_EXPAND_CLS = [
            "tree-expanded-folder-icon"
        ].join(" "),
        ICON_EL_FOLDER_COLLAPSE_CLS = [
            "tree-collapsed-folder-icon"
        ].join(" "),
    // 实际使用，结束

        CONTENT_EL_CLS = "tree-node-content",
        CHILDREN_CLS = "tree-children",
        CHILDREN_CLS_L = "tree-lchildren";

    return Component.Render.extend({

        refreshCss: function (isNodeSingleOrLast, isNodeLeaf) {
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

            iconEl.attr("class", self.getCssClassWithPrefix(iconElCss));
            expandIconEl.attr("class", self.getCssClassWithPrefix(S.substitute(expandElCss, {
                "t": isNodeSingleOrLast ? "l" : "t"
            })));
            if (childrenEl) {
                childrenEl.attr("class", self.getCssClassWithPrefix((isNodeSingleOrLast ? CHILDREN_CLS_L : CHILDREN_CLS)));
            }
        },

        createDom: function () {
            var self = this,
                el = self.get("el"),
                id,
                rowEl,
                expandIconEl,
                iconEl,
                contentEl = self.get("contentEl");

            rowEl = $("<div class='" +
                self.getCssClassWithPrefix(ROW_CLS) + "'/>");

            id = contentEl.attr("id");

            if (!id) {
                contentEl.attr("id", id = S.guid("ks-tree-node"));
            }

            expandIconEl = $("<div>").appendTo(rowEl);

            iconEl = $("<div>").appendTo(rowEl);

            contentEl.appendTo(rowEl);

            el.attr({
                "role": "tree-node",
                "aria-labelledby": id
            }).prepend(rowEl);

            self.setInternal("rowEl", rowEl);
            self.setInternal("expandIconEl", expandIconEl);
            self.setInternal("iconEl", iconEl);
        },

        _onSetExpanded: function (v) {
            var self = this,
                childrenEl = self.get("childrenEl");
            if (childrenEl) {
                childrenEl[v ? "show" : "hide"]();
            }
            self.get("el").attr("aria-expanded", v);
        },

        _onSetSelected: function (v) {
            var self = this,
                rowEl = self.get("rowEl");
            rowEl[v ? "addClass" : "removeClass"](self.getCssClassWithPrefix(SELECTED_CLS));
            self.get("el").attr("aria-selected", v);
        },

        '_onSetDepth': function (v) {
            this.get("el").attr("aria-level", v);
        },

        _onSetTooltip: function (v) {
            this.get("el").attr("title", v);
        },

        /**
         * 内容容器节点，子树节点都插到这里
         * 默认调用 Component.Render.prototype.getContentElement 为当前节点的容器
         * 而对于子树节点，它有自己的子树节点容器（单独的div），而不是儿子都直接放在自己的容器里面
         * @protected
         * @return {KISSY.NodeList}
         */
        getContentElement: function () {
            var self = this, c;
            if (c = self.get("childrenEl")) {
                return c;
            }
            c = $("<div " + (self.get("expanded") ? "" : "style='display:none'")
                + " role='group'><" + "/div>")
                .appendTo(self.get("el"));
            self.setInternal("childrenEl", c);
            return c;
        }
    }, {
        ATTRS: {
            childrenEl: {},
            expandIconEl: {},
            tooltip: {},
            iconEl: {},
            expanded: {
                value: false
            },
            rowEl: {},
            depth: {
                value: 0
            },
            contentEl: {
                valueFn: function () {
                    return $("<span id='" + S.guid("ks-tree-node") +
                        "' class='" + this.getCssClassWithPrefix(CONTENT_EL_CLS) + "'/>");
                }
            },
            isLeaf: {},
            selected: {}
        },

        HTML_PARSER: {
            childrenEl: function (el) {
                return el.children("." + this.getCssClassWithPrefix(CHILDREN_CLS));
            },
            contentEl: function (el) {
                return el.children("." + this.getCssClassWithPrefix(CONTENT_EL_CLS));
            },
            isLeaf: function (el) {
                var self = this;
                if (el.hasClass(self.getCssClassWithPrefix("tree-node-leaf"))) {
                    return true;
                }
                if (el.hasClass(self.getCssClassWithPrefix("tree-node-folder"))) {
                    return false;
                }
            },
            expanded: function (el) {
                var children = el.one("." + this.get('prefixCls') + "tree-children");
                if (!children) {
                    return false;
                }
                return children.css("display") != "none";
            }
        }

    });

}, {
    requires: ['node', 'component/base']
});/**
 * @fileOverview abstraction of tree node ,root and other node will extend it
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/node", function (S, Node, Component, TreeNodeRender) {
    var $ = Node.all,
        KeyCodes = Node.KeyCodes;

    /**
     * @class
     * Tree Node.
     * xclass: 'tree-node'.
     * @name Node
     * @memberOf Tree
     * @extends KISSY.Component.Controller
     */
    var TreeNode = Component.Container.extend(
        [
            // 不是所有的子节点都是子组件
            Component.DecorateChild
        ],
        /**
         * @lends Tree.Node#
         */
        {

            syncUI: function () {
                // 集中设置样式
                refreshCss(this);
            },

            _keyNav: function (e) {
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

            next: function () {
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

            prev: function () {
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
            select: function () {
                var self = this;
                self.get("tree").set("selectedItem", self);
            },

            performActionInternal: function (e) {
                var self = this,
                    target = $(e.target),
                    expanded = self.get("expanded"),
                    tree = self.get("tree");
                tree.get("el")[0].focus();
                if (target.equals(self.get("expandIconEl"))) {
                        self.set("expanded", !expanded);
                } else {
                    self.select();
                    self.fire("click");
                }
            },

            decorateChildrenInternal: function (UI, c) {
                var self = this;
                self.addChild(new UI({
                    srcNode: c,
                    prefixCls: self.get("prefixCls")
                }));
            },

            /**
             * override controller 's addChild to apply depth and css recursively
             */
            addChild: function () {
                var self = this,
                    c;
                c = TreeNode.superclass.addChild.apply(self, S.makeArray(arguments));
                // after default addChild then parent is accessible
                // if first build a node subtree, no root is constructed yet!
                var tree = self.get("tree");
                if (tree) {
                    recursiveRegister(tree, c, "_register", self.get("depth") + 1);
                    refreshCssForSelfAndChildren(self);
                }
                return c;
            },

            /**
             * override controller 's removeChild to apply depth and css recursively
             */
            removeChild: function (c) {
                var self = this,
                    tree = self.get("tree");
                if (tree) {
                    recursiveRegister(tree, c, "_unRegister");
                    TreeNode.superclass.removeChild.apply(self, S.makeArray(arguments));
                    refreshCssForSelfAndChildren(self);
                }
                return c;
            },

            _onSetExpanded: function (v) {
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
            expandAll: function () {
                var self = this;
                self.set("expanded", true);
                S.each(self.get("children"), function (c) {
                    c.expandAll();
                });
            },

            /**
             * Collapse all descend nodes of current node
             */
            collapseAll: function () {
                var self = this;
                self.set("expanded", false);
                S.each(self.get("children"), function (c) {
                    c.collapseAll();
                });
            }
        },

        {
            ATTRS: /**
             * @lends Tree.Node#
             */
            {
                // 一般节点不需要代理事件，统统交给 root(tree) 代理
                delegateChildren: {
                    value: false
                },

                xrender: {
                    value: TreeNodeRender
                },

                // 事件代理
                handleMouseEvents: {
                    value: false
                },

                /**
                 * Only For Config.
                 * Whether to force current tree node as a leaf.                 *
                 * It will change as children are added.
                 *
                 * @type {Boolean}
                 */
                isLeaf: {
                    view: 1
                },

                /**
                 * Element for expand icon.
                 * @type {KISSY.NodeList}
                 */
                expandIconEl: {
                    view: 1
                },

                /**
                 * Element for icon.
                 * @type {KISSY.NodeList}
                 */
                iconEl: {
                    view: 1
                },

                /**
                 * Whether current tree node is selected.
                 * @type {Boolean}
                 */
                selected: {
                    view: 1
                },

                /**
                 * Whether current tree node is expanded.
                 * @type {Boolean.}
                 * @default false.
                 */
                expanded: {
                    view: 1
                },

                /**
                 * Whether current tree node is collapsed.
                 * @type {Boolean.}
                 * @default true.
                 */
                collapsed: {
                    getter: function () {
                        return !this.get("expanded");
                    },
                    setter: function (v) {
                        this.set("expanded", !v);
                    }
                },

                /**
                 * html title for current tree node.
                 * @type {String}
                 */
                tooltip: {
                    view: 1
                },

                /**
                 * Tree instance current tree node belongs to.
                 * @type {Tree}
                 */
                tree: {
                    getter: function () {
                        var from = this;
                        while (from && !from.isTree) {
                            from = from.get("parent");
                        }
                        return from;
                    }
                },

                /**
                 * depth of node.
                 * @type {Number}
                 */
                depth: {
                    view: 1
                },

                focusable: {
                    value: false
                },

                decorateChildCls: {
                    valueFn:function(){
                        return this.get('prefixCls')+'tree-children';
                    }
                },

                defaultChildXClass: {
                    value: 'tree-node'
                }
            }
        }, {
            xclass: 'tree-node',
            priority: 10
        });


    // # ------------------- private start

    function recursiveRegister(tree, c, action, setDepth) {
        tree[action](c);
        if (setDepth !== undefined) {
            c.set("depth", setDepth);
        }
        S.each(c.get("children"), function (child) {
            // xclass 的情况，在对应 xclass render 时自然会处理
            if (child.isController) {
                if (setDepth) {
                    recursiveRegister(tree, child, action, setDepth + 1);
                } else {
                    recursiveRegister(tree, child, action);
                }
            }
        });
    }

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

    return TreeNode;

}, {
    requires: ['node', 'component/base', './node-render']
});

/**
 * 2012-09-25
 *  - 去除 dblclick 支持，该交互会重复触发 click 事件，可能会重复执行逻辑
 *//**
 * @fileOverview tree management utils render
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/tree-manager-render", function (S) {

    function TreeManagerRender() {
    }

    TreeManagerRender.ATTRS = {
        // 默认 true
        // 是否显示根节点
        showRootNode: {
        }
    };

    S.augment(TreeManagerRender, {
        __renderUI: function () {
            var self = this;
            self.get("el").attr("role", "tree");
            self.get("rowEl").addClass(self.get('prefixCls') + "tree-row");
        },

        '_onSetShowRootNode': function (v) {
            this.get("rowEl")[v ? "show" : "hide"]();
        }
    });

    return TreeManagerRender;
});/**
 * @fileOverview tree management utils
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/tree-manager", function (S, Event) {

    function TreeManager() {
    }

    TreeManager.ATTRS =
    /**
     * @lends Tree#
     */
    {
        // 覆盖 baseNode 处配置
        delegateChildren: {
            value: true
        },

        /**
         * Whether show root node.
         * @defaulttrue.
         * @type {Boolean}
         */
        showRootNode: {
            value: true,
            view: 1
        },
        /**
         * Current selected tree node.
         * @type {Tree.Node}
         */
        selectedItem: {},

        // only root node is focusable
        focusable: {
            value: true
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

    S.augment(TreeManager, {

        isTree: 1,

        _register: function (c) {
            if (!c.__isRegisted) {
                getAllNodes(this)[getIdFromNode(c)] = c;
                c.__isRegisted = 1;
                S.log("_register for " + c.get("content"));
            }
        },

        _unRegister: function (c) {
            if (c.__isRegisted) {
                delete getAllNodes(this)[getIdFromNode(c)];
                c.__isRegisted = 0;
                S.log("_unRegister for " + c.get("content"));
            }
        },

        handleKeyEventInternal: function (e) {
            var current = this.get("selectedItem");
            if (e.keyCode == Event.KeyCodes.ENTER) {
                // 传递给真正的单个子节点
                return current.performActionInternal(e);
            }
            return current._keyNav(e);
        },


        /**
         * Get tree child node by comparing cached child nodes.
         * Faster than default mechanism.
         * @protected
         * @param target
         */
        getOwnerControl: function (target) {
            var self = this,
                n,
                allNodes = getAllNodes(self),
                elem = self.get("el")[0];
            while (target && target !== elem) {
                if (n = allNodes[target.id]) {
                    return n;
                }
                target = target.parentNode;
            }
            // 最终自己处理
            // 所以根节点不用注册！
            return self;
        },

        // 单选
        '_onSetSelectedItem': function (n, ev) {
            if (ev.prevVal) {
                ev.prevVal.set("selected", false);
            }
            n.set("selected", true);
        },

        _onSetFocused: function (v) {
            var self = this;
            // 得到焦点时没有选择节点
            // 默认选择自己
            if (v && !self.get("selectedItem")) {
                self.select();
            }
        }
    });

    /*
     加快从事件代理获取原事件节点
     */
    function getAllNodes(self) {
        if (!self._allNodes) {
            self._allNodes = {};
        }
        return self._allNodes;
    }

    return TreeManager;
}, {
    requires: ['event']
});/**
 * @fileOverview root node render
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/tree-render", function (S, TreeNodeRender, TreeManagerRender) {
    return TreeNodeRender.extend([TreeManagerRender]);
}, {
    requires:['./node-render', './tree-manager-render']
});/**
 * @fileOverview tree component for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add('tree', function (S, Tree, TreeNode, CheckNode, CheckTree) {
    Tree.Node =TreeNode;
    Tree.CheckNode = CheckNode;
    Tree.CheckTree = CheckTree;
    return Tree;
}, {
    requires: ["tree/base", "tree/node", "tree/check-node", "tree/check-tree"]
});
