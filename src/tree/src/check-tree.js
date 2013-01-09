/**
 *  root node represent a check tree
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
});