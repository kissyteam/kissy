/**
 * @fileOverview root node render
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/treerender", function(S, UIBase, Component, BaseNodeRender, TreeMgrRender) {
    var TREE_CLS="tree-root";
    return UIBase.create(BaseNodeRender, [TreeMgrRender],{},{
        TREE_CLS:TREE_CLS
    });
}, {
    requires:['uibase','component','./basenoderender','./treemgrrender']
});