/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Aug 7 22:26
*/
/**
 * undo button
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/undo/index", function (S, Editor, Btn, cmd) {

    function undo() {
    }


    S.augment(undo, {
        renderUI:function (editor) {
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
