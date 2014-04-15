/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 15 17:50
*/
/*
combined files : 

editor/plugin/underline/cmd

*/
/**
 * @ignore
 * underline command
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/underline/cmd',['editor', '../font/cmd'], function (S, require) {
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
