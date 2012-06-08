/**
 * underline button
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/underline/index", function (S, Editor, ui, cmd) {
    return {
        init:function (editor) {
            cmd.init(editor);
            editor.addButton("underline",{
                cmdType:"underline",
                tooltip:"下划线 "
            }, ui.Button);
        }
    };
}, {
    requires:['editor', '../font/ui', './cmd']
});