/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:20
*/
/**
 * undo button
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/undo/btn", function (S, Editor, Button) {

    var UndoBtn = Button.extend({

        __lock: true,

        bindUI: function () {
            var self = this,
                editor = self.get("editor");

            self.on("click", function () {
                editor.execCommand("undo");
            });
            editor.on("afterUndo afterRedo afterSave", function (ev) {
                var index = ev.index;
                //有状态可后退
                if (index > 0) {
                    self.set("disabled", self.__lock = false);
                } else {
                    self.set("disabled", self.__lock = true);
                }
            });
        }
    }, {
        ATTRS: {
            mode: {
                value: Editor.Mode.WYSIWYG_MODE
            },
            disabled: {
                // 默认 disabled
                value: true,
                setter: function (v) {
                    // wysiwyg mode invalid
                    if (this.__lock) {
                        v = true;
                    }
                    return v;
                }
            }
        }
    });


    var RedoBtn = Button.extend({

        __lock: true,

        bindUI: function () {
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
                    self.set("disabled", self.__lock = false);
                } else {
                    self.set("disabled", self.__lock = true);
                }
            });
        }
    }, {

        ATTRS: {
            mode: {
                value: Editor.Mode.WYSIWYG_MODE
            },
            disabled: {
                // 默认 disabled
                value: true,
                setter: function (v) {
                    // wysiwyg mode invalid
                    if (this.__lock) {
                        v = true;
                    }
                    return v;
                }
            }
        }
    });


    return {
        RedoBtn: RedoBtn,
        UndoBtn: UndoBtn
    };

}, {
    requires: ['editor', '../button']
});
