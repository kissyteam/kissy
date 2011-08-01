/**
 * root node render
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/treerender", function(S, UIBase, Component, BaseNodeRender, TreeMgrRender) {
    return UIBase.create(BaseNodeRender, [TreeMgrRender]);
}, {
    requires:['uibase','component','./basenoderender','./treemgrrender']
});