/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 29 15:03
*/
/*
combined modules:
editor/plugin/image
*/
/**
 * @ignore
 * insert image for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/image', [
    './button',
    'editor',
    './bubble',
    './contextmenu',
    './dialog-loader',
    'node'
], function (S, require) {
    require('./button');
    var Editor = require('editor');
    require('./bubble');
    require('./contextmenu');
    var DialogLoader = require('./dialog-loader');
    var UA = S.UA, Node = require('node'), $ = Node.all, checkImg = function (node) {
            node = $(node);
            if (node.nodeName() === 'img' && // prevent collision with fake objects
                !/(^|\s+)ke_/.test(node[0].className)) {
                return node;
            }
        }, tipHTML = '<a class="{prefixCls}editor-bubble-url" ' + 'target="_blank" href="#">\u5728\u65B0\u7A97\u53E3\u67E5\u770B</a>  |  ' + '<a class="{prefixCls}editor-bubble-link ' + '{prefixCls}editor-bubble-change" href="#">\u7F16\u8F91</a>  |  ' + '<a class="{prefixCls}editor-bubble-link ' + '{prefixCls}editor-bubble-remove" href="#">\u5220\u9664</a>';
    function ImagePlugin(config) {
        this.config = config || {};
    }
    S.augment(ImagePlugin, {
        pluginRenderUI: function (editor) {
            var self = this;
            var prefixCls = editor.get('prefixCls');
            function showImageEditor(selectedEl) {
                DialogLoader.useDialog(editor, 'image', self.config, selectedEl);
            }    // 重新采用form提交，不采用flash，国产浏览器很多问题
            // 重新采用form提交，不采用flash，国产浏览器很多问题
            editor.addButton('image', {
                tooltip: '\u63D2\u5165\u56FE\u7247',
                listeners: {
                    click: function () {
                        showImageEditor(null);
                    }
                },
                mode: Editor.Mode.WYSIWYG_MODE
            });
            var handlers = [
                    {
                        content: '\u56FE\u7247\u5C5E\u6027',
                        fn: function () {
                            var img = checkImg(this.get('editorSelectedEl'));
                            if (img) {
                                // make editor restore focus
                                this.hide();
                                showImageEditor($(img));
                            }
                        }
                    },
                    {
                        content: '\u63D2\u5165\u65B0\u884C',
                        fn: function () {
                            this.hide();
                            var doc = editor.get('document')[0], p = new Node(doc.createElement('p'));
                            if (!UA.ie) {
                                p._4eAppendBogus(undefined);
                            }
                            var r = new Editor.Range(doc);
                            r.setStartAfter(this.get('editorSelectedEl'));
                            r.select();
                            editor.insertElement(p);
                            r.moveToElementEditablePosition(p, 1);
                            r.select();
                        }
                    }
                ];
            var children = [];
            S.each(handlers, function (h) {
                children.push({ content: h.content });
            });
            editor.addContextMenu('image', checkImg, {
                width: 120,
                children: children,
                listeners: {
                    click: function (e) {
                        var self = this, content = e.target.get('content');
                        S.each(handlers, function (h) {
                            if (h.content === content) {
                                h.fn.call(self);
                            }
                        });
                    }
                }
            });
            editor.docReady(function () {
                editor.get('document').on('dblclick', function (ev) {
                    ev.halt();
                    var t = $(ev.target);
                    if (checkImg(t)) {
                        showImageEditor(t);
                    }
                });
            });
            editor.addBubble('image', checkImg, {
                listeners: {
                    afterRenderUI: function () {
                        var bubble = this, el = bubble.get('contentEl');
                        el.html(S.substitute(tipHTML, { prefixCls: prefixCls }));
                        var tipUrlEl = el.one('.' + prefixCls + 'editor-bubble-url'), tipChangeEl = el.one('.' + prefixCls + 'editor-bubble-change'), tipRemoveEl = el.one('.' + prefixCls + 'editor-bubble-remove');
                        Editor.Utils.preventFocus(el);
                        tipChangeEl.on('click', function (ev) {
                            showImageEditor(bubble.get('editorSelectedEl'));
                            ev.halt();
                        });
                        tipRemoveEl.on('click', function (ev) {
                            if (UA.webkit) {
                                var r = editor.getSelection().getRanges();
                                if (r && r[0]) {
                                    r[0].collapse();
                                    r[0].select();
                                }
                            }
                            bubble.get('editorSelectedEl').remove();
                            bubble.hide();
                            editor.notifySelectionChange();
                            ev.halt();
                        });
                        bubble.on('show', function () {
                            var a = bubble.get('editorSelectedEl');
                            if (a) {
                                var src = a.attr('_ke_saved_src') || a.attr('src');
                                tipUrlEl.attr('href', src);
                            }
                        });
                    }
                }
            });
        }
    });
    return ImagePlugin;
});





