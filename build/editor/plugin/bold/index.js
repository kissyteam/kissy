/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Aug 22 22:19
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

            editor.docReady(function () {
                editor.get("document").on("keydown", function (e) {
                    if (e.ctrlKey && e.keyCode == S.Node.KeyCodes.B) {
                        editor.execCommand("bold");
                        e.preventDefault();
                    }
                });
            });
        }
    });

    return bold;
}, {
    requires:['editor', '../font/ui', './cmd']
});
