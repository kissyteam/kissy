/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 29 15:04
*/
/*
combined modules:
editor/plugin/justify-center/cmd
*/
/**
 * @ignore
 * Add justifyCenter command identifier for Editor.
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/justify-center/cmd', ['../justify-cmd'], function (S, require) {
    var justifyUtils = require('../justify-cmd');
    return {
        init: function (editor) {
            justifyUtils.addCommand(editor, 'justifyCenter', 'center');
        }
    };
});
