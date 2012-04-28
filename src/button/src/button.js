/**
 * @fileOverview simulated button for kissy , inspired by goog button
 * @author yiminghe@gmail.com
 */
KISSY.add("button", function (S, Button, Render, Split, Toggle) {
    Button.Render = Render;
    Button.Split = Split;
    Button.Toggle = Toggle;
    return Button;
}, {
    requires:[
        'button/base',
        'button/buttonRender',
        'button/split',
        'button/toggle'
    ]
});