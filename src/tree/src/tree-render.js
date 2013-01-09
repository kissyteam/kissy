/**
 *  root node render
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/tree-render", function (S, TreeNodeRender, TreeManagerRender) {
    return TreeNodeRender.extend([TreeManagerRender]);
}, {
    requires:['./node-render', './tree-manager-render']
});