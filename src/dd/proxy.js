/**
 * generate proxy drag object,
 * @author yiminghe@gmail.com
 */
KISSY.add("dd/proxy", function(S, Node) {
    var DESTRUCTOR_ID = "__proxy_destructors",
        stamp = S.stamp,
        MARKER = S.guid("__dd_proxy"),
        PROXY_ATTR = "__proxy";

    function Proxy() {
        var self = this;
        Proxy.superclass.constructor.apply(self, arguments);
        self[DESTRUCTOR_ID] = {};
    }

    Proxy.ATTRS = {
        node:{
            /*
             如何生成替代节点
             @return {KISSY.Node} 替代节点
             */
            value:function(drag) {
                return new Node(drag.get("node").clone(true));
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

            var self = this,
                tag;

            if (tag = stamp(drag, 1, MARKER) &&
                self[DESTRUCTOR_ID][tag]
                ) {
                return;
            }

            function start() {
                var node = self.get("node"),
                    dragNode = drag.get("node");

                if (!self[PROXY_ATTR] && S.isFunction(node)) {
                    node = node(drag);
                    node.addClass("ks-dd-proxy");
                    node.css("position", "absolute");
                    self[PROXY_ATTR] = node;
                }
                dragNode.parent()
                    .append(node);
                node.show();
                node.offset(dragNode.offset());
                drag.set("dragNode", dragNode);
                drag.set("node", node);
            }

            function end() {
                var node = self[PROXY_ATTR];
                drag.get("dragNode").offset(node.offset());
                node.hide();
                if (self.get("destroyOnEnd")) {
                    node.remove();
                    self[PROXY_ATTR] = 0;
                }
                drag.set("node", drag.get("dragNode"));
            }

            drag.on("dragstart", start);
            drag.on("dragend", end);

            tag = stamp(drag, 0, MARKER);

            self[DESTRUCTOR_ID][tag] = {
                drag:drag,
                fn:function() {
                    drag.detach("dragstart", start);
                    drag.detach("dragend", end);
                }
            };
        },
        unAttach:function(drag) {
            var self = this,
                tag = stamp(drag, 1, MARKER),
                destructors = self[DESTRUCTOR_ID];
            if (tag && destructors[tag]) {
                destructors[tag].fn();
                delete destructors[tag];
            }
        },

        destroy:function() {
            var self = this,
                node = self.get("node"),
                destructors = self[DESTRUCTOR_ID];
            if (node && !S.isFunction(node)) {
                node.remove();
            }
            for (var d in destructors) {
                this.unAttach(destructors[d].drag);
            }
        }
    });

    return Proxy;
}, {
    requires:['node']
});