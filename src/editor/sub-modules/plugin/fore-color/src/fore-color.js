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

(ForeColorPlugin.prototype = {
    pluginRenderUI: function (editor) {
        cmd.init(editor);
        Button.init(editor, {
            cmdType: 'foreColor',
            defaultColor: 'rgb(204, 0, 0)',
            tooltip: '文本颜色'
        });
    }
});

module.exports = ForeColorPlugin;
