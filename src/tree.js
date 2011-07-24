/**
 * tree component for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add('tree', function(S, Tree, TreeNode) {
    Tree.Node = TreeNode;
    return Tree;
}, {
    requires:["tree/tree","tree/node"]
});