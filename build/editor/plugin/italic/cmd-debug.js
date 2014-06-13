/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:46
*/
/*
combined modules:
editor/plugin/italic/cmd
*/
KISSY.add('editor/plugin/italic/cmd', [
    'editor',
    '../font/cmd'
], function (S, require, exports, module) {
    /**
 * @ignore
 * italic command.
 * @author yiminghe@gmail.com
 */
    var Editor = require('editor');
    var Cmd = require('../font/cmd');
    var ITALIC_STYLE = new Editor.Style({
            element: 'em',
            overrides: [
                { element: 'i' },
                {
                    element: 'span',
                    attributes: { style: 'font-style: italic;' }
                }
            ]
        });
    module.exports = {
        init: function (editor) {
            Cmd.addButtonCmd(editor, 'italic', ITALIC_STYLE);
        }
    };
});

