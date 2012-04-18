KISSY.add("editor/plugin/insertOrderedList/cmd", function (S, KE, listCmd) {

    var insertOrderedList = "insertOrderedList",
        ListCommand = listCmd.ListCommand,
        queryActive = listCmd.queryActive,
        olCmd = new ListCommand("ol");

    return {
        init:function (editor) {
            if (!editor.hasCommand(insertOrderedList)) {
                editor.addCommand(insertOrderedList, {
                    exec:function (editor) {
                        olCmd.exec(editor);
                    }
                });
            }

            var queryOl = KE.Utils.getQueryCmd(insertOrderedList);

            if (!editor.hasCommand(queryOl)) {
                editor.addCommand(queryOl, {
                    exec:function (editor, elementPath) {
                        return queryActive("ol", elementPath);
                    }
                });
            }
        }
    };

}, {
    requires:['editor', '../listUtils/cmd.js']
});