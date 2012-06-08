/**
 * foreColor button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/foreColor/index", function (S, Editor, Button, cmd) {

    return {
        init:function (editor) {
            cmd.init(editor);
            editor.addButton("foreColor",{
                cmdType:'foreColor',
                tooltip:"文本颜色"
            }, Button);
        }
    };
}, {
    requires:['editor', '../color/btn', './cmd']
});