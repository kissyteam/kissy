/**
 * model and control for overlay
 * @author:yiminghe@gmail.com
 */
KISSY.add("overlay/overlay", function(S, UIBase, Component, OverlayRender) {
    function require(s) {
        return S.require("uibase/" + s);
    }

    return UIBase.create(Component.ModelControl, [
        require("box"),
        require("contentbox"),
        require("position"),
        require("loading"),
        require("align"),
        require("resize"),
        require("mask")], {
    }, {
        ATTRS:{
            view:{
                valueFn:function() {
                    return new OverlayRender();
                }
            }
        }
    });
}, {
    requires:['uibase','component','./overlayrender']
});