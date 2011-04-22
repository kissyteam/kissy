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
                if (v) {
                    var n = Node.one(v);
                    n.addClass(DDM.get("prefixCls") + "drop");
                    return n;
                }
            }
        }

    };

    S.extend(Droppable, Base, {
        /**
         * 用于被 droppable-delegate override
         * @param {KISSY.EventObject} ev
         */
        getNodeFromTarget:function(ev) {
            return this.get("node");
        },
        _init:function() {
            DDM._regDrop(this);
        },
        _handleOut:function() {
            var activeDrag = DDM.get("activeDrag");

            this.get("node").removeClass(DDM.get("prefixCls") + "drop-over");
            var ret = {
                drop:this,
                drag:activeDrag
            };
            this.fire("dropexit", ret);
            DDM.fire("dropexit", ret);
            activeDrag.get("node").removeClass(DDM.get("prefixCls") + "drag-over");
            activeDrag.fire("dragexit", ret);
            DDM.fire("dragexit", ret);
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