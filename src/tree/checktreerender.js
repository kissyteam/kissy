/**
 * root node render for checktree
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/checktreerender", function(S, UIBase, Component, CheckNodeRender, TreeMgrRender) {
    return UIBase.create(CheckNodeRender, [TreeMgrRender]);
}, {
    requires:['uibase','component','./checknoderender','./treemgrrender']
});