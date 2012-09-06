/**
 * @fileOverview KISSY Overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/overlay-render", function (S, UA, Component) {

    function require(s) {
        return S.require("component/uibase/" + s);
    }

    return Component.Render.extend([
        require("contentboxrender"),
        require("positionrender"),
        require("loadingrender"),
        UA['ie'] === 6 ? require("shimrender") : null,
        require("closerender"),
        require("maskrender")
    ]);
}, {
    requires:["ua", "component"]
});

/**
 * 2010-11-09 2010-11-10 yiminghe@gmail.com重构，attribute-base-uibase-Overlay ，采用 UIBase.create
 */
