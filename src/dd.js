KISSY.add("dd", function(S, Draggable, Droppable) {
    var dd = {
        Draggable:Draggable,
        Droppable:Droppable
    };

    S.mix(S, dd);

    return dd;
}, {
    requires:["dd/draggable","dd/droppable"]
});