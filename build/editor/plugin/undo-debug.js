/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:49
*/
/*
combined modules:
editor/plugin/undo
*/
KISSY.add('editor/plugin/undo', [
    'editor',
    './undo/btn',
    './undo/cmd',
    './button'
], function (S, require, exports, module) {
    /**
 * @ignore
 * undo button
 * @author yiminghe@gmail.com
 */
    var Editor = require('editor');
    var Btn = require('./undo/btn');
    var cmd = require('./undo/cmd');
    require('./button');
    function Undo() {
    }
    Undo.prototype = {
        pluginRenderUI: function (editor) {
            // 先 button 绑定事件
            editor.addButton('undo', {
                mode: Editor.Mode.WYSIWYG_MODE,
                tooltip: '\u64A4\u9500',
                editor: editor
            }, Btn.UndoBtn);
            editor.addButton('redo', {
                mode: Editor.Mode.WYSIWYG_MODE,
                tooltip: '\u91CD\u505A',
                editor: editor
            }, Btn.RedoBtn);
            cmd.init(editor);
        }
    };
    module.exports = Undo;
});



