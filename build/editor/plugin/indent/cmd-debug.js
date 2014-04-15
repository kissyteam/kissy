/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 15 17:47
*/
/*
combined files : 

editor/plugin/indent/cmd

*/
/**
 * @ignore
 * Add indent and outdent command identifier for KISSY Editor.
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/indent/cmd',['../dent-cmd'], function (S, require) {
    var dentUtils = require('../dent-cmd');

    var addCommand = dentUtils.addCommand;
    return {
        init: function (editor) {
            addCommand(editor, 'indent');
        }
    };
});
