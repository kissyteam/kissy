/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 9 13:58
*/
/*
combined modules:
editor/plugin/fore-color
*/
/**
 * @ignore
 * foreColor button.
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/fore-color', [
    './color/btn',
    './fore-color/cmd'
], function (S, require) {
    var Button = require('./color/btn');
    var cmd = require('./fore-color/cmd');
    function ForeColorPlugin(config) {
        this.config = config || {};
    }
    S.augment(ForeColorPlugin, {
        pluginRenderUI: function (editor) {
            cmd.init(editor);
            Button.init(editor, {
                cmdType: 'foreColor',
                defaultColor: 'rgb(204, 0, 0)',
                tooltip: '\u6587\u672C\u989C\u8272'
            });
        }
    });
    return ForeColorPlugin;
});

