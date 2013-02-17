/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
/**
 * undo,redo manager for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/undo/cmd", function (S, Editor) {
    var arrayCompare = Editor.Utils.arrayCompare,
        UA = S.UA,
        LIMIT = 30;

    /**
     * 当前编辑区域状态，包括 html 与选择区域(光标位置)
     * @param editor
     */
    function Snapshot(editor) {
        var contents = editor.get("document")[0].body.innerHTML,
            self = this,
            selection;
        if (contents) {
            selection = editor.getSelection();
        }
        //内容html
        self.contents = contents;
        //选择区域书签标志
        self.bookmarks = selection && selection.createBookmarks2(true);
    }

    S.augment(Snapshot, {
        /**
         * 编辑状态间是否相等
         * @param otherImage
         */
        equals:function (otherImage) {
            var self = this,
                thisContents = self.contents,
                otherContents = otherImage.contents;

            if (thisContents != otherContents){
                return false;
            }

            var bookmarksA = self.bookmarks,
                bookmarksB = otherImage.bookmarks;

            if (bookmarksA || bookmarksB) {
                if (!bookmarksA || !bookmarksB || bookmarksA.length != bookmarksB.length)
                    return false;

                for (var i = 0; i < bookmarksA.length; i++) {
                    var bookmarkA = bookmarksA[ i ],
                        bookmarkB = bookmarksB[ i ];

                    if (
                        bookmarkA.startOffset != bookmarkB.startOffset ||
                            bookmarkA.endOffset != bookmarkB.endOffset ||
                            !arrayCompare(bookmarkA.start, bookmarkB.start) ||
                            !arrayCompare(bookmarkA.end, bookmarkB.end)) {
                        return false;
                    }
                }
            }

            return true;
        }
    });

    /**
     * 通过编辑器的save与restore事件，编辑器实例的历史栈管理，与键盘监控
     * @param editor
     */
    function UndoManager(editor) {
        // redo undo history stack
        /**
         * 编辑器状态历史保存
         */
        var self = this;
        self.history = [];
        //当前所处状态对应的历史栈内下标
        self.index = -1;
        self.editor = editor;
        //键盘输入做延迟处理
        self.bufferRunner = S.buffer(self.save, 500, self);
        self._init();
    }

    var //editingKeyCodes = { /*Backspace*/ 8:1, /*Delete*/ 46:1 },
        modifierKeyCodes = { /*Shift*/ 16:1, /*Ctrl*/ 17:1, /*Alt*/ 18:1 },
    // Arrows: L, T, R, B
        navigationKeyCodes = { 37:1, 38:1, 39:1, 40:1, 33:1, 34:1 },
        zKeyCode = 90,
        yKeyCode = 89;


    S.augment(UndoManager, {
        /**
         * 监控键盘输入，buffer处理
         */
        _keyMonitor:function () {
            var self = this,
                editor = self.editor;

            editor.docReady(function () {
                editor.get("document").on("keydown", function (ev) {
                    var keyCode = ev.keyCode;
                    if (keyCode in navigationKeyCodes
                        || keyCode in modifierKeyCodes) {
                        return;
                    }
                    // ctrl+z，撤销
                    if (keyCode === zKeyCode && (ev.ctrlKey || ev.metaKey)) {
                        if (false !== editor.fire("beforeRedo")) {
                            self.restore(-1);
                        }
                        ev.halt();
                        return;
                    }
                    // ctrl+y，重做
                    if (keyCode === yKeyCode && (ev.ctrlKey || ev.metaKey)) {
                        if (false !== editor.fire("beforeUndo")) {
                            self.restore(1);
                        }
                        ev.halt();
                        return;
                    }
                    if (editor.fire("beforeSave", {buffer:1}) !== false) {
                        self.save(1);
                    }
                });
            });
        },

        _init:function () {
            var self = this;
            self._keyMonitor();
            //先save一下,why??
            //初始状态保存，异步，必须等use中已经 set 了编辑器中初始代码
            //必须在从 textarea 复制到编辑区域前，use所有plugin，为了过滤插件生效
            //而这段代码必须在从 textarea 复制到编辑区域后运行，所以设个延迟
            setTimeout(function () {
                self.save();
            }, 0);
        },

        /**
         * 保存历史
         */
        save:function (buffer) {
            var editor = this.editor;

            // 代码模式下不和可视模式下混在一起
            if (editor.get("mode") != Editor.WYSIWYG_MODE) {
                return;
            }


            if (!editor.get("document")) {
                return;
            }

            if (buffer) {
                this.bufferRunner();
                return;
            }

            var self = this,
                history = self.history,
                index = self.index;

            //前面的历史抛弃
            if (history.length > index + 1)
                history.splice(index + 1, history.length - index - 1);

            var last = history[history.length - 1],
                current = new Snapshot(editor);

            if (!last || !last.equals(current)) {
                if (history.length === LIMIT) {
                    history.shift();
                }
                history.push(current);
                self.index = index = history.length - 1;
                editor.fire("afterSave", {history:history, index:index});
            }
        },

        /**
         * @param d 1.向前撤销 ，-1.向后重做
         */
        restore:function (d) {

            // 代码模式下不和可视模式下混在一起
            if (this.editor.get("mode") != Editor.WYSIWYG_MODE) {
                return;
            }

            var self = this,
                history = self.history,
                editor = self.editor,
                editorDomBody = editor.get("document")[0].body,
                snapshot = history[self.index + d];

            if (snapshot) {
                editorDomBody.innerHTML = snapshot.contents;
                if (snapshot.bookmarks)
                    editor.getSelection().selectBookmarks(snapshot.bookmarks);
                else if (UA['ie']) {
                    // IE BUG: If I don't set the selection to *somewhere* after setting
                    // document contents, then IE would create an empty paragraph at the bottom
                    // the next time the document is modified.
                    var $range = editorDomBody.createTextRange();
                    $range.collapse(true);
                    $range.select();
                }
                var selection = editor.getSelection();
                // 将当前光标，选择区域滚动到可视区域
                if (selection) {
                    selection.scrollIntoView();
                }
                self.index += d;
                editor.fire(d > 0 ? "afterUndo" : "afterRedo", {
                    history:history,
                    index:self.index
                });
                editor.notifySelectionChange();
            }

            return snapshot;
        }
    });


    return {
        init:function (editor) {
            if (!editor.hasCommand("save")) {
                var undoRedo = new UndoManager(editor);
                editor.addCommand("save", {
                    exec:function (_, buffer) {
                        editor.focus();
                        undoRedo.save(buffer);
                    }
                });
                editor.addCommand("undo", {
                    exec:function () {
                        editor.focus();
                        undoRedo.restore(-1);
                    }
                });
                editor.addCommand("redo", {
                    exec:function () {
                        editor.focus();
                        undoRedo.restore(1);
                    }
                });
            }
        }
    };
}, {
    requires:['editor']
});
