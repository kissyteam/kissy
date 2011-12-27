/**
 * @fileOverview generate proxy drag object,
 * @author yiminghe@gmail.com
 */
KISSY.add("dd/proxy", function (S, Node, Base) {
    var DESTRUCTOR_ID = "__proxy_destructors",
        stamp = S.stamp,
        MARKER = S.guid("__dd_proxy"),
        PROXY_ATTR = "__proxy";

    /**
     * @memberOf DD
     * @class proxy drag
     */
    function Proxy() {
        var self = this;
        Proxy.superclass.constructor.apply(self, arguments);
        self[DESTRUCTOR_ID] = {};
    }

    Proxy.ATTRS =
    /**
     * @lends DD.Proxy#
     */
    {
        /**
         * 如何生成替代节点
         * @type {Function}
         * @default 深度克隆自身
         */
        node:{
            value:function (drag) {
                return new Node(drag.get("node").clone(true));
            }
        },
        /**
         * 是否每次都生成新节点/拖放完毕是否销毁当前代理节点
         * @type {boolean}
         * @default false
         */
        destroyOnEnd:{
            value:false
        },

        /**
         * 拖放结束是否移动本身到代理节点位置
         * @type {boolean}
         * @default true
         */
        moveOnEnd:{
            value:true
        }
    };

    S.extend(Proxy, Base,
        /**
         * @lends DD.Proxy#
         */
        {
            /**
             * 关联到某个拖对象
             * @param drag
             */
            attach:function (drag) {

                var self = this,
                    tag = stamp(drag, 1, MARKER);

                if (tag && self[DESTRUCTOR_ID][tag]) {
                    return;
                }

                function start() {
                    var node = self.get("node"),
                        dragNode = drag.get("node");
                    // cache proxy node
                    if (!self[PROXY_ATTR]) {
                        if (S.isFunction(node)) {
                            node = node(drag);
                            node.addClass("ks-dd-proxy");
                            node.css("position", "absolute");
                            self[PROXY_ATTR] = node;
                        }
                    } else {
                        node = self[PROXY_ATTR];
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
                    if (self.get("moveOnEnd")) {
                        drag.get("dragNode").offset(node.offset());
                    }
                    if (self.get("destroyOnEnd")) {
                        node.remove();
                        self[PROXY_ATTR] = 0;
                    } else {
                        node.hide();
                    }
                    drag.set("node", drag.get("dragNode"));
                }

                drag.on("dragstart", start);
                drag.on("dragend", end);

                tag = stamp(drag, 0, MARKER);

                self[DESTRUCTOR_ID][tag] = {
                    drag:drag,
                    fn:function () {
                        drag.detach("dragstart", start);
                        drag.detach("dragend", end);
                    }
                };
            },
            /**
             * 取消关联
             * @param drag
             */
            unAttach:function (drag) {
                var self = this,
                    tag = stamp(drag, 1, MARKER),
                    destructors = self[DESTRUCTOR_ID];
                if (tag && destructors[tag]) {
                    destructors[tag].fn();
                    delete destructors[tag];
                }
            },

            /**
             * 销毁
             */
            destroy:function () {
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
    requires:['node', 'base']
});