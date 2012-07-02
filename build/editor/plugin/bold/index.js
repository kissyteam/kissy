/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Jul 2 11:44
*/
/**
 * bold command.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/bold/index", function (S, Editor, ui, cmd) {

    function bold() {
    }

    S.augment(bold, {
        renderUI:function (editor) {
            cmd.init(editor);
            editor.addButton("bold", {
                cmdType:'bold',
                tooltip:"粗体 "
            }, ui.Button);
        }
    });

    return bold;
}, {
    requires:['editor', '../font/ui', './cmd']
});
