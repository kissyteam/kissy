/**
 * maximize functionality
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("maximize/support", function () {

    var S = KISSY,
        KE = S.Editor,
        UA = S.UA,
        ie = UA['ie'],
        Node = S.Node,
        Event = S.Event,
        DOM = S.DOM,
        iframe,
        MAXIMIZE_CLASS = "ke-toolbar-maximize",
        RESTORE_CLASS = "ke-toolbar-restore",
        MAXIMIZE_TIP = "全屏",
        MAXIMIZE_TOOLBAR_CLASS = "ke-toolbar-padding",
        RESTORE_TIP = "取消全屏",
        Maximize = {},
        init = function () {
            if (!iframe) {
                iframe = new Node("<" + "iframe " +
                    " class='ke-maximize-shim'" +
                    " style='" +
                    "position:absolute;" +
                    "top:-9999px;" +
                    "left:-9999px;" +
                    "'" +
                    " frameborder='0'>").prependTo(document.body);
            }
        };

    DOM.addStyleSheet(".ke-toolbar-padding {" +
        "padding:5px;" +
        "}",
        "ke-maximize");

    S.mix(Maximize, {

        onClick:function () {
            var self = this,
                editor = self.editor;

            if (editor.fire("beforeRestoreWindow") === false) {
                return;
            }

            if (self._resize) {
                Event.remove(window, "resize", self._resize);
                self._resize = 0;
            } else {
                return;
            }

            //body overflow 变化也会引起 resize 变化！！！！先去除
            self.call("_saveEditorStatus");
            self.call("_restoreState");
            self.btn.boff();

            //firefox 必须timeout
            setTimeout(function () {
                self.call("_restoreEditorStatus");
                editor.notifySelectionChange();
                editor.fire("restoreWindow");
            }, 30);
        },

        /**
         * 从内存恢复最大化前的外围状态信息到编辑器实际动作，
         * 包括编辑器位置以及周围元素，浏览器窗口
         */
        _restoreState:function () {
            var self = this,
                doc = document,
                editor = self.editor,
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
            editor.wrap.css({
                height:self.iframeHeight
            });
            DOM.css(doc.body, {
                width:"",
                height:"",
                overflow:""
            });
            //documentElement 设置宽高，ie崩溃
            doc.documentElement.style.overflow = "";

            var editorWrapStyle = editor.editorWrap[0].style;
            editorWrapStyle.position = "static";
            editorWrapStyle.width = self.editorWrapWidth;

            /*
             iframe 中时假死！
             editor.editorWrap.css({
             position:"static",
             width:self.editorWrapWidth
             });*/

            iframe.css({
                left:"-99999px",
                top:"-99999px"
            });

            window.scrollTo(self.scrollLeft, self.scrollTop);
            var bel = self.btn.get("el");

            bel.one("span")
                .removeClass(RESTORE_CLASS)
                .addClass(MAXIMIZE_CLASS)
                .attr("title", MAXIMIZE_TIP);

            ie < 8 && self.editor.toolBarDiv.removeClass(MAXIMIZE_TOOLBAR_CLASS);
        },
        /**
         * 保存最大化前的外围状态信息到内存，
         * 包括编辑器位置以及周围元素，浏览器窗口
         */
        _saveSate:function () {
            var self = this,
                editor = self.editor,
                _savedParents = [],
                editorWrap = editor.editorWrap;
            self.iframeHeight = editor.wrap._4e_style("height");
            self.editorWrapWidth = editorWrap._4e_style("width");
            //主窗口滚动条也要保存哦
            self.scrollLeft = DOM.scrollLeft();
            self.scrollTop = DOM.scrollTop();
            window.scrollTo(0, 0);

            //将父节点的position都改成static并保存原状态 bugfix:最大化被父元素限制
            var p = editorWrap.parent();

            while (p) {
                var pre = p.css("position");
                if (pre != "static") {
                    _savedParents.push({
                        el:p,
                        position:pre
                    });
                    p.css("position", "static");
                }
                p = p.parent();
            }
            self._savedParents = _savedParents;
            var bel = self.btn.get("el");
            bel.one("span")
                .removeClass(MAXIMIZE_CLASS)
                .addClass(RESTORE_CLASS);
            bel.attr("title", RESTORE_TIP);
            //ie6,7 图标到了窗口边界，不可点击，给个padding
            ie < 8 && self.editor.toolBarDiv.addClass(MAXIMIZE_TOOLBAR_CLASS);
        },

        /**
         *  编辑器自身核心状态保存，每次最大化最小化都要save,restore，
         *  firefox修正，iframe layout变化时，range丢了
         */
        _saveEditorStatus:function () {
            var self = this,
                editor = self.editor;
            self.savedRanges = null;
            if (!UA['gecko'] || !editor.iframeFocus) return;
            var sel = editor.getSelection();
            //firefox 光标丢失bug,位置丢失，所以这里保存下
            self.savedRanges = sel && sel.getRanges();
        },

        /**
         * 编辑器自身核心状态恢复，每次最大化最小化都要save,restore，
         * 维持编辑器核心状态不变
         */
        _restoreEditorStatus:function () {
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
            if (editor.iframeFocus && sel) {
                var element = sel.getStartElement();
                //使用原生不行的，会使主窗口滚动
                //element[0] && element[0].scrollIntoView(true);
                element && element[0] && element._4e_scrollIntoView();
            }
        },

        /**
         * 将编辑器最大化-实际动作
         * 必须做两次，何解？？
         */
        _maximize:function (stop) {
            var self = this,
                doc = document,
                editor = self.editor,
                editorWrap = editor.editorWrap,
                viewportHeight = DOM.viewportHeight(),
                viewportWidth = DOM.viewportWidth(),
                statusHeight = editor.statusDiv ?
                    editor.statusDiv[0].offsetHeight : 0,
                toolHeight = editor.toolBarDiv[0].offsetHeight;

            if (!ie) {
                DOM.css(doc.body, {
                    width:0,
                    height:0,
                    overflow:"hidden"
                });
            } else {
                doc.body.style.overflow = "hidden";
            }
            doc.documentElement.style.overflow = "hidden";

            editorWrap.css({
                position:"absolute",
                zIndex:KE.baseZIndex(KE.zIndexManager.MAXIMIZE),
                width:viewportWidth + "px"
            });
            iframe.css({
                zIndex:KE.baseZIndex(KE.zIndexManager.MAXIMIZE - 5),
                height:viewportHeight + "px",
                width:viewportWidth + "px"
            });
            editorWrap.offset({
                left:0,
                top:0
            });
            iframe.css({
                left:0,
                top:0
            });

            editor.wrap.css({
                height:(viewportHeight - statusHeight - toolHeight ) + "px"
            });
            if (stop !== true) {
                arguments.callee.call(self, true);
            }
        },
        _real:function () {
            var self = this,
                editor = self.editor;
            if (self._resize) {
                return;
            }

            self.call("_saveEditorStatus");
            self.call("_saveSate");
            self.call("_maximize");
            if (!self._resize) {
                var cfgMaximize = self.cfg._maximize;
                self['_resize'] = KE.Utils.buffer(function () {
                    cfgMaximize.call(self);
                    editor.fire("maximizeWindow");
                }, self, 100);
            }

            Event.on(window, "resize", self._resize);

            self.btn.bon();
            setTimeout(function () {
                self.call("_restoreEditorStatus");
                editor.notifySelectionChange();
                editor.fire("maximizeWindow");
            }, 30);
        },
        offClick:function () {
            var self = this,
                editor = self.editor;
            if (editor.fire("beforeMaximizeWindow") === false) {
                return;
            }
            init();
            self.call("_real");
        },
        destroy:function () {
            var self = this;
            if (self._resize) {
                Event.remove(window, "resize", self._resize);
                self._resize = 0;
            }
        }
    });

    KE.Maximize = Maximize;
}, {
    attach:false
});