/**
 * @fileOverview root node render for checktree
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/checktreeRender", function (S, CheckNodeRender, TreeMgrRender) {
    var CHECK_TREE_CLS = "tree-root-check";
    return CheckNodeRender.extend([TreeMgrRender], {
    }, {
        CHECK_TREE_CLS:CHECK_TREE_CLS
    });
}, {
    requires:['./checknodeRender', './treemgrRender']
});