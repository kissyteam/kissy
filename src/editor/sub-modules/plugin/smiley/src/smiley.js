/**
 * smiley button
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/smiley", function (S, Editor, Overlay4E) {

    var smiley_markup = "<div class='{prefixCls}editor-smiley-sprite'>";
    for (var i = 0; i <= 98; i++) {
        smiley_markup += "<a href='javascript:void(0)' " +
            "data-icon='http://a.tbcdn.cn/sys/wangwang/smiley/48x48/" + i + ".gif'>" +
            "</a>"
    }
    smiley_markup += "</div>";

    function Smiley() {
    }

    S.augment(Smiley, {
        pluginRenderUI: function (editor) {

            var prefixCls = editor.get('prefixCls');

            editor.addButton("smiley", {
                tooltip: "插入表情",
                checkable: true,
                listeners: {
                    afterSyncUI: function () {
                        var self = this;
                        self.on("blur", function () {
                            // make click event fire
                            setTimeout(function () {
                                self.smiley && self.smiley.hide();
                            }, 150);
                        });

                    },
                    click: function () {
                        var self = this, smiley, checked = self.get("checked");
                        if (checked) {
                            if (!(smiley = self.smiley)) {
                                smiley = self.smiley = new Overlay4E({
                                    content: S.substitute(smiley_markup, {
                                        prefixCls: prefixCls
                                    }),
                                    focus4e: false,
                                    width: 300,
                                    elCls: prefixCls + "editor-popup",
                                    zIndex: Editor.baseZIndex(Editor.zIndexManager.POPUP_MENU),
                                    mask: false
                                }).render();
                                smiley.get("el").on("click", function (ev) {
                                    var t = new S.Node(ev.target),
                                        icon;
                                    if (t.nodeName() == "a" &&
                                        (icon = t.attr("data-icon"))) {
                                        var img = new S.Node("<img " +
                                            "alt='' src='" +
                                            icon + "'/>", null,
                                            editor.get("document")[0]);
                                        editor.insertElement(img);
                                    }
                                });
                                smiley.on("hide", function () {
                                    self.set("checked", false);
                                });
                            }
                            smiley.set("align", {
                                node: this.get("el"),
                                points: ["bl", "tl"],
                                overflow: {
                                    adjustX: 1,
                                    adjustY: 1
                                }
                            });
                            smiley.show();
                        } else {
                            self.smiley && self.smiley.hide();
                        }
                    },
                    destroy: function () {
                        if (this.smiley) {
                            this.smiley.destroy();
                        }
                    }

                },
                mode: Editor.Mode.WYSIWYG_MODE
            });
        }
    });

    return Smiley;
}, {
    requires: ['editor', './overlay']
});