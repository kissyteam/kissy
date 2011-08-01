/**
 * root node represent a simple tree
 * @author yiminghe@gmail.com
 * @refer http://www.w3.org/TR/wai-aria-practices/#TreeView
 */
KISSY.add("tree/tree", function(S, UIBase, Component, BaseNode, TreeRender, TreeMgr) {
    /*多继承*/
    return UIBase.create(BaseNode, [TreeMgr], {
    }, {
        DefaultRender:TreeRender
    });

}, {
    requires:['uibase','component','./basenode','./treerender','./treemgr']
});