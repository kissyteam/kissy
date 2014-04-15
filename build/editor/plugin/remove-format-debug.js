/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 15 17:50
*/
/*
combined files : 

editor/plugin/remove-format

*/
/**
 * @ignore
 * removeFormat for selection.
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/remove-format',['editor', './button', './remove-format/cmd'], function (S, require) {
    var Editor = require('editor');
    require('./button');
    var formatCmd = require('./remove-format/cmd');

    function removeFormat() {
    }

    S.augment(removeFormat, {
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
