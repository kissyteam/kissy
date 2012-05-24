/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 24 18:37
*/
/**
 * link editor support for kissy editor ,innovation from google doc and ckeditor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/link/index", function (S, Editor, BubbleView, Utils, DialogLoader) {

    var $ = S.all,
        tipHtml = '<a ' +
            'href="" '
            + ' target="_blank" ' +
            'class="ke-bubbleview-url">' +
            '在新窗口查看' +
            '</a>  –  '
            + ' <span ' +
            'class="ke-bubbleview-link ke-bubbleview-change">' +
            '编辑' +
            '</span>   |   '
            + ' <span ' +
            'class="ke-bubbleview-link ke-bubbleview-remove">' +
            '去除' +
            '</span>';

    function checkLink(lastElement) {
        lastElement = $(lastElement);
        return lastElement.closest('a', undefined);
    }


    return {init:function (editor) {

        editor.addButton({
            contentCls:"ke-toolbar-link",
            title:"插入链接",
            mode:Editor.WYSIWYG_MODE
        }, {
            offClick:function () {
                showLinkEditDialog();
            }
        });

        function showLinkEditDialog(selectedEl) {
            DialogLoader.useDialog(editor, "link/dialog", selectedEl);
        }

        BubbleView.register({
            editor:editor,
            filter:checkLink,
            init:function () {
                var bubble = this,
                    el = bubble.get("contentEl");
                el.html(tipHtml);
                var tipurl = el.one(".ke-bubbleview-url"),
                    tipchange = el.one(".ke-bubbleview-change"),
                    tipremove = el.one(".ke-bubbleview-remove");
                //ie focus not lose
                Editor.Utils.preventFocus(el);
                tipchange.on("click", function (ev) {
                    showLinkEditDialog(bubble.selectedEl);
                    ev.halt();
                });

                tipremove.on("click", function (ev) {
                    Utils.removeLink(editor, bubble.selectedEl);
                    ev.halt();
                });

                bubble.on("show", function () {
                    var a = bubble.selectedEl;
                    if (!a) {
                        return;
                    }
                    var href = a.attr(Utils._ke_saved_href) ||
                        a.attr("href");
                    tipurl.html(href);
                    tipurl.attr("href", href);
                });
            }
        });
    }
    };
}, {
    requires:['editor', '../bubbleview/', './utils', '../dialogLoader/']
});
