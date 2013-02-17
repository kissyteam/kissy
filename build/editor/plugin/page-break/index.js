/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
/**
 * pagebreak functionality
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/page-break/index", function (S, Editor, fakeObjects) {
    var Node = S.Node,
        CLS = "ke_pagebreak",
        TYPE = "div",
        PAGE_BREAK_MARKUP = '<div' +
            ' style="page-break-after: always; ">' +
            '<span style="DISPLAY:none">&nbsp;</span>' +
            '</div>';

    function pageBreak() {

    }

    S.augment(pageBreak, {
        pluginRenderUI:function (editor) {

            fakeObjects.init(editor);

            var dataProcessor = editor.htmlDataProcessor,
                dataFilter = dataProcessor && dataProcessor.dataFilter;

            dataFilter.addRules({
                tags:{
                    div:function (element) {
                        var style = element.getAttribute("style"),
                            child;

                        if (style) {
                            var childNodes = element.childNodes;
                            for (var i = 0; i < childNodes.length; i++) {
                                if (childNodes[i].nodeType == 1) {
                                    child = childNodes[i];
                                }
                            }
                        }

                        var childStyle = child &&
                            ( child.nodeName == 'span' ) &&
                            child.getAttribute("style");

                        if (childStyle &&
                            ( /page-break-after\s*:\s*always/i ).test(style) &&
                            ( /display\s*:\s*none/i ).test(childStyle)) {
                            return dataProcessor.createFakeParserElement(element, CLS, TYPE);
                        }
                    }
                }
            });

            editor.addButton("pageBreak", {
                tooltip:"分页",
                listeners:{
                    click:function () {

                        var real = new Node(PAGE_BREAK_MARKUP, null, editor.get("document")[0]),
                            substitute = editor.createFakeElement(real, CLS, TYPE,
                                //不可缩放，也不用
                                false,
                                PAGE_BREAK_MARKUP);

                        editor.focus();

                        var sel = editor.getSelection(), range = sel && sel.getRanges()[0];

                        if (!range) {
                            return;
                        }

                        editor.execCommand("save");

                        var start = range.startContainer,
                            pre = start;

                        while (start.nodeName() !== "body") {
                            pre = start;
                            start = start.parent();
                        }

                        range.collapse(true);

                        range.splitElement(pre);

                        substitute.insertAfter(pre);

                        editor.execCommand("save");
                    }

                },
                mode:Editor.WYSIWYG_MODE
            });
        }
    });

    return pageBreak;
}, {
    "requires":["editor", "../fake-objects/"]
});
