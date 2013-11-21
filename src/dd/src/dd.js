/**
 * @ignore
 * dd support for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S,require) {
    var DDM = require('dd/ddm'),
        Draggable = require('dd/draggable'),
        DraggableDelegate = require('dd/draggable-delegate'),
        DroppableDelegate = require('dd/droppable-delegate'),
        Droppable = require('dd/droppable');
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