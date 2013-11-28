/**
 * @ignore
 * italic command.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Editor = require('editor');
    var Cmd = require('../font/cmd');

    var ITALIC_STYLE = new Editor.Style({
        element: 'em',
        overrides: [
            {
                element: 'i'
            },
            {
                element: 'span',
                attributes: {
                    style: 'font-style: italic;'
                }
            }
        ]
    });
    return {
        init: function (editor) {
            Cmd.addButtonCmd(editor, 'italic', ITALIC_STYLE);
        }
    };
});