/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 9 13:59
*/
/*
combined modules:
editor/plugin/italic/cmd
*/
/**
 * @ignore
 * italic command.
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/italic/cmd', [
    'editor',
    '../font/cmd'
], function (S, require) {
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
    return {
        init: function (editor) {
            Cmd.addButtonCmd(editor, 'italic', ITALIC_STYLE);
        }
    };
});

