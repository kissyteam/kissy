/**
 * generate proxy drag object,
 * @author:yiminghe@gmail.com
 */
KISSY.add("dd/proxy", function(S, Node) {
    var DESTRUCTOR_ID = "__proxy_destructors",
        DRAG_TAG = "__proxy_id",
        PROXY_ATTR = "__proxy";

    function Proxy() {
        Proxy.superclass.constructor.apply(this, arguments);
        this[DESTRUCTOR_ID] = {};
    }

    Proxy.ATTRS = {
        node:{
            /*
             如何生成替代节点
             @return {KISSY.Node} 替代节点
             */
            value:function(drag) {
                return new Node(drag.get("node")[0].cloneNode(true));
                //n.attr("id", S.guid("ks-dd-proxy"));
            }
        },
        destroyOnEnd:{
            /**
             * 是否每次都生成新节点/拖放完毕是否销毁当前代理节点
             */
            value:false
        }
    };

    S.extend(Proxy, S.Base, {
        attach:function(drag) {
            if (drag[DRAG_TAG]) return;

            var self = this;

            function start() {
                var node = self.get("node");
                var dragNode = drag.get("node");

                if (!self[PROXY_ATTR] && S.isFunction(node)) {
                    node = node(drag);
                    node.addClass("ks-dd-proxy");
                    node.css("position", "absolute");
                    self[PROXY_ATTR] = node;
                }
                dragNode.parent().append(self[PROXY_ATTR]);
                self[PROXY_ATTR].show();
                self[PROXY_ATTR].offset(dragNode.offset());
                drag.set("dragNode", dragNode);
                drag.set("node", self[PROXY_ATTR]);
            }

            function end() {
                var node = self[PROXY_ATTR];
                drag.get("dragNode").offset(node.offset());
                node.hide();
                if (self.get("destroyOnEnd")) {
                    node.remove();
                    self[PROXY_ATTR] = null;
                }
                drag.set("node", drag.get("dragNode"));
            }

            drag.on("dragstart", start);
            drag.on("dragend", end);

            var tag = drag[DRAG_TAG] = S.guid("dd-proxyid-");

            self[DESTRUCTOR_ID][tag] = {
                drag:drag,
                fn:function() {
                    drag.detach("dragstart", start);
                    drag.detach("dragend", end);
                }
            };
        },
        unAttach:function(drag) {
            var tag = drag[DRAG_TAG];
            if (!tag) return;
            this[DESTRUCTOR_ID][tag].fn();
            delete this[DESTRUCTOR_ID][tag];
            delete drag[DRAG_TAG];
        },

        destroy:function() {
            var node = this.get("node");
            if (node && !S.isFunction(node)) {
                node.remove();
            }
            for (var d in this[DESTRUCTOR_ID]) {
                this.unAttach(this[DESTRUCTOR_ID][d].drag);
            }
        }
    });

    return Proxy;
}, {
    requires:['node']
});