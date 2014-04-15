/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 15 17:50
*/
/*
combined files : 

editor/plugin/undo

*/
/**
 * @ignore
 * undo button
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/undo',['editor', './undo/btn', './undo/cmd', './button'], function (S, require) {
    var Editor = require('editor');
    var Btn = require('./undo/btn');
    var cmd = require('./undo/cmd');
    require('./button');
    function undo() {
    }

    S.augment(undo, {
        pluginRenderUI: function (editor) {
            // 先 button 绑定事件
            editor.addButton('undo', {
                mode: Editor.Mode.WYSIWYG_MODE,
                tooltip: '撤销',
                editor: editor
            }, Btn.UndoBtn);

            editor.addButton('redo', {
                mode: Editor.Mode.WYSIWYG_MODE,
                tooltip: '重做',
                editor: editor
            }, Btn.RedoBtn);
            cmd.init(editor);
        }
    });

    return undo;
});
