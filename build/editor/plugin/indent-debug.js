/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 15 17:47
*/
/*
combined files : 

editor/plugin/indent

*/
/**
 * @ignore
 * Add indent button.
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/indent',['editor', './indent/cmd', './button'], function (S, require) {
    var Editor = require('editor');
    var indexCmd = require('./indent/cmd');
    require('./button');
    function Indent() {

    }

    S.augment(Indent, {
        pluginRenderUI: function (editor) {
            indexCmd.init(editor);
            editor.addButton('indent', {
                tooltip: '增加缩进量',
                listeners: {
                    click: function () {
                        editor.execCommand('indent');
                        editor.focus();
                    }
                },
                mode: Editor.Mode.WYSIWYG_MODE
            });
        }
    });

    return Indent;
});
