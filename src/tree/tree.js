/**
 * root node represent a simple tree
 * @author yiminghe@gmail.com
 * @refer http://www.w3.org/TR/wai-aria-practices/#TreeView
 */
KISSY.add("tree/tree", function(S, UIBase, Component, BaseNode, TreeRender, TreeMgr) {
    /*多继承
     *1. 继承基节点（包括可装饰儿子节点功能）
     *2. 继承 mixin 树管理功能
     *3. 继承 mixin 儿子事件代理功能
     */
    return UIBase.create(BaseNode, [TreeMgr,Component.DelegateChildren], {
    }, {
        DefaultRender:TreeRender
    });

}, {
    requires:['uibase','component','./basenode','./treerender','./treemgr']
});