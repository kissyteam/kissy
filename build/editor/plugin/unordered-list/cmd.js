﻿/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:55
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/unordered-list/cmd
*/

/**
 * ol command
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/unordered-list/cmd", function (S, Editor, listCmd) {

    var insertUnorderedList = "insertUnorderedList",
        ListCommand = listCmd.ListCommand,
        queryActive = listCmd.queryActive,
        ulCmd = new ListCommand("ul");

    return {
        init:function (editor) {
            if (!editor.hasCommand(insertUnorderedList)) {
                editor.addCommand(insertUnorderedList, {
                    exec:function (editor,type) {
                        editor.focus();
                        ulCmd.exec(editor,type);
                    }
                });
            }

            var queryUl = Editor.Utils.getQueryCmd(insertUnorderedList);

            if (!editor.hasCommand(queryUl)) {
                editor.addCommand(queryUl, {
                    exec:function (editor) {
                        var selection = editor.getSelection();
                        if (selection && !selection.isInvalid) {
                            var startElement = selection.getStartElement();
                            var elementPath = new Editor.ElementPath(startElement);
                            return queryActive("ul", elementPath);
                        }
                    }
                });
            }
        }
    };

}, {
    requires:['editor', '../list-utils/cmd']
});

