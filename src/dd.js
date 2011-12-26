/**
 * @fileOverview dd support for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("dd", function (S, DDM, Draggable, Droppable, Proxy, Delegate, DroppableDelegate, Scroll) {
    /**
     * @name DD
     */
    var DD;
    DD = {
        Draggable:Draggable,
        Droppable:Droppable,
        DDM:DDM,
        Proxy:Proxy,
        DraggableDelegate:Delegate,
        DroppableDelegate:DroppableDelegate,
        Scroll:Scroll
    };
    return DD;
}, {
    requires:["dd/ddm",
        "dd/draggable",
        "dd/droppable",
        "dd/proxy",
        "dd/draggable-delegate",
        "dd/droppable-delegate",
        "dd/scroll"]
});