/**
 * @ignore
 * justifyLeft button.
 * @author yiminghe@gmail.com
 */

var Editor = require('editor');
var justifyCenterCmd = require('./justify-left/cmd');
require('./button');
var $ = require('node');
function exec() {
    var editor = this.get('editor');
    editor.execCommand('justifyLeft');
    editor.focus();
}

function justifyLeft() {
}

(justifyLeft.prototype = {
    pluginRenderUI: function (editor) {
        justifyCenterCmd.init(editor);

        editor.addButton('justifyLeft', {
            tooltip: '左对齐',
            checkable: true,
            listeners: {
                click: exec,
                afterSyncUI: function () {
                    var self = this;
                    editor.on('selectionChange', function () {
                        if (editor.get('mode') === Editor.Mode.SOURCE_MODE) {
                            return;
                        }
                        if (editor.queryCommandValue('justifyLeft')) {
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
                if (e.ctrlKey && e.keyCode === $.Event.KeyCode.L) {
                    editor.execCommand('justifyLeft');
                    e.preventDefault();
                }
            });
        });
    }
});

module.exports = justifyLeft;
