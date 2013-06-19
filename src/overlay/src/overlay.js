/**
 * @ignore
 * overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay", function (S, O, D, P) {
    O.Dialog = D;
    S.Dialog = D;
    O.Popup = P;
    S.Overlay = O;
    return O;
}, {
    requires:[
        "overlay/base",
        "overlay/dialog",
        "overlay/popup"
    ]
});