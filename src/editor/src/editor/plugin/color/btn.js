KISSY.add("editor/plugin/color/btn", function (S, KE, TripleButton, Overlay4E, DialogLoader) {

    var Node = S.Node,
        DOM = S.DOM;

    DOM.addStyleSheet(".ke-color-panel a {" +
        "display: block;" +
        "color:black;" +
        "text-decoration: none;" +
        "}" +
        "" +
        ".ke-color-panel a:hover {" +
        "color:black;" +
        "text-decoration: none;" +
        "}" +
        ".ke-color-panel a:active {" +
        "color:black;" +
        "}" +

        ".ke-color-palette {" +
        "    margin: 5px 8px 8px;" +
        "}" +

        ".ke-color-palette table {" +
        "    border: 1px solid #666666;" +
        "    border-collapse: collapse;" +
        "}" +

        ".ke-color-palette td {" +
        "    border-right: 1px solid #666666;" +
        "    height: 18px;" +
        "    width: 18px;" +
        "}" +

        "a.ke-color-a {" +
        "    height: 18px;" +
        "    width: 18px;" +
        "}" +

        "a.ke-color-a:hover {" +
        "    border: 1px solid #ffffff;" +
        "    height: 16px;" +
        "    width: 16px;" +
        "}" +
        "a.ke-color-remove {" +
        "  padding:3px 8px;" +
        "  margin:2px 0 3px 0;" +
        "}" +
        "a.ke-color-remove:hover {" +
        "    background-color: #D6E9F8;" +
        "}", "ke-color-plugin");

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
        html = "<div class='ke-color-panel'>" +
            "<a class='ke-color-remove' " +
            "href=\"javascript:void('清除');\">" +
            "清除" +
            "</a>";
        for (var i = 0; i < 3; i++) {
            html += "<div class='ke-color-palette'><table>";
            var c = COLORS[i], l = c.length / 8;
            for (var k = 0; k < l; k++) {
                html += "<tr>";
                for (var j = 0; j < 8; j++) {
                    var currentColor = "#" + (c[8 * k + j]);
                    html += "<td>";
                    html += "<a href='javascript:void(0);' " +
                        "class='ke-color-a' " +
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
            "<a class='ke-button ke-color-others'>其他颜色</a>" +
            "</div>" +
            "</div>";
    }

    initHtml();

    function ColorButton() {
        ColorButton.superclass.constructor.apply(this, arguments);
    }

    S.extend(ColorButton, TripleButton, {
        offClick:function () {
            this._prepare();
        },

        onClick:function () {
            this.colorWin && this.colorWin.hide();
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
                elCls:"ke-popup",
                content:html,
                autoRender:true,
                width:170,
                zIndex:KE.baseZIndex(KE.zIndexManager.POPUP_MENU)
            });

            var colorWin = self.colorWin;
            colorPanel = colorWin.get("contentEl");
            colorPanel.on("click", self._selectColor, self);
            colorWin.get("el").on("blur", function () {
                colorWin.hide();
            });
            colorWin.on("show", self.bon, self);
            colorWin.on("hide", self.boff, self);
            var others = colorPanel.one(".ke-color-others");
            others.on("click", function (ev) {
                ev.halt();
                colorWin.hide();
                DialogLoader.useDialog(editor, "color/colorpicker", self.get("cmdType"));
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
            colorWin.get("el")[0].focus();
        },
        _selectColor:function (ev) {
            ev.halt();
            var self = this,
                t = new Node(ev.target);
            if (t.hasClass("ke-color-a")) {
                self.get("editor").execCommand(self.get("cmdType"), t.style("background-color"));
            }
        },

        destroy:function () {
            var self = this;
            if (self.colorWin) {
                self.colorWin.destroy();
            }
        }
    }, {
        ATTRS:{
            mode:{
                value:KE.WYSIWYG_MODE
            }
        }
    });

    return ColorButton;

}, {
    requires:['editor', '../button/', '../overlay/', '../dialogLoader/']
});