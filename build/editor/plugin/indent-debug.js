/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:20
*/
/*
combined modules:
editor/plugin/indent
*/
/**
 * @ignore
 * Add indent button.
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/indent', [
    'editor',
    './indent/cmd',
    './button'
], function (S, require) {
    var Editor = require('editor');
    var indexCmd = require('./indent/cmd');
    require('./button');
    function Indent() {
    }
    Indent.prototype = {
        pluginRenderUI: function (editor) {
            indexCmd.init(editor);
            editor.addButton('indent', {
                tooltip: '\u589E\u52A0\u7F29\u8FDB\u91CF',
                listeners: {
                    click: function () {
                        editor.execCommand('indent');
                        editor.focus();
                    }
                },
                mode: Editor.Mode.WYSIWYG_MODE
            });
        }
    };
    return Indent;
});


