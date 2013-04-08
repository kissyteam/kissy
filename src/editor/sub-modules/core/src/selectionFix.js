/**
 * ie selection fix.
 * modified from ckeditor core
 * @author yiminghe@gmail.com
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.add("editor/core/selectionFix", function (S, Editor) {

    var TRUE = true,
        FALSE = false,
        NULL = null,
        UA = S.UA,
        Event = S.Event,
        DOM = S.DOM,
        Node = S.Node,
        KES = Editor.SELECTION;

    /**
     * 2012-01-11 借鉴 tinymce
     * 解决：ie 没有滚动条时，点击窗口空白区域，光标不能正确定位
     */
    function fixCursorForIE(editor) {
        var started,
            win = editor.get("window")[0],
            doc = editor.get("document")[0],
            startRng;

        // Return range from point or NULL if it failed
        function rngFromPoint(x, y) {
            var rng = doc.body.createTextRange();

            try {
                rng['moveToPoint'](x, y);
            } catch (ex) {
                // IE sometimes throws and exception, so lets just ignore it
                rng = NULL;
            }

            return rng;
        }

        // Removes listeners
        function endSelection() {
            var rng = doc.selection.createRange();

            // If the range is collapsed then use the last start range
            if (startRng &&
                !rng.item && rng.compareEndPoints('StartToEnd', rng) === 0) {
                startRng.select();
            }
            Event.remove(doc, 'mouseup', endSelection);
            Event.remove(doc, 'mousemove', selectionChange);
            startRng = started = 0;
        }

        // Fires while the selection is changing
        function selectionChange(e) {
            var pointRng;

            // Check if the button is down or not
            if (e.button) {
                // Create range from mouse position
                pointRng = rngFromPoint(e.pageX, e.pageY);

                if (pointRng) {
                    // Check if pointRange is before/after selection then change the endPoint
                    if (pointRng.compareEndPoints('StartToStart', startRng) > 0)
                        pointRng.setEndPoint('StartToStart', startRng);
                    else
                        pointRng.setEndPoint('EndToEnd', startRng);

                    pointRng.select();
                }
            } else {
                endSelection();
            }
        }

        // ie 点击空白处光标不能定位到末尾
        // IE has an issue where you can't select/move the caret by clicking outside the body if the document is in standards mode
        Event.on(doc, "mousedown contextmenu", function (e) {
            var html = doc.documentElement;
            if (e.target === html) {
                if (started) {
                    endSelection();
                }
                // Detect vertical scrollbar, since IE will fire a mousedown on the scrollbar and have target set as HTML
                if (html.scrollHeight > html.clientHeight) {
                    return;
                }
                // S.log("fix ie cursor");
                started = 1;
                // Setup start position
                startRng = rngFromPoint(e.pageX, e.pageY);
                if (startRng) {
                    // Listen for selection change events
                    Event.on(doc, 'mouseup', endSelection);
                    Event.on(doc, 'mousemove', selectionChange);

                    win.focus();
                    startRng.select();
                }
            }
        });
    }


    function fixSelectionForIEWhenDocReady(editor) {
        var doc = editor.get("document")[0],
            body = new Node(doc.body),
            html = new Node(doc.documentElement);
        //ie 焦点管理不行 (ie9 也不行) ,编辑器 iframe 失去焦点，选择区域/光标位置也丢失了
        //ie中事件都是同步，focus();xx(); 会立即触发事件处理函数，然后再运行xx();

        // In IE6/7 the blinking cursor appears, but contents are
        // not editable. (#5634)
        if (//ie8 的 7 兼容模式
            Editor.Utils.ieEngine < 8) {
            // The 'click' event is not fired when clicking the
            // scrollbars, so we can use it to check whether
            // the empty space following <body> has been clicked.
            html.on('click', function (evt) {
                var t = new Node(evt.target);
                if (t.nodeName() === "html") {
                    editor.getSelection().getNative().createRange().select();
                }
            });
        }


        // Other browsers don't loose the selection if the
        // editor document loose the focus. In IE, we don't
        // have support for it, so we reproduce it here, other
        // than firing the selection change event.

        var savedRange,
            saveEnabled,
        // 2010-10-08 import from ckeditor 3.4.1
        // 点击(mousedown-focus-mouseup)，不保留原有的 selection
            restoreEnabled = TRUE;

        // Listening on document element ensures that
        // scrollbar is included. (#5280)
        // or body.on('mousedown')
        html.on('mousedown', function () {
            // Lock restore selection now, as we have
            // a followed 'click' event which introduce
            // new selection. (#5735)
            //点击时不要恢复了，点击就意味着原来的选择区域作废
            restoreEnabled = FALSE;
        });

        html.on('mouseup', function () {
            restoreEnabled = TRUE;
        });

        //事件顺序
        // 1.body mousedown
        // 2.html mousedown
        // body  blur
        // window blur
        // 3.body focusin
        // 4.body focus
        // 5.window focus
        // 6.body mouseup
        // 7.body mousedown
        // 8.body click
        // 9.html click
        // 10.doc click

        // "onfocusin" is fired before "onfocus". It makes it
        // possible to restore the selection before click
        // events get executed.
        body.on('focusin', function (evt) {
            var t = new Node(evt.target);
            // If there are elements with layout they fire this event but
            // it must be ignored to allow edit its contents #4682
            if (t.nodeName() != 'body')
                return;

            // If we have saved a range, restore it at this
            // point.
            if (savedRange) {
                // Well not break because of this.
                try {
                    // S.log("body focusin");
                    // 如果不是 mousedown 引起的 focus
                    if (restoreEnabled) {
                        savedRange.select();
                    }
                }
                catch (e) {
                }

                savedRange = NULL;
            }
        });

        body.on('focus', function () {
            // S.log("body focus");
            // Enable selections to be saved.
            saveEnabled = TRUE;
            saveSelection();
        });

        body.on('beforedeactivate', function (evt) {
            // Ignore this event if it's caused by focus switch between
            // internal editable control type elements, e.g. layouted paragraph. (#4682)
            if (evt.relatedTarget)
                return;

            // S.log("beforedeactivate");
            // Disable selections from being saved.
            saveEnabled = FALSE;
            restoreEnabled = TRUE;
        });

        // IE before version 8 will leave cursor blinking inside the document after
        // editor blurred unless we clean up the selection. (#4716)
// http://yiminghe.github.com/lite-ext/playground/iframe_selection_ie/demo.html
// 需要第一个 hack
//            editor.on('blur', function () {
//                // 把选择区域与光标清除
//                // Try/Catch to avoid errors if the editor is hidden. (#6375)
//                // S.log("blur");
//                try {
//                    var el = document.documentElement || document.body;
//                    var top = el.scrollTop, left = el.scrollLeft;
//                    doc && doc.selection.empty();
//                    //in case if window scroll to editor
//                    el.scrollTop = top;
//                    el.scrollLeft = left;
//                } catch (e) {
//                }
//            });

        // IE fires the "selectionchange" event when clicking
        // inside a selection. We don't want to capture that.
        body.on('mousedown', function () {
            // S.log("body mousedown");
            saveEnabled = FALSE;
        });
        body.on('mouseup', function () {
            // S.log("body mouseup");
            saveEnabled = TRUE;
            setTimeout(function () {
                saveSelection(TRUE);
            }, 0);
        });

        /**
         *
         * @param {Boolean=} testIt
         */
        function saveSelection(testIt) {
            // S.log("saveSelection");
            if (saveEnabled) {
                var sel = editor.getSelection(),
                    type = sel && sel.getType(),
                    nativeSel = sel && doc.selection;

                // There is a very specific case, when clicking
                // inside a text selection. In that case, the
                // selection collapses at the clicking point,
                // but the selection object remains in an
                // unknown state, making createRange return a
                // range at the very start of the document. In
                // such situation we have to test the range, to
                // be sure it's valid.
                // 右键时，若前一个操作选中，则该次一直为None
                if (testIt && nativeSel && type == KES.SELECTION_NONE) {
                    // The "InsertImage" command can be used to
                    // test whether the selection is good or not.
                    // If not, it's enough to give some time to
                    // IE to put things in order for us.
                    if (!doc['queryCommandEnabled']('InsertImage')) {
                        setTimeout(function () {
                            //S.log("retry");
                            saveSelection(TRUE);
                        }, 50);
                        return;
                    }
                }

                // Avoid saving selection from within text input. (#5747)
                var parentTag;
                if (nativeSel && nativeSel.type && nativeSel.type != 'Control'
                    && ( parentTag = nativeSel.createRange() )
                    && ( parentTag = parentTag.parentElement() )
                    && ( parentTag = parentTag.nodeName )
                    && parentTag.toLowerCase() in { input: 1, textarea: 1 }) {
                    return;
                }
                savedRange = nativeSel && sel.getRanges()[ 0 ];
                // S.log("monitor ing...");
                // 同时检测，不同则 editor 触发 selectionChange
                editor.checkSelectionChange();
            }
        }

        body.on('keydown', function () {
            saveEnabled = FALSE;
        });
        body.on('keyup', function () {
            saveEnabled = TRUE;
            setTimeout(function () {
                saveSelection();
            }, 0);
        });
    }

    function fireSelectionChangeForNonIE(editor) {
        var doc = editor.get("document")[0];
        // In other browsers, we make the selection change
        // check based on other events, like clicks or keys
        // press.
        function monitor() {
            // S.log("fireSelectionChangeForNonIE in selection/index");
            editor.checkSelectionChange();
        }

        Event.on(doc, 'mouseup keyup ' +
            // ios does not fire mouseup/keyup ....
            // http://stackoverflow.com/questions/8442158/selection-change-event-in-contenteditable
            // https://www.w3.org/Bugs/Public/show_bug.cgi?id=13952
            // https://bugzilla.mozilla.org/show_bug.cgi?id=571294
            // firefox does not has selectionchange
            'selectionchange', monitor);
    }

    /**
     * 监控选择区域变化
     * @param editor
     */
    function monitorSelectionChange(editor) {
        // Matching an empty paragraph at the end of document.
        // 注释也要排除掉
        var emptyParagraphRegexp =
            /\s*<(p|div|address|h\d|center)[^>]*>\s*(?:<br[^>]*>|&nbsp;|\u00A0|&#160;|(<!--[\s\S]*?-->))?\s*(:?<\/\1>)?(?=\s*$|<\/body>)/gi;


        function isBlankParagraph(block) {
            return block._4e_outerHtml().match(emptyParagraphRegexp);
        }

        var isNotWhitespace = Editor.Walker.whitespaces(TRUE),
            isNotBookmark = Editor.Walker.bookmark(FALSE, TRUE);
        //除去注释和空格的下一个有效元素
        var nextValidEl = function (node) {
            return isNotWhitespace(node) && node.nodeType != 8
        };

        // 光标可以不能放在里面
        function cannotCursorPlaced(element) {
            var dtd = Editor.XHTML_DTD;
            return element._4e_isBlockBoundary() && dtd.$empty[ element.nodeName() ];
        }

        function isNotEmpty(node) {
            return isNotWhitespace(node) && isNotBookmark(node);
        }

        /**
         * 如果选择了body下面的直接inline元素，则新建p
         */
        editor.on("selectionChange", function (ev) {
            // S.log("monitor selectionChange in selection/index.js");
            var path = ev.path,
                body = new Node(editor.get("document")[0].body),
                selection = ev.selection,
                range = selection && selection.getRanges()[0],
                blockLimit = path.blockLimit;

            // Fix gecko link bug, when a link is placed at the end of block elements there is
            // no way to move the caret behind the link. This fix adds a bogus br element after the link
            // kissy-editor #12
            if (UA['gecko']) {
                var pathBlock = path.block || path.blockLimit,
                    lastNode = pathBlock && pathBlock.last(isNotEmpty);
                if (pathBlock
                    // style as block
                    && pathBlock._4e_isBlockBoundary()
                    // lastNode is not block
                    && !( lastNode && lastNode[0].nodeType == 1 && lastNode._4e_isBlockBoundary() )
                    // not pre
                    && pathBlock.nodeName() != 'pre'
                    // does not have bogus
                    && !pathBlock._4e_getBogus()) {
                    pathBlock._4e_appendBogus();
                }
            }

            if (!range ||
                !range.collapsed ||
                path.block) {
                return;
            }

            // 裸的光标出现在 body 里面
            if (blockLimit.nodeName() == "body") {
                var fixedBlock = range.fixBlock(TRUE, "p");
                if (fixedBlock &&
                    // https://dev.ckeditor.com/ticket/8550
                    // 新加的 p 在 body 最后，那么不要删除
                    // <table><td/></table>^ => <table><td/></table><p>^</p>
                    fixedBlock[0] != body[0].lastChild) {
                    // firefox选择区域变化时自动添加空行，不要出现裸的text
                    if (isBlankParagraph(fixedBlock)) {
                        var element = fixedBlock.next(nextValidEl, 1);
                        if (element &&
                            element[0].nodeType == DOM.NodeType.ELEMENT_NODE &&
                            !cannotCursorPlaced[ element ]) {
                            range.moveToElementEditablePosition(element);
                            fixedBlock._4e_remove();
                        } else {
                            element = fixedBlock.prev(nextValidEl, 1);
                            if (element &&
                                element[0].nodeType == DOM.NodeType.ELEMENT_NODE &&
                                !cannotCursorPlaced[element]) {
                                range.moveToElementEditablePosition(element,
                                    // 空行的话还是要移到开头的
                                    isBlankParagraph(element) ? FALSE : TRUE);
                                fixedBlock._4e_remove();
                            } else {
                                // 否则的话，就在文章中间添加空行了！
                            }
                        }
                    }
                }
                range.select();
                // 选择区域变了，通知其他插件更新状态
                editor.notifySelectionChange();
            }

            /**
             *  当 table pre div 是 body 最后一个元素时，鼠标没法移到后面添加内容了
             *  解决：增加新的 p
             */
            var doc = editor.get("document")[0],
                lastRange = new Editor.Range(doc),
                lastPath, editBlock;
            // 最后的编辑地方
            lastRange
                .moveToElementEditablePosition(body,
                TRUE);
            lastPath = new Editor.ElementPath(lastRange.startContainer);
            // 不位于 <body><p>^</p></body>
            if (lastPath.blockLimit.nodeName() !== 'body') {
                editBlock = new Node(doc.createElement('p')).appendTo(body);
                if (!UA['ie']) {
                    editBlock._4e_appendBogus();
                }
            }
        });
    }

    return {
        init: function (editor) {
            editor.docReady(function () {
                // S.log("editor docReady for fix selection");
                if (UA.ie) {
                    fixCursorForIE(editor);
                    fixSelectionForIEWhenDocReady(editor);
                } else {
                    fireSelectionChangeForNonIE(editor);
                }
            });
            // 1. 选择区域变化时各个浏览器的奇怪修复
            // 2. 触发 selectionChange 事件
            monitorSelectionChange(editor);
        }
    };
}, {
    requires: ['./base', './selection']
});
