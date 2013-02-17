/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
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
                    exec:function (editor) {
                        var selection = editor.getSelection();
                        if (selection && !selection.isInvalid) {
                            var startElement = selection.getStartElement();
                            var elementPath = new Editor.ElementPath(startElement);
                            return checkOutdentActive(elementPath);
                        }
                    }
                });
            }
        }
    };

}, {
    requires:['editor', '../dent-utils/cmd']
});
