/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Sep 10 22:09
*/
/**
 * Add indent and outdent command identifier for KISSY Editor.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/indent/cmd", function (S, Editor, dentUtils) {
    var addCommand = dentUtils.addCommand;
    return {
        init:function (editor) {
            addCommand(editor, "indent");
        }
    };

}, {
    requires:['editor', '../dent-utils/cmd']
});
