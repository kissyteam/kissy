/**
 * @fileOverview root node render for checktree
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/checktreeRender", function (S, CheckNodeRender, TreeMgrRender) {
    return CheckNodeRender.extend([TreeMgrRender]);
}, {
    requires:['./checknodeRender', './treemgrRender']
});