/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 29 14:52
*/
/**
 * contextmenu for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/contextmenu/index", function (S, Editor, Overlay) {
    var $ = S.all,
        MENUITEM_DISABLED_CLS = "ke-menuitem-disable",
        Event = S.Event;

    /**
     * 组合使用 overlay
     */
    function ContextMenu() {
        ContextMenu.superclass.constructor.apply(this, arguments);
    }

    /**
     * 多菜单管理
     */
    ContextMenu.register = function (cfg) {
        var cm = new ContextMenu(cfg),
            editor = cfg.editor;

        cm.editor = editor;

        editor.on("destroy", function () {
            cm.destroy();
        });

        function hideContextMenu() {
            cm.hide();
        }

        editor.on("sourceMode", hideContextMenu);

        editor.docReady(function () {
            var doc = editor.get("document")[0];
            Event.on(doc, "mousedown", hideContextMenu);
            Event.delegate(doc, "contextmenu", cfg.filter, function (ev) {
                ContextMenu.hide(editor);
                var t = $(ev.target);
                ev.halt();
                // ie 右键作用中，不会发生焦点转移，光标移动
                // 只能右键作用完后才能，才会发生光标移动,range变化
                // 异步右键操作
                // qc #3764,#3767
                var x = ev.pageX,
                    y = ev.pageY;
                if (!x) {
                    var xy = t._4e_getOffset(undefined);
                    x = xy.left;
                    y = xy.top;
                }
                setTimeout(function () {
                    cm.selectedEl = t;
                    cm.show(Editor.Utils.getXY(x, y, doc, document));
                    ContextMenu.show(cm);
                }, 30);
            });
        });

        return cm;
    };

    /**
     * last visible menu of each editor
     */
    var visibleContextMenus = {
        /**
         * editorStamp:menu
         */
    };

    ContextMenu.hide = function (editor) {
        var last = visibleContextMenus[S.stamp(editor)];
        if (last) {
            last.hide();
        }
    };

    ContextMenu.show = function (cm) {
        visibleContextMenus[S.stamp(cm.editor)] = cm;
    };

    S.extend(ContextMenu, S.Base, {
        /**
         * 根据配置构造右键菜单内容
         */
        _init:function () {
            var self = this,
                handlers = self.get("handlers");
            self.menu = new Overlay({
                autoRender:true,
                width:self.get("width"),
                elCls:"ke-menu"
            });
            var el = self.menu.get("contentEl");
            for (var f in handlers) {
                var a = $("<a href='#'>" + f + "</a>");
                el.append(a);
                if (handlers.hasOwnProperty(f)) {
                    (function (a, handler) {
                        a.unselectable(undefined);
                        a.on("click", function (ev) {
                            ev.halt();
                            if (a.hasClass(MENUITEM_DISABLED_CLS, undefined)) {
                                return;
                            }
                            //先 hide 还原编辑器内焦点
                            self.hide();

                            //给 ie 一点 hide() 中的事件触发 handler 运行机会，原编辑器获得焦点后再进行下步操作
                            S.later(handler, 30, false, self);
                        });
                    })(a, handlers[f]);
                }
            }

        },
        destroy:function () {
            var t;
            if (t = this.menu) {
                t.destroy();
            }
        },
        hide:function () {
            var t;
            if (t = this.menu) {
                t.hide();
            }
        },
        _realShow:function (offset) {
            var self = this,
                menu = self.menu;
            //防止ie 失去焦点，取不到复制等状态
            Editor.fire("contextmenu", {
                contextmenu:self
            });
            menu.set("xy", [offset.left, offset.top]);
            var statusChecker = self.get("statusChecker"),
                editor = self.editor;
            if (statusChecker) {
                var as = menu.get("contentEl").children("a");
                as.each(function (a) {
                    var func = statusChecker[S.trim(a.text())];
                    if (func) {
                        if (func(editor)) {
                            a.removeClass(MENUITEM_DISABLED_CLS, undefined);
                        } else {
                            a.addClass(MENUITEM_DISABLED_CLS, undefined);
                        }
                    }
                });
            }
            menu.show();
        },
        show:function (offset) {
            var self = this;
            self._init();
            self.show = self._realShow;
            self.show(offset);
        }
    });

    return ContextMenu;
}, {
    requires:['editor', 'overlay']
});
