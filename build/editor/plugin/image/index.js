/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 31 22:01
*/
/**
 * insert image for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/image/index", function (S, Editor, Button, BubbleView, ContextMenu, DialogLoader) {

    var UA = S.UA,
        Node = S.Node,
        $ = S.all,
        Event = S.Event,
        checkImg = function (node) {
            node = $(node);
            return node.nodeName(node) === 'img' &&
                // prevent collision with fake objects
                (!/(^|\s+)ke_/.test(node[0].className)) &&
                node;
        },
        tipHtml = '<a class="ks-editor-bubbleview-url" target="_blank" href="#">在新窗口查看</a>  |  '
            + '<a class="ks-editor-bubbleview-link ks-editor-bubbleview-change" href="#">编辑</a>  |  '
            + '<a class="ks-editor-bubbleview-link ks-editor-bubbleview-remove" href="#">删除</a>'
            + '';

    return {
        init:function (editor) {

            function showImageEditor(selectedEl) {
                DialogLoader.useDialog(editor, "image/dialog", selectedEl);
            }

            // 重新采用form提交，不采用flash，国产浏览器很多问题
            editor.addButton({
                contentCls:"ks-editor-toolbar-image",
                title:"插入图片",
                mode:Editor.WYSIWYG_MODE
            }, {
                offClick:function () {
                    showImageEditor(null);
                }
            });

            var handlers = {
                "图片属性":function () {
                    var img = checkImg(this.selectedEl);
                    if (img) {
                        showImageEditor($(img));
                    }
                },
                "插入新行":function () {
                    var doc = editor.get("document")[0],
                        p = new Node(doc.createElement("p"));
                    if (!UA['ie']) {
                        p._4e_appendBogus(undefined);
                    }
                    var r = new Editor.Range(doc);
                    r.setStartAfter(this.selectedEl);
                    r.select();
                    editor.insertElement(p);
                    r.moveToElementEditablePosition(p, 1);
                    r.select();
                }
            };

            ContextMenu.register({
                editor:editor,
                filter:checkImg,
                width:"120px",
                handlers:handlers
            });

            editor.docReady(function () {
                Event.on(editor.get("document")[0], "dblclick", function (ev) {
                    ev.halt();
                    var t = $(ev.target);
                    if (checkImg(t)) {
                        showImageEditor(t);
                    }
                });
            });

            BubbleView.register({
                editor:editor,
                filter:checkImg,
                init:function () {
                    var bubble = this,
                        el = bubble.get("contentEl");
                    el.html(tipHtml);
                    var tipUrlEl = el.one(".ks-editor-bubbleview-url"),
                        tipChangeEl = el.one(".ks-editor-bubbleview-change"),
                        tipRemoveEl = el.one(".ks-editor-bubbleview-remove");
                    Editor.Utils.preventFocus(el);
                    tipChangeEl.on("click", function (ev) {
                        showImageEditor(bubble.selectedEl);
                        ev.halt();
                    });
                    tipRemoveEl.on("click", function (ev) {
                        if (UA['webkit']) {
                            var r = editor.getSelection().getRanges();
                            if (r && r[0]) {
                                r[0].collapse();
                                r[0].select();
                            }
                        }
                        bubble.selectedEl.remove();
                        bubble.hide();
                        editor.notifySelectionChange();
                        ev.halt();
                    });
                    bubble.on("show", function () {
                        var a = bubble.selectedEl;
                        if (a) {
                            var src = a.attr("_ke_saved_src") || a.attr("src");
                            tipUrlEl.attr("href", src);
                        }
                    });
                }
            });
        }
    };
}, {
    requires:['editor',
        '../button/',
        '../bubbleview/',
        '../contextmenu/',
        '../dialogLoader/']
});
