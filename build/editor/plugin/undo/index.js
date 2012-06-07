/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 15:13
*/
KISSY.add("editor/plugin/undo/index", function (S, Editor, Btn, cmd) {
    return {
        init:function (editor) {
            cmd.init(editor);

            editor.addButton("undo",{
                mode:Editor.WYSIWYG_MODE,
                tooltip:"撤销",
                editor:editor
            }, undefined, Btn.UndoBtn);

            editor.addButton("redo",{
                mode:Editor.WYSIWYG_MODE,
                tooltip:"重做",
                editor:editor
            }, undefined, Btn.RedoBtn);
        }
    };
}, {
    requires:['editor', './btn', './cmd']
});
