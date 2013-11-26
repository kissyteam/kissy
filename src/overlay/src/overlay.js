/**
 * @ignore
 * overlay
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var O = require('overlay/control');
    var D = require('overlay/dialog');
    var P = require('overlay/popup');

    O.Dialog = D;
    S.Dialog = D;
    O.Popup = P;
    S.Overlay = O;
    return O;
});