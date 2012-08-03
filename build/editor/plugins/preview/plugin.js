/**
 * preview for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("preview", function(editor) {

    editor.addPlugin("preview", function() {
        var context = editor.addButton("preview", {
            title:"预览",
            contentCls:"ke-toolbar-preview",
            offClick:function() {
                var self = this,
                    editor = self.editor,
                    iWidth = 640,    // 800 * 0.8,
                    iHeight = 420,    // 600 * 0.7,
                    iLeft = 80;	// (800 - 0.8 * 800) /2 = 800 * 0.1.
                try {
                    var screen = window.screen;
                    iWidth = Math.round(screen.width * 0.8);
                    iHeight = Math.round(screen.height * 0.7);
                    iLeft = Math.round(screen.width * 0.1);
                } catch (e) {
                }
                var sHTML = editor._prepareIFrameHtml()
                    .replace(/<body[^>]+>.+<\/body>/,
                    "<body>\n"
                        + editor.getData(true)
                        + "\n</body>")
                    .replace(/\${title}/, "预览"),
                    sOpenUrl = '',
                    oWindow = window.open(sOpenUrl,
                        //每次都弹出新窗口
                        '',
                        'toolbar=yes,' +
                            'location=no,' +
                            'status=yes,' +
                            'menubar=yes,' +
                            'scrollbars=yes,' +
                            'resizable=yes,' +
                            'width=' +
                            iWidth +
                            ',height='
                            + iHeight
                            + ',left='
                            + iLeft),winDoc = oWindow.document;
                winDoc.open();
                winDoc.write(sHTML);
                winDoc.close();
                //ie 重新显示
                oWindow.focus();
            }
        });


        this.destroy = function() {
            context.destroy();
        };
    });
}, {
    attach:false
});
