/**
 * @ignore
 *  simulated button for kissy , inspired by goog button
 * @author yiminghe@gmail.com
 */
KISSY.add("button", function (S, Button, Render) {
    Button.Render = Render;
    return Button;
}, {
    requires:[
        'button/base',
        'button/buttonRender'
    ]
});