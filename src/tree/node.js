/**
 * tree node , extend abstract node
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/node", function(S, UIBase, Component, AbstractNode, NodeRender) {
    return UIBase.create(AbstractNode, {
        _performInternal:function() {
            // 需要通知 tree 获得焦点
            this.get("tree").get("el")[0].focus();
            return AbstractNode.prototype._performInternal.apply(this, S.makeArray(arguments));
        }
    }, {
        DefaultRender:NodeRender
    });
}, {
    requires:['uibase','component','./abstractnode','./noderender']
});