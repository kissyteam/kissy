/**
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
            ATTRS:{
                xrender:{
                    value:CheckTreeRender
                }
            }
        }, {
            xclass:CHECK_TREE_CLS,
            priority:40
        });
    return CheckTree;

}, {
    requires:['component', './checknode', './checktreeRender', './treemgr']
});