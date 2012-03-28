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
     * provide abilities for draggable tp create a proxy drag node,
     * instead of dragging the original node.
     * @memberOf DD
     * @class
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
         * how to get the proxy node. default:clone the node itself deeply.
         * @type {Function}
         */
        node:{
            value:function (drag) {
                return new Node(drag.get("node").clone(true));
            }
        },
        /**
         * destroy the proxy node at the end of this drag. default:false
         * @type {boolean}
         */
        destroyOnEnd:{
            value:false
        },

        /**
         * move the original node at the end of the drag. default:true
         * @type {boolean}
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
             * make this draggable object can be proxied.
             * @param {DD.Draggable} drag
             */
            attachDrag:function (drag) {

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
                    drag.__set("dragNode", dragNode);
                    drag.__set("node", node);
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
                    drag.__set("node", drag.get("dragNode"));
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
             * make this draggable object unproxied
             * @param {DD.Draggable} drag
             */
            detachDrag:function (drag) {
                var self = this,
                    tag = stamp(drag, 1, MARKER),
                    destructors = self[DESTRUCTOR_ID];
                if (tag && destructors[tag]) {
                    destructors[tag].fn();
                    delete destructors[tag];
                }
            },

            /**
             * make all draggable object associated with this proxy object unproxied
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

    // for compatibility
    var ProxyPrototype = Proxy.prototype;
    ProxyPrototype.attach = ProxyPrototype.attachDrag;
    ProxyPrototype.unAttach = ProxyPrototype.detachDrag;

    return Proxy;
}, {
    requires:['node', 'base']
});