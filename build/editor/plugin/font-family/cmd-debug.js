/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:45
*/
/*
combined modules:
editor/plugin/font-family/cmd
*/
KISSY.add('editor/plugin/font-family/cmd', ['../font/cmd'], function (S, require, exports, module) {
    /**
 * @ignore
 * fontFamily command.
 * @author yiminghe@gmail.com
 */
    var Cmd = require('../font/cmd');
    var fontFamilyStyle = {
            element: 'span',
            styles: { 'font-family': '#(value)' },
            overrides: [{
                    element: 'font',
                    attributes: { 'face': null }
                }]
        };
    module.exports = {
        init: function (editor) {
            Cmd.addSelectCmd(editor, 'fontFamily', fontFamilyStyle);
        }
    };
});
