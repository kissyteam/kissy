/**
 * @fileOverview root node render for checktree
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/checktreerender", function(S, UIBase, Component, CheckNodeRender, TreeMgrRender) {
    var CHECK_TREE_CLS="tree-root-check";
    return UIBase.create(CheckNodeRender, [TreeMgrRender],{
    },{
        CHECK_TREE_CLS:CHECK_TREE_CLS
    });
}, {
    requires:['uibase','component','./checknoderender','./treemgrrender']
});