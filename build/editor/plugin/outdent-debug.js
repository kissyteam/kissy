/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:48
*/
/*
combined modules:
editor/plugin/outdent
*/
KISSY.add('editor/plugin/outdent', [
    'editor',
    './button',
    './outdent/cmd'
], function (S, require, exports, module) {
    /**
 * @ignore
 * Add indent button.
 * @author yiminghe@gmail.com
 */
    var Editor = require('editor');
    require('./button');
    var indexCmd = require('./outdent/cmd');
    function Outdent() {
    }
    Outdent.prototype = {
        pluginRenderUI: function (editor) {
            indexCmd.init(editor);
            editor.addButton('outdent', {
                tooltip: '\u51CF\u5C11\u7F29\u8FDB\u91CF',
                listeners: {
                    click: function () {
                        editor.execCommand('outdent');
                        editor.focus();
                    },
                    afterSyncUI: function () {
                        var self = this;
                        editor.on('selectionChange', function () {
                            if (editor.get('mode') === Editor.Mode.SOURCE_MODE) {
                                return;
                            }
                            if (editor.queryCommandValue('outdent')) {
                                self.set('disabled', false);
                            } else {
                                self.set('disabled', true);
                            }
                        });
                    }
                },
                mode: Editor.Mode.WYSIWYG_MODE
            });
        }
    };
    module.exports = Outdent;
});


