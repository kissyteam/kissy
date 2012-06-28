/**
 * font command.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/font/cmd", function (S, Editor) {

    var getQueryCmd = Editor.Utils.getQueryCmd;

    function getValueFromSingle(element, styleObj) {
        var nodeName = element.nodeName();
        if (styleObj.element != nodeName) {
            return false;
        }
        var styles = styleObj.styles, v;
        for (var s in styles) {
            if (v = element.style(s)) {
                return v;
            }
        }
        var overrides = styleObj.overrides;
        for (var i = 0; i < overrides.length; i++) {
            var override = overrides[i];
            if (override.element != nodeName) {
                continue;
            }
            var attributes = override.attributes;
            for (var a in attributes) {
                if (v = element.attr(a)) {
                    return v;
                }
            }
        }
        return false;
    }

    function getValueFromStyleObj(elementPath, styleObj) {
        var elements = elementPath.elements,
            element,
            i,
            v;
        for (i = 0; i < elements.length; i++) {
            element = elements[ i ];
            if (element[0] == elementPath.block[0] ||
                element[0] == elementPath.blockLimit[0]) {
                continue;
            }
            v = getValueFromSingle(element, styleObj);
            if (v !== false) {
                return v;
            }
        }
        return v;
    }

    return {
        addButtonCmd:function (editor, cmdType, style) {
            var queryCmd = getQueryCmd(cmdType);
            if (!editor.hasCommand(cmdType)) {
                editor.addCommand(cmdType, {
                    exec:function (editor, effect) {
                        var doc = editor.get("document")[0];
                        editor.execCommand("save");
                        var checked = editor.queryCommandValue(cmdType);
                        if (checked) {
                            style.remove(doc);
                        } else {
                            style.apply(doc);
                        }
                        editor.execCommand("save");
                        editor.notifySelectionChange();
                    }
                });

                editor.addCommand(queryCmd, {
                    exec:function (editor) {
                        var selection = editor.getSelection();
                        if (selection && !selection.isInvalid) {
                            var startElement = selection.getStartElement(),
                                currentPath = new Editor.ElementPath(startElement);
                            return  style.checkActive(currentPath);
                        }
                    }
                });
            }
        },

        addSelectCmd:function (editor, cmdType, styleObj) {
            var queryCmd = getQueryCmd(cmdType);
            if (!editor.hasCommand(cmdType)) {
                editor.addCommand(cmdType, {
                    exec:function (editor, value) {
                        editor.focus();
                        var currentValue = editor.queryCommandValue(cmdType) || "";
                        var style = new Editor.Style(styleObj, {
                                value:value
                            }),
                            doc = editor.get("document")[0];
                        editor.execCommand("save");
                        if (value.toLowerCase() == currentValue.toLowerCase()) {
                            style.remove(doc);
                        } else {
                            style.apply(doc);
                        }
                        editor.execCommand("save");
                    }
                });
                editor.addCommand(queryCmd, {
                    exec:function (editor) {
                        var selection = editor.getSelection();
                        if (selection && !selection.isInvalid) {
                            var startElement = selection.getStartElement();
                            var currentPath = new Editor.ElementPath(startElement);
                            return getValueFromStyleObj(currentPath, styleObj);
                        }
                    }
                });
            }
        }
    };
}, {
    requires:['editor']
});