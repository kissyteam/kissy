/**
 * @ignore
 * @fileOverview uibase
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase", function (S, UIBase, Align, Box, BoxRender, Close, CloseRender, ContentBox, ContentBoxRender, Drag, Loading, LoadingRender, Mask, MaskRender, Position, PositionRender, ShimRender, Resize, StdMod, StdModRender) {
    Close.Render = CloseRender;
    Loading.Render = LoadingRender;
    Mask.Render = MaskRender;
    Position.Render = PositionRender;
    StdMod.Render = StdModRender;
    Box.Render = BoxRender;
    ContentBox.Render = ContentBoxRender;
    S.mix(UIBase, {
        Align:Align,
        Box:Box,
        Close:Close,
        ContentBox:ContentBox,
        Drag:Drag,
        Loading:Loading,
        Mask:Mask,
        Position:Position,
        Shim:{
            Render:ShimRender
        },
        Resize:Resize,
        StdMod:StdMod
    });
    return UIBase;
}, {
    requires:["./uibase/base",
        "./uibase/align",
        "./uibase/box",
        "./uibase/box-render",
        "./uibase/close",
        "./uibase/close-render",
        "./uibase/content-box",
        "./uibase/content-box-render",
        "./uibase/drag",
        "./uibase/loading",
        "./uibase/loading-render",
        "./uibase/mask",
        "./uibase/mask-render",
        "./uibase/position",
        "./uibase/position-render",
        "./uibase/shim-render",
        "./uibase/resize",
        "./uibase/stdmod",
        "./uibase/stdmod-render"]
});