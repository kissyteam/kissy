/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:47
*/
/*
combined modules:
editor/plugin/justify-left/cmd
*/
KISSY.add('editor/plugin/justify-left/cmd', ['../justify-cmd'], function (S, require, exports, module) {
    /**
 * @ignore
 * Add justifyCenter command identifier for Editor.
 * @author yiminghe@gmail.com
 */
    var justifyUtils = require('../justify-cmd');
    module.exports = {
        init: function (editor) {
            justifyUtils.addCommand(editor, 'justifyLeft', 'left');
        }
    };
});
