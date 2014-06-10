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
            tooltip: '清除格式',
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
