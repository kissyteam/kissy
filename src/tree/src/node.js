/**
 * abstraction of tree node ,root and other node will extend it
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
     * @member Tree
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

            _onSetSelected: function (v, e) {
                var tree = this.get("tree");
                if (e && e.byPassSetTreeSelectedItem) {
                } else {
                    tree.set('selectedItem', v ? this : null);
                }
            },

            bindUI: function () {
                this.on('afterAddChild', onAddChild);
                this.on('afterRemoveChild', onRemoveChild);
                this.on('afterAddChild afterRemoveChild', syncAriaSetSize);
            },

            syncUI: function () {
                // 集中设置样式
                refreshCss(this);
                syncAriaSetSize.call(this, {
                    target: this
                });
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
                            nodeToBeSelected = self.get('parent');
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
                    parent = self.get('parent'),
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
                    parent = self.get('parent'),
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
                this.set('selected', true);
            },

            performActionInternal: function (e) {
                var self = this,
                    target = $(e.target),
                    expanded = self.get("expanded"),
                    tree = self.get("tree");
                tree.focus();
                if (target.equals(self.get("expandIconEl"))) {
                    self.set("expanded", !expanded);
                } else {
                    self.select();
                    self.fire("click");
                }


            },

            /**
             * override root 's renderChildren to apply depth and css recursively
             */
            renderChildren: function () {
                var self = this;
                TreeNode.superclass.renderChildren.apply(self, arguments);
                // only sync child sub tree at root node
                if (self === self.get('tree')) {
                    registerToTree(self, self, -1, 0);
                }
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
                 * Defaults to: false.
                 */
                expanded: {
                    view: 1
                },

                /**
                 * Whether current tree node is collapsed.
                 * @type {Boolean.}
                 * Defaults to: true.
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
                            from = from.get('parent');
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
                    value: 'tree-children'
                },

                defaultChildCfg: {
                    value: {
                        xclass: 'tree-node'
                    }
                }
            }
        }, {
            xclass: 'tree-node',
            priority: 10
        });


    // # ------------------- private start

    function onAddChild(e) {
        if (e.target == this) {
            registerToTree(this, e.component, this.get('depth'), e.index);
        }
    }

    function onRemoveChild(e) {
        var self = this;
        if (e.target == self) {
            recursiveRegister(self.get('tree'), e.component, "_unRegister");
            refreshCssForSelfAndChildren(self, e.index);
        }
    }

    function syncAriaSetSize(e) {
        if (e.target === this)
            this.get('el')[0].setAttribute('aria-setsize', this.get('children').length);
    }

    function isNodeSingleOrLast(self) {
        var parent = self.get('parent'),
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
            prev = self.get('parent');
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
        while (!n && (parent = parent.get('parent'))) {
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

    function registerToTree(self, c, depth, index) {
        var tree = self.get("tree");
        if (tree) {
            recursiveRegister(tree, c, "_register", depth + 1);
            refreshCssForSelfAndChildren(self, index);
        }
    }

    function recursiveRegister(tree, c, action, setDepth) {
        tree[action](c);
        if (setDepth !== undefined) {
            c.set("depth", setDepth);
        }
        S.each(c.get("children"), function (child) {
            if (typeof setDepth == 'number') {
                recursiveRegister(tree, child, action, setDepth + 1);
            } else {
                recursiveRegister(tree, child, action);
            }
        });
    }

    function refreshCssForSelfAndChildren(self, index) {
        refreshCss(self);
        index = Math.max(0, index - 1);
        var children = self.get('children'),
            c,
            len = children.length;
        for (; index < len; index++) {
            c = children[index];
            refreshCss(c);
            c.get("el")[0].setAttribute("aria-posinset", index + 1);
        }
    }

    // # ------------------- private end

    return TreeNode;

}, {
    requires: ['node', 'component/base', './node-render']
});

/**
 * 2012-09-25
 *  - 去除 dblclick 支持，该交互会重复触发 click 事件，可能会重复执行逻辑
 */