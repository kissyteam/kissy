KISSY.add("overlay", function(S, O, OR, D, DR) {
    O.Render = OR;
    D.Render = DR;
    O.Dialog = D;
    return O;
}, {
    requires:["overlay/overlay","overlay/overlayrender","overlay/dialog","overlay/dialogrender"]
});