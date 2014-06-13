/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:45
*/
/*
combined modules:
editor/plugin/font-size/cmd
*/
KISSY.add('editor/plugin/font-size/cmd', ['../font/cmd'], function (S, require, exports, module) {
    /**
 * @ignore
 * fontSize command.
 * @author yiminghe@gmail.com
 */
    var Cmd = require('../font/cmd');
    var fontSizeStyle = {
            element: 'span',
            styles: { 'font-size': '#(value)' },
            overrides: [{
                    element: 'font',
                    attributes: { 'size': null }
                }]
        };
    module.exports = {
        init: function (editor) {
            Cmd.addSelectCmd(editor, 'fontSize', fontSizeStyle);
        }
    };
});
