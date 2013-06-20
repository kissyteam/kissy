/**
 * root node represent a check tree
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/check-tree", function (S, CheckNode, TreeManager) {

    var CheckTree;
    /**
     * @name CheckTree
     * @extends Tree.CheckNode
     * @class
     * KISSY Checked Tree.
     * xclass: 'check-tree'.
     * @member Tree
     */
    return  CheckTree = CheckNode.extend([TreeManager], {

        handleKeyDownInternal: function (e) {
            var current = this.get("selectedItem");
            if (current === this) {
                return CheckTree.superclass.handleKeyDownInternal.call(current, e);
            }
            return current && current.handleKeyDownInternal(e);
        },

        _onSetFocused: function (v) {
            var self = this;
            CheckTree.superclass._onSetFocused.apply(self, arguments);
            // 得到焦点时没有选择节点
            // 默认选择自己
            if (v && !self.get("selectedItem")) {
                self.select();
            }
        }

    }, {
        ATTRS: {
            defaultChildCfg: {
                value: {
                    xclass: 'check-tree-node'
                }
            }
        },
        xclass: 'check-tree'
    });
}, {
    requires: ['./check-node', './tree-manager']
});