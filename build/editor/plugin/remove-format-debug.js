/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:48
*/
/*
combined modules:
editor/plugin/remove-format
*/
KISSY.add('editor/plugin/remove-format', [
    'editor',
    './button',
    './remove-format/cmd'
], function (S, require, exports, module) {
    /**
 * @ignore
 * removeFormat for selection.
 * @author yiminghe@gmail.com
 */
    var Editor = require('editor');
    require('./button');
    var formatCmd = require('./remove-format/cmd');
    function RemoveFormat() {
    }
    RemoveFormat.prototype = {
        pluginRenderUI: function (editor) {
            formatCmd.init(editor);
            editor.addButton('removeFormat', {
                tooltip: '\u6E05\u9664\u683C\u5F0F',
                listeners: {
                    click: function () {
                        editor.execCommand('removeFormat');
                    }
                },
                mode: Editor.Mode.WYSIWYG_MODE
            });
        }
    };
    module.exports = RemoveFormat;
});


