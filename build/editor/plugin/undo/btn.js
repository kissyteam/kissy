/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 10 21:07
*/
/**
 * undo button
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/undo/btn", function (S, Editor, Button) {
    function Common(self) {
        var editor = self.get("editor");
        /**
         * save,restore完，更新工具栏状态
         */
        editor.on("afterSave afterRestore", self._respond, self);
    }


    var UndoBtn = Button.extend({

        bindUI:function () {
            Common(this);
            this.on("click", function () {
                this.get("editor").execCommand("undo");
            });
        },

        _respond:function (ev) {
            var self = this,
                index = ev.index;

            //有状态可退
            if (index > 0) {
                self.set("disabled", false);
            } else {
                self.set("disabled", true);
            }
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
            Common(this);
            this.on("click", function () {
                this.get("editor").execCommand("redo");
            });
        },

        _respond:function (ev) {
            var self = this,
                history = ev.history,
                index = ev.index;
            //有状态可前进
            if (index < history.length - 1) {
                self.set("disabled", false);
            } else {
                self.set("disabled", true);
            }
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
