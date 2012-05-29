/**
 * @fileOverview root node render
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/treeRender", function (S, BaseNodeRender, TreeMgrRender) {
    var TREE_CLS = "tree-root";
    return BaseNodeRender.extend([TreeMgrRender], {}, {
        TREE_CLS:TREE_CLS
    });
}, {
    requires:['./basenodeRender', './treemgrRender']
});