/**
 * @fileOverview root node render for checktree
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/checktreerender", function(S,  Component, CheckNodeRender, TreeMgrRender) {
    var CHECK_TREE_CLS="tree-root-check";
    return Component.define(CheckNodeRender, [TreeMgrRender],{
    },{
        CHECK_TREE_CLS:CHECK_TREE_CLS
    });
}, {
    requires:['component','./checknoderender','./treemgrrender']
});