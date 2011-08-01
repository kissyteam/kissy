/**
 * root node represent a check tree
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/checktree", function(S, UIBase, Component, CheckNode, CheckTreeRender, TreeMgr) {
    /*多继承*/
    return UIBase.create(CheckNode, [TreeMgr], {
    }, {
        DefaultRender:CheckTreeRender
    });

}, {
    requires:['uibase','component','./checknode','./checktreerender','./treemgr']
});