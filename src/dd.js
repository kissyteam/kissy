/**
 * @fileOverview dd support for kissy
 * @author  承玉<yiminghe@gmail.com>
 */
KISSY.add("dd", function (S, DDM, Draggable, Droppable, Proxy, Delegate, DroppableDelegate, Scroll) {

    /**
     * @exports Draggable as DD.Draggable
     */

    /**
     * @exports Droppable as DD.Droppable
     */

    /**
     * @name DD
     */
    return {
        Draggable:Draggable,
        Droppable:Droppable,
        DDM:DDM,
        Proxy:Proxy,
        DraggableDelegate:Delegate,
        DroppableDelegate:DroppableDelegate,
        Scroll:Scroll
    };
}, {
    requires:["dd/ddm",
        "dd/draggable",
        "dd/droppable",
        "dd/proxy",
        "dd/draggable-delegate",
        "dd/droppable-delegate",
        "dd/scroll"]
});