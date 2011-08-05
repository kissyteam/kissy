/**
 * root node represent a check tree
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/checktree", function(S, UIBase, Component, CheckNode, CheckTreeRender, TreeMgr) {
    var CHECKED_TREE_CLS = CheckTreeRender.CHECKED_TREE_CLS;
    /*多继承*/
    var CheckTree = UIBase.create(CheckNode, [TreeMgr,Component.DelegateChildren], {
    }, {
        DefaultRender:CheckTreeRender
    });

    Component.UIStore.setUIByClass(CHECKED_TREE_CLS, {
        priority:40,
        ui:CheckTree
    });

    return CheckTree;

}, {
    requires:['uibase','component','./checknode','./checktreerender','./treemgr']
});