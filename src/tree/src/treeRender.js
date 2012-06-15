/**
 * @fileOverview root node render
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/treeRender", function (S, BaseNodeRender, TreeMgrRender) {
    return BaseNodeRender.extend([TreeMgrRender]);
}, {
    requires:['./basenodeRender', './treemgrRender']
});