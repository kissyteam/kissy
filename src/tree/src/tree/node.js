/**
 * @ignore
 * abstraction of tree node ,root and other node will extend it
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Node = require('node');
    var Container = require('component/container');
    var TreeNodeRender = require('./node-render');

    var $ = Node.all,
        KeyCode = Node.KeyCode;

    /**
     * Tree Node. xclass: 'tree-node'.
     * @class KISSY.Tree.Node
     * @extends KISSY.Component.Container
     */
    return Container.extend({
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

        handleKeyDownInternal: function (e) {
            var self = this,
                processed = true,
                tree = self.get('tree'),
                expanded = self.get('expanded'),
                nodeToBeSelected,
                isLeaf = self.get('isLeaf'),
                children = self.get('children'),
                keyCode = e.keyCode;

            // 顺序统统为前序遍历顺序
            switch (keyCode) {
                case KeyCode.ENTER:
                    return self.handleClickInternal(e);

                // home
                // 移到树的顶层节点
                case KeyCode.HOME:
                    nodeToBeSelected = tree;
                    break;

                // end
                // 移到最后一个可视节点
                case KeyCode.END:
                    nodeToBeSelected = getLastVisibleDescendant(tree);
                    break;

                // 上
                // 当前节点的上一个兄弟节点的最后一个可显示节点
                case KeyCode.UP:
                    nodeToBeSelected = getPreviousVisibleNode(self);
                    break;

                // 下
                // 当前节点的下一个可显示节点
                case KeyCode.DOWN:
                    nodeToBeSelected = getNextVisibleNode(self);
                    break;

                // 左
                // 选择父节点或 collapse 当前节点
                case KeyCode.LEFT:
                    if (expanded && (children.length || isLeaf === false)) {
                        self.set('expanded', false);
                    } else {
                        nodeToBeSelected = self.get('parent');
                    }
                    break;

                // 右
                // expand 当前节点
                case KeyCode.RIGHT:
                    if (children.length || isLeaf === false) {
                        if (!expanded) {
                            self.set('expanded', true);
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
            if (index === siblings.length - 1) {
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

        handleClickInternal: function (e) {
            var self = this,
                target = $(e.target),
                expanded = self.get('expanded'),
                tree = self.get('tree');
            tree.focus();
            self.callSuper(e);
            if (target.equals(self.get('expandIconEl'))) {
                self.set('expanded', !expanded);
            } else {
                self.select();
                self.fire('click', {
                    domEvent: e
                });
            }
            return true;
        },

        /**
         * override root 's renderChildren to apply depth and css recursively
         */
        createChildren: function () {
            var self = this;
            self.renderChildren.apply(self, arguments);
            // only sync child sub tree at root node
            if (self === self.get('tree')) {
                updateSubTreeStatus(self, self, -1, 0);
            }
        },

        _onSetExpanded: function (v) {
            var self = this;
            refreshCss(self);
            self.fire(v ? 'expand' : 'collapse');
        },

        _onSetSelected: function (v, e) {
            var tree = this.get('tree');
            if (!(e && e.byPassSetTreeSelectedItem)) {
                tree.set('selectedItem', v ? this : null);
            }
        },

        /**
         * Expand all descend nodes of current node
         */
        expandAll: function () {
            var self = this;
            self.set('expanded', true);
            S.each(self.get('children'), function (c) {
                c.expandAll();
            });
        },

        /**
         * Collapse all descend nodes of current node
         */
        collapseAll: function () {
            var self = this;
            self.set('expanded', false);
            S.each(self.get('children'), function (c) {
                c.collapseAll();
            });
        }
    }, {
        ATTRS: {
            xrender: {
                value: TreeNodeRender
            },

            checkable: {
                value: false,
                view: 1
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
            },

            /**
             * Element for icon.
             * @type {KISSY.NodeList}
             */
            iconEl: {
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
             * @type {Boolean}
             * Defaults to: false.
             */
            expanded: {
                sync: 0,
                value: false,
                view: 1
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
             * @type {KISSY.Tree}
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

            defaultChildCfg: {
                value: {
                    xclass: 'tree-node'
                }
            }
        },
        xclass: 'tree-node'
    });

    // # ------------------- private start

    function onAddChild(e) {
        var self = this;
        if (e.target === self) {
            updateSubTreeStatus(self, e.component, self.get('depth'), e.index);
        }
    }

    function onRemoveChild(e) {
        var self = this;
        if (e.target === self) {
            recursiveSetDepth(self.get('tree'), e.component);
            refreshCssForSelfAndChildren(self, e.index);
        }
    }

    function syncAriaSetSize(e) {
        var self = this;
        if (e.target === self) {
            self.el.setAttribute('aria-setsize',
                self.get('children').length);
        }
    }

    function isNodeSingleOrLast(self) {
        var parent = self.get('parent'),
            children = parent && parent.get('children'),
            lastChild = children && children[children.length - 1];
        // 根节点
        // or
        // 父亲的最后一个子节点
        return !lastChild || lastChild === self;
    }

    function isNodeLeaf(self) {
        var isLeaf = self.get('isLeaf');
        // 强制指定了 isLeaf，否则根据儿子节点集合自动判断
        return !(isLeaf === false || (isLeaf === undefined && self.get('children').length));
    }

    function getLastVisibleDescendant(self) {
        var children = self.get('children');
        // 没有展开或者根本没有儿子节点，可视的只有自己
        if (!self.get('expanded') || !children.length) {
            return self;
        }
        // 可视的最后一个子孙
        return getLastVisibleDescendant(children[children.length - 1]);
    }

    // not same with _4ePreviousSourceNode in editor !
    function getPreviousVisibleNode(self) {
        var prev = self.prev();
        if (!prev) {
            prev = self.get('parent');
        } else {
            prev = getLastVisibleDescendant(prev);
        }
        return prev;
    }

    // similar to _4eNextSourceNode in editor
    function getNextVisibleNode(self) {
        var children = self.get('children'),
            n,
            parent;
        if (self.get('expanded') && children.length) {
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
        if (self.get && self.view) {
            self.view.refreshCss(isNodeSingleOrLast(self), isNodeLeaf(self));
        }
    }

    function updateSubTreeStatus(self, c, depth, index) {
        var tree = self.get('tree');
        if (tree) {
            recursiveSetDepth(tree, c, depth + 1);
            refreshCssForSelfAndChildren(self, index);
        }
    }

    function recursiveSetDepth(tree, c, setDepth) {
        if (setDepth !== undefined) {
            c.set('depth', setDepth);
        }
        S.each(c.get('children'), function (child) {
            if (typeof setDepth === 'number') {
                recursiveSetDepth(tree, child, setDepth + 1);
            } else {
                recursiveSetDepth(tree, child);
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
            c.el.setAttribute('aria-posinset', index + 1);
        }
    }

    // # ------------------- private end
});

/**
 * @ignore
 * 2012-09-25
 *  - 去除 dblclick 支持，该交互会重复触发 click 事件，可能会重复执行逻辑
 */