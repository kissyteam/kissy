/**
 * generate proxy drag object,
 * @author:yiminghe@gmail.com
 */
KISSY.add("dd/proxy", function(S) {
    function Proxy() {
        Proxy.superclass.constructor.apply(this, arguments);
    }

    Proxy.ATTRS = {
        node:{
            /*
             如何生成替代节点
             @return {KISSY.Node} 替代节点
             */
            value:function(drag) {
                var n = S.one(drag.get("node")[0].cloneNode(true));
                n.attr("id", S.guid("ks-dd-proxy"));
                return n;
            }
        }
    };

    S.extend(Proxy, S.Base, {
        attach:function(drag) {
            var self = this;
            drag.on("dragstart", function() {
                var node = self.get("node");
                var dragNode = drag.get("node");
                if (S.isFunction(node)) {
                    node = node(drag);
                    node.css("position", "absolute");
                    self.set("node", node);
                }
                dragNode.parent().append(node);
                node.show();
                node.offset(dragNode.offset());
                drag.set("dragNode", dragNode);
                drag.set("node", node);
            });
            drag.on("dragend", function() {
                var node = self.get("node");
                drag.get("dragNode").offset(node.offset());
                node.hide();
                drag.set("node", drag.get("dragNode"));
            });
        },

        destroy:function() {
            var node = this.get("node");
            if (node && !S.isFunction(node)) {
                node.remove();
            }
        }
    });

    return Proxy;
});