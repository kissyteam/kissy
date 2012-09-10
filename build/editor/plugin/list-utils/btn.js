/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Sep 10 10:11
*/
/**
 * Common btn for list.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/list-utils/btn", function (S, Editor, Button) {

    function onClick() {
        var editor = this.get("editor");
        var cmd = this.get("cmdType");
        editor.execCommand(cmd);
        editor.focus();
    }

    return Button.extend({
        initializer:function () {
            var self = this;
            self.on("click", onClick, self);
            var editor = self.get("editor");
            editor.on("selectionChange", function () {
                var cmd = self.get("cmdType");
                if (editor.queryCommandValue(cmd)) {
                    self.set("checked", true);
                } else {
                    self.set("checked", false);
                }
            })
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
}, {
    requires:['editor', '../button/']
});
