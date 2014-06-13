/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:46
*/
/*
combined modules:
editor/plugin/fore-color
*/
KISSY.add('editor/plugin/fore-color', [
    './color/btn',
    './fore-color/cmd'
], function (S, require, exports, module) {
    /**
 * @ignore
 * foreColor button.
 * @author yiminghe@gmail.com
 */
    var Button = require('./color/btn');
    var cmd = require('./fore-color/cmd');
    function ForeColorPlugin(config) {
        this.config = config || {};
    }
    ForeColorPlugin.prototype = {
        pluginRenderUI: function (editor) {
            cmd.init(editor);
            Button.init(editor, {
                cmdType: 'foreColor',
                defaultColor: 'rgb(204, 0, 0)',
                tooltip: '\u6587\u672C\u989C\u8272'
            });
        }
    };
    module.exports = ForeColorPlugin;
});

