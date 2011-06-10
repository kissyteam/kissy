/**
 * only one droppable instance for multiple droppable nodes
 * @author:yiminghe@gmail.com
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
                };

                var container = this.get("container"),
                    selector = this.get("selector");

                var allNodes = container.all(selector);
                //S.log("start ***********************");
                for (var i = 0; i < allNodes.length; i++) {
                    var domNode = allNodes[i],
                        n = new Node(domNode);
                    // 排除当前拖放的元素以及代理节点
                    if (domNode == proxyNode || domNode == dragNode) {
                        continue;
                    }
                    //S.log(n.attr("class"));
                    if (DDM.inRegion(DDM.region(n), pointer)) {
                        this.set("lastNode", this.get("node"));
                        this.set("node", n);
                        //S.log("end ***********************");
                        return n;
                    }
                }
                //S.log("end ***********************");
                return null;
            },

            _handleOut:function() {
                DroppableDelegate.superclass._handleOut.call(this);
                this.set("node", null);
                this.set("lastNode", null);
            },

            _handleOver:function(ev) {
                var oldDrop = DDM.get("activeDrop");
                DDM.set("activeDrop", this);
                var activeDrag = DDM.get("activeDrag");
                this.get("node").addClass(DDM.get("prefixCls") + "drop-over");
                var evt = S.mix({
                        drag:activeDrag,
                        drop:this
                    }, ev);
                var node = this.get("node"),
                    lastNode = this.get("lastNode");

                if (this != oldDrop
                    || !lastNode
                    || (lastNode && lastNode[0] !== node[0])
                    ) {
                    /**
                     * 两个可 drop 节点相邻，先通知上次的离开
                     */
                    if (lastNode) {
                        this.set("node", lastNode);
                        DroppableDelegate.superclass._handleOut.call(this);
                    }
                    /**
                     * 再通知这次的进入
                     */
                    this.set("node", node);
                    activeDrag.get("node").addClass(DDM.get("prefixCls") + "drag-over");
                    //第一次先触发 dropenter,dragenter
                    activeDrag.fire("dragenter", evt);
                    this.fire("dropenter", evt);
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
                 * 上一个成为放目标的节点
                 */
                lastNode:{
                }
                ,
                /**
                 * 放目标节点选择器
                 */
                selector:{
                }
                ,
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