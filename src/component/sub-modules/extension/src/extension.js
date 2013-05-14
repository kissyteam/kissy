/**
 * @ignore
 * uibase
 * @author yiminghe@gmail.com
 */
KISSY.add("component/extension", function (S, Align, Position,
                                           PositionRender, ShimRender,
                                           DelegateChildren, DecorateChildren,
                                           DecorateChild
    ) {
    Position.Render = PositionRender;
    return {
        Align: Align,
        Position: Position,
        Shim: {
            Render: ShimRender
        },
        'DelegateChildren': DelegateChildren,
        'DecorateChild': DecorateChild,
        'DecorateChildren': DecorateChildren
    };
}, {
    requires: [
        "./extension/align",
        "./extension/position",
        "./extension/position-render",
        "./extension/shim-render",
        "./extension/delegate-children",
        "./extension/decorate-children",
        "./extension/decorate-child"
    ]
});