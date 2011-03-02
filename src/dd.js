KISSY.add("dd", function(S, Draggable) {
    var dd = {
        Draggable:Draggable
    };

    S.mix(S, dd);

    return dd;
}, {
    requires:["dd/draggable"]
});