/**
 * concrete non-root tree node render
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/noderender", function(S, UIBase, Component, AbstractNodeRender) {
    return UIBase.create(AbstractNodeRender, {
    }, {
        ATTRS:{
            // 单个节点不能获取焦点，只能由根节点获取焦点
            focusable:{
                value:false
            }
        }
    });
}, {
    requires:['uibase','component','./abstractnoderender']
});