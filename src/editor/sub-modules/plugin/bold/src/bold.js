/**
 * @ignore
 * bold command.
 * @author yiminghe@gmail.com
 */

var ui = require('./font/ui');
var cmd = require('./bold/cmd');
/*global Node:true*/
var Node = require('node');
require('./button');
function Bold() {
}

Bold.prototype = {
    pluginRenderUI: function (editor) {
        cmd.init(editor);
        editor.addButton('bold', {
            cmdType: 'bold',
            tooltip: '粗体'
        }, ui.Button);

        editor.docReady(function () {
            editor.get('document').on('keydown', function (e) {
                if (e.ctrlKey && e.keyCode === Node.KeyCode.B) {
                    editor.execCommand('bold');
                    e.preventDefault();
                }
            });
        });
    }
};

module.exports = Bold;