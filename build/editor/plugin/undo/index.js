/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 28 19:44
*/
KISSY.add("editor/plugin/undo/index", function (S, Editor, Btn, cmd) {
    return {
        init:function (editor) {
            cmd.init(editor);
            editor.addButton({
                mode:Editor.WYSIWYG_MODE,
                title:"撤销",
                editor:editor,
                contentCls:"ke-toolbar-undo"
            }, undefined, Btn.UndoBtn);
            editor.addButton({
                mode:Editor.WYSIWYG_MODE,
                title:"重做",
                editor:editor,
                contentCls:"ke-toolbar-redo"
            }, undefined, Btn.RedoBtn);
        }
    };
}, {
    requires:['editor', './btn', './cmd']
});
