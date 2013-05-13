/**
 * @ignore
 * uibase
 * @author yiminghe@gmail.com
 */
KISSY.add("component/extension", function (S, Align, Position, PositionRender, ShimRender) {
    Position.Render = PositionRender;
    return {
        Align: Align,
        Position: Position,
        Shim: {
            Render: ShimRender
        }
    };
}, {
    requires: [
        "./extension/align",
        "./extension/position",
        "./extension/position-render",
        "./extension/shim-render"
    ]
});