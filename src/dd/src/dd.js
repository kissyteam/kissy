/**
 * @ignore
 * @fileOverview dd support for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add('dd', function (S, DDM, Draggable, Droppable, Proxy, Constrain, Delegate, DroppableDelegate, Scroll) {

    var DD;
    DD = {
        Draggable: Draggable,
        Droppable: Droppable,
        DDM: DDM,
        'Constrain': Constrain,
        Proxy: Proxy,
        DraggableDelegate: Delegate,
        DroppableDelegate: DroppableDelegate,
        Scroll: Scroll
    };

    KISSY.DD = DD;

    return DD;
}, {
    requires: ['dd/ddm',
        'dd/draggable',
        'dd/droppable',
        'dd/proxy',
        'dd/constrain',
        'dd/draggable-delegate',
        'dd/droppable-delegate',
        'dd/scroll']
});