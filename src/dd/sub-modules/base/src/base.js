/**
 * @ignore
 * dd support for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/base', function (S, DDM, Draggable, DraggableDelegate) {

    var DD = {
        Draggable: Draggable,
        DDM: DDM,
        DraggableDelegate: DraggableDelegate
    };

    KISSY.DD = DD;

    return DD;
}, {
    requires: [
        './base/ddm',
        './base/draggable',
        './base/draggable-delegate'
    ]
});