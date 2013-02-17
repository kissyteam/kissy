/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
/**
 * contextmenu for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/contextmenu/index", function (S, Editor, Menu, focusFix) {

    Editor.prototype.addContextMenu = function (id, filter, cfg) {

        var self = this;

        cfg = cfg || {};

        cfg.prefixCls = self.get("prefixCls") + "editor-";
        cfg.editor = self;
        cfg.focusable = 1;
        cfg.zIndex = Editor.baseZIndex(Editor.zIndexManager.POPUP_MENU);

        var menu = new Menu.PopupMenu(cfg);

        focusFix.init(menu);

        menu.on("afterRenderUI", function () {
            menu.get("el").on("keydown", function (e) {
                if (e.keyCode == S.Event.KeyCodes.ESC) {
                    menu.hide();
                }
            });
        });

        self.docReady(function () {
            var doc = self.get("document");
            // 编辑器获得焦点，不会触发 menu el blur？
            doc.on("mousedown", function (e) {
                if (e.which == 1) {
                    menu.hide();
                }
            });
            doc.delegate("contextmenu", filter, function (ev) {
                var t = S.all(ev.target);
                ev.halt();
                // ie 右键作用中，不会发生焦点转移，光标移动
                // 只能右键作用完后才能，才会发生光标移动,range变化
                // 异步右键操作
                // qc #3764,#3767
                var x = ev.pageX,
                    y = ev.pageY;
                if (!x) {
                    return;
                } else {
                    var translate = Editor.Utils.getXY({
                        left:x,
                        top:y
                    }, self);
                    x = translate.left;
                    y = translate.top;
                }
                setTimeout(function () {
                    menu.set("editorSelectedEl", t, {
                        silent:1
                    });
                    menu.set("xy", [x, y]);
                    menu.show();
                    self.fire("contextmenu", {
                        contextmenu:menu
                    });
                    window.focus();
                    document.body.focus();
                    // 防止焦点一直在 el，focus 无效
                    menu.get("el")[0].focus();
                }, 30);
            });
        });

        self.addControl(id + "/contextmenu", menu);

        return menu;
    };
}, {
    requires:['editor', 'menu', '../focus-fix/']
});
