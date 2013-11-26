/**
 * @ignore
 * tree component for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Tree = require('tree/control');
    var TreeNode = require('tree/node');
    var CheckNode = require('tree/check-node');
    var CheckTree = require('tree/check-tree');

    Tree.Node = TreeNode;
    Tree.CheckNode = CheckNode;
    Tree.CheckTree = CheckTree;
    return Tree;
});