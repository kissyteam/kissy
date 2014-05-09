/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 9 13:59
*/
/*
combined modules:
editor/plugin/justify-right/cmd
*/
/**
 * @ignore
 * Add justifyCenter command identifier for Editor.
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/justify-right/cmd', ['../justify-cmd'], function (S, require) {
    var justifyUtils = require('../justify-cmd');
    return {
        init: function (editor) {
            justifyUtils.addCommand(editor, 'justifyRight', 'right');
        }
    };
});
