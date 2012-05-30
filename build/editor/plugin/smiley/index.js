/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 30 12:21
*/
KISSY.add("editor/plugin/smiley/index", function (S, Editor, Overlay4E) {

    var smiley_markup = "<div class='ke-smiley-sprite'>";
    for (var i = 0; i <= 98; i++) {
        smiley_markup += "<a href='javascript:void(0)' " +
            "data-icon='http://a.tbcdn.cn/sys/wangwang/smiley/48x48/" + i + ".gif'>" +
            "</a>"
    }
    smiley_markup += "</div>";


    return {
        init:function (editor) {
            editor.addButton({
                contentCls:"ke-toolbar-smiley",
                title:"插入表情",
                keepFocus:false,
                mode:Editor.WYSIWYG_MODE
            }, {
                init:function () {
                    var self = this;
                    self.get("el").on("blur", function () {
                        if (self.smiley) {
                            // make click event fire
                            setTimeout(function () {
                                self.smiley.hide();
                            }, 100);
                        }
                    });
                },
                offClick:function () {
                    var self = this;
                    if (!self.smiley) {
                        self.smiley = new Overlay4E({
                            content:smiley_markup,
                            focus4e:false,
                            width:"297px",
                            autoRender:true,
                            elCls:"ke-popup",
                            zIndex:Editor.baseZIndex(Editor.zIndexManager.POPUP_MENU),
                            mask:false
                        });
                        self.smiley.get("el").on("click", function (ev) {
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
                    }
                    self.smiley.set("align", {
                        node:this.get("el"),
                        points:["bl", "tl"]
                    });
                    self.smiley.show();
                },
                onClick:function () {
                    this.smiley.hide();
                },
                destructor:function () {
                    if (this.smiley) {
                        this.smiley.destroy();
                    }
                }
            });
        }
    };
}, {
    requires:['editor', '../overlay/']
});
