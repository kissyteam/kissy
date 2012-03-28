/**
 * @fileOverview only one droppable instance for multiple droppable nodes
 * @author yiminghe@gmail.com
 */
KISSY.add("dd/droppable-delegate", function (S, DDM, Droppable, DOM, Node) {


    function dragStart() {
        var self = this,
            container = self.get("container"),
            selector = self.get("selector");
        self.__allNodes = container.all(selector);
    }

    /**
     * make multiple nodes droppable under a container using only one droppable instance
     * @memberOf DD
     * @class
     */
    function DroppableDelegate() {
        var self = this;
        DroppableDelegate.superclass.constructor.apply(self, arguments);
        // 提高性能，拖放开始时缓存代理节点
        DDM.on("dragstart", dragStart, self);
    }

    S.extend(DroppableDelegate, Droppable, {

            /**
             * 根据鼠标位置得到真正的可放目标，暂时不考虑 mode，只考虑鼠标
             * @param ev
             * @private
             * @override
             */
            getNodeFromTarget:function (ev, dragNode, proxyNode) {
                var pointer = {
                    left:ev.pageX,
                    top:ev.pageY
                },
                    self = this,
                    allNodes = self.__allNodes,
                    ret = 0,
                    vArea = Number.MAX_VALUE;


                if (allNodes) {
                    allNodes.each(function (n) {
                        var domNode = n[0];
                        // 排除当前拖放的元素以及代理节点
                        if (domNode === proxyNode || domNode === dragNode) {
                            return;
                        }
                        if (DDM.inRegion(DDM.region(n), pointer)) {
                            // 找到面积最小的那个
                            var a = DDM.area(DDM.region(n));
                            if (a < vArea) {
                                vArea = a;
                                ret = n;
                            }
                        }
                    });
                }

                if (ret) {
                    self.__set("lastNode", self.get("node"));
                    self.__set("node", ret);
                }

                return ret;
            },

            _handleOut:function () {
                var self = this;
                DroppableDelegate.superclass._handleOut.apply(self, arguments);
                self.__set("node", 0);
                self.__set("lastNode", 0);
            },

            _handleOver:function (ev) {
                var self = this,
                    node = self.get("node"),
                    superOut = DroppableDelegate.superclass._handleOut,
                    superOver = DroppableDelegate.superclass._handleOver,
                    superEnter = DroppableDelegate.superclass._handleEnter,
                    lastNode = self.get("lastNode");

                if (lastNode[0] !== node[0]) {
                    /**
                     * 同一个 drop 对象内委托的两个可 drop 节点相邻，先通知上次的离开
                     */
                    self.__set("node", lastNode);
                    superOut.apply(self, arguments);
                    /**
                     * 再通知这次的进入
                     */
                    self.__set("node", node);
                    superEnter.call(self, ev);
                } else {
                    superOver.call(self, ev);
                }
            },

            _end:function () {
                var self = this;
                DroppableDelegate.superclass._end.apply(self, arguments);
                self.__set("node", 0);
            }
        },
        {
            ATTRS:/**
             * @lends DD.DroppableDelegate#
             */
            {


                // 继承自 Drappable ，当前正在委托的放节点目标


                /**
                 * 上一个成为放目标的委托节点
                 * @private
                 */
                lastNode:{
                },

                /**
                 * a selector query to get the children of container to make droppable elements from.
                 * usually as for tag.cls.
                 * @type String
                 */
                selector:{
                },

                /**
                 * a selector query to get the container to listen for mousedown events on.
                 * All "draggable selector" should be a child of this container
                 * @type {String|HTMLElement}
                 */
                container:{
                    setter:function (v) {
                        return Node.one(v);
                    }
                }
            }
        });

    return DroppableDelegate;
}, {
    requires:['./ddm', './droppable', 'dom', 'node']
});