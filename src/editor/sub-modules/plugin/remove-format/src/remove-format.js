/**
 * @ignore
 * removeFormat for selection.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Editor = require('editor');
    require('./button');
    var formatCmd = require('./remove-format/cmd');

    function removeFormat() {
    }

    (removeFormat.prototype = {
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
    });

    return removeFormat;
});