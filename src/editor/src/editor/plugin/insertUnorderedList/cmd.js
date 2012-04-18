KISSY.add("editor/plugin/insertUnorderedList/cmd", function (S, KE, listCmd) {

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

            var queryUl = KE.Utils.getQueryCmd(insertUnorderedList);

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
    requires:['editor', '../listUtils/cmd.js']
});