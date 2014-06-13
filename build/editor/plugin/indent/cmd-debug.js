/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:46
*/
/*
combined modules:
editor/plugin/indent/cmd
*/
KISSY.add('editor/plugin/indent/cmd', ['../dent-cmd'], function (S, require, exports, module) {
    /**
 * @ignore
 * Add indent and outdent command identifier for KISSY Editor.
 * @author yiminghe@gmail.com
 */
    var dentUtils = require('../dent-cmd');
    var addCommand = dentUtils.addCommand;
    module.exports = {
        init: function (editor) {
            addCommand(editor, 'indent');
        }
    };
});
