/**
 * @fileOverview KISSY Overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/overlay-render", function (S, UA, Component) {

    function require(s) {
        return S.require("component/uibase/" + s);
    }

    return Component.Render.extend([
        require("content-box-render"),
        require("position-render"),
        require("loading-render"),
        UA['ie'] === 6 ? require("shim-render") : null,
        require("close-render"),
        require("mask-render")
    ]);
}, {
    requires:["ua", "component"]
});

/**
 * 2010-11-09 2010-11-10 yiminghe@gmail.com重构，attribute-base-uibase-Overlay ，采用 UIBase.create
 */
