KISSY.add("overlay", function(S, O, OR, D, DR, P) {
    O.Render = OR;
    D.Render = DR;
    O.Dialog = D;
    S.Overlay = O;
    S.Dialog = D;
    O.Popup = S.Popup = P;

    return O;
}, {
    requires:["overlay/overlay","overlay/overlayrender","overlay/dialog","overlay/dialogrender", "overlay/popup"]
});