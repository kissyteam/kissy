/**
 * droppable for kissy
 * @author:yiminghe@gmail.com
 */
KISSY.add("dd/droppable", function(S, Node, Base, DDM) {

    function Droppable() {
        Droppable.superclass.constructor.apply(this, arguments);
        this._init();
    }

    Droppable.ATTRS = {
        /**
         * 放节点
         */
        node: {
            setter:function(v) {
                var n = Node.one(v);
                n.addClass(DDM.get("prefixCls") + "drop");
                return n;
            }
        }

    };

    S.extend(Droppable, Base, {
        _init:function() {
            DDM._regDrop(this);
        },
        _handleOut:function() {
            var activeDrag = DDM.get("activeDrag");

            this.get("node").removeClass(DDM.get("prefixCls") + "drop-over");
            this.fire("dropexit", {
                drop:this,
                drag:activeDrag
            });
            DDM.fire("dropexit", {
                drop:this,
                drag:activeDrag
            });
            activeDrag.get("node").removeClass(DDM.get("prefixCls") + "drag-over");
            activeDrag.fire("dragexit", {
                drop:this,
                drag:activeDrag
            });
            DDM.fire("dragexit", {
                drop:this,
                drag:activeDrag
            });
        },
        _handleOver:function() {
            var oldDrop = DDM.get("activeDrop");
            DDM.set("activeDrop", this);
            var activeDrag = DDM.get("activeDrag");
            this.get("node").addClass(DDM.get("prefixCls") + "drop-over");
            var evt = {
                drag:activeDrag,
                drop:this
            };
            if (this != oldDrop) {
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
        },
        destroy:function() {
            DDM._unregDrop(this);
        }
    });

    return Droppable;

}, { requires:["node","base","dd/ddm"] });