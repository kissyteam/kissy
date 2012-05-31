/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 29 14:52
*/
/**
 * @fileOverview root node represent a simple tree
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/base", function (S, Component, BaseNode, TreeRender, TreeMgr) {

    var TREE_CLS = TreeRender.TREE_CLS;

    /*多继承
     1. 继承基节点（包括可装饰儿子节点功能）
     2. 继承 mixin 树管理功能
     3. 继承 mixin 儿子事件代理功能
     */

    /**
     * KISSY Tree
     * @name Tree
     * @class
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
            DefaultRender:TreeRender
        }, {
            xclass:TREE_CLS,
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
        ITEM_CLS = BaseNodeRender.ITEM_CLS,
        KeyCodes = Node.KeyCodes;


    /**
     * Tree Node
     * @constructor
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
            _keyNav:function (e) {
                var self = this,
                    processed = true,
                    n,
                    children = self.get("children"),
                    keyCode = e.keyCode;

                // 顺序统统为前序遍历顺序
                switch (keyCode) {
                    // home
                    // 移到树的顶层节点
                    case KeyCodes.HOME:
                        n = self.get("tree");
                        break;

                    // end
                    // 移到最后一个可视节点
                    case KeyCodes.END:
                        n = self.get("tree").getLastVisibleDescendant();
                        break;

                    // 上
                    // 当前节点的上一个兄弟节点的最后一个可显示节点
                    case KeyCodes.UP:
                        n = self.getPreviousVisibleNode();
                        break;

                    // 下
                    // 当前节点的下一个可显示节点
                    case KeyCodes.DOWN:
                        n = self.getNextVisibleNode();
                        break;

                    // 左
                    // 选择父节点或 collapse 当前节点
                    case KeyCodes.LEFT:
                        if (self.get("expanded") && (children.length || self.get("isLeaf") === false)) {
                            self.set("expanded", false);
                        } else {
                            n = self.get("parent");
                        }
                        break;

                    // 右
                    // expand 当前节点
                    case KeyCodes.RIGHT:
                        if (children.length || self.get("isLeaf") === false) {
                            if (!self.get("expanded")) {
                                self.set("expanded", true);
                            } else {
                                children[0].select();
                            }
                        }
                        break;

                    default:
                        processed = false;
                        break;

                }
                if (n) {
                    n.select();
                }
                return processed;
            },

            getLastVisibleDescendant:function () {
                var self = this, children = self.get("children");
                // 没有展开或者根本没有儿子节点，可视的只有自己
                if (!self.get("expanded") || !children.length) {
                    return self;
                }
                // 可视的最后一个子孙
                return children[children.length - 1].getLastVisibleDescendant();
            },

            getNextVisibleNode:function () {
                var self = this,
                    children = self.get("children"),
                    parent = self.get("parent");
                if (self.get("expanded") && children.length) {
                    return children[0];
                }
                // 没有展开或者根本没有儿子节点
                // 深度遍历的下一个
                var n = self.next();
                while (parent && !n) {
                    n = parent.next();
                    parent = parent.get("parent");
                }
                return n;
            },

            getPreviousVisibleNode:function () {
                var self = this, prev = self.prev();
                if (!prev) {
                    prev = self.get("parent");
                } else {
                    prev = prev.getLastVisibleDescendant();
                }
                return prev;
            },

            next:function () {
                var self = this, parent = self.get("parent");
                if (!parent) {
                    return null;
                }
                var siblings = parent.get('children');
                var index = S.indexOf(self, siblings);
                if (index == siblings.length - 1) {
                    return null;
                }
                return siblings[index + 1];
            },

            prev:function () {
                var self = this, parent = self.get("parent");
                if (!parent) {
                    return null;
                }
                var siblings = parent.get('children');
                var index = S.indexOf(self, siblings);
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
                    tree = self.get("tree"),
                    view = self.get("view");
                tree.get("el")[0].focus();
                if (target.equals(view.get("expandIconEl"))) {
                    // 忽略双击
                    if (e.type != 'dblclick') {
                        self.set("expanded", !self.get("expanded"));
                    }
                } else if (e.type == 'dblclick') {
                    self.set("expanded", !self.get("expanded"));
                }
                else {
                    self.select();
                    tree.fire("click", {
                        target:self
                    });
                }
            },

            // 默认 addChild，这里需要设置 tree 属性
            decorateChildrenInternal:function (ui, c) {
                var self = this;
                self.addChild(new ui({
                    srcNode:c,
                    tree:self.get("tree"),
                    prefixCls:self.get("prefixCls")
                }));
            },

            addChild:function (c) {
                var self = this, tree = self.get("tree");
                c.__set("tree", tree);
                c.__set("depth", self.get('depth') + 1);
                BaseNode.superclass.addChild.call(self, c);
                self._updateRecursive();
                tree._register(c);
                S.each(c.get("children"), function (cc) {
                    tree._register(cc);
                });
            },

            /*
             每次添加/删除节点，都检查自己以及自己子孙 class
             每次 expand/collapse，都检查
             */
            _computeClass:function (cause) {
                var self = this, view = self.get("view");
                view._computeClass(self.get('children'), self.get("parent"), cause);
            },

            _updateRecursive:function () {
                var self = this, len = self.get('children').length;
                self._computeClass("_updateRecursive");
                S.each(self.get("children"), function (c, index) {
                    c._computeClass("_updateRecursive_children");
                    c.get("view").set("ariaPosInSet", index + 1);
                    c.get("view").set("ariaSize", len);
                });
            },

            removeChild:function (c) {
                var self = this, tree = self.get("tree");
                tree._unregister(c);
                S.each(c.get("children"), function (cc) {
                    tree._unregister(cc);
                });
                BaseNode.superclass.removeChild.apply(self, S.makeArray(arguments));
                self._updateRecursive();
            },

            _uiSetExpanded:function (v) {
                var self = this,
                    tree = self.get("tree");
                self._computeClass("expanded-" + v);
                if (v) {
                    tree.fire("expand", {
                        target:self
                    });
                } else {
                    tree.fire("collapse", {
                        target:self
                    });
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
            DefaultRender:BaseNodeRender,
            ATTRS:/**
             * @lends Tree.Node#
             */
            {
                /*事件代理*/
                handleMouseEvents:{
                    value:false
                },
                /**
                 * Current tree node 's id.
                 * Will generated automatically.
                 * @type String
                 */
                id:{
                    getter:function () {
                        var self = this,
                            id = self.get("el").attr("id");
                        if (!id) {
                            self.get("el").attr("id", id = S.guid("tree-node"));
                        }
                        return id;
                    }
                },
                /**
                 * Can used For config.
                 * Content of current tree node.
                 * @type String
                 */
                content:{view:true},

                /**
                 * Only For Config.
                 * Whether to force current tree node as a leaf.
                 * Default:false.
                 * It will change as children are added.
                 * @type Boolean
                 */
                isLeaf:{
                    view:true
                },

                /**
                 * Element for expand icon.
                 * @type {NodeList}
                 */
                expandIconEl:{ view:true},

                /**
                 * Element for icon.
                 * @type {NodeList}
                 */
                iconEl:{ view:true},

                /**
                 * Whether current tree node is selected.
                 * @type Boolean
                 */
                selected:{
                    view:true
                },

                /**
                 * Whether current tree node is expanded.
                 */
                expanded:{
                    value:false,
                    view:true
                },

                /**
                 * Html title for current tree node.
                 * @type String
                 */
                tooltip:{
                    view:true
                },

                /**
                 * Tree instance current tree node belongs to.
                 * @type Tree
                 */
                tree:{
                },

                /**
                 * depth of node.
                 * @type Number
                 */
                depth:{
                    value:0,
                    view:true
                },
                focusable:{
                    value:false
                },
                decorateChildCls:{
                    value:"tree-children"
                }
            },

            HTML_PARSER:{
                expanded:function (el) {
                    var children = el.one("." + this.getCssClassWithPrefix("tree-children"));
                    if (!children) {
                        return false;
                    }
                    return children.css("display") != "none";
                }
            }
        });

    Component.UIStore.setUIConstructorByCssClass(ITEM_CLS, {
        priority:10,
        ui:BaseNode
    });

    return BaseNode;

}, {
    requires:['node', 'component', './basenodeRender']
});/**
 * @fileOverview common render for node
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/basenodeRender", function (S, Node,  Component) {
    var $ = Node.all,
        LABEL_CLS = "tree-item-label",
        FILE_CLS = "tree-file-icon",
        FILE_EXPAND = "tree-expand-icon-{t}",
        FOLDER_EXPAND = FILE_EXPAND + "minus",
        FOLDER_COLLAPSED = FILE_EXPAND + "plus",

        INLINE_BLOCK = " ks-inline-block",
        ITEM_CLS = "tree-item",

        FOLDER_ICON_EXPANED = "tree-expanded-folder-icon",
        FOLDER_ICON_COLLAPSED = "tree-collapsed-folder-icon",

        CHILDREN_CLS = "tree-children",
        CHILDREN_CLS_L = "tree-lchildren",

        EXPAND_ICON_CLS = "tree-expand-icon",
        ICON_CLS = "tree-icon",

        LEAF_CLS = "tree-item-leaf",

        NOT_LEAF_CLS = "tree-item-folder",

        ROW_CLS = "tree-row";

    return Component.Render.extend({

        _computeClass:function (children, parent
                                //, cause
            ) {
            // S.log("hi " + cause + ": " + this.get("content"));
            var self = this,
                expanded = self.get("expanded"),
                isLeaf = self.get("isLeaf"),
                iconEl = self.get("iconEl"),
                expandIconEl = self.get("expandIconEl"),
                childrenEl = self.get("childrenEl"),
                expand_cls = [ICON_CLS, EXPAND_ICON_CLS, ""].join(" "),
                icon_cls = self.getCssClassWithPrefix([ICON_CLS, FILE_CLS, ""].join(" ")) + INLINE_BLOCK,
                folder_cls = self.getCssClassWithPrefix(
                    [ ICON_CLS, expanded ? FOLDER_ICON_EXPANED : FOLDER_ICON_COLLAPSED, ""].join(" ")) + INLINE_BLOCK,
                last = !parent ||
                    parent.get("children")[parent.get("children").length - 1].get("view") == self;
            // 强制指定了 isLeaf，否则根据儿子节点集合自动判断
            if (isLeaf === false || (isLeaf === undefined && children.length)) {
                iconEl.attr("class", folder_cls);
                if (expanded) {
                    expand_cls += FOLDER_EXPAND;
                } else {
                    expand_cls += FOLDER_COLLAPSED;
                }
                expandIconEl.attr("class", self.getCssClassWithPrefix(S.substitute(expand_cls, {
                    "t":last ? "l" : "t"
                })) + INLINE_BLOCK);
            } else
            //if (isLeaf !== false && (isLeaf ==true || !children.length))
            {
                iconEl.attr("class", icon_cls);
                expandIconEl.attr("class",
                    self.getCssClassWithPrefix(S.substitute((expand_cls + FILE_EXPAND), {
                        "t":last ? "l" : "t"
                    })) + INLINE_BLOCK);
            }
            childrenEl && childrenEl.attr("class", self.getCssClassWithPrefix(last ? CHILDREN_CLS_L : CHILDREN_CLS));

        },

        createDom:function () {
            var self = this,
                el = self.get("el"),
                id,
                rowEl,
                labelEl = self.get("labelEl");


            rowEl = $("<div class='" + self.getCssClassWithPrefix(ROW_CLS) + "'/>");
            id = S.guid('tree-item');
            self.__set("rowEl", rowEl);

            var expandIconEl = $("<div/>")
                .appendTo(rowEl);
            var iconEl = $("<div />")
                .appendTo(rowEl);

            if (!labelEl) {
                labelEl = $("<span id='" + id + "' class='" + self.getCssClassWithPrefix(LABEL_CLS) + "'/>");
                self.__set("labelEl", labelEl);
            }
            labelEl.appendTo(rowEl);

            el.attr({
                "role":"treeitem",
                "aria-labelledby":id
            }).prepend(rowEl);

            self.__set("expandIconEl", expandIconEl);
            self.__set("iconEl", iconEl);

        },

        _uiSetExpanded:function (v) {
            var self = this,
                childrenEl = self.get("childrenEl");
            if (childrenEl) {
                if (!v) {
                    childrenEl.hide();
                } else if (v) {
                    childrenEl.show();
                }
            }
            self.get("el").attr("aria-expanded", v);
        },

        _uiSetSelected:function (v) {
            var self = this,
                classes = self.getComponentCssClassWithState("-selected"),
                // selected 放在 row 上，防止由于子选择器而干扰节点的子节点显示
                // .selected .label {background:xx;}
                rowEl = self.get("rowEl");
            rowEl[v ? "addClass" : "removeClass"](classes);
            self.get("el").attr("aria-selected", v);
        },

        _uiSetContent:function (c) {
            this.get("labelEl").html(c);
        },

        _uiSetDepth:function (v) {
            this.get("el").attr("aria-level", v);
        },

        _uiSetAriaSize:function (v) {
            this.get("el").attr("aria-setsize", v);
        },

        _uiSetAriaPosInSet:function (v) {
            this.get("el").attr("aria-posinset", v);
        },

        _uiSetTooltip:function (v) {
            this.get("el").attr("title", v);
        },

        /**
         * 内容容器节点，子树节点都插到这里
         * 默认调用 Component.Render.prototype.getContentElement 为当前节点的容器
         * 而对于子树节点，它有自己的子树节点容器（单独的div），而不是儿子都直接放在自己的容器里面
         * @override
         * @return {NodeList}
         */
        getContentElement:function () {
            var self = this;
            if (self.get("childrenEl")) {
                return self.get("childrenEl");
            }
            var c = $("<div " + (self.get("expanded") ? "" : "style='display:none'")
                + " role='group'><" + "/div>")
                .appendTo(self.get("el"));
            self.__set("childrenEl", c);
            return c;
        }
    }, {
        ATTRS:{
            ariaSize:{},
            ariaPosInSet:{},
            childrenEl:{},
            expandIconEl:{},
            tooltip:{},
            iconEl:{},
            expanded:{},
            rowEl:{},
            depth:{},
            labelEl:{},
            content:{},
            isLeaf:{},
            selected:{}
        },

        HTML_PARSER:{
            childrenEl:function (el) {
                return el.children("." + this.getCssClassWithPrefix(CHILDREN_CLS));
            },
            labelEl:function (el) {
                return el.children("." + this.getCssClassWithPrefix(LABEL_CLS));
            },
            content:function (el) {
                return el.children("." + this.getCssClassWithPrefix(LABEL_CLS)).html();
            },
            isLeaf:function (el) {
                var self = this;
                if (el.hasClass(self.getCssClassWithPrefix(LEAF_CLS))) {
                    return true;
                }
                if (el.hasClass(self.getCssClassWithPrefix(NOT_LEAF_CLS))) {
                    return false;
                }
            }
        },

        ITEM_CLS:ITEM_CLS

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
        CHECK_CLS = "tree-item-check",
        CHECK = 1,
        EMPTY = 0;

    /**
     * Checked tree node.
     * @name CheckNode
     * @memberOf Tree
     * @class
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
                var self = this;
                // 需要通知 tree 获得焦点
                self.get("tree").get("el")[0].focus();
                var target = $(e.target),
                    view = self.get("view"),
                    tree = self.get("tree");

                if (e.type == "dblclick") {
                    // 双击在 +- 号上无效
                    if (target.equals(view.get("expandIconEl"))) {
                        return;
                    }
                    // 双击在 checkbox 上无效
                    if (target.equals(view.get("checkEl"))) {
                        return;
                    }
                    // 双击在字或者图标上，切换 expand 装tai
                    self.set("expanded", !self.get("expanded"));
                }

                // 点击在 +- 号，切换状态
                if (target.equals(view.get("expandIconEl"))) {
                    self.set("expanded", !self.get("expanded"));
                    return;
                }

                // 单击任何其他地方都切换 check 状态
                var checkState = self.get("checkState");
                if (checkState == CHECK) {
                    checkState = EMPTY;
                } else {
                    checkState = CHECK;
                }
                self.set("checkState", checkState);
                tree.fire("click", {
                    target:self
                });
            },

            _uiSetCheckState:function (s) {
                var self = this;
                if (s == CHECK || s == EMPTY) {
                    S.each(self.get("children"), function (c) {
                        c.set("checkState", s);
                    });
                }
                // 每次状态变化都通知 parent 沿链检查，一层层向上通知
                // 效率不高，但是结构清晰
                var parent = self.get("parent");
                if (parent) {
                    var checkCount = 0;
                    var cs = parent.get("children");
                    for (var i = 0; i < cs.length; i++) {
                        var c = cs[i], cState = c.get("checkState");
                        // 一个是部分选，父亲必定是部分选，立即结束
                        if (cState == PARTIAL_CHECK) {
                            parent.set("checkState", PARTIAL_CHECK);
                            return;
                        } else if (cState == CHECK) {
                            checkCount++;
                        }
                    }

                    // 儿子全都选了，父亲也全选
                    if (checkCount == cs.length) {
                        parent.set("checkState", CHECK);
                    }
                    // 儿子都没选，父亲也不选
                    else if (checkCount === 0) {
                        parent.set("checkState", EMPTY);
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

                /**
                 * Enums for check states.
                 * CheckNode.PARTIAL_CHECK: checked partly.
                 * CheckNode.CHECK: checked completely.
                 * CheckNode.EMPTY: not checked.
                 * @type Number
                 */
                checkState:{
                    view:true,
                    // check 的三状态
                    // 0 一个不选
                    // 1 儿子有选择
                    // 2 全部都选了
                    value:0
                }
            },
            CHECK_CLS:CHECK_CLS,
            DefaultRender:CheckNodeRender
        }, {
            xclass:CHECK_CLS,
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
        })

    return CheckNode;
}, {
    requires:['node', './basenode', './checknodeRender']
});/**
 * @fileOverview check node render
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/checknodeRender", function (S, Node,BaseNodeRender) {
    var $ = Node.all,
        ICON_CLS = "tree-icon",
        CHECK_CLS = "tree-item-check",
        ALL_STATES_CLS = "tree-item-checked0 tree-item-checked1 tree-item-checked2",
        INLINE_BLOCK = " ks-inline-block";
    return BaseNodeRender.extend({

        createDom:function () {
            var self = this;
            var expandIconEl = self.get("expandIconEl"),
                checkEl = $("<div class='" + self.getCssClassWithPrefix(ICON_CLS) + INLINE_BLOCK + "'/>").insertAfter(expandIconEl);
            self.__set("checkEl", checkEl);
        },

        _uiSetCheckState:function (s) {
            var self = this;
            var checkEl = self.get("checkEl");
            checkEl.removeClass(self.getCssClassWithPrefix(ALL_STATES_CLS))
                .addClass(self.getCssClassWithPrefix(CHECK_CLS + "ed" + s));
        }

    }, {
        ATTRS:{
            checkEl:{},
            checkState:{}
        },

        CHECK_CLS:CHECK_CLS
    });
}, {
    requires:['node', './basenodeRender']
});/**
 * @fileOverview root node represent a check tree
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/checktree", function (S, Component, CheckNode, CheckTreeRender, TreeMgr) {
    var CHECK_TREE_CLS = CheckTreeRender.CHECK_TREE_CLS;
    /**
     * KISSY Checked Tree.
     * @name CheckTree
     * @extends Tree.CheckNode
     * @class
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
            }
        }, {
        }, {
            xclass:CHECK_TREE_CLS,
            priority:40
        });
    CheckTree.DefaultRender = CheckTreeRender;
    return CheckTree;

}, {
    requires:['component', './checknode', './checktreeRender', './treemgr']
});/**
 * @fileOverview root node render for checktree
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/checktreeRender", function (S, CheckNodeRender, TreeMgrRender) {
    var CHECK_TREE_CLS = "tree-root-check";
    return CheckNodeRender.extend([TreeMgrRender], {
    }, {
        CHECK_TREE_CLS:CHECK_TREE_CLS
    });
}, {
    requires:['./checknodeRender', './treemgrRender']
});/**
 * @fileOverview tree component for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add('tree', function(S, Tree, TreeNode, CheckNode, CheckTree) {
    Tree.Node = TreeNode;
    Tree.CheckNode = CheckNode;
    Tree.CheckTree = CheckTree;
    return Tree;
}, {
    requires:["tree/base","tree/basenode","tree/checknode","tree/checktree"]
});/**
 * @fileOverview root node render
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/treeRender", function (S, BaseNodeRender, TreeMgrRender) {
    var TREE_CLS = "tree-root";
    return BaseNodeRender.extend([TreeMgrRender], {}, {
        TREE_CLS:TREE_CLS
    });
}, {
    requires:['./basenodeRender', './treemgrRender']
});/**
 * @fileOverview tree management utils
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/treemgr", function(S, Event) {

    function TreeMgr() {
    }

    TreeMgr.ATTRS =
    /**
     * @lends Tree#
     */
    {
        /**
         * Whether show root node.
         * Default:false.
         * @type Boolean
         */
        showRootNode:{
            view:true
        },
        /**
         * Current selected tree node.
         * @type Tree.Node
         */
        selectedItem:{},
        tree:{
            valueFn:function() {
                return this;
            }
        },
        focusable:{
            value:true
        }
    };

    S.augment(TreeMgr, {
        /*
         加快从事件代理获取原事件节点
         */
        __getAllNodes:function() {
            var self=this;
            if (!self._allNodes) {
                self._allNodes = {};
            }
            return self._allNodes;
        },

        __renderUI:function() {
             var self=this;
            // add 过那么一定调用过 checkIcon 了
            if (!self.get("children").length) {
                self._computeClass("root_renderUI");
            }
        },

        _register:function(c) {
            this.__getAllNodes()[c.get("id")] = c;
        },

        _unregister:function(c) {
            delete this.__getAllNodes()[c.get("id")];
        },

        handleKeyEventInternal:function(e) {
            var current = this.get("selectedItem");
            if (e.keyCode == Event.KeyCodes.ENTER) {
                // 传递给真正的单个子节点
                return current.performActionInternal(e);
            }
            return current._keyNav(e);
        },

        // 重写 delegateChildren ，缓存加快从节点获取对象速度
        getOwnerControl:function(node) {
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
        _uiSetSelectedItem:function(n, ev) {
            if (ev.prevVal) {
                ev.prevVal.set("selected", false);
            }
            n.set("selected", true);
        },


        _uiSetFocused:function(v) {
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
KISSY.add("tree/treemgrRender", function(S) {
    var FOCUSED_CLS = "tree-item-focused";

    function TreeMgrRender() {
    }

    TreeMgrRender.ATTRS = {
        // 默认 true
        // 是否显示根节点
        showRootNode:{
        }
    };

    S.augment(TreeMgrRender, {
        __renderUI:function() {
            var self=this;
            self.get("el").attr("role", "tree")[0]['hideFocus'] = true;
            self.get("rowEl").addClass(self.getCssClassWithPrefix("tree-root-row"));
        },

        _uiSetShowRootNode:function(v) {
            this.get("rowEl")[v ? "show" : "hide"]();
        },

        _uiSetFocused:function(v) {
            this.get("el")[v ? "addClass" : "removeClass"](this.getCssClassWithPrefix(FOCUSED_CLS));
        }
    });

    return TreeMgrRender;
});
