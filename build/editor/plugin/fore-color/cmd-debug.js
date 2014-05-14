/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:19
*/
/*
combined modules:
editor/plugin/fore-color/cmd
*/
/**
 * @ignore
 * foreColor command.
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/fore-color/cmd', ['../color/cmd'], function (S, require) {
    var cmd = require('../color/cmd');
    var COLOR_STYLES = {
            element: 'span',
            styles: { 'color': '#(color)' },
            overrides: [{
                    element: 'font',
                    attributes: { 'color': null }
                }],
            childRule: function (el) {
                // <span style='color:red'><a href='g.cn'>abcdefg</a></span>
                // 不起作用
                return !(el.nodeName() === 'a' || el.all('a').length);
            }
        };
    return {
        init: function (editor) {
            if (!editor.hasCommand('foreColor')) {
                editor.addCommand('foreColor', {
                    exec: function (editor, c) {
                        editor.execCommand('save');
                        cmd.applyColor(editor, c, COLOR_STYLES);
                        editor.execCommand('save');
                    }
                });
            }
        }
    };
});
