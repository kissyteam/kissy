/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 9 13:59
*/
/*
combined modules:
editor/plugin/indent/cmd
*/
/**
 * @ignore
 * Add indent and outdent command identifier for KISSY Editor.
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/indent/cmd', ['../dent-cmd'], function (S, require) {
    var dentUtils = require('../dent-cmd');
    var addCommand = dentUtils.addCommand;
    return {
        init: function (editor) {
            addCommand(editor, 'indent');
        }
    };
});
