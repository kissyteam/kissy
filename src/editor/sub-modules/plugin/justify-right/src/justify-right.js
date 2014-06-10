/**
 * @ignore
 * justifyRight button.
 * @author yiminghe@gmail.com
 */

var Editor = require('editor');
var justifyCenterCmd = require('./justify-right/cmd');
require('./button');
var $ = require('node');
function exec() {
    var editor = this.get('editor');
    editor.execCommand('justifyRight');
    editor.focus();
}

function justifyRight() {

}

(justifyRight.prototype = {
    pluginRenderUI: function (editor) {

        justifyCenterCmd.init(editor);

        editor.addButton('justifyRight', {
            tooltip: '右对齐',
            checkable: true,
            listeners: {
                click: exec,
                afterSyncUI: function () {
                    var self = this;
                    editor.on('selectionChange', function () {
                        if (editor.get('mode') === Editor.Mode.SOURCE_MODE) {
                            return;
                        }
                        if (editor.queryCommandValue('justifyRight')) {
                            self.set('checked', true);
                        } else {
                            self.set('checked', false);
                        }
                    });
                }

            },
            mode: Editor.Mode.WYSIWYG_MODE
        });

        editor.docReady(function () {
            editor.get('document').on('keydown', function (e) {
                if (e.ctrlKey && e.keyCode === $.Event.KeyCode.R) {
                    editor.execCommand('justifyRight');
                    e.preventDefault();
                }
            });
        });
    }
});

module.exports = justifyRight;
