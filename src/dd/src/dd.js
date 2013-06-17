/**
 * @ignore
 * dd support for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add('dd', function (S, DDM, Draggable, DraggableDelegate, Droppable, DroppableDelegate) {

    var DD = {
        Draggable: Draggable,
        DDM: DDM,
        Droppable: Droppable,
        DroppableDelegate: DroppableDelegate,
        DraggableDelegate: DraggableDelegate
    };

    KISSY.DD = DD;

    return DD;
}, {
    requires: [
        'dd/ddm',
        'dd/draggable',
        'dd/draggable-delegate',
        'dd/droppable',
        'dd/droppable-delegate'
    ]
});