KISSY.add("tree/noderender", function(S, UIBase, Component, AbstractNodeRender) {
    return UIBase.create(AbstractNodeRender, {
    }, {
        ATTRS:{
            focusable:{
                value:false
            }
        }
    });
}, {
    requires:['uibase','component','./abstractnoderender']
});