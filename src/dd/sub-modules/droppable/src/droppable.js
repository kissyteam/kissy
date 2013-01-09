/**
 * @ignore
 *  droppable for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/droppable', function (S, DD, Droppable, DroppableDelegate) {
    Droppable.Delegate = DroppableDelegate;
    DD.Droppable = Droppable;
    DD.DroppableDelegate = DroppableDelegate;
    return Droppable;
}, { requires: ['dd/base', './droppable/base', './droppable/delegate'] });