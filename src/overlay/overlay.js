/**
 * model and control for overlay
 * @author:yiminghe@gmail.com
 */
KISSY.add("overlay/overlay", function(S, UIBase, Component, OverlayRender) {
    function require(s) {
        return S.require("uibase/" + s);
    }

    var Overlay= UIBase.create(Component.ModelControl, [
        require("box"),
        require("contentbox"),
        require("position"),
        require("loading"),
        require("align"),
        require("resize"),
        require("mask")]);

    Overlay.DefaultRender=OverlayRender;

    return Overlay;
}, {
    requires:['uibase','component','./overlayrender']
});