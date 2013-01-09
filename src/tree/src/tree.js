/**
 *  tree component for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add('tree', function (S, Tree, TreeNode, CheckNode, CheckTree) {
    Tree.Node =TreeNode;
    Tree.CheckNode = CheckNode;
    Tree.CheckTree = CheckTree;
    return Tree;
}, {
    requires: ["tree/base", "tree/node", "tree/check-node", "tree/check-tree"]
});