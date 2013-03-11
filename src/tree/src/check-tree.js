/**
 * root node represent a check tree
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/check-tree", function (S, Component, CheckNode, CheckTreeRender, TreeManager) {
    /**
     * @name CheckTree
     * @extends Tree.CheckNode
     * @class
     * KISSY Checked Tree.
     * xclass: 'check-tree'.
     * @member Tree
     */
    return  CheckNode.extend([TreeManager], {
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
}, {
    requires: ['component/base', './check-node', './check-tree-render', './tree-manager']
});