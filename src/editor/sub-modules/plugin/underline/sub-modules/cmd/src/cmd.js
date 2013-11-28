/**
 * @ignore
 * underline command
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Editor = require('editor');
    var Cmd = require('../font/cmd');

    var UNDERLINE_STYLE = new Editor.Style({
        element: 'u',
        overrides: [
            {
                element: 'span',
                attributes: {
                    style: 'text-decoration: underline;'
                }
            }
        ]
    });
    return {
        init: function (editor) {
            Cmd.addButtonCmd(editor, 'underline', UNDERLINE_STYLE);
        }
    };
});