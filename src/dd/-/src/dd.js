/**
 * @ignore
 * dd support for kissy
 * @author yiminghe@gmail.com
 */

var DDM = require('dd/ddm'),
    Draggable = require('dd/draggable'),
    DraggableDelegate = require('dd/draggable-delegate'),
    DroppableDelegate = require('dd/droppable-delegate'),
    Droppable = require('dd/droppable');

module.exports = {
    Draggable: Draggable,
    DDM: DDM,
    Droppable: Droppable,
    DroppableDelegate: DroppableDelegate,
    DraggableDelegate: DraggableDelegate
};