/**
 *  checkable tree node
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
});