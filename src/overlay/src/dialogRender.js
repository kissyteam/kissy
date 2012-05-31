/**
 * @fileOverview render for dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/dialogRender", function(S, OverlayRender, AriaRender) {
    function require(s) {
        return S.require("component/uibase/" + s);
    }

    return OverlayRender.extend([
        require("stdmodrender"),
        AriaRender
    ]);
}, {
    requires:['./overlayRender','./ariaRender']
});