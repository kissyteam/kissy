/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:46
*/
/*
combined modules:
editor/plugin/indent
*/
KISSY.add('editor/plugin/indent', [
    'editor',
    './indent/cmd',
    './button'
], function (S, require, exports, module) {
    /**
 * @ignore
 * Add indent button.
 * @author yiminghe@gmail.com
 */
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
    module.exports = Indent;
});


