KISSY.add("editor/plugin/font/cmd", function (S, KE) {

    var getQueryCmd = KE.Utils.getQueryCmd;

    return {
        addButtonCmd:function (editor, cmdType, style) {
            var queryCmd = getQueryCmd(cmdType);
            if (!editor.hasCommand(cmdType)) {
                editor.addCommand(cmdType, {
                    exec:function (editor, effect) {
                        var doc = editor.get("document")[0];
                        editor.execCommand("save");
                        if (effect || effect === undefined) {
                            style.apply(doc);
                        } else {
                            style.remove(doc);
                        }
                        editor.execCommand("save");
                        editor.notifySelectionChange();
                    }
                });

                editor.addCommand(queryCmd, {
                    exec:function (editor, currentPath) {
                        return  style.checkActive(currentPath);
                    }
                });
            }
        },

        addSelectCmd:function (editor, cmdType, styleObj) {
            var queryCmd = getQueryCmd(cmdType);
            if (!editor.hasCommand(cmdType)) {
                editor.addCommand(cmdType, {
                    exec:function (editor, value, apply) {
                        var style = new KE.Style(styleObj, {
                            value:value
                        }),
                            doc = editor.get("document")[0];
                        editor.execCommand("save");
                        if (apply === undefined || apply) {
                            style.apply(doc);
                        } else {
                            style.remove(doc);
                        }
                        editor.execCommand("save");
                    }
                });
                editor.addCommand(queryCmd, {
                    exec:function (editor, value, element) {
                        var style = new KE.Style(styleObj, {
                            value:value
                        });
                        return style.checkElementRemovable(element, true);
                    }
                });
            }
        }
    };
}, {
    requires:['editor']
});