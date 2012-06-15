/**
 * @fileOverview root node represent a simple tree
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/base", function (S, Component, BaseNode, TreeRender, TreeMgr) {

    /*多继承
     1. 继承基节点（包括可装饰儿子节点功能）
     2. 继承 mixin 树管理功能
     3. 继承 mixin 儿子事件代理功能
     */

    /**
     * @name Tree
     * @class
     * KISSY Tree.
     * xclass: 'tree'.
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
            ATTRS:{
                xrender:{
                    value:TreeRender
                }
            }
        }, {
            xclass:'tree',
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
 **/