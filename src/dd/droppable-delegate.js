/**
 * only one droppable instance for multiple droppable nodes
 * @author yiminghe@gmail.com
 */
KISSY.add("dd/droppable-delegate", function(S, DDM, Droppable, DOM, Node) {
    function DroppableDelegate() {
        DroppableDelegate.superclass.constructor.apply(this, arguments);
    }

    S.extend(DroppableDelegate, Droppable, {

            /**
             * 根据鼠标位置得到真正的可放目标，暂时不考虑 mode，只考虑鼠标
             * @param ev
             */
            getNodeFromTarget:function(ev, dragNode, proxyNode) {
                var pointer = {
                    left:ev.pageX,
                    top:ev.pageY
                },
                    self = this,
                    container = self.get("container"),
                    selector = self.get("selector"),
                    allNodes = container.all(selector),
                    ret = 0;

                allNodes.each(function(n) {
                    var domNode = n[0];
                    // 排除当前拖放的元素以及代理节点
                    if (domNode == proxyNode || domNode == dragNode) {
                        return;
                    }
                    if (DDM.inRegion(DDM.region(n), pointer)) {
                        self.set("lastNode", self.get("node"));
                        self.set("node", ret = n);
                        return false;
                    }
                });
                return ret;
            },

            _handleOut:function() {
                var self = this;
                DroppableDelegate.superclass._handleOut.apply(self, arguments);
                self.set("node", 0);
                self.set("lastNode", 0);
            },

            _handleOver:function(ev) {
                var self = this,
                    activeDrag = DDM.get("activeDrag"),
                    oldDrop = DDM.get("activeDrop"),
                    evt = S.mix({
                        drag:activeDrag,
                        drop:self
                    }, ev),
                    node = self.get("node"),
                    lastNode = self.get("lastNode");

                DDM.set("activeDrop", self);
                node.addClass(DDM.get("prefixCls") + "drop-over");

                if (self != oldDrop
                    || !lastNode
                    || (lastNode && lastNode[0] !== node[0])
                    ) {
                    /**
                     * 两个可 drop 节点相邻，先通知上次的离开
                     */
                    if (lastNode) {
                        self.set("node", lastNode);
                        DroppableDelegate.superclass._handleOut.apply(self, arguments);
                    }
                    /**
                     * 再通知这次的进入
                     */
                    self.set("node", node);
                    activeDrag.get("node").addClass(DDM.get("prefixCls") + "drag-over");
                    //第一次先触发 dropenter,dragenter
                    activeDrag.fire("dragenter", evt);
                    self.fire("dropenter", evt);
                    DDM.fire("dragenter", evt);
                    DDM.fire("dropenter", evt);
                } else {
                    activeDrag.fire("dragover", evt);
                    this.fire("dropover", evt);
                    DDM.fire("dragover", evt);
                    DDM.fire("dropover", evt);
                }
            }
        },
        {
            ATTRS:{

                /**
                 * 继承自 Drappable ，当前正在委托的放节点目标
                 * note:{}
                 */

                /**
                 * 上一个成为放目标的委托节点
                 */
                lastNode:{
                },

                /**
                 * 放目标节点选择器
                 */
                selector:{
                },

                /**
                 * 放目标所在区域
                 */
                container:{
                    setter:function(v) {
                        return Node.one(v);
                    }
                }
            }
        });

    return DroppableDelegate;
}, {
    requires:['./ddm','./droppable','dom','node']
});