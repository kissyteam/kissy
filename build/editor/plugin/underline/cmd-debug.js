/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:49
*/
/*
combined modules:
editor/plugin/underline/cmd
*/
KISSY.add('editor/plugin/underline/cmd', [
    'editor',
    '../font/cmd'
], function (S, require, exports, module) {
    /**
 * @ignore
 * underline command
 * @author yiminghe@gmail.com
 */
    var Editor = require('editor');
    var Cmd = require('../font/cmd');
    var UNDERLINE_STYLE = new Editor.Style({
            element: 'u',
            overrides: [{
                    element: 'span',
                    attributes: { style: 'text-decoration: underline;' }
                }]
        });
    module.exports = {
        init: function (editor) {
            Cmd.addButtonCmd(editor, 'underline', UNDERLINE_STYLE);
        }
    };
});

