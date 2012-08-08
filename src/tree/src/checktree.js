/**
 * @fileOverview root node represent a check tree
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/checktree", function (S, Component, CheckNode, CheckTreeRender, TreeMgr) {
    /**
     * @name CheckTree
     * @extends Tree.CheckNode
     * @class
     * KISSY Checked Tree.
     * xclass: 'check-tree'.
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
            },

            _uiSetFocused:function () {
                // check tree 没有 selectedItem 概念，也没有选中状态
            }
        }, {
            ATTRS:/**
             * @lends Tree.CheckTree#
             */
            {
                /**
                 * Readonly. Render class.
                 * @type {Function}
                 */
                xrender:{
                    value:CheckTreeRender
                }
            }
        }, {
            xclass:'check-tree',
            priority:40
        });
    return CheckTree;

}, {
    requires:['component', './checknode', './checktreeRender', './treemgr']
});