/**
 * color picker
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("colorsupport/dialog/colorpicker", function() {
    var S = KISSY,
        KE = S.Editor,
        map = KE.Utils.map,
        DOM = S.DOM;
    DOM.addStyleSheet("" +
        ".ke-color-advanced-picker-left {" +
        "float:left;" +
        "display:inline;" +
        "margin-left:10px;" +
        "}" +

        ".ke-color-advanced-picker-right {" +
        "float:right;" +
        "width:50px;" +
        "display:inline;" +
        "margin:13px 10px 0 0;" +
        "cursor:crosshair;" +
        "}" +
        "" +
        ".ke-color-advanced-picker-right a {" +
        "height:2px;" +
        "line-height:0;" +
        "font-size:0;" +
        "display:block;" +
        "}" +
        "" +

        ".ke-color-advanced-picker-left ul{" +
        "float:left;" +
        "}" +
        ".ke-color-advanced-picker-left li,.ke-color-advanced-picker-left a{" +
        "overflow:hidden;" +
        "width:15px;" +
        "height:16px;" +
        "line-height:0;" +
        "font-size:0;" +
        "display:block;" +
        "}" +
        ".ke-color-advanced-picker-left a:hover{" +
        "width:13px;height:13px;border:1px solid white;" +
        "}" +
        "" +
        ".ke-color-advanced-indicator {" +
        "margin-left:10px;" +
        "*zoom:1;" +
        "display:inline-block;" +
        "*display:inline;" +
        "width:68px;" +
        "height:24px;" +
        "vertical-align:middle;" +
        "line-height:0;" +
        "overflow:hidden;" +
        "}", "ke-color-advanced");

    //获取颜色数组
    function getData(color) {
        if (S.isArray(color)) return color;
        var re = RegExp;
        if (/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.test(color)) {
            //#rrggbb
            return map([ re['$1'], re['$2'], re['$3'] ], function(x) {
                return parseInt(x, 16);
            });
        } else if (/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.test(color)) {
            //#rgb
            return map([ re['$1'], re['$2'], re['$3'] ], function(x) {
                return parseInt(x + x, 16);
            });
        } else if (/^rgb\((.*),(.*),(.*)\)$/i.test(color)) {
            //rgb(n,n,n) or rgb(n%,n%,n%)
            return map([ re['$1'], re['$2'], re['$3'] ], function(x) {
                return x.indexOf("%") > 0 ? parseFloat(x, 10) * 2.55 : x | 0;
            });
        }
        return undefined;
    }

    //refer:http://www.cnblogs.com/cloudgamer/archive/2009/03/11/color.html
    //http://yiminghe.javaeye.com/blog/511589
    //获取颜色梯度方法
    var ColorGrads = (function() {
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
            return map(colors, function(x) {
                return map(x, function(x) {
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
                } catch(e) {
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


        return function(colors, step) {
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
            function(x) {
                return map(ColorGrads([ "white", "rgb(" + x.join(",") + ")" ,"black" ], 5),
                    function(x) {
                        return "<li><a style='background-color" + ":" + hex(x) + "' href='#'></a></li>";
                    }).join("");
            }).join("</ul><ul>") + "</ul>";


    var panelHtml = "<div class='ke-color-advanced-picker'>" +
        "<div class='ks-clear'>" +
        "<div class='ke-color-advanced-picker-left'>" +
        pickerHtml +
        "</div>" +
        "<div class='ke-color-advanced-picker-right'>" +
        "</div>" +
        "</div>" +
        "<div style='padding:10px;'>" +
        "<label>" +
        "颜色值： " +
        "<input style='width:100px' class='ke-color-advanced-value'/>" +
        "</label>" +
        "<span class='ke-color-advanced-indicator'></span>" +
        "</div>" +
        "</div>";

    var footHtml = "<div style='padding:5px 20px 20px;'>" +
        "<a class='ke-button ke-color-advanced-ok'>确定</a>&nbsp;&nbsp;&nbsp;" +
        "<a class='ke-button  ke-color-advanced-cancel'>取消</a>" +
        "</div>";

    function ColorPicker() {
        this._init();
    }

    var addRes = KE.Utils.addRes,destroyRes = KE.Utils.destroyRes;
    S.augment(ColorPicker, {
            _init:function() {
                var self = this;
                self.__res = [];
                self.dialog = new KE.Dialog({
                        mask:true,
                        headerContent:"颜色拾取器",
                        bodyContent:panelHtml,
                        footerContent:footHtml,
                        autoRender:true,
                        width:"550px"
                    });
                var win = self.dialog,
                    body = win.get("body"),
                    foot = win.get("footer"),
                    indicator = body.one(".ke-color-advanced-indicator"),
                    indicatorValue = body.one(".ke-color-advanced-value"),
                    left = body.one(".ke-color-advanced-picker-left"),
                    right = body.one(".ke-color-advanced-picker-right"),
                    ok = foot.one(".ke-color-advanced-ok"),
                    cancel = foot.one(".ke-color-advanced-cancel");

                ok.on("click", function(ev) {
                    var v = S.trim(indicatorValue.val()),
                        cmd = self.cmd;
                    if (!/^#([a-f0-9]{1,2}){3,3}$/i.test(v)) {
                        alert("请输入正确的颜色代码");
                        return;
                    }
                    //先隐藏窗口，使得编辑器恢复焦点，恢复原先range
                    self.hide();
                    setTimeout(function() {
                        cmd.cfg._applyColor.call(cmd, indicatorValue.val());
                    }, 0);
                    ev && ev.halt();
                });


                indicatorValue.on("change", function() {
                    var v = S.trim(indicatorValue.val());
                    if (!/^#([a-f0-9]{1,2}){3,3}$/i.test(v)) {
                        alert("请输入正确的颜色代码");
                        return;
                    }
                    indicator.css("background-color", v);
                });


                cancel.on("click", function(ev) {
                    self.hide();
                    ev && ev.halt();
                });
                body.on("click", function(ev) {
                    ev.halt();
                    var t = new S.Node(ev.target);
                    if (t._4e_name() == "a") {
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

            _detailColor:function(color) {
                var self = this,
                    win = self.dialog,
                    body = win.get("body"),
                    detailPanel = body.one(".ke-color-advanced-picker-right");

                detailPanel.html(map(ColorGrads(["#ffffff",color,"#000000"], 40),
                    function(x) {
                        return "<a style='background-color:" + hex(x) + "'></a>";
                    }).join(""));
            },
            show:function(cmd) {
                this.cmd = cmd;
                this.dialog.show();
            },
            hide:function() {
                this.dialog.hide();
            },
            destroy:function() {
                destroyRes.call(this);
            }
        });

    KE.ColorSupport.ColorPicker = ColorPicker;
}, {
        attach:false
    });