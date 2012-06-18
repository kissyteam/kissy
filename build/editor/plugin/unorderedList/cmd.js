/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 18 17:43
*/
/**
 * ol command
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/unorderedList/cmd", function (S, Editor, listCmd) {

    var insertUnorderedList = "insertUnorderedList",
        ListCommand = listCmd.ListCommand,
        queryActive = listCmd.queryActive,
        ulCmd = new ListCommand("ul");

    return {
        init:function (editor) {
            if (!editor.hasCommand(insertUnorderedList)) {
                editor.addCommand(insertUnorderedList, {
                    exec:function (editor) {
                        ulCmd.exec(editor);
                    }
                });
            }

            var queryUl = Editor.Utils.getQueryCmd(insertUnorderedList);

            if (!editor.hasCommand(queryUl)) {
                editor.addCommand(queryUl, {
                    exec:function (editor, elementPath) {
                        return queryActive("ul", elementPath);
                    }
                });
            }
        }
    };

}, {
    requires:['editor', '../listUtils/cmd']
});
