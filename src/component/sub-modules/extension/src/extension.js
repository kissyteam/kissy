/**
 * @ignore
 * uibase
 * @author yiminghe@gmail.com
 */
KISSY.add("component/extension", function (S, Align, ContentRender, Position, PositionRender, ShimRender, DelegateChildren, DecorateChildren, DecorateChild) {
    return {
        Align: Align,
        Position: Position,
        PositionRender: PositionRender,
        ContentRender: ContentRender,
        ShimRender: S.UA === 6 ? ShimRender : null,
        'DelegateChildren': DelegateChildren,
        'DecorateChild': DecorateChild,
        'DecorateChildren': DecorateChildren
    };
}, {
    requires: [
        "./extension/align",
        "./extension/content-render",
        "./extension/position",
        "./extension/position-render",
        "./extension/shim-render",
        "./extension/delegate-children",
        "./extension/decorate-children",
        "./extension/decorate-child"
    ]
});