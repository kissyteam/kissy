/**
 * @ignore
 * uibase
 * @author yiminghe@gmail.com
 */
KISSY.add("component/extension", function (S, Align, ContentBoxRender, Position, PositionRender, ShimRender) {
    Position.Render = PositionRender;
    return {
        Align: Align,
        ContentBox: {
            Render: ContentBoxRender
        },
        Position: Position,
        Shim: {
            Render: ShimRender
        }
    };
}, {
    requires: [
        "./extension/align",
        "./extension/content-box-render",
        "./extension/position",
        "./extension/position-render",
        "./extension/shim-render"
    ]
});