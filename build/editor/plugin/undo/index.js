/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 5 21:37
*/
KISSY.add("editor/plugin/undo/index", function (S, Editor, Btn, cmd) {
    return {
        init:function (editor) {
            cmd.init(editor);
            editor.addButton({
                mode:Editor.WYSIWYG_MODE,
                title:"撤销",
                editor:editor,
                contentCls:"ks-editor-toolbar-undo"
            }, undefined, Btn.UndoBtn);
            editor.addButton({
                mode:Editor.WYSIWYG_MODE,
                title:"重做",
                editor:editor,
                contentCls:"ks-editor-toolbar-redo"
            }, undefined, Btn.RedoBtn);
        }
    };
}, {
    requires:['editor', './btn', './cmd']
});
