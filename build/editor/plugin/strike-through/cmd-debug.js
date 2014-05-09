/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 9 14:01
*/
/*
combined modules:
editor/plugin/strike-through/cmd
*/
/**
 * @ignore
 * strike-through command
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/strike-through/cmd', [
    'editor',
    '../font/cmd'
], function (S, require) {
    var Editor = require('editor');
    var Cmd = require('../font/cmd');
    var STRIKE_STYLE = new Editor.Style({
            element: 'del',
            overrides: [
                {
                    element: 'span',
                    attributes: { style: 'text-decoration: line-through;' }
                },
                { element: 's' },
                { element: 'strike' }
            ]
        });
    return {
        init: function (editor) {
            Cmd.addButtonCmd(editor, 'strikeThrough', STRIKE_STYLE);
        }
    };
});

