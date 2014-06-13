/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:49
*/
/*
combined modules:
editor/plugin/undo/btn
*/
KISSY.add('editor/plugin/undo/btn', [
    '../button',
    'editor'
], function (S, require, exports, module) {
    /**
 * @ignore
 * undo button
 * @author yiminghe@gmail.com
 */
    var Button = require('../button');
    var Editor = require('editor');
    var UndoBtn = Button.extend({
            __lock: true,
            bindUI: function () {
                var self = this, editor = self.get('editor');
                self.on('click', function () {
                    editor.execCommand('undo');
                });
                editor.on('afterUndo afterRedo afterSave', function (ev) {
                    var index = ev.index;    //有状态可后退
                    //有状态可后退
                    if (index > 0) {
                        self.set('disabled', self.__lock = false);
                    } else {
                        self.set('disabled', self.__lock = true);
                    }
                });
            }
        }, {
            ATTRS: {
                mode: { value: Editor.Mode.WYSIWYG_MODE },
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
                var self = this, editor = self.get('editor');
                self.on('click', function () {
                    editor.execCommand('redo');
                });
                editor.on('afterUndo afterRedo afterSave', function (ev) {
                    var history = ev.history, index = ev.index;    //有状态可前进
                    //有状态可前进
                    if (index < history.length - 1) {
                        self.set('disabled', self.__lock = false);
                    } else {
                        self.set('disabled', self.__lock = true);
                    }
                });
            }
        }, {
            ATTRS: {
                mode: { value: Editor.Mode.WYSIWYG_MODE },
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
    module.exports = {
        RedoBtn: RedoBtn,
        UndoBtn: UndoBtn
    };
});

