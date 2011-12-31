/**
 * @fileOverview root node represent a simple tree
 * @author yiminghe@gmail.com
 * @see http://www.w3.org/TR/wai-aria-practices/#TreeView
 */
KISSY.add("tree/base", function(S, UIBase, Component, BaseNode, TreeRender, TreeMgr) {

    var TREE_CLS = TreeRender.TREE_CLS;

    /*多继承
     *1. 继承基节点（包括可装饰儿子节点功能）
     *2. 继承 mixin 树管理功能
     *3. 继承 mixin 儿子事件代理功能
     */
    var Tree = UIBase.create(BaseNode, [Component.DelegateChildren,TreeMgr], {
    }, {
        DefaultRender:TreeRender
    });


    Component.UIStore.setUIByClass(TREE_CLS, {
        priority:Component.UIStore.PRIORITY.LEVEL3,
        ui:Tree
    });


    return Tree;

}, {
    requires:['uibase','component','./basenode','./treerender','./treemgr']
});

/**
 * note bug:
 *
 * 1. checked tree 根节点总是 selected ！
 * 2. 根节点 hover 后取消不了了
 **/