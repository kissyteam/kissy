/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 15 17:49
*/
/*
combined files : 

editor/plugin/outdent

*/
/**
 * @ignore
 * Add indent button.
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/outdent',['editor', './button', './outdent/cmd'], function (S, require) {
    var Editor = require('editor');
    require('./button');
    var indexCmd = require('./outdent/cmd');

    function outdent() {

    }

    S.augment(outdent, {
        pluginRenderUI: function (editor) {

            indexCmd.init(editor);

            editor.addButton('outdent', {
                tooltip: '减少缩进量',
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
    });

    return outdent;
});
