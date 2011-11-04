/**
 * droppable for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("dd/droppable", function(S, Node, Base, DDM) {

    function Droppable() {
        var self = this;
        Droppable.superclass.constructor.apply(self, arguments);
        self._init();
    }

    Droppable.ATTRS = {
        /**
         * 放节点
         */
        node: {
            setter:function(v) {
                if (v) {
                    return Node.one(v).addClass(DDM.get("prefixCls") + "drop");
                }
            }
        }

    };

    S.extend(Droppable, Base, {
        /**
         * 用于被 droppable-delegate override
         */
        getNodeFromTarget:function(ev, dragNode, proxyNode) {
            var node = this.get("node"),
                domNode = node[0];
            // 排除当前拖放和代理节点
            return domNode == dragNode || domNode == proxyNode
                ? null : node;
        },
        _init:function() {
            DDM._regDrop(this);
        },
        _handleOut:function() {
            var self = this,
                activeDrag = DDM.get("activeDrag"),
                ret = {
                    drop:self,
                    drag:activeDrag
                };
            self.get("node").removeClass(DDM.get("prefixCls") + "drop-over");
            self.fire("dropexit", ret);
            DDM.fire("dropexit", ret);
            activeDrag.get("node").removeClass(DDM.get("prefixCls") + "drag-over");
            activeDrag.fire("dragexit", ret);
            DDM.fire("dragexit", ret);
        },
        _handleOver:function(ev) {
            var self = this,
                oldDrop = DDM.get("activeDrop");
            DDM.set("activeDrop", this);
            var activeDrag = DDM.get("activeDrag");
            self.get("node").addClass(DDM.get("prefixCls") + "drop-over");
            var evt = S.mix({
                drag:activeDrag,
                drop:this
            }, ev);
            if (self != oldDrop) {
                activeDrag.get("node").addClass(DDM.get("prefixCls") + "drag-over");
                //第一次先触发 dropenter,dragenter
                activeDrag.fire("dragenter", evt);
                this.fire("dropenter", evt);
                DDM.fire("dragenter", evt);
                DDM.fire("dropenter", evt);
            } else {
                activeDrag.fire("dragover", evt);
                self.fire("dropover", evt);
                DDM.fire("dragover", evt);
                DDM.fire("dropover", evt);
            }
        },
        destroy:function() {
            DDM._unregDrop(this);
        }
    });

    return Droppable;

}, { requires:["node","base","./ddm"] });