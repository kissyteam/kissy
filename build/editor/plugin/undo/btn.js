/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
/**
 * undo button
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/undo/btn", function (S, Editor, Button) {

    var UndoBtn = Button.extend({

        bindUI:function () {
            var self = this,
                editor = self.get("editor");
            self.on("click", function () {
                editor.execCommand("undo");
            });
            editor.on("afterUndo afterRedo afterSave", function (ev) {
                var index = ev.index;
                //有状态可后退
                if (index > 0) {
                    self.set("disabled", false);
                } else {
                    self.set("disabled", true);
                }
            });
        }
    }, {
        ATTRS:{
            mode:{
                value:Editor.WYSIWYG_MODE
            },
            disabled:{
                // 默认 disabled
                value:true
            }
        }
    });


    var RedoBtn = Button.extend({

        bindUI:function () {
            var self = this,
                editor = self.get("editor");
            self.on("click", function () {
                editor.execCommand("redo");
            });
            editor.on("afterUndo afterRedo afterSave", function (ev) {
                var history = ev.history,
                    index = ev.index;
                //有状态可前进
                if (index < history.length - 1) {
                    self.set("disabled", false);
                } else {
                    self.set("disabled", true);
                }
            });
        }
    }, {
        mode:{
            value:Editor.WYSIWYG_MODE
        },
        ATTRS:{
            disabled:{
                // 默认 disabled
                value:true
            }
        }
    });


    return {
        RedoBtn:RedoBtn,
        UndoBtn:UndoBtn
    };

}, {
    requires:['editor', '../button/']
});
