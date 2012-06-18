/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 18 22:02
*/
/**
 * font formatting for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/font/ui", function (S, Editor, Button, MenuButton) {

    var getQueryCmd = Editor.Utils.getQueryCmd;

    var FontSelect = MenuButton.Select.extend({

        initializer:function () {
            var self = this,
                editor = self.get("editor");
            self.on("click", function (ev) {
                var v = ev.target.get("value"),
                    cmdType = self.get("cmdType"),
                    pre = ev.prevTarget && ev.prevTarget.get("value");
                editor.focus();
                if (v == pre) {
                    // 清除,wildcard pls
                    // !TODO inherit 小问题，在中间点 inherit
                    editor.execCommand(cmdType, v, false);
                } else {
                    editor.execCommand(cmdType, v);
                }
            });

            editor.on("selectionChange", function (ev) {
                if (editor.get("mode") == Editor.SOURCE_MODE) {
                    return;
                }

                var elementPath = ev.path,
                    cmdType = getQueryCmd(self.get("cmdType")),
                    menu = self.get("menu"),
                    children = menu.get && menu.get("children"),
                    elements = elementPath.elements;

                if (children) {
                    // For each element into the elements path.
                    for (var i = 0, element; i < elements.length; i++) {
                        element = elements[i];
                        // Check if the element is removable by any of
                        // the styles.
                        for (var j = 0; j < children.length; j++) {
                            var item = children[j];
                            var value = item.get("value");
                            if (editor.execCommand(cmdType, value, element)) {
                                self.set("value", value);
                                return;
                            }
                        }
                    }
                    self.set("value", null);
                }
            });
        }
    });


    var FontButton = Button.extend({

        initializer:function () {
            var self = this, editor = self.get("editor"),
                cmdType = self.get("cmdType");
            self.on("click", function () {
                var checked = self.get("checked");
                if (checked) {
                    editor.execCommand(cmdType);
                    editor.focus();
                } else {
                    editor.execCommand(cmdType, false);
                    editor.focus();
                }
            });
            editor.on("selectionChange", function (ev) {

                if (editor.get("mode") == Editor.SOURCE_MODE) {
                    return;
                }
                var cmdType = getQueryCmd(self.get("cmdType"));
                var elementPath = ev.path;
                if (editor.execCommand(cmdType, elementPath)) {
                    self.set("checked", true);
                } else {
                    self.set("checked", false);
                }
            });
        }
    }, {
        ATTRS:{
            checkable:{
                value:true
            },
            mode:{
                value:Editor.WYSIWYG_MODE
            }
        }
    });

    return {
        Button:FontButton,
        Select:FontSelect
    };
}, {
    requires:['editor', '../button/', '../menubutton/']
});
