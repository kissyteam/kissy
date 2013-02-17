/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
/**
 * insert image for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/image/index", function (S, Editor, Button, Bubble, ContextMenu, DialogLoader) {

    var UA = S.UA,
        Node = KISSY.NodeList,
        $ = S.all,
        Event = S.Event,
        checkImg = function (node) {
            node = $(node);
            if (node.nodeName() === 'img' &&
                // prevent collision with fake objects
                (!/(^|\s+)ke_/.test(node[0].className))) {
                return node;
            }
        },
        tipHtml = '<a class="{prefixCls}editor-bubble-url" ' +
            'target="_blank" href="#">在新窗口查看</a>  |  '
            + '<a class="{prefixCls}editor-bubble-link ' +
            '{prefixCls}editor-bubble-change" href="#">编辑</a>  |  '
            + '<a class="{prefixCls}editor-bubble-link ' +
            '{prefixCls}editor-bubble-remove" href="#">删除</a>';


    function ImagePlugin(config) {
        this.config = config || {};
    }

    S.augment(ImagePlugin, {
        pluginRenderUI: function (editor) {

            var self = this;

            var prefixCls = editor.get('prefixCls');

            function showImageEditor(selectedEl) {
                DialogLoader.useDialog(editor, "image",
                    self.config,
                    selectedEl);
            }

            // 重新采用form提交，不采用flash，国产浏览器很多问题
            editor.addButton("image", {
                tooltip: "插入图片",
                listeners: {
                    click: function () {
                        showImageEditor(null);

                    }
                },
                mode: Editor.WYSIWYG_MODE
            });

            var handlers = [
                {
                    content: "图片属性",
                    fn: function () {
                        var img = checkImg(this.get("editorSelectedEl"));
                        if (img) {
                            // make editor restore focus
                            this.hide();
                            showImageEditor($(img));
                        }
                    }
                },
                {
                    content: "插入新行",
                    fn: function () {
                        this.hide();
                        var doc = editor.get("document")[0],
                            p = new Node(doc.createElement("p"));
                        if (!UA['ie']) {
                            p._4e_appendBogus(undefined);
                        }
                        var r = new Editor.Range(doc);
                        r.setStartAfter(this.get("editorSelectedEl"));
                        r.select();
                        editor.insertElement(p);
                        r.moveToElementEditablePosition(p, 1);
                        r.select();
                    }
                }
            ];

            var children = [];

            S.each(handlers, function (h) {
                children.push({
                    content: h.content
                })
            });

            editor.addContextMenu("image", checkImg, {
                width: 120,
                children: children,
                listeners: {
                    click: function (e) {
                        var self = this, content = e.target.get('content');
                        S.each(handlers, function (h) {
                            if (h.content == content) {
                                h.fn.call(self);
                            }
                        });

                    }
                }
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

            editor.addBubble("image", checkImg, {
                listeners: {
                    afterRenderUI: function () {
                        var bubble = this,
                            el = bubble.get("contentEl");
                        el.html(S.substitute(tipHtml, {
                            prefixCls: prefixCls
                        }));
                        var tipUrlEl = el.one("." + prefixCls + "editor-bubble-url"),
                            tipChangeEl = el.one("." + prefixCls + "editor-bubble-change"),
                            tipRemoveEl = el.one("." + prefixCls + "editor-bubble-remove");
                        Editor.Utils.preventFocus(el);
                        tipChangeEl.on("click", function (ev) {
                            showImageEditor(bubble.get("editorSelectedEl"));
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
                            bubble.get("editorSelectedEl").remove();
                            bubble.hide();
                            editor.notifySelectionChange();
                            ev.halt();
                        });
                        bubble.on("show", function () {
                            var a = bubble.get("editorSelectedEl");
                            if (a) {
                                var src = a.attr("_ke_saved_src") || a.attr("src");
                                tipUrlEl.attr("href", src);
                            }
                        });
                    }
                }
            });
        }
    });

    return ImagePlugin;
}, {
    requires: ['editor',
        '../button/',
        '../bubble/',
        '../contextmenu/',
        '../dialog-loader/']
});
