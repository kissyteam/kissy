/**
 * @ignore
 * strike-through command
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Editor = require('editor');
    var Cmd = require('../font/cmd');

    var STRIKE_STYLE = new Editor.Style({
        element: 'del',
        overrides: [
            {
                element: 'span',
                attributes: {
                    style: 'text-decoration: line-through;'
                }
            },
            {
                element: 's'
            },
            {
                element: 'strike'
            }
        ]
    });
    return {
        init: function (editor) {
            Cmd.addButtonCmd(editor, 'strikeThrough', STRIKE_STYLE);
        }
    };
});