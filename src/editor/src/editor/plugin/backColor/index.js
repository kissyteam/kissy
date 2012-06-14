/**
 * backColor button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/backColor/index", function (S, Editor, Button, cmd) {

    function backColor() {
    }

    S.augment(backColor, {
        renderUI:function (editor) {
            cmd.init(editor);
            editor.addButton("backColor", {
                cmdType:'backColor',
                tooltip:"背景颜色"
            }, Button);
        }
    });

    return backColor;

}, {
    requires:['editor', '../color/btn', './cmd']
});