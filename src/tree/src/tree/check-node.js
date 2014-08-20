/**
 * @ignore
 * checkable tree node
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Node = require('node');
    var TreeNode = require('./node');

    var $ = Node.all,
        PARTIAL_CHECK = 2,
        CHECK = 1,
        EMPTY = 0;

    /**
     * Checked tree node. xclass: 'check-tree-node'.
     * @class KISSY.Tree.CheckNode
     * @extends KISSY.Tree.Node
     */
    var CheckNode = TreeNode.extend({
        handleClickInternal: function (e) {
            var self = this,
                checkState,
                expanded = self.get('expanded'),
                expandIconEl = self.get('expandIconEl'),
                tree = self.get('tree'),
                target = $(e.target);

            // 需要通知 tree 获得焦点
            tree.focus();
            self.callSuper(e);
            // 点击在 +- 号，切换状态
            if (target.equals(expandIconEl)) {
                self.set('expanded', !expanded);
                return;
            }

            // 单击任何其他地方都切换 check 状态
            checkState = self.get('checkState');

            if (checkState === CHECK) {
                checkState = EMPTY;
            } else {
                checkState = CHECK;
            }

            self.set('checkState', checkState);
            return true;
        },

        _onSetCheckState: function (s) {
            var self = this,
                parent = self.get('parent'),
                checkCount,
                i,
                c,
                cState,
                cs;

            if (s === CHECK || s === EMPTY) {
                S.each(self.get('children'), function (c) {
                    c.set('checkState', s);
                });
            }

            // 每次状态变化都通知 parent 沿链检查，一层层向上通知
            // 效率不高，但是结构清晰
            if (parent) {
                checkCount = 0;
                cs = parent.get('children');
                for (i = 0; i < cs.length; i++) {
                    c = cs[i];
                    cState = c.get('checkState');
                    // 一个是部分选，父亲必定是部分选，立即结束
                    if (cState === PARTIAL_CHECK) {
                        parent.set('checkState', PARTIAL_CHECK);
                        return;
                    } else if (cState === CHECK) {
                        checkCount++;
                    }
                }

                // 儿子都没选，父亲也不选
                if (checkCount === 0) {
                    parent.set('checkState', EMPTY);
                } else
                // 儿子全都选了，父亲也全选
                if (checkCount === cs.length) {
                    parent.set('checkState', CHECK);
                }
                // 有的儿子选了，有的没选，父亲部分选
                else {
                    parent.set('checkState', PARTIAL_CHECK);
                }
            }
        }
    }, {
        ATTRS: {
            checkIconEl: {
            },

            checkable: {
                value: true,
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
                // check 的三状态
                // 0 一个不选
                // 1 儿子有选择
                // 2 全部都选了
                value: 0,
                sync: 0,
                view: 1
            },

            defaultChildCfg: {
                value: {
                    xclass: 'check-tree-node'
                }
            }
        },
        xclass: 'check-tree-node'
    });

    /**
     * check node's check state enum
     * @enum {Number} KISSY.Tree.CheckNode.CheckState
     */
    CheckNode.CheckState = {
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
    };

    return CheckNode;
});