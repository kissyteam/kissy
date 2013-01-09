/**
 *  root node render for check-tree
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/check-tree-render", function (S, CheckNodeRender, TreeManagerRender) {
    return CheckNodeRender.extend([TreeManagerRender]);
}, {
    requires:['./check-node-render', './tree-manager-render']
});