/**
 * undo,redo manager for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("undo/support", function() {
    var S = KISSY,
        KE = S.Editor,
        arrayCompare = KE.Utils.arrayCompare,
        UA = S.UA,
        Event = S.Event,
        LIMIT = 30;

    /**
     * 当前编辑区域状态，包括 html 与选择区域(光标位置)
     * @param editor
     */
    function Snapshot(editor) {
        var contents = editor._getRawData(),
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
        equals:function(otherImage) {
            var self = this,
                thisContents = self.contents,
                otherContents = otherImage.contents;
            if (thisContents != otherContents)
                return false;
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
        //redo undo history stack
        /**
         * 编辑器状态历史保存
         */
        var self = this;
        self.history = [];
        //当前所处状态对应的历史栈内下标
        self.index = -1;
        self.editor = editor;
        //键盘输入做延迟处理
        self.bufferRunner = KE.Utils.buffer(self.save, self, 500);
        self._init();
    }

    var //editingKeyCodes = { /*Backspace*/ 8:1, /*Delete*/ 46:1 },
        modifierKeyCodes = { /*Shift*/ 16:1, /*Ctrl*/ 17:1, /*Alt*/ 18:1 },
        // Arrows: L, T, R, B
        navigationKeyCodes = { 37:1, 38:1, 39:1, 40:1,33:1,34:1 },
        zKeyCode = 90,
        yKeyCode = 89;


    S.augment(UndoManager, {
        /**
         * 监控键盘输入，buffer处理
         */
        _keyMonitor:function() {
            var self = this,
                editor = self.editor,
                doc = editor.document;
            //也要监控源码下的按键，便于实时统计
            Event.on([doc,editor.textarea], "keydown", function(ev) {
                var keycode = ev.keyCode;
                if (keycode in navigationKeyCodes
                    || keycode in modifierKeyCodes
                    )
                    return;
                //ctrl+z，撤销
                if (keycode === zKeyCode && (ev.ctrlKey || ev.metaKey)) {
                    editor.fire("restore", {d:-1});
                    ev.halt();
                    return;
                }
                //ctrl+y，重做
                if (keycode === yKeyCode && (ev.ctrlKey || ev.metaKey)) {
                    editor.fire("restore", {d:1});
                    ev.halt();
                    return;
                }
                editor.fire("save", {buffer:1});
            });
        },

        _init:function() {
            var self = this,
                editor = self.editor;
            //外部通过editor触发save|restore,管理器捕获事件处理
            editor.on("save", function(ev) {
                //代码模式下不和可视模式下混在一起
                if (editor.getMode() != KE.WYSIWYG_MODE) return;
                if (ev.buffer) {
                    //键盘操作需要缓存
                    self.bufferRunner();
                } else {
                    //其他立即save
                    self.save();
                }
            });
            editor.on("restore", function(ev) {
                //代码模式下不和可视模式下混在一起
                if (editor.getMode() != KE.WYSIWYG_MODE) return;
                self.restore(ev);
            });

            self._keyMonitor();
            //先save一下,why??
            //初始状态保存，异步，必须等use中已经 set 了编辑器中初始代码
            //必须在从 textarea 复制到编辑区域前，use所有plugin，为了过滤插件生效
            //而这段代码必须在从 textarea 复制到编辑区域后运行，所以设个延迟
            setTimeout(function() {
                self.save();
            }, 0);
        },

        /**
         * 保存历史
         */
        save:function() {
            var self = this,
                history = self.history,
                index = self.index;
            //debugger
            //前面的历史抛弃
            if (history.length > index + 1)
                history.splice(index + 1, history.length - index - 1);

            var editor = self.editor,
                last = history[history.length - 1],
                current = new Snapshot(editor);

            if (!last || !last.equals(current)) {
                if (history.length === LIMIT) {
                    history.shift();
                }
                history.push(current);
                self.index = index = history.length - 1;
                editor.fire("afterSave", {history:history,index:index});
            }
        },

        /**
         *
         * @param ev
         * ev.d ：1.向前撤销 ，-1.向后重做
         */
        restore:function(ev) {
            var d = ev.d,
                self = this,
                history = self.history,
                editor = self.editor,
                snapshot = history[self.index + d];
            if (snapshot) {
                editor._setRawData(snapshot.contents);
                if (snapshot.bookmarks)
                    editor.getSelection().selectBookmarks(snapshot.bookmarks);
                else if (UA['ie']) {
                    // IE BUG: If I don't set the selection to *somewhere* after setting
                    // document contents, then IE would create an empty paragraph at the bottom
                    // the next time the document is modified.
                    var $range = editor.document.body.createTextRange();
                    $range.collapse(true);
                    $range.select();
                }
                var selection = editor.getSelection();
                //将当前光标，选择区域滚动到可视区域
                if (selection) {
                    selection.scrollIntoView();
                }
                self.index += d;
                editor.fire("afterRestore", {
                    history:history,
                    index:self.index
                });
                editor.notifySelectionChange();
            }
        }
    });
    KE.UndoManager = UndoManager;
},{
    attach:false
});
