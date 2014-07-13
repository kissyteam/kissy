/**
 * @ignore
 * strike-through command
 * @author yiminghe@gmail.com
 */

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
module.exports = {
    init: function (editor) {
        Cmd.addButtonCmd(editor, 'strikeThrough', STRIKE_STYLE);
    }
};