/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:20
*/
/**
 * undo button
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/undo", function (S, Editor, Btn, cmd) {

    function undo() {
    }

    S.augment(undo, {
        pluginRenderUI: function (editor) {
            // 先 button 绑定事件
            editor.addButton("undo", {
                mode: Editor.Mode.WYSIWYG_MODE,
                tooltip: "撤销",
                editor: editor
            }, Btn.UndoBtn);

            editor.addButton("redo", {
                mode: Editor.Mode.WYSIWYG_MODE,
                tooltip: "重做",
                editor: editor
            }, Btn.RedoBtn);
            cmd.init(editor);
        }
    });

    return undo;

}, {
    requires: ['editor', './undo/btn', './undo/cmd']
});
