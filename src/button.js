KISSY.add("button", function(S, Button, Render) {
    Button.Render = Render;
    return Button;
}, {
    requires:['button/base','button/customrender']
});