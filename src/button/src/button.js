/**
 * @fileOverview simulated button for kissy , inspired by goog button
 * @author yiminghe@gmail.com
 */
KISSY.add("button", function(S, Button, Render, Split) {
    Button.Render = Render;
    Button.Split = Split;
    return Button;
}, {
    requires:['button/base','button/customrender','button/split']
});