/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:46
*/
/*
combined modules:
editor/plugin/justify-center
*/
KISSY.add('editor/plugin/justify-center', [
    'editor',
    './justify-center/cmd',
    './button',
    'node'
], function (S, require, exports, module) {
    /**
 * @ignore
 * justifyCenter button.
 * @author yiminghe@gmail.com
 */
    var Editor = require('editor');
    var justifyCenterCmd = require('./justify-center/cmd');
    require('./button');
    var $ = require('node');
    function exec() {
        var editor = this.get('editor');
        editor.execCommand('justifyCenter');
        editor.focus();
    }
    function justifyCenter() {
    }
    justifyCenter.prototype = {
        pluginRenderUI: function (editor) {
            justifyCenterCmd.init(editor);
            editor.addButton('justifyCenter', {
                tooltip: '\u5C45\u4E2D\u5BF9\u9F50',
                checkable: true,
                listeners: {
                    click: exec,
                    afterSyncUI: function () {
                        var self = this;
                        editor.on('selectionChange', function () {
                            if (editor.get('mode') === Editor.Mode.SOURCE_MODE) {
                                return;
                            }
                            if (editor.queryCommandValue('justifyCenter')) {
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
                    if (e.ctrlKey && e.keyCode === $.Event.KeyCode.E) {
                        editor.execCommand('justifyCenter');
                        e.preventDefault();
                    }
                });
            });
        }
    };
    module.exports = justifyCenter;
});



