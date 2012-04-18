KISSY.add("editor/plugin/undo/index", function (S, KE, Btn, cmd) {
    return {
        init:function (editor) {
            cmd.init(editor);
            editor.addButton({
                mode:KE.WYSIWYG_MODE,
                title:"撤销",
                editor:editor,
                contentCls:"ke-toolbar-undo"
            }, undefined, Btn.UndoBtn);
            editor.addButton({
                mode:KE.WYSIWYG_MODE,
                title:"重做",
                editor:editor,
                contentCls:"ke-toolbar-redo"
            }, undefined, Btn.RedoBtn);
        }
    };
}, {
    requires:['editor', './btn', './cmd']
});