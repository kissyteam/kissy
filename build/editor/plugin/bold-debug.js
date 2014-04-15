/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 15 17:44
*/
/*
combined files : 

editor/plugin/bold

*/
/**
 * @ignore
 * bold command.
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/bold',['./font/ui', './bold/cmd', './button'], function (S, require) {
    var ui = require('./font/ui');
    var cmd = require('./bold/cmd');
    require('./button');
    function bold() {
    }

    S.augment(bold, {
        pluginRenderUI: function (editor) {
            cmd.init(editor);
            editor.addButton('bold', {
                cmdType: 'bold',
                tooltip: '粗体'
            }, ui.Button);

            editor.docReady(function () {
                editor.get('document').on('keydown', function (e) {
                    if (e.ctrlKey && e.keyCode === S.Node.KeyCode.B) {
                        editor.execCommand('bold');
                        e.preventDefault();
                    }
                });
            });
        }
    });

    return bold;
});
