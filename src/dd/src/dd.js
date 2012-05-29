/**
 * @fileOverview dd support for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("dd", function (S, DDM, Draggable, Droppable, Proxy, Constrain, Delegate, DroppableDelegate, Scroll) {
    /**
     * @name DD
     * @namespace Provide the ability to make node draggable and droppable.
     */
    var DD;
    DD = {
        Draggable:Draggable,
        Droppable:Droppable,
        DDM:DDM,
        "Constrain":Constrain,
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
        "dd/constrain",
        "dd/draggable-delegate",
        "dd/droppable-delegate",
        "dd/scroll"]
});