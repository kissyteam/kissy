/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Aug 7 22:12
*/
/**
 * color button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/color/btn", function (S, Editor, Button, Overlay4E, DialogLoader) {

    var Node = S.Node,
        DOM = S.DOM;

    DOM.addStyleSheet(window, ".ks-editor-color-panel a {" +
        "display: block;" +
        "color:black;" +
        "text-decoration: none;" +
        "}" +
        "" +
        ".ks-editor-color-panel a:hover {" +
        "color:black;" +
        "text-decoration: none;" +
        "}" +
        ".ks-editor-color-panel a:active {" +
        "color:black;" +
        "}" +

        ".ks-editor-color-palette {" +
        "    margin: 5px 8px 8px;" +
        "}" +

        ".ks-editor-color-palette table {" +
        "    border: 1px solid #666666;" +
        "    border-collapse: collapse;" +
        "}" +

        ".ks-editor-color-palette td {" +
        "    border-right: 1px solid #666666;" +
        "    height: 18px;" +
        "    width: 18px;" +
        "}" +

        "a.ks-editor-color-a {" +
        "    height: 18px;" +
        "    width: 18px;" +
        "}" +

        "a.ks-editor-color-a:hover {" +
        "    border: 1px solid #ffffff;" +
        "    height: 16px;" +
        "    width: 16px;" +
        "}" +
        "a.ks-editor-color-remove {" +
        "  padding:3px 8px;" +
        "  margin:2px 0 3px 0;" +
        "}" +
        "a.ks-editor-color-remove:hover {" +
        "    background-color: #D6E9F8;" +
        "}", "ks-editor-color-plugin");

    var COLORS = [
        ["000", "444", "666", "999", "CCC", "EEE", "F3F3F3", "FFF"],
        ["F00", "F90", "FF0", "0F0", "0FF", "00F", "90F", "F0F"],
        [
            "F4CCCC", "FCE5CD", "FFF2CC", "D9EAD3", "D0E0E3", "CFE2F3", "D9D2E9", "EAD1DC",
            "EA9999", "F9CB9C", "FFE599", "B6D7A8", "A2C4C9", "9FC5E8", "B4A7D6", "D5A6BD",
            "E06666", "F6B26B", "FFD966", "93C47D", "76A5AF", "6FA8DC", "8E7CC3", "C27BAD",
            "CC0000", "E69138", "F1C232", "6AA84F", "45818E", "3D85C6", "674EA7", "A64D79",
            "990000", "B45F06", "BF9000", "38761D", "134F5C", "0B5394", "351C75", "741B47",
            "660000", "783F04", "7F6000", "274E13", "0C343D", "073763", "20124D", "4C1130"
        ]
    ], html;


    function initHtml() {
        html = "<div class='ks-editor-color-panel'>" +
            "<a class='ks-editor-color-remove' " +
            "href=\"javascript:void('清除');\">" +
            "清除" +
            "</a>";
        for (var i = 0; i < 3; i++) {
            html += "<div class='ks-editor-color-palette'><table>";
            var c = COLORS[i], l = c.length / 8;
            for (var k = 0; k < l; k++) {
                html += "<tr>";
                for (var j = 0; j < 8; j++) {
                    var currentColor = "#" + (c[8 * k + j]);
                    html += "<td>";
                    html += "<a href='javascript:void(0);' " +
                        "class='ks-editor-color-a' " +
                        "style='background-color:"
                        + currentColor
                        + "'" +
                        "></a>";
                    html += "</td>";
                }
                html += "</tr>";
            }
            html += "</table></div>";
        }
        html += "" +
            "<div>" +
            "<a class='ks-editor-button ks-editor-color-others ks-inline-block'>其他颜色</a>" +
            "</div>" +
            "</div>";
    }

    initHtml();

    return Button.extend({

        initializer:function () {
            var self = this;
            self.on("blur", function () {
                // make select color works
                setTimeout(function () {
                    self.colorWin && self.colorWin.hide();
                }, 150);
            });
            self.on('click', function () {
                var checked = self.get("checked");
                if (checked) {
                    self._prepare();
                } else {
                    self.colorWin && self.colorWin.hide();
                }
            });
        },

        _prepare:function () {
            var self = this,
                editor = self.get("editor"),
                colorPanel;

            self.colorWin = new Overlay4E({
                // TODO 变成了 -1??
                elAttrs:{
                    tabindex:0
                },
                elCls:"ks-editor-popup",
                content:html,
                autoRender:true,
                width:170,
                zIndex:Editor.baseZIndex(Editor.zIndexManager.POPUP_MENU)
            });

            var colorWin = self.colorWin;
            colorPanel = colorWin.get("contentEl");
            colorPanel.on("click", self._selectColor, self);
            colorWin.on("hide", function () {
                self.set("checked", false);
            });
            var others = colorPanel.one(".ks-editor-color-others");
            others.on("click", function (ev) {
                ev.halt();
                colorWin.hide();
                DialogLoader.useDialog(editor, "color/color-picker",
                    self.get("pluginConfig"),
                    self.get("cmdType"));
            });
            self._prepare = self._show;
            self._show();
        },

        _show:function () {
            var self = this,
                el = self.get("el"),
                colorWin = self.colorWin;
            colorWin.align(el, ["bl", "tl"], [0, 2]);
            colorWin.show();
        },

        _selectColor:function (ev) {
            ev.halt();
            var self = this,
                t = new Node(ev.target);
            if (t.hasClass("ks-editor-color-a")) {
                self.get("editor").execCommand(self.get("cmdType"), t.style("background-color"));
            }
        },

        destructor:function () {
            var self = this;
            if (self.colorWin) {
                self.colorWin.destroy();
            }
        }
    }, {
        ATTRS:{
            checkable:{
                value:true
            },
            mode:{
                value:Editor.WYSIWYG_MODE
            }
        }
    });

}, {
    requires:['editor', '../button/', '../overlay/', '../dialog-loader/']
});
