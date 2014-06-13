/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:44
*/
/*
combined modules:
editor/plugin/bold/cmd
*/
KISSY.add('editor/plugin/bold/cmd', [
    'editor',
    '../font/cmd'
], function (S, require, exports, module) {
    /**
 * @ignore
 * bold command.
 * @author yiminghe@gmail.com
 */
    var Editor = require('editor');
    var Cmd = require('../font/cmd');
    var BOLD_STYLE = new Editor.Style({
            element: 'strong',
            overrides: [
                { element: 'b' },
                {
                    element: 'span',
                    attributes: { style: 'font-weight: bold;' }
                }
            ]
        });
    module.exports = {
        init: function (editor) {
            Cmd.addButtonCmd(editor, 'bold', BOLD_STYLE);
        }
    };
});

