/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:19
*/
/**
 * preview for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/preview", function (S) {
    var win = window;

    function Preview() {
    }

    S.augment(Preview, {
        pluginRenderUI:function (editor) {
            editor.addButton("preview", {
                tooltip:"预览",
                listeners:{
                    click:function () {
                        try {
                            var screen = win.screen,
                                iWidth = Math.round(screen.width * 0.8),
                                iHeight = Math.round(screen.height * 0.7),
                                iLeft = Math.round(screen.width * 0.1);
                        } catch (e) {
                            iWidth = 640; // 800 * 0.8,
                            iHeight = 420; // 600 * 0.7,
                            iLeft = 80;	// (800 - 0.8 * 800) /2 = 800 * 0.1.
                        }
                        var sHTML = editor.getDocHTML()
                                .replace(/\${title}/, "预览"),
                            sOpenUrl = '',
                            oWindow = win.open(sOpenUrl,
                                // 每次都弹出新窗口
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
                                    + iLeft), winDoc = oWindow.document;
                        winDoc.open();
                        winDoc.write(sHTML);
                        winDoc.close();
                        //ie 重新显示
                        oWindow.focus();
                    }

                }
            });
        }});

    return Preview;


});
