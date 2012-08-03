/**
 * align support for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("justify", function(editor) {

    editor.addPlugin("justify", function() {
        var S = KISSY,
            KE = S.Editor,
            TripleButton = KE.TripleButton;
        var alignRemoveRegex = /(-moz-|-webkit-|start|auto)/gi,
            default_align = "left";

        var JustifyTpl = {
            mode:KE.WYSIWYG_MODE,
            offClick:function() {
                this.call("_change");
            },
            onClick:function() {
                this.call("_change");
            },
            _change:function() {
                var self = this,
                    editor = self.editor,
                    selection = editor.getSelection(),
                    state = self.btn.get("state");

                if (!selection)
                    return;

                var bookmarks = selection.createBookmarks(),
                    ranges = selection.getRanges(),
                    iterator,
                    block;
                editor.fire("save");
                for (var i = ranges.length - 1;
                     i >= 0;
                     i--) {
                    iterator = ranges[ i ].createIterator();
                    iterator.enlargeBr = true;
                    while (( block = iterator.getNextParagraph() )) {
                        block.removeAttr('align');
                        if (state == TripleButton.OFF)
                            block.css('text-align', self.cfg.v);
                        else
                            block.css('text-align', '');
                    }
                }
                editor.notifySelectionChange();
                selection.selectBookmarks(bookmarks);
                editor.fire("save");
            },
            selectionChange:function(ev) {
                var self = this,
                    el = self.btn,
                    path = ev.path,
                    //elements = path.elements,
                    block = path.block || path.blockLimit;
                //如果block是body，就不要设置，
                // <body>
                // <ul>
                // <li style='text-align:center'>
                // </li>
                // </ul>
                // </body>
                //gecko ctrl-a 为直接得到 container : body
                //其他浏览器 ctrl-a 得到 container : li
                if (!block || block._4e_name() === "body") {
                    el.boff();
                    return;
                }
                var align = block.css("text-align")
                    .replace(alignRemoveRegex, "")
                    //默认值，没有设置
                    || default_align;

                if (align == self.cfg.v) {
                    el.bon();
                } else {
                    el.boff();
                }
            }
        };
        var alignleft = editor.addButton("alignleft", S.mix({
            contentCls:"ke-toolbar-alignleft",
            title:"左对齐",
            v:"left"
        }, JustifyTpl));

        var aligncenter = editor.addButton("aligncenter", S.mix({
            contentCls:"ke-toolbar-aligncenter",
            title:"居中对齐",
            v:"center"
        }, JustifyTpl));

        var alignright = editor.addButton("alignright", S.mix({
            contentCls:"ke-toolbar-alignright",
            title:"右对齐",
            v:"right"
        }, JustifyTpl));

        this.destroy = function() {
            alignleft.destroy();
            aligncenter.destroy();
            alignright.destroy();
        };
    });

}, {
    attach:false
});
