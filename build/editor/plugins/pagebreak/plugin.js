/**
 * pagebreak functionality
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("pagebreak", function(editor) {
    editor.addPlugin("pagebreak", function() {
        var S = KISSY,
            KE = S.Editor,
            Node = S.Node,
            dataProcessor = editor.htmlDataProcessor,
            dataFilter = dataProcessor && dataProcessor.dataFilter,
            CLS = "ke_pagebreak",
            TYPE = "div";
        if (dataFilter) {
            dataFilter.addRules({
                elements :
                {
                    div : function(element) {
                        var attributes = element.attributes,
                            style = attributes && attributes.style,
                            child = style && element.children.length == 1
                                && element.children[ 0 ],
                            childStyle = child && ( child.name == 'span' )
                                && child.attributes.style;

                        if (childStyle
                            && ( /page-break-after\s*:\s*always/i ).test(style)
                            && ( /display\s*:\s*none/i ).test(childStyle))
                            return dataProcessor.createFakeParserElement(element,
                                CLS,
                                TYPE);
                    }
                }
            });
        }

        var mark_up = '<div' +
            ' style="page-break-after: always; ">' +
            '<span style="DISPLAY:none">&nbsp;</span></div>';
        var context = editor.addButton("page-break", {
            title:"分页",
            mode:KE.WYSIWYG_MODE,
            contentCls:"ke-toolbar-pagebreak",
            offClick:function() {
                var editor = this.editor,
                    real = new Node(mark_up, null, editor.document),
                    substitute = editor.createFakeElement ?
                        editor.createFakeElement(real,
                            CLS,
                            TYPE,
                            //不可缩放，也不用
                            false,
                            mark_up) :
                        real;
                var sel = editor.getSelection(),
                    range = sel && sel.getRanges()[0];
                if (!range) return;
                editor.fire("save");
                var start = range.startContainer,pre = start;
                while (start._4e_name() !== "body") {
                    pre = start;
                    start = start.parent();
                }
                range.collapse(true);
                range.splitElement(pre);
                substitute.insertAfter(pre);
                editor.fire("save");
            }
        });


        this.destroy = function() {
            context.destroy();
        };
    });
}, {
    attach:false,
    "requires":["fakeobjects"]
});