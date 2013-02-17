/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
/**
 * italic button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/italic/index", function (S, Editor, ui, cmd) {

    function italic() {

    }

    S.augment(italic, {
        pluginRenderUI:function (editor) {
            cmd.init(editor);

            editor.addButton("italic", {
                cmdType:'italic',
                tooltip:"斜体 "
            }, ui.Button);

            editor.docReady(function () {
                editor.get("document").on("keydown", function (e) {
                    if (e.ctrlKey && e.keyCode == S.Node.KeyCodes.I) {
                        editor.execCommand("italic");
                        e.preventDefault();
                    }
                });
            });
        }
    });

    return italic;
}, {
    requires:['editor', '../font/ui', './cmd']
});
