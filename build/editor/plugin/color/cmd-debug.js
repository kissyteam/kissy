/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:44
*/
/*
combined modules:
editor/plugin/color/cmd
*/
KISSY.add('editor/plugin/color/cmd', ['editor'], function (S, require, exports, module) {
    /**
 * @ignore
 * color command.
 * @author yiminghe@gmail.com
 */
    var Editor = require('editor');
    function applyColor(editor, c, styles) {
        var doc = editor.get('document')[0];
        editor.execCommand('save');
        if (c) {
            new Editor.Style(styles, { color: c }).apply(doc);
        } else {
            // Value 'inherit'  is treated as a wildcard,
            // which will match any value.
            //清除已设格式
            new Editor.Style(styles, { color: 'inherit' }).remove(doc);
        }
        editor.execCommand('save');
    }
    module.exports = { applyColor: applyColor };
});
