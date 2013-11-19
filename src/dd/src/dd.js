/**
 * @ignore
 * dd support for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add(function () {
    var module = this;
    var DDM = module.require('dd/ddm'),
        Draggable = module.require('dd/draggable'),
        DraggableDelegate = module.require('dd/draggable-delegate'),
        DroppableDelegate = module.require('dd/droppable-delegate'),
        Droppable = module.require('dd/droppable');
    var DD = {
        Draggable: Draggable,
        DDM: DDM,
        Droppable: Droppable,
        DroppableDelegate: DroppableDelegate,
        DraggableDelegate: DraggableDelegate
    };

    KISSY.DD = DD;

    return DD;
});