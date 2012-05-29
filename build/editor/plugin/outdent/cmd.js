/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 29 18:24
*/
/**
 * Add indent and outdent command identifier for KISSY Editor.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/outdent/cmd", function (S, Editor, dentUtils) {
    var addCommand = dentUtils.addCommand;
    var checkOutdentActive = dentUtils.checkOutdentActive;
    return {
        init:function (editor) {
            addCommand(editor, "outdent");
            var queryCmd = Editor.Utils.getQueryCmd("outdent");
            if (!editor.hasCommand(queryCmd)) {
                editor.addCommand(queryCmd, {
                    exec:function (editor, elementPath) {
                        return checkOutdentActive(elementPath);
                    }
                });
            }
        }
    };

}, {
    requires:['editor', '../dentUtils/cmd']
});
