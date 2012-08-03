/**
 * insert image for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("image", function (editor) {
    editor.addPlugin("image", function () {
        var S = KISSY,
            KE = S.Editor,
            UA = S.UA,
            Node = S.Node,
            Event = S.Event,
            checkImg = function (node) {
                return node._4e_name() === 'img' &&
                    (!/(^|\s+)ke_/.test(node[0].className)) &&
                    node;
            },
            controls = {},
            addRes = KE.Utils.addRes,
            destroyRes = KE.Utils.destroyRes,
            tipHtml = ' '
                + '<a class="ke-bubbleview-url" target="_blank" href="#">在新窗口查看</a>  |  '
                + '<a class="ke-bubbleview-link ke-bubbleview-change" href="#">编辑</a>  |  '
                + '<a class="ke-bubbleview-link ke-bubbleview-remove" href="#">删除</a>'
                + '',

            //重新采用form提交，不采用flash，国产浏览器很多问题
            context = editor.addButton("image", {
                contentCls:"ke-toolbar-image",
                title:"插入图片",
                mode:KE.WYSIWYG_MODE,
                offClick:function () {
                    this.call("show");
                },
                _updateTip:function (tipurl, img) {
                    var src = img.attr("_ke_saved_src") || img.attr("src");
                    //tipurl.html(src);
                    tipurl.attr("href", src);
                },
                show:function (ev, _selectedEl) {
                    var editor = this.editor;
                    editor.showDialog("image/dialog", [_selectedEl]);
                }
            });

        addRes.call(controls, context, function () {
            editor.destroyDialog("image/dialog");
        });


        KE.use("contextmenu", function () {
            var contextMenu = {
                "图片属性":function (editor) {
                    var selection = editor.getSelection(),
                        startElement = selection && selection.getStartElement(),
                        img = checkImg(startElement);
                    if (img) {
                        context.call("show", null, img);
                    }
                },
                "插入新行":function (editor) {
                    var selection = editor.getSelection(),
                        startElement = selection && selection.getStartElement();
                    if (!startElement) {
                        return;
                    }
                    var doc = editor.document,
                        p = new Node(doc.createElement("p"));
                    if (!UA['ie']) {
                        p._4e_appendBogus();
                    }
                    var r = new KE.Range(doc);
                    r.setStartAfter(startElement);
                    r.select();
                    editor.insertElement(p);
                    r.moveToElementEditablePosition(p, 1);
                    r.select();
                }
            };


            var myContexts = {};
            for (var f in contextMenu) {
                if (contextMenu.hasOwnProperty(f)) {
                    (function (f) {
                        myContexts[f] = function () {
                            contextMenu[f](editor);
                        }
                    })(f);
                }
            }
            var menu = KE.ContextMenu.register({
                editor:editor,
                rules:[checkImg],
                width:"120px",
                funcs:myContexts
            });
            addRes.call(controls, menu);
        });


        function dblshow(ev) {
            var t = new Node(ev.target);
            ev.halt();
            if (checkImg(t)) {
                context.call("show", null, t);
            }
        }

        Event.on(editor.document, "dblclick", dblshow);

        addRes.call(controls, function () {
            Event.remove(editor.document,
                "dblclick",
                dblshow);
        });

        KE.use("bubbleview", function () {
            KE.BubbleView.register({
                pluginName:'image',
                pluginContext:context,
                editor:editor,
                func:checkImg,
                init:function () {
                    var bubble = this,
                        el = bubble.get("contentEl");
                    el.html(tipHtml);
                    var tipurl = el.one(".ke-bubbleview-url"),
                        tipchange = el.one(".ke-bubbleview-change"),
                        tipremove = el.one(".ke-bubbleview-remove");
                    //ie focus not lose
                    KE.Utils.preventFocus(el);
                    tipchange.on("click", function (ev) {
                        bubble._plugin.call("show", null, bubble._selectedEl);
                        ev.halt();
                    });
                    tipremove.on("click", function (ev) {
                        var flash = bubble._plugin;
                        if (UA['webkit']) {
                            var r = flash.editor.getSelection().getRanges();
                            r && r[0] && (r[0].collapse(true) || true) && r[0].select();
                        }
                        bubble._selectedEl._4e_remove();
                        bubble.hide();
                        flash.editor.notifySelectionChange();
                        ev.halt();
                    });
                    KE.Utils.addRes.call(bubble, tipchange, tipremove);
                    /*
                     位置变化
                     */
                    bubble.on("show", function () {
                        var a = bubble._selectedEl,
                            b = bubble._plugin;
                        if (!a)return;
                        b.call("_updateTip", tipurl, a);
                    });
                }
            });

            addRes.call(controls, function () {
                KE.BubbleView.destroy("image")
            });
        });


        this.destroy = function () {
            destroyRes.call(controls);
        };
    });
}, {
    attach:false
});