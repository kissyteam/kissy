/**
 * @ignore
 * contextmenu for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Editor = require('editor');
    var Menu = require('menu');
    var focusFix = require('./focus-fix');
    var Event = require('event');

    Editor.prototype.addContextMenu = function (id, filter, cfg) {

        var self = this;

        cfg = cfg || {};

        var event = cfg.event;
        if (event) {
            delete  cfg.event;
        }

        cfg.prefixCls = self.get('prefixCls') + 'editor-';
        cfg.editor = self;
        cfg.focusable = 1;
        cfg.zIndex = Editor.baseZIndex(Editor.ZIndexManager.POPUP_MENU);

        var menu = new Menu.PopupMenu(cfg);

        focusFix.init(menu);

        menu.on('afterRenderUI', function () {
            menu.get('el').on('keydown', function (e) {
                if (e.keyCode === Event.KeyCode.ESC) {
                    menu.hide();
                }
            });
        });

        self.docReady(function () {
            var doc = self.get('document');
            // 编辑器获得焦点，不会触发 menu el blur？
            doc.on('mousedown', function (e) {
                if (e.which === 1) {
                    menu.hide();
                }
            });
            doc.delegate('contextmenu', filter, function (ev) {
                ev.halt();
                showNow(ev);
            });
        });

        function showNow(ev) {
            var t = S.all(ev.target);

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
                    left: x,
                    top: y
                }, self);
                x = translate.left;
                y = translate.top;
            }
            setTimeout(function () {
                menu.set('editorSelectedEl', t, {
                    silent: 1
                });
                menu.move(x, y);
                self.fire('contextmenu', {
                    contextmenu: menu
                });
                menu.show();
                window.focus();
                document.body.focus();
                // 防止焦点一直在 el，focus 无效
                menu.focus();
            }, 30);
        }

        if (event) {
            showNow(event);
        }

        self.addControl(id + '/contextmenu', menu);

        return menu;
    };
});
