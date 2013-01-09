/**
 * @ignore
 * uibase
 * @author yiminghe@gmail.com
 */
KISSY.add("component/extension", function (S, Align, ContentBox, ContentBoxRender, Position, PositionRender, ShimRender) {
    Position.Render = PositionRender;
    ContentBox.Render = ContentBoxRender;
    return {
        Align: Align,
        ContentBox: ContentBox,
        Position: Position,
        Shim: {
            Render: ShimRender
        }
    };
}, {
    requires: [
        "./extension/align",
        "./extension/content-box",
        "./extension/content-box-render",
        "./extension/position",
        "./extension/position-render",
        "./extension/shim-render"
    ]
});