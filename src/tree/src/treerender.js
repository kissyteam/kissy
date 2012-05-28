/**
 * @fileOverview root node render
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/treerender", function(S,  Component, BaseNodeRender, TreeMgrRender) {
    var TREE_CLS="tree-root";
    return Component.define(BaseNodeRender, [TreeMgrRender],{},{
        TREE_CLS:TREE_CLS
    });
}, {
    requires:['component','./basenoderender','./treemgrrender']
});