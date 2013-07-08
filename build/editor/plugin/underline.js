﻿/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:55
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/underline
*/

/**
 * underline button
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/underline", function (S, Editor, ui, cmd) {

    function Underline() {
    }

    S.augment(Underline, {
        pluginRenderUI:function (editor) {
            cmd.init(editor);

            editor.addButton("underline", {
                cmdType:"underline",
                tooltip:"下划线 "
            }, ui.Button);

            editor.docReady(function () {
                editor.get("document").on("keydown", function (e) {
                    if (e.ctrlKey && e.keyCode == S.Node.KeyCode.U) {
                        editor.execCommand("underline");
                        e.preventDefault();
                    }
                });
            });
        }
    });

    return Underline;
}, {
    requires:['editor', './font/ui', './underline/cmd']
});

