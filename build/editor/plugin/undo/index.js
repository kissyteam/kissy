/*
Copyright 2013, KISSY UI Library v1.32
MIT Licensed
build time: Sep 4 17:12
*/
/**
 * undo button
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/undo/index", function (S, Editor, Btn, cmd) {

    function undo() {
    }


    S.augment(undo, {
        pluginRenderUI:function (editor) {
            cmd.init(editor);

            editor.addButton("undo", {
                mode:Editor.WYSIWYG_MODE,
                tooltip:"撤销",
                editor:editor
            }, Btn.UndoBtn);

            editor.addButton("redo", {
                mode:Editor.WYSIWYG_MODE,
                tooltip:"重做",
                editor:editor
            }, Btn.RedoBtn);
        }
    });

    return undo;
}, {
    requires:['editor', './btn', './cmd']
});
