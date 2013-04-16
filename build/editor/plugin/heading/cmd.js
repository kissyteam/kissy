/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:17
*/
/**
 * Adds a heading tag around a selection or insertion point line.
 * Requires the tag-name string to be passed in as a value argument (i.e. "H1", "H6")
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/heading/cmd", function (S, Editor) {
    return {
        init:function (editor) {
            if (!editor.hasCommand("heading")) {
                editor.addCommand("heading", {
                    exec:function (editor, tag) {
                        editor.execCommand("save");
                        if (tag != "p") {
                            var currentValue = editor.queryCommandValue("heading");
                        }
                        if (tag == currentValue) {
                            tag = "p";
                        }
                        new Editor.Style({
                            element:tag
                        }).apply(editor.get("document")[0]);
                        editor.execCommand("save");
                    }
                });

                var queryCmd = Editor.Utils.getQueryCmd("heading");

                editor.addCommand(queryCmd, {
                    exec:function (editor) {
                        var selection = editor.getSelection();
                        if (selection && !selection.isInvalid) {
                            var startElement = selection.getStartElement();
                            var currentPath = new Editor.ElementPath(startElement);
                            var block = currentPath.block || currentPath.blockLimit;
                            var nodeName = block && block.nodeName() || "";
                            if (nodeName.match(/^h\d$/) || nodeName == "p") {
                                return nodeName;
                            }
                        }
                    }
                });
            }


        }
    };
}, {
    requires:['editor']
});
