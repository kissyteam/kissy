/**
 * @fileOverview render for dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/dialogrender", function(S, Component, OverlayRender, AriaRender) {
    function require(s) {
        return S.require("component/uibase/" + s);
    }

    return Component.define(OverlayRender, [
        require("stdmodrender"),
        AriaRender
    ]);
}, {
    requires:['component','./overlayrender','./ariarender']
});