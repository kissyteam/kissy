/**
 * font formatting for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/font/ui", function (S, Editor, Button, Select) {

    var getQueryCmd = Editor.Utils.getQueryCmd;

    var FontSelect = Select.extend({

        click:function (ev) {
            var self = this,
                v = ev.target.get("value"),
                cmdType = self.get("cmdType"),
                pre = ev.prevTarget && ev.prevTarget.get("value"),
                editor = self.get("editor");
            editor.focus();
            if (v == pre) {
                // 清除,wildcard pls
                // !TODO inherit 小问题，在中间点 inherit
                editor.execCommand(cmdType, v, false);
            } else {
                editor.execCommand(cmdType, v);
            }
        },

        selectionChange:function (ev) {
            var self = this,
                elementPath = ev.path,
                cmdType = getQueryCmd(self.get("cmdType")),
                menu = self.get("menu"),
                children = menu.get && menu.get("children"),
                editor = self.get("editor"),
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
        }
    });


    var FontButton = Button.Toggle.extend({
        offClick:function () {
            var self = this,
                cmdType = self.get("cmdType"),
                editor = self.get("editor");
            editor.execCommand(cmdType);
            editor.focus();
        },
        onClick:function () {
            var self = this,
                cmdType = self.get("cmdType"),
                editor = self.get("editor");
            editor.execCommand(cmdType, false);
            editor.focus();
        },
        selectionChange:function (ev) {
            var self = this,
                editor = self.get("editor"),
                cmdType = getQueryCmd(self.get("cmdType")),
                elementPath = ev.path;
            if (editor.execCommand(cmdType, elementPath)) {
                self.set("checked", true);
            } else {
                self.set("checked", false);
            }
        }
    }, {
        ATTRS:{
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
    requires:['editor', '../button/', '../select/']
});
