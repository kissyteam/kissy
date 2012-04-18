/**
 * font formatting for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/font/ui", function (S, KE, TripleButton, Select) {

    var getQueryCmd = KE.Utils.getQueryCmd;

    function FontSelect() {
        FontSelect.superclass.constructor.apply(this, arguments);
    }

    S.extend(FontSelect, Select, {
        click:function (ev) {
            var self = this,
                v = ev.newVal,
                cmdType = self.get("cmdType"),
                pre = ev.prevVal,
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
                items = self.get("items"),
                editor = self.get("editor"),
                elements = elementPath.elements;

            // For each element into the elements path.
            for (var i = 0, element; i < elements.length; i++) {
                element = elements[i];
                // Check if the element is removable by any of
                // the styles.
                for (var j = 0; j < items.length; j++) {
                    var item = items[j];
                    var value = item.value;
                    if (editor.execCommand(cmdType, value, element)) {
                        self.set("value", value);
                        return;
                    }
                }
            }

            var defaultValue = self.get("defaultValue");
            if (defaultValue) {
                self.set("value", defaultValue);
            } else {
                self.reset("value");
            }
        }
    });

    function FontButton() {
        FontButton.superclass.constructor.apply(this, arguments);
    }

    S.extend(FontButton, TripleButton, {
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
                self.set("state", TripleButton.ON);
            } else {
                self.set("state", TripleButton.OFF);
            }
        }
    }, {
        ATTRS:{
            mode:{
                value:KE.WYSIWYG_MODE
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
