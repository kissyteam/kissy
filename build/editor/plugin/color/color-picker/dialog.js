/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
/**
 * color picker
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/color/color-picker/dialog", function (S, Editor, Overlay4E) {
    var map = S.map, DOM = S.DOM;

    //获取颜色数组
    function getData(color) {
        if (S.isArray(color)) return color;
        var re = RegExp;
        if (/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.test(color)) {
            //#rrggbb
            return map([ re['$1'], re['$2'], re['$3'] ], function (x) {
                return parseInt(x, 16);
            });
        } else if (/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.test(color)) {
            //#rgb
            return map([ re['$1'], re['$2'], re['$3'] ], function (x) {
                return parseInt(x + x, 16);
            });
        } else if (/^rgb\((.*),(.*),(.*)\)$/i.test(color)) {
            //rgb(n,n,n) or rgb(n%,n%,n%)
            return map([ re['$1'], re['$2'], re['$3'] ], function (x) {
                return x.indexOf("%") > 0 ? parseFloat(x, 10) * 2.55 : x | 0;
            });
        }
        return undefined;
    }

    //refer:http://www.cnblogs.com/cloudgamer/archive/2009/03/11/color.html
    //http://yiminghe.javaeye.com/blog/511589
    //获取颜色梯度方法
    var ColorGrads = (function () {
        //获取颜色梯度数据
        function getStep(start, end, step) {
            var colors = [];
            start = getColor(start);
            end = getColor(end);
            var stepR = (end[0] - start[0]) / step,
                stepG = (end[1] - start[1]) / step,
                stepB = (end[2] - start[2]) / step;
            //生成颜色集合
            for (var i = 0, r = start[0], g = start[1], b = start[2]; i < step; i++) {
                colors[i] = [r, g, b];
                r += stepR;
                g += stepG;
                b += stepB;
            }
            colors[i] = end;
            //修正颜色值
            return map(colors, function (x) {
                return map(x, function (x) {
                    return Math.min(Math.max(0, Math.floor(x)), 255);
                });
            });
        }

        //获取颜色数据
        var frag;

        function getColor(color) {
            var ret = getData(color);
            if (ret === undefined) {
                if (!frag) {
                    frag = document.createElement("textarea");
                    frag.style.display = "none";
                    DOM.prepend(frag, document.body);
                }
                try {
                    frag.style.color = color;
                } catch (e) {
                    return [0, 0, 0];
                }

                if (document.defaultView) {
                    ret = getData(document.defaultView.getComputedStyle(frag, null).color);
                } else {
                    color = frag.createTextRange()['queryCommandValue']("ForeColor");
                    ret = [ color & 0x0000ff, (color & 0x00ff00) >>> 8, (color & 0xff0000) >>> 16 ];
                }
            }
            return ret;
        }


        return function (colors, step) {
            var ret = [], len = colors.length;
            if (step === undefined) {
                step = 20;
            }
            if (len == 1) {
                ret = getStep(colors[0], colors[0], step);
            } else if (len > 1) {
                for (var i = 0, n = len - 1; i < n; i++) {
                    var t = step[i] || step;
                    var steps = getStep(colors[i], colors[i + 1], t);
                    i < n - 1 && steps.pop();
                    ret = ret.concat(steps);
                }
            }
            return ret;
        }
    })();

    function padding2(x) {
        x = "0" + x;
        var l = x.length;
        return x.slice(l - 2, l);
    }

    function hex(c) {
        c = getData(c);
        return "#" + padding2(c[0].toString(16))
            + padding2(c[1].toString(16))
            + padding2(c[2].toString(16));
    }

    var pickerHtml = "<ul>" +
            map(ColorGrads([ "red", "orange", "yellow", "green", "cyan", "blue", "purple" ], 5),
                function (x) {
                    return map(ColorGrads([ "white", "rgb(" + x.join(",") + ")" , "black" ], 5),
                        function (x) {
                            return "<li><a style='background-color" + ":" + hex(x) + "' href='#'></a></li>";
                        }).join("");
                }).join("</ul><ul>") + "</ul>",
        panelHtml = "<div class='{prefixCls}editor-color-advanced-picker'>" +
            "<div class='ks-clear'>" +
            "<div class='{prefixCls}editor-color-advanced-picker-left'>" +
            pickerHtml +
            "</div>" +
            "<div class='{prefixCls}editor-color-advanced-picker-right'>" +
            "</div>" +
            "</div>" +
            "<div style='padding:10px;'>" +
            "<label>" +
            "颜色值： " +
            "<input style='width:100px' class='{prefixCls}editor-color-advanced-value'/>" +
            "</label>" +
            "<span class='{prefixCls}editor-color-advanced-indicator'></span>" +
            "</div>" +
            "</div>",
        footHtml = "<div style='padding:5px 20px 20px;'>" +
            "<a class='{prefixCls}editor-button {prefixCls}editor-color-advanced-ok ks-inline-block'>确定</a>" +
            "&nbsp;&nbsp;&nbsp;" +
            "<a class='{prefixCls}editor-button  {prefixCls}editor-color-advanced-cancel ks-inline-block'>取消</a>" +
            "</div>";

    function ColorPicker(editor) {
        this.editor = editor;
        this._init();
    }

    var addRes = Editor.Utils.addRes, destroyRes = Editor.Utils.destroyRes;

    S.augment(ColorPicker, {
        _init: function () {
            var self = this,
                editor = self.editor,
                prefixCls = editor.get('prefixCls');

            self.dialog = new Overlay4E.Dialog({
                mask: true,
                headerContent: "颜色拾取器",
                bodyContent: S.substitute(panelHtml, {
                    prefixCls: prefixCls
                }),
                footerContent: S.substitute(footHtml, {
                    prefixCls: prefixCls
                }),
                width: "550px"
            }).render();
            var win = self.dialog,
                body = win.get("body"),
                foot = win.get("footer"),
                indicator = body.one("." + prefixCls + "editor-color-advanced-indicator"),
                indicatorValue = body.one("." + prefixCls + "editor-color-advanced-value"),
                left = body.one("." + prefixCls + "editor-color-advanced-picker-left"),
                right = body.one("." + prefixCls + "editor-color-advanced-picker-right"),
                ok = foot.one("." + prefixCls + "editor-color-advanced-ok"),
                cancel = foot.one("." + prefixCls + "editor-color-advanced-cancel");

            ok.on("click", function (ev) {
                var v = S.trim(indicatorValue.val()),
                    colorButtonArrow = self.colorButtonArrow;
                if (!/^#([a-f0-9]{1,2}){3,3}$/i.test(v)) {
                    alert("请输入正确的颜色代码");
                    return;
                }
                //先隐藏窗口，使得编辑器恢复焦点，恢复原先range
                self.hide();
                colorButtonArrow.fire('selectColor', {
                    color: indicatorValue.val()
                });
                ev.halt();
            });


            indicatorValue.on("change", function () {
                var v = S.trim(indicatorValue.val());
                if (!/^#([a-f0-9]{1,2}){3,3}$/i.test(v)) {
                    alert("请输入正确的颜色代码");
                    return;
                }
                indicator.css("background-color", v);
            });


            cancel.on("click", function (ev) {
                self.hide();
                ev && ev.halt();
            });
            body.on("click", function (ev) {
                ev.halt();
                var t = new S.Node(ev.target);
                if (t.nodeName() == "a") {
                    var c = hex(t.css("background-color"));
                    if (left.contains(t))self._detailColor(c);
                    indicatorValue.val(c);
                    indicator.css("background-color", c);
                }
            });
            addRes.call(self, ok, indicatorValue, cancel, body, self.dialog);

            var defaultColor = "#FF9900";
            self._detailColor(defaultColor);
            indicatorValue.val(defaultColor);
            indicator.css("background-color", defaultColor);
        },

        _detailColor: function (color) {
            var self = this,
                win = self.dialog,
                body = win.get("body"),
                editor = self.editor,
                prefixCls = editor.get('prefixCls'),
                detailPanel = body.one("." + prefixCls + "editor-color-advanced-picker-right");

            detailPanel.html(map(ColorGrads(["#ffffff", color, "#000000"], 40),
                function (x) {
                    return "<a style='background-color:" + hex(x) + "'></a>";
                }).join(""));
        },
        show: function (colorButtonArrow) {
            this.colorButtonArrow = colorButtonArrow;
            this.dialog.show();
        },
        hide: function () {
            this.dialog.hide();
        },
        destroy: function () {
            destroyRes.call(this);
        }
    });

    return ColorPicker;
}, {
    requires: ['editor', '../../overlay/']
});
