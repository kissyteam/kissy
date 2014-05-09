/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 9 13:58
*/
/*
combined modules:
editor/plugin/font-size/cmd
*/
/**
 * @ignore
 * fontSize command.
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/font-size/cmd', ['../font/cmd'], function (S, require) {
    var Cmd = require('../font/cmd');
    var fontSizeStyle = {
            element: 'span',
            styles: { 'font-size': '#(value)' },
            overrides: [{
                    element: 'font',
                    attributes: { 'size': null }
                }]
        };
    return {
        init: function (editor) {
            Cmd.addSelectCmd(editor, 'fontSize', fontSizeStyle);
        }
    };
});
