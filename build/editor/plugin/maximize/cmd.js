/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:19
*/
/**
 * Add maximizeWindow/restoreWindow to Editor.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/maximize/cmd", function (S, Editor) {
    var UA = S.UA,
        ie = UA['ie'],
        doc = document,
        Node = S.Node,
        Event = S.Event,
        DOM = S.DOM,
        iframe,
        MAXIMIZE_TOOLBAR_CLASS = "editor-toolbar-padding",
        init = function () {
            if (!iframe) {
                iframe = new Node("<" + "iframe " +
                    " style='" +
                    "position:absolute;" +
                    "top:-9999px;" +
                    "left:-9999px;" +
                    "'" +
                    " frameborder='0'>").prependTo(doc.body, undefined);
            }
        };

    function MaximizeCmd(editor) {
        this.editor = editor;
    }

    S.augment(MaximizeCmd, {

        restoreWindow: function () {
            var self = this,
                editor = self.editor;

            if (editor.fire("beforeRestoreWindow") === false) {
                return;
            }

            if (self._resize) {
                Event.remove(window, "resize", self._resize);
                self._resize.stop();
                self._resize = 0;
            } else {
                return;
            }

            //body overflow 变化也会引起 resize 变化！！！！先去除
            self._saveEditorStatus();
            self._restoreState();

            //firefox 必须timeout
            setTimeout(function () {
                self._restoreEditorStatus();
                editor.notifySelectionChange();
                editor.fire("afterRestoreWindow");
            }, 30);
        },

        /**
         * 从内存恢复最大化前的外围状态信息到编辑器实际动作，
         * 包括编辑器位置以及周围元素，浏览器窗口
         */
        _restoreState: function () {
            var self = this,
                editor = self.editor,
                textareaEl = editor.get("textarea"),
            //恢复父节点的position原状态 bugfix:最大化被父元素限制
                _savedParents = self._savedParents;
            if (_savedParents) {
                for (var i = 0; i < _savedParents.length; i++) {
                    var po = _savedParents[i];
                    po.el.css("position", po.position);
                }
                self._savedParents = null;
            }
            //如果没有失去焦点，重新获得当前选取元素
            //self._saveEditorStatus();
            textareaEl.parent().css({
                height: self.iframeHeight
            });
            textareaEl.css({
                height: self.iframeHeight
            });
            DOM.css(doc.body, {
                width: "",
                height: "",
                overflow: ""
            });
            //documentElement 设置宽高，ie崩溃
            doc.documentElement.style.overflow = "";

            var editorElStyle = editor.get("el")[0].style;
            editorElStyle.position = "static";
            editorElStyle.width = self.editorElWidth;

            /*
             iframe 中时假死！
             editor.editorEl.css({
             position:"static",
             width:self.editorElWidth
             });*/

            iframe.css({
                left: "-99999px",
                top: "-99999px"
            });

            window.scrollTo(self.scrollLeft, self.scrollTop);

            if (ie < 8) {
                editor.get("toolBarEl").removeClass(
                    editor.get('prefixCls') + MAXIMIZE_TOOLBAR_CLASS, undefined);
            }
        },
        /**
         * 保存最大化前的外围状态信息到内存，
         * 包括编辑器位置以及周围元素，浏览器窗口
         */
        _saveSate: function () {
            var self = this,
                editor = self.editor,
                _savedParents = [],
                editorEl = editor.get("el");
            self.iframeHeight = editor.get("textarea").parent().style("height");
            self.editorElWidth = editorEl.style("width");
            //主窗口滚动条也要保存哦
            self.scrollLeft = DOM.scrollLeft();
            self.scrollTop = DOM.scrollTop();
            window.scrollTo(0, 0);

            //将父节点的position都改成static并保存原状态 bugfix:最大化被父元素限制
            var p = editorEl.parent();

            while (p) {
                var pre = p.css("position");
                if (pre != "static") {
                    _savedParents.push({
                        el: p,
                        position: pre
                    });
                    p.css("position", "static");
                }
                p = p.parent();
            }
            self._savedParents = _savedParents;

            //ie6,7 图标到了窗口边界，不可点击，给个padding
            if (ie < 8) {
                editor.get("toolBarEl").addClass(
                    editor.get('prefixCls') + MAXIMIZE_TOOLBAR_CLASS, undefined);
            }
        },

        /**
         *  编辑器自身核心状态保存，每次最大化最小化都要save,restore，
         *  firefox修正，iframe layout变化时，range丢了
         */
        _saveEditorStatus: function () {
            var self = this,
                editor = self.editor;
            self.savedRanges = null;
            if (!UA['gecko'] || !editor.__iframeFocus) {
                return;
            }
            var sel = editor.getSelection();
            //firefox 光标丢失bug,位置丢失，所以这里保存下
            self.savedRanges = sel && sel.getRanges();
        },

        /**
         * 编辑器自身核心状态恢复，每次最大化最小化都要save,restore，
         * 维持编辑器核心状态不变
         */
        _restoreEditorStatus: function () {
            var self = this,
                editor = self.editor,
                sel = editor.getSelection(),
                savedRanges = self.savedRanges;

            //firefox焦点bug

            //原来是聚焦，现在刷新designmode
            //firefox 先失去焦点才行
            if (UA['gecko']) {
                editor.activateGecko();
            }

            if (savedRanges && sel) {
                sel.selectRanges(savedRanges);
            }

            //firefox 有焦点时才重新聚焦
            if (editor.__iframeFocus && sel) {
                var element = sel.getStartElement();
                //使用原生不行的，会使主窗口滚动
                //element[0] && element[0].scrollIntoView(true);
                element && element.scrollIntoView(undefined,{
                    alignWithTop:false,
                    allowHorizontalScroll:true,
                    onlyScrollIfNeeded:true
                });
            }
        },

        /**
         * 将编辑器最大化-实际动作
         * 必须做两次，何解？？
         */
        _maximize: function (stop) {
            var self = this,
                editor = self.editor,
                editorEl = editor.get("el"),
                viewportHeight = DOM.viewportHeight(),
                viewportWidth = DOM.viewportWidth(),
                textareaEl = editor.get("textarea"),
                statusHeight = editor.get("statusBarEl") ?
                    editor.get("statusBarEl")[0].offsetHeight : 0,
                toolHeight = editor.get("toolBarEl")[0].offsetHeight;

            if (!ie) {
                DOM.css(doc.body, {
                    width: 0,
                    height: 0,
                    overflow: "hidden"
                });
            } else {
                doc.body.style.overflow = "hidden";
            }
            doc.documentElement.style.overflow = "hidden";

            editorEl.css({
                position: "absolute",
                zIndex: Editor.baseZIndex(Editor.zIndexManager.MAXIMIZE),
                width: viewportWidth + "px"
            });
            iframe.css({
                zIndex: Editor.baseZIndex(Editor.zIndexManager.MAXIMIZE - 5),
                height: viewportHeight + "px",
                width: viewportWidth + "px"
            });
            editorEl.offset({
                left: 0,
                top: 0
            });
            iframe.css({
                left: 0,
                top: 0
            });

            textareaEl.parent().css({
                height: (viewportHeight - statusHeight - toolHeight ) + "px"
            });


            textareaEl.css({
                height: (viewportHeight - statusHeight - toolHeight ) + "px"
            });

            if (stop !== true) {
                arguments.callee.call(self, true);
            }
        },
        _real: function () {
            var self = this,
                editor = self.editor;
            if (self._resize) {
                return;
            }

            self._saveEditorStatus();
            self._saveSate();
            self._maximize();
            if (!self._resize) {
                self._resize = S.buffer(function () {
                    self._maximize();
                    editor.fire("afterMaximizeWindow");
                }, 100);
            }

            Event.on(window, "resize", self._resize);

            setTimeout(function () {
                self._restoreEditorStatus();
                editor.notifySelectionChange();
                editor.fire("afterMaximizeWindow");
            }, 30);
        },
        maximizeWindow: function () {
            var self = this,
                editor = self.editor;
            if (editor.fire("beforeMaximizeWindow") === false) {
                return;
            }
            init();
            self._real();
        },
        destroy: function () {
            var self = this;
            if (self._resize) {
                Event.remove(window, "resize", self._resize);
                self._resize.stop();
                self._resize = 0;
            }
        }
    });

    return {
        init: function (editor) {

            if (!editor.hasCommand("maximizeWindow")) {

                var maximizeCmd = new MaximizeCmd(editor);

                editor.addCommand("maximizeWindow", {
                    exec: function () {
                        maximizeCmd.maximizeWindow();
                    }
                });

                editor.addCommand("restoreWindow", {
                    exec: function () {
                        maximizeCmd.restoreWindow();
                    }
                });

            }

        }
    };
}, {
    requires: ['editor']
});
