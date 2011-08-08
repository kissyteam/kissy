/**
 * root node render for checktree
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/checktreerender", function(S, UIBase, Component, CheckNodeRender, TreeMgrRender) {
    var CHECKED_TREE_CLS="tree-root-checked";
    return UIBase.create(CheckNodeRender, [TreeMgrRender],{
        renderUI:function(){
            this.get("el").addClass(this.getCls(CHECKED_TREE_CLS));
        }
    },{
        CHECKED_TREE_CLS:CHECKED_TREE_CLS
    });
}, {
    requires:['uibase','component','./checknoderender','./treemgrrender']
});