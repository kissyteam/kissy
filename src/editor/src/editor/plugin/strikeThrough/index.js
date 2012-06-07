/**
 * strikeThrough button
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/strikeThrough/index", function (S, Editor, ui,cmd) {
    return {
        init:function (editor) {
            cmd.init(editor);
            editor.addButton("strikeThrough",{
                cmdType:"strikeThrough",
                tooltip:"删除线 "
            }, ui.Button);
        }
    };
}, {
    requires:['editor', '../font/ui','./cmd']
});