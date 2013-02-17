/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
/**
 * color button.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/color/btn", function (S, Editor, Button, Overlay4E, DialogLoader) {

    var Node = S.Node;

    var COLORS = [
        ["000", "444", "666", "999", "CCC", "EEE", "F3F3F3", "FFF"],
        ["F00", "F90", "FF0", "0F0", "0FF", "00F", "90F", "F0F"],
        [
            "F4CC" + "CC", "FCE5CD", "FFF2CC", "D9EAD3", "D0E0E3", "CFE2F3", "D9D2E9", "EAD1DC",
            "EA9999", "F9CB9C", "FFE599", "B6D7A8", "A2C4C9", "9FC5E8", "B4A7D6", "D5A6BD",
            "E06666", "F6B26B", "FFD966", "93C47D", "76A5AF", "6FA8DC", "8E7CC3", "C27BAD",
            "CC0000", "E69138", "F1C232", "6AA84F", "45818E", "3D85C6", "674EA7", "A64D79",
            "990000", "B45F06", "BF9000", "38761D", "134F5C", "0B5394", "351C75", "741B47",
            "660000", "783F04", "7F6000", "274E13", "0C343D", "073763", "20124D", "4C1130"
        ]
    ], html;


    function initHtml() {
        html = "<div class='{prefixCls}editor-color-panel'>" +
            "<a class='{prefixCls}editor-color-remove' " +
            "href=\"javascript:void('清除');\">" +
            "清除" +
            "</a>";
        for (var i = 0; i < 3; i++) {
            html += "<div class='{prefixCls}editor-color-palette'><table>";
            var c = COLORS[i], l = c.length / 8;
            for (var k = 0; k < l; k++) {
                html += "<tr>";
                for (var j = 0; j < 8; j++) {
                    var currentColor = "#" + (c[8 * k + j]);
                    html += "<td>";
                    html += "<a href='javascript:void(0);' " +
                        "class='{prefixCls}editor-color-a' " +
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
            "<a class='{prefixCls}editor-button {prefixCls}editor-color-others ks-inline-block'>其他颜色</a>" +
            "</div>" +
            "</div>";
    }

    initHtml();

    var ColorButton = Button.extend({

        initializer: function () {
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

        _prepare: function () {
            var self = this,
                editor = self.get("editor"),
                prefixCls = editor.get('prefixCls'),
                colorPanel;

            self.colorWin = new Overlay4E({
                // TODO 变成了 -1??
                elAttrs: {
                    tabindex: 0
                },
                elCls: prefixCls + "editor-popup",
                content: S.substitute(html, {
                    prefixCls: prefixCls
                }),
                width: 172,
                zIndex: Editor.baseZIndex(Editor.zIndexManager.POPUP_MENU)
            }).render();

            var colorWin = self.colorWin;
            colorPanel = colorWin.get("contentEl");
            colorPanel.on("click", self._selectColor, self);
            colorWin.on("hide", function () {
                self.set("checked", false);
            });
            var others = colorPanel.one("." + prefixCls + "editor-color-others");
            others.on("click", function (ev) {
                ev.halt();
                colorWin.hide();
                DialogLoader.useDialog(editor, "color/color-picker", self);
            });
            self._prepare = self._show;
            self._show();
        },

        _show: function () {
            var self = this,
                el = self.get("el"),
                colorWin = self.colorWin;
            colorWin.set("align", {
                node: el,
                points: ["bl", "tl"],
                offset: [0, 2],
                overflow: {
                    adjustX: 1,
                    adjustY: 1
                }
            });
            colorWin.show();
        },

        _selectColor: function (ev) {
            ev.halt();
            var self = this,
                editor = self.get("editor"),
                prefixCls = editor.get('prefixCls'),
                t = new Node(ev.target);
            if (t.hasClass(prefixCls + "editor-color-a")) {
                self.fire('selectColor', {
                    color: t.style("background-color")
                });
            }
        },

        destructor: function () {
            var self = this;
            if (self.colorWin) {
                self.colorWin.destroy();
            }
        }
    }, {
        ATTRS: {
            checkable: {
                value: true
            },
            mode: {
                value: Editor.WYSIWYG_MODE
            }
        }
    });

    var tpl = '<div class="{icon}"></div>' +
        '<div style="background-color:{defaultColor}"' +
        ' class="{indicator}"></div>';

    function runCmd(editor, cmdType, color) {
        setTimeout(function () {
            editor.execCommand(cmdType, color);
        }, 0);
    }

    ColorButton.init = function (editor, cfg) {
        var prefix = editor.get('prefixCls') + 'editor-toolbar-',
            cmdType = cfg.cmdType,
            defaultColor=cfg.defaultColor,
            tooltip = cfg.tooltip;

        var button = editor.addButton(cmdType, {
            elCls: cmdType + 'Btn',
            content: S.substitute(tpl, {
                defaultColor: defaultColor,
                icon: prefix + 'item ' + prefix + cmdType,
                indicator: prefix + 'color-indicator'
            }),
            mode: Editor.WYSIWYG_MODE,
            tooltip: "设置" + tooltip
        });

        var arrow = editor.addButton(cmdType + 'Arrow', {
            tooltip: "选择并设置" + tooltip,
            elCls: cmdType + 'ArrowBtn'
        }, ColorButton);

        var indicator = button.get('el').one('.' + prefix + 'color-indicator');

        arrow.on('selectColor', function (e) {
            indicator.css('background-color', e.color);
            runCmd(editor, cmdType, e.color);
        });

        button.on('click', function () {
            runCmd(editor, cmdType, indicator.style('background-color'));
        });
    };

    return ColorButton;

}, {
    requires: ['editor', '../button/', '../overlay/', '../dialog-loader/']
});
