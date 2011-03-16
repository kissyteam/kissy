KISSY.add("dd", function(S, DDM, Draggable, Droppable) {
    var dd = {
        Draggable:Draggable,
        Droppable:Droppable,
        DDM:DDM
    };

    S.mix(S, dd);

    return dd;
}, {
    requires:["dd/ddm","dd/draggable","dd/droppable"]
});