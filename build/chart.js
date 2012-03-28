/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Mar 28 12:22
*/
KISSY.add("chart/anim",function(S){
    var P = S.namespace("Chart"),
        Easing = S.Easing;
    function Anim(duration,easing){
        this.duration = duration*1000;
        this.fnEasing = S.isString(easing)?Easing[easing]:easing;
    }
    S.augment(Anim,{
        init : function(){
            this.start = new Date().getTime();
            this.finish = this.start + this.duration;
        },
        get : function(){
            var now = new Date().getTime(),k;
            if(now > this.finish) {
                return 1;
            }
            k = (now - this.start)/this.duration;
            return this.fnEasing(k);
        }
    });
    P.Anim = Anim;
    return Anim;
});
KISSY.add("chart/axis", function(S) {
    var P = KISSY.namespace("Chart"),
        Event = S.Event,
        LINE = 'line',
        BAR = 'bar';

    /**
     * Axis of Chart
     * @constructor
     * @param {DataObject} data of Chart
     * @param {ChartObject} chart Instance
     * @param {Object} config of Chart
     */
    function Axis(data, chart, config) {
        var self = this,
            label,cfgitem;

        self.chart = chart;
        self.type = data.type;
        self.data = data;
        self.axisData = data.axis();
        self.cfg= config;
        self.current_x = -1;
        self.initEvent();

        S.each(self.axisData, function(item, label) {
            item.name = ("name" in item) && S.isString(item) && item.name.length > 0 ? "(" + item.name + ")" : false;
        });

        self.initdata(self.axisData, config);
    }

    S.mix(Axis, {
        getMax : function(max, cfg) {
            var h = cfg.height - cfg.paddingBottom - cfg.paddingTop,
                n = Math.ceil(h / 40),
                g = max / n,i;
            if (g <= 1) {
                g = 1;
            } else if (g > 1 && g <= 5) {
                g = Math.ceil(g);
            } else if (g > 5 && g <= 10) {
                g = 10;
            } else {
                i = 1;
                do{
                    i *= 10;
                    g = g / 10;
                } while (g > 10)
                g = Math.ceil(g) * i;
            }
            return g * n;
        }
    });

    S.augment(Axis, S.EventTarget, {
        /**
         * 初始化 Y轴 Label
         */
        initYLabel : function(data, cfg) {
            if (data.y.labels) {
                return null;
            }
            var max = cfg.max,
                n = Math.ceil((cfg.height - cfg.paddingBottom - cfg.paddingTop) / 40),
                g = max / n,
                labels = [];
            for (i = 0; i <= n; i++) {
                labels.push(g * i);
            }
            data.y.labels = labels
        },

        /**
         * 初始化数据
         */
        initdata : function(axisData, cfg) {

            this.initYLabel(axisData, cfg);

            var xd = axisData.x,
                yd = axisData.y,
                xl = xd.labels.length,
                yl = yd.labels.length,
                height = cfg.height,
                right = cfg.width - cfg.paddingRight,
                left = cfg.paddingLeft,
                bottom = height - cfg.paddingBottom,
                top = cfg.paddingTop,
                ygap = (bottom - top) / (yl - 1),
                width = right - left,
                xgap, pathx,pathleft,pathright,
                lgap = Math.ceil(120 * xl / width);
            //init X Axis
            xd._lpath = {
                x : right * 2 - left,
                y : height - bottom + 20
            };
            xd._path = [];
            xd._area = [];
            xd._showlabel = [];
            for (i = 0; i < xl; i++) {
                if (this.type === LINE) {
                    xgap = width / (xl - 1);
                    pathx = left + i * xgap;
                    pathleft = (i === 0) ? pathx : pathx - xgap / 2;
                    pathright = (i === (xl - 1)) ? pathx : pathx + xgap / 2;
                } else {
                    xgap = width / xl;
                    pathx = left + (i + 0.5) * xgap;
                    pathleft = pathx - xgap / 2;
                    pathright = pathx + xgap / 2;
                }
                xd._showlabel.push(i === 0 || i % lgap === 0);
                xd._path.push({
                    left : pathleft,
                    right : pathright,
                    top : top,
                    bottom : bottom,
                    x : pathx
                });
                xd._area.push(new P.RectPath(pathleft, top, pathright - pathleft, bottom - top));
            }
            //init Y Axis
            yd._lpath = {
                x: (bottom - top) / 2 + top,
                y : -10
            };
            yd._path = [];
            for (i = 0; i < yl; i++) {
                yd._path.push({
                    y : bottom - ygap * i,
                    left : left,
                    right : right
                });
            }
        },

        /**
         * 初始化事件
         * @private
         */
        initEvent : function() {
            if (this.type === LINE) {
                Event.on(this.chart, P.Chart.MOUSE_MOVE, this.chartMouseMove, this);
                Event.on(this.chart, P.Chart.MOUSE_LEAVE, this.chartMouseLeave, this);
            }
        },

        /**
         * 解除事件绑定
         */
        destory : function() {
            if (this.type === ATYPE.LINE) {
                Event.remove(this.chart, P.Chart.MOUSE_MOVE, this.chartMouseMove);
                Event.remove(this.chart, P.Chart.MOUSE_LEAVE, this.chartMouseLeave);
            }
        },
        //事件回调函数
        chartMouseMove : function(ev) {
            var self = this;

            S.each(self.axisData.x._area, function(path, idx) {
                if (idx !== self.current_x && path.inpath(ev.x, ev.y)) {
                    self.current_x = idx;
                    self.fire("xaxishover", {index : idx, x : self.axisData.x._path[idx].x});
                    self.fire("redraw");
                    return false;
                }
            });
        },
        //事件回调函数
        chartMouseLeave : function(ev) {
            var self = this;
            self.current_x = -1;
            self.fire("redraw");
            self.fire("leave");
        },

        /**
         * 绘坐标系
         * @param {CanasContext} context of current canvas
         */
        draw : function(ctx, size) {
            var self = this,
                config = self.data.config,
                axisData = self.data.axis(),
                cfgx = axisData.x,
                cfgy = axisData.y,
                lx = cfgx.labels.length,
                ly = cfgy.labels.length,
                label,gridleft,
                isline = self.type === LINE,
                isbar = self.type === BAR,
                i, iscurrent,px,py,textwidth,labelx,showlabel;
            ctx.save();
            //draw y axis
            for (i = 0; i < ly; i++) {
                py = cfgy._path[i];
                label = cfgy.labels[i];
                //draw even bg
                if (i % 2 === 1 && i > 0) {
                    ctx.save();
                    ctx.globalAlpha = .3;
                    ctx.fillStyle = config.axisBackgroundColor;
                    ctx.fillRect(
                        py.left,
                        py.y,
                        py.right - py.left,
                        cfgy._path[i - 1].y - py.y);
                    ctx.restore();
                }
                //draw grid
                if (i !== 0 && i !== ly - 1) {
                    ctx.strokeStyle = config.axisGridColor;
                    ctx.lineWidth = "1.0";
                    ctx.beginPath();
                    ctx.moveTo(py.left, py.y);
                    ctx.lineTo(py.right, py.y);
                    ctx.stroke();
                }
                //draw label
                if (label) {
                    ctx.font = "12px Tohoma";
                    ctx.textAlign = "right";
                    ctx.textBaseline = "middle";
                    ctx.fillStyle = config.axisTextColor;
                    ctx.fillText(label, py.left - 5, py.y);
                }
            }
            //draw x axis
            for (i = 0; i < lx; i++) {
                iscurrent = (i === self.current_x);
                px = cfgx._path[i];
                label = cfgx.labels[i];
                showlabel = cfgx._showlabel[i];
                //draw x grid
                ctx.strokeStyle = isline && iscurrent ? "#404040" : config.axisGridColor;
                ctx.lineWidth = isline && iscurrent ? "1.6" : "1.0";
                if (isbar) {
                    if (i !== 0) {
                        ctx.beginPath();
                        ctx.moveTo(px.left, px.bottom);
                        ctx.lineTo(px.left, px.top);
                        ctx.stroke();
                    }
                }
                if (isline) {
                    if (i !== 0 && i !== lx - 1) {
                        ctx.beginPath();
                        ctx.moveTo(px.x, px.bottom);
                        ctx.lineTo(px.x, px.top);
                        ctx.stroke();
                    }
                }
                //draw x label
                if (label && showlabel) {
                    ctx.font = "13px Tahoma";
                    if (isline && i === 0) {
                        ctx.textAlign = "left";
                    } else if (isline && i === lx - 1) {
                        ctx.textAlign = "right";
                    } else {
                        ctx.textAlign = "center";
                    }
                    ctx.textBaseline = "top";
                    ctx.fillStyle = config.axisTextColor;
                    ctx.fillText(label, px.x, px.bottom + 5);
                }
            }

            if (self.current_x !== -1) {
                px = cfgx._path[self.current_x];
                label = cfgx.labels[self.current_x];
                ctx.font = "12px Tahoma";
                textwidth = ctx.measureText(label).width + 6;
                ctx.fillStyle = "#333";
                labelx = Math.max(px.x - textwidth / 2, config.paddingLeft);
                labelx = Math.min(labelx, size.width - config.paddingRight - textwidth);
                ctx.fillRect(labelx, px.bottom, textwidth, 20);
                ctx.textAlign = "left";
                ctx.fillStyle = "#ffffff";
                ctx.fillText(label, labelx + 2, px.bottom + 5);
            }
            ctx.restore();
            self.drawLabels(ctx);
        },

        /**
         * 绘制坐标文字
         * @private
         */
        drawLabels : function(ctx) {
            var self = this,
                data = self.data.axis(),
                yname = data.y.name,
                xname = data.x.name,
                px = data.x._lpath,
                py = data.y._lpath;
            //draw yaxis name
            ctx.save();
            ctx.font = "10px Arial";
            ctx.fillStyle = "#808080";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            if (xname) {
                ctx.fillText(xname, px.x, px.y);
            }
            if (yname) {
                ctx.rotate(Math.PI / 2);
                ctx.translate(py.x, py.y);
                ctx.fillText(yname, 0, 0);
            }
            ctx.restore();
        }
    });
    P.Axis = Axis;
    return Axis;
});
KISSY.add("chart", function(S) {
    var Event = S.Event,
        Dom = S.DOM;

    //kissy < 1.2
    var P = S.namespace("Chart");


    /**
     * 图表默认配置
     */
    var defaultCfg = {
        'left' : 40,
        'top'  : 40
    };

    /**
     * class Chart
     * @constructor
     * @param {String|Object} canvas HTMLElement
     * @param {String|Object} data of canvas
     */
    function Chart(canvas, data) {
        if (!(this instanceof Chart)) return new Chart(canvas, data);

        var elCanvas = this.elCanvas = Dom.get(canvas)

        if(!elCanvas) return;

        var self = this,
            width = elCanvas.width,
            height = elCanvas.height;

        self.elCanvas = elCanvas;
        self.width = width;
        self.height = height;
        self.ctx = -1;

        self.tooltip = Chart.getTooltip();
        self._chartAnim = new P.Anim(0.3, "easeIn");
        if(data){
            self.data = data;
            self._initContext();
        }

    }

    /**
     * 获取ToolTip 对象， 所有图表共享一个Tooltip
     */
    Chart.getTooltip = function() {
        if (!Chart.tooltip) {
            Chart.tooltip = new P.SimpleTooltip();
        }
        return Chart.tooltip;
    };
    /**
     * Event Mouse leave
     */
    Chart.MOUSE_LEAVE = "mouse_leave";

    /**
     * Event Mouse move
     */
    Chart.MOUSE_MOVE= "mouse_move";

    S.augment(Chart,
        S.EventTarget, /**@lends Chart.prototype*/{

        /**
         * render form
         * @param {Object} the chart data
         */
        render : function(data) {
            var self = this;

            // ensure we have got context here
            if(self.ctx == -1){
                self.data = data;
                self._initContext();
                return;
            }
            //wait... context to init
            if(self.ctx === 0){
                self.data = data;
                return;
            }
            self._data = new P.Data(data);
            if(!self._data) return;
            data = self._data;

            self.initChart();
            //绘图相关属性
            self._drawcfg = S.merge(defaultCfg, data.config, {
                width : self.width,
                height : self.height
            });


            if (data.type === "bar" || data.type === "line") {

                //generate the max of Y axis
                self._drawcfg.max = data.axis().y.max || P.Axis.getMax(data.max(), self._drawcfg);

                self.axis = new P.Axis(data, self, self._drawcfg);
                self._frame = new P.Frame(self._data, self._drawcfg);
                self.layers.push(self.axis);
                self.layers.push(self._frame);

            }

            self.element = P.Element.getElement(self._data, self, self._drawcfg);

            self.layers.push(self.element);

            var config = data.config;

            // 设置背景
            var gra = self.ctx.createLinearGradient(0,0,0,self.height);
            self.backgroundFillStyle = null;
            if(config.backgroundStyle && typeof config.backgroundStyle === "object"){
                gra.addColorStop(0, config.backgroundStyle.start);
                gra.addColorStop(1, config.backgroundStyle.end);
                self.backgroundFillStyle = gra;
            }else if(S.isString(config.backgroundStyle)){
                self.backgroundFillStyle = config.backgroundStyle;
            }

            setTimeout(function() {
                self._redraw();
                self.initEvent();
            }, 100);
        },
        /**
         * init Canvas Context
         * @private
         */
        _initContext : function(){
            var self = this;
            if(typeof self.ctx == 'object') return;

            if(self.elCanvas.getContext){
                //flashcanvas初始化需要时间
                setTimeout(function(){
                    self.ctx = self.elCanvas.getContext('2d');
                    self._contextReady();
                }, 150);
            }else{
                //this is for gaving flashCanvas has the time to init canvas
                self.ctx = 0;
                self._count = (typeof self._count == "number") ? self._count-1 : 30;
                if(self._count >= 0){
                    setTimeout(function ctx(){
                        self._initContext();
                    },150)
                }else{
                    //糟了，你的浏览器还不支持我们的图表
                    var text = Dom.create("<p class='ks-chart-error' > \u7cdf\u4e86\uff0c\u4f60\u7684\u6d4f\u89c8\u5668\u8fd8\u4e0d\u652f\u6301\u6211\u4eec\u7684\u56fe\u8868</p>");
                    Dom.insertAfter(text,self.elCanvas)
                }
            }
        },

        /**
         * execute when the ctx is ready
         * @private
         */
        _contextReady : function(){
            var self = this;
            if(self.data){
                self.render(self.data);
           }
        },

        /**
         * show the loading text
         */
        loading : function() {
            this.showMessage("\u8F7D\u5165\u4E2D...");
        },

        /**
         * show text
         */
        showMessage : function(m) {
            var ctx = this.ctx,
                tx = this.width / 2,
                ty = this.height / 2;
            ctx.clearRect(0, 0, this.width, this.height);
            ctx.save();
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.fillStyle = "#808080";
            ctx.fillText(m, tx, ty);
            ctx.restore();
        },

        /**
         * init the chart for render
         * this will remove all the event
         * @private
         */
        initChart : function() {
            var self = this;
            self._chartAnim.init();
            self.layers = [];
            self._updateOffset();
            self.loading();

            S.each([self.element,self.axis], function(item) {
                if (item) {
                    item.destory();
                    Event.remove(item);
                }
            });

            self.element = null;
            self.axis = null;
            if (self._event_inited) {
                Event.remove(self.elCanvas, "mousemove", self._mousemoveHandle);
                Event.remove(self.elCanvas, "mouseenter", self._mouseenterHandle);
                Event.remove(self.elCanvas, "mouseleave", self._mouseLeaveHandle);
                Event.remove(self, Chart.MOUSE_LEAVE, self._drawAreaLeave);
            }
            self.tooltip.hide();
        },

        initEvent : function() {
            var self = this;

            self._event_inited = true;

            Event.on(self.elCanvas, "mousemove", self._mousemoveHandle, self);
            Event.on(self.elCanvas, "mouseenter", self._mouseenterHandle,self);
            Event.on(self.elCanvas, "mouseleave", self._mouseLeaveHandle, self);
            Event.on(self, Chart.MOUSE_LEAVE, self._drawAreaLeave, self);

            if (self.type === "bar") {
                Event.on(self.element, "barhover", self._barHover, self);
            }

            if (self.axis) {
                Event.on(self.axis, "xaxishover", self._xAxisHover, self);
                Event.on(self.axis, "leave", self._xAxisLeave, self);
                Event.on(self.axis, "redraw", self._redraw, self);
            }

            Event.on(self.element, "redraw", self._redraw, self);

            Event.on(self.element, "showtooltip", function(e) {
                var msg = S.isString(e.message)?e.message:e.message.innerHTML;
                self.tooltip.show(msg);
            });

            Event.on(self.element, "hidetooltip", function(e) {
                self.tooltip.hide();
            });
        },

        /**
         * draw all layers
         * @private
         */
        draw : function() {
            var self = this,
                ctx = self.ctx,
                k = self._chartAnim.get(),
                size = self._drawcfg;

            ctx.save();
            ctx.globalAlpha = k;
            if(self.backgroundFillStyle){
                ctx.fillStyle = self.backgroundFillStyle;
                ctx.fillRect(0,0,size.width,size.height);
            }else{
                ctx.clearRect(0,0,size.width,size.height);
            }
            S.each(self.layers, function(e, i) {
                e.draw(ctx, size);
            });
            ctx.restore();

            if (k < 1) {
                this._redraw();
            }
        },
        /**
         * Get The Draw Context of Canvas
         */
        ctx : function(){
            if(this.ctx) {
                return this.ctx;
            }
            if(this.elCanvas.getContext){
                this.ctx = this.elCanvas.getContext('2d');
                return this.ctx;
            }else{
                return null;
            }
        },
        /**
         * redraw the layers
         * @private
         */
        _redraw : function() {
            this._redrawmark = true;
            if (!this._running) {
                this._run();
            }
        },
        /**
         * run the Timer
         * @private
         */
        _run : function() {
            var self = this;
            clearTimeout(self._timeoutid);
            self._running = true;
            self._redrawmark = false;
            self._timeoutid = setTimeout(function go() {
                self.draw();
                if (self._redrawmark) {
                    self._run();
                } else {
                    self._running = false;
                }
            }, 1000 / 24);
        },
        /**
         * event handler
         * @private
         */
        _barHover : function(ev) {
        },
        /**
         * event handler
         * @private
         */
        _xAxisLeave : function(ev) {
            //this._redraw();
            this.fire("axisleave");
        },
        /**
         * event handler
         * @private
         */
        _xAxisHover : function(ev) {
            this.fire("axishover", {
                index : ev.index,
                x : ev.x
            });
            this._redraw();
        },
        /**
         * event handler
         * @private
         */
        _drawAreaLeave : function(ev) {
            this.tooltip.hide();
        },
        /**
         * event handler
         * @private
         */
        _mousemoveHandle : function(e) {
            var ox = e.pageX - this.offset.left,
                oy = e.pageY - this.offset.top;


            if(this._frame && this._frame.path && this._frame.path.inpath(ox,oy) || !this._frame){
                this.fire(Chart.MOUSE_MOVE, {x:ox,y:oy});
            }else{
                this.fire(Chart.MOUSE_LEAVE);
            }
        },

        /**
         * event handle
         * @private
         */
        _mouseenterHandle : function(e){
            this._updateOffset();
        },

        /**
         * get canvas offset
         * @private
         * @return {Object} offset of canvas element
         */
        _updateOffset : function(){
            this.offset = Dom.offset(this.elCanvas);
            return this.offset;
        },
        /**
         * event handler
         * @private
         */
        _mouseLeaveHandle : function(ev) {
            var self = this,
                tooltip = self.tooltip;

            var rel = ev.relatedTarget;

            if(rel && (rel === tooltip.n_c[0] || tooltip.n_c.contains(rel))){
                return;
            }
            this.fire(Chart.MOUSE_LEAVE);
        }
    });

    /*export*/
    P.Chart = Chart;
    return Chart;
}, {
    requires:[
        'chart/anim',
        'chart/axis',
        'chart/simpletooltip',
        'chart/frame',
        'chart/element',
        'chart/element-bar',
        'chart/element-line',
        'chart/element-pie',
        'chart/data'
    ]
});
/*
 * color.js
 * Version 0.2.1.2
 *
 * 2009-09-12
 * 
 * By Eli Grey, http://eligrey.com
 * Licensed under the X11/MIT License
 *   See LICENSE.md
 */

/*jslint undef: true, nomen: true, eqeqeq: true, regexp: true, strict: true, newcap: true, immed: true */

/*! @source http://purl.eligrey.com/github/color.js/blob/master/color.js*/
KISSY.add("chart/color", function(S) {
    var Color = (function () {
        var str = "string",
            Color = function Color(r, g, b, a) {
                var
                    color = this,
                    args = arguments.length,
                    parseHex = function (h) {
                        return parseInt(h, 16);
                    };

                if (args < 3) { // called as Color(color [, alpha])
                    if (typeof r === str) {
                        r = r.substr(r.indexOf("#") + 1);
                        var threeDigits = r.length === 3;
                        r = parseHex(r);
                        threeDigits &&
                        (r = (((r & 0xF00) * 0x1100) | ((r & 0xF0) * 0x110) | ((r & 0xF) * 0x11)));
                    }

                    args === 2 && // alpha specifed
                    (a = g);

                    g = (r & 0xFF00) / 0x100;
                    b = r & 0xFF;
                    r = r >>> 0x10;
                }

                if (!(color instanceof Color)) {
                    return new Color(r, g, b, a);
                }

                this.channels = [
                    typeof r === str && parseHex(r) || r,
                    typeof g === str && parseHex(g) || g,
                    typeof b === str && parseHex(b) || b,
                    (typeof a !== str && typeof a !== "number") && 1 ||
                        typeof a === str && parseFloat(a) || a
                ];
            },
            proto = Color.prototype,
            undef = "undefined",
            lowerCase = "toLowerCase",
            math = Math,
            colorDict;

        // RGB to HSL and HSL to RGB code from
        // http://www.mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript

        Color.RGBtoHSL = function (rgb) {
            // in JS 1.7 use: var [r, g, b] = rgb;
            var r = rgb[0],
                g = rgb[1],
                b = rgb[2];

            r /= 255;
            g /= 255;
            b /= 255;

            var max = math.max(r, g, b),
                min = math.min(r, g, b),
                h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0; // achromatic
            } else {
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }

            return [h, s, l];

        };

        Color.HSLtoRGB = function (hsl) {
            // in JS 1.7 use: var [h, s, l] = hsl;
            var h = hsl[0],
                s = hsl[1],
                l = hsl[2],

                r, g, b,

                hue2rgb = function (p, q, t) {
                    if (t < 0) {
                        t += 1;
                    }
                    if (t > 1) {
                        t -= 1;
                    }
                    if (t < 1 / 6) {
                        return p + (q - p) * 6 * t;
                    }
                    if (t < 1 / 2) {
                        return q;
                    }
                    if (t < 2 / 3) {
                        return p + (q - p) * (2 / 3 - t) * 6;
                    }
                    return p;
                };

            if (s === 0) {
                r = g = b = l; // achromatic
            } else {
                var
                    q = l < 0.5 ? l * (1 + s) : l + s - l * s,
                    p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }

            return [r * 0xFF, g * 0xFF, b * 0xFF];
        };

        Color.rgb = function (r, g, b, a) {
            return new Color(r, g, b, typeof a !== undef ? a : 1);
        };

        Color.hsl = function (h, s, l, a) {
            var rgb = Color.HSLtoRGB([h, s, l]),
                ceil = math.ceil;
            return new Color(ceil(rgb[0]), ceil(rgb[1]), ceil(rgb[2]), typeof a !== undef ? a : 1);
        };

        Color.TO_STRING_METHOD = "hexTriplet"; // default toString method used

        Color.parse = function (color) {
            color = color.replace(/^\s+/g, "") // trim leading whitespace
                [lowerCase]();

            if (color[0] === "#") {
                return new Color(color);
            }

            var cssFn = color.substr(0, 3), i;

            color = color.replace(/[^\d,.]/g, "").split(",");
            i = color.length;

            while (i--) {
                color[i] = color[i] && parseFloat(color[i]) || 0;
            }

            switch (cssFn) {
                case "rgb": // handle rgb[a](red, green, blue [, alpha])
                    return Color.rgb.apply(Color, color); // no need to break;
                case "hsl": // handle hsl[a](hue, saturation, lightness [, alpha])
                    color[0] /= 360;
                    color[1] /= 100;
                    color[2] /= 100;
                    return Color.hsl.apply(Color, color);
            }

            return null;
        };

        (Color.clearColors = function () {
            colorDict = {
                transparent: [0, 0, 0, 0]
            };
        })();

        Color.define = function (color, rgb) {
            colorDict[color[lowerCase]()] = rgb;
        };

        Color.get = function (color) {
            color = color[lowerCase]();

            if (Object.prototype.hasOwnProperty.call(colorDict, color)) {
                return Color.apply(null, [].concat(colorDict[color]));
            }

            return null;
        };

        Color.del = function (color) {
            return delete colorDict[color[lowerCase]()];
        };

        Color.random = function (rangeStart, rangeEnd) {
            typeof rangeStart === str &&
                (rangeStart = Color.get(rangeStart)) &&
            (rangeStart = rangeStart.getValue());
            typeof rangeEnd === str &&
                (rangeEnd = Color.get(rangeEnd)) &&
            (rangeEnd = rangeEnd.getValue());

            var floor = math.floor,
                random = math.random;

            rangeEnd = (rangeEnd || 0xFFFFFF) + 1;
            if (!isNaN(rangeStart)) {
                return new Color(floor((random() * (rangeEnd - rangeStart)) + rangeStart));
            }
            // random color from #000000 to #FFFFFF
            return new Color(floor(random() * rangeEnd));
        };

        proto.toString = function () {
            return this[Color.TO_STRING_METHOD]();
        };

        proto.valueOf = proto.getValue = function () {
            var channels = this.channels;
            return (
                (channels[0] * 0x10000) |
                    (channels[1] * 0x100  ) |
                    channels[2]
                );
        };

        proto.setValue = function (value) {
            this.channels.splice(
                0, 3,

                value >>> 0x10,
                (value & 0xFF00) / 0x100,
                value & 0xFF
                );
        };

        proto.hexTriplet = ("01".substr(-1) === "1" ?
            // pad 6 zeros to the left
            function () {
                return "#" + ("00000" + this.getValue().toString(16)).substr(-6);
            }
            : // IE doesn't support substr with negative numbers
            function () {
                var str = this.getValue().toString(16);
                return "#" + (new Array(str.length < 6 ? 6 - str.length + 1 : 0)).join("0") + str;
            }
            );

        proto.css = function () {
            var color = this;
            return color.channels[3] === 1 ? color.hexTriplet() : color.rgba();
        };

        // TODO: make the following functions less redundant

        proto.rgbData = function () {
            return this.channels.slice(0, 3);
        };

        proto.hslData = function () {
            return Color.RGBtoHSL(this.rgbData());
        };

        proto.rgb = function () {
            return "rgb(" + this.rgbData().join(",") + ")";
        };

        proto.rgba = function () {
            return "rgba(" + this.channels.join(",") + ")";
        };

        proto.hsl = function () {
            var hsl = this.hslData();
            return "hsl(" + hsl[0] * 360 + "," + (hsl[1] * 100) + "%," + (hsl[2] * 100) + "%)";
        };

        proto.hsla = function () {
            var hsl = this.hslData();
            return "hsla(" + hsl[0] * 360 + "," + (hsl[1] * 100) + "%," + (hsl[2] * 100) + "%," + this.channels[3] + ")";
        };

        return Color;
    }());


    var chart = S.namespace("Chart");
    chart.Color = Color;
    return Color;
});

KISSY.add("chart/colors", function(S){
    var P = S.namespace("Chart"),
        colors = [
         { c : "#00b0f0" },
         { c : "#FF4037" },
         { c : "#39B54A" },
         { c : "#FEF56F" },
         { c : "#c821ac" },
         { c : "#D1EB53" }
    ];
    P.colors = colors;
});
KISSY.add("chart/data",function(S){
    var P = S.namespace("Chart");

    /**
     * 图表默认配置
     */
    var defaultConfig= {
        //上边距
        paddingTop: 30,
        //左边距
        paddingLeft : 20,
        //右边距
        paddingRight : 20,
        //底边距
        paddingBottom : 20,
        //是否显示标签
        showLabels : true,

        colors : [],
        //动画间隔
        animationDuration : .5,
        //动画Easing函数
        animationEasing : "easeInStrong",
        //背景色 或 背景渐变
        /*
        {
            start : "#222",
            end : "#666"
        }
        */
        backgroundStyle : false,
        //坐标字体颜色
        axisTextColor : "#999",
        //坐标间隔背景颜色
        axisBackgroundColor : "#EEE",
        //坐标线框颜色
        axisGridColor : "#e4e4e4",
        //Number Format
        //针对特定数据设置numberFormat可以用
        //numberFormats : ['0.00','0.000']
        //false表示不做format处理
        numberFormat : false,
        //边框颜色
        frameColor : "#d7d7d7"
    };

    /**
     * 特定图标配置
     */
    var specificConfig = {
        'line' : {
            //是否在折线下绘制渐变背景
            //值为要绘制背景的折线index
            drawbg : -1
        },
        'bar' : { },
        'pie' : {
            //pie 默认动画时间
            animationDuration : 1.8,
            //pie 的默认动画效果
            animationEasing : "bounceOut",
            paddingTop : 10,
            paddingBottom : 10,
            paddingLeft : 10,
            paddingRight : 10,
            shadow : true,
            labelTemplete : "{name} {pecent}%", //{name} {data} {pecent}
            firstPieOut : false // 第一块飞出
        }
    };

    /**
     * 数据默认配置
     */
    var defaultElementConfig = {
        'default' : {
            label : "{name} -  {data}"
        },
        'line':{
        },
        "pie" : {
        },
        "bar" : {
        }
    };

    /**
     * 图表数据
     * 处理图表输入数据
     * @constructor
     * @param {Object} 输入的图表JSON数据
     */
    function Data(data){
        if(!data || !data.type) return;
        if(!this instanceof Data)
            return new Data(data);
        var self = this,
            cfg = data.config;

        self.origin = data;
        data = S.clone(data);
        self.type = data.type.toLowerCase();
        //self._design = data.design;

        self.config = cfg = S.merge(defaultConfig, specificConfig[self.type], cfg);

        /**
         * 配置兼容
         */
        S.each({
            'left'  : 'paddingLeft',
            'top'   : 'paddingTop',
            'bottom': 'paddingBottom',
            'right' : 'paddingRight'
        }, function(item, key){
            if(key in cfg && S.isNumber(cfg[key])){
                cfg[item] = cfg[key];
            }
        });

        self._elements = self._initElement(data);
        self._elements = self._expandElement(self._elements);
        self._initElementItem();
        self._axis = data.axis;
    }

    S.augment(Data, /**@lends Data.protoptype*/{
        /**
         * get the AxisData
         */
        axis : function(){
            return this._axis;
        },

        /**
         * get the Element Data
         */
        elements : function(){
            return this._elements;
        },

        /**
         * get the the max length of each Element
         */
        maxElementLength: function(){
            var ml = 0;
            S.each(this._elements, function(elem,idx){
                if(S.isArray(elem.items)){
                    ml = Math.max(ml, elem.items.length);
                } else {
                    ml = Math.max(ml,1)
                }
            });
            return ml;
        },


        /**
         * Get the color for the Element
         * from the user config or the default
         * color
         * @param {Number} the index of the element
         * @param {String} type of Chart
         */
        getColor : function(idx,type){
            var length = this._elements.length;
            var usercolor = this.config.colors
            if(S.isArray(usercolor) && usercolor[idx]){
                return usercolor[idx];
            }

            //getColor frome user defined function
            if(S.isFunction(usercolor)){
                return usercolor(idx);
            }

            //get color from default Color getter
            return this.getDefaultColor(idx,length,type);
        },

        /**
         * return the sum of all Data
         */
        sum: function(){
            var d = 0;
            this.eachElement(function(item){
                d += item.data;
            });
            return d;
        },

        /**
         * Get the Biggest Data from element
         */
        max : function(){
            return this._max;
        },

        /**
         * get the default color depending on idx and length, and types of chart 
         * @param {Number} index of element
         * @param {Number} length of element
         */
        getDefaultColor : function (idx,length){
            //在色相环上取色
            var colorgap = 1/3,
                //h = Math.floor(idx/3)/length + 1/(idx%3 + 1)*colorgap,
                h = colorgap * idx, //h of color hsl
                s = .7, // s of color hsl
                b = 1,//b of  color hsb
                l = b - s*.5, //l of color hsl
                i, j, k;

            if(idx < 3){
                h = colorgap * idx + 0.05;
            }else{
                //防止最后一个颜色落在第3区间
                if(length % 3 == 0){
                    if(idx === length -1){
                        idx = length - 2;
                    }else
                    if(idx === length - 2){
                        idx = length - 1;
                    }
                }
                i = idx % 3;
                j = Math.ceil(length/3);
                k = Math.ceil((idx + 1)/3);
                h = i*colorgap + colorgap/j * (k-1);
            }
            return P.Color.hsl(h,s,l).hexTriplet();
        },


        /**
         * execuse fn on each Element item
         */
        eachElement : function(fn){
            var self = this;

            S.each(self._elements, function(item,idx){
                if(item.items){
                    S.each(item.items, function(i, idx2){
                        fn(i,idx,idx2);
                    });
                }else{
                    fn(item, idx, -1);
                }
            });
        },

        /**
         * Init the Element Item
         * parse the label
         */
        _initElementItem: function(){
            var self = this;
            self._max = null;

            self.eachElement(function(elem,idx,idx2){
                if(idx === 0 && (!idx2) )self._max = elem.data || 0;

                var defaultElem = S.merge(defaultElementConfig['default'], defaultElementConfig[self.type]||{});

                elem.data = S.isNumber(elem.data) ? elem.data : 0;
                //数字的格式
                if(S.isArray(self.config.numberFormats) ){
                    elem.format = self.config.numberFormats[idx];
                }

                if(typeof elem.format == 'undefined' ){
                    elem.format = self.config.numberFormat;
                }

                elem.label = elem.label || defaultElem.label;
                elem.label = S.substitute(
                    elem.label,
                    {
                        name : elem.name,
                        data : elem.format?P.format(elem.data, elem.format):elem.data
                    }
                );
                self._max = Math.max(self._max, elem.data);
            });
        },

        /**
         * expand the sub element
         * @param {Object} the Element Object
         * @private
         */
        _expandElement : function(data){
            var datas,
                itemdata,
                self = this;
            S.each(data, function(item,idx){
                if(S.isArray(item.datas)){
                    item.items = item.items || [];
                    S.each(item.datas, function(d,n){
                        itemdata = {
                            name : item.name,
                            data : d
                        };
                        if(item.label){
                            itemdata.label = item.label;
                        }
                        if(item.labels && S.isString(item.labels[n])){
                            itemdata.label = item.labels[n];
                        }

                        delete item.datas;
                        item.items.push(itemdata);
                    });
                }

            });
            return data;
        },

        /**
         * normalize Input Element
         * @private
         * @param {Object} input data
         */
        _initElement : function(data){
            var elements = null,
                elem,
                self = this,
                newelem;

            //数组形式
            if(data.elements && S.isArray(data.elements)){
                elements = S.clone(data.elements);
            }

            //对象形式
            if(!data.elements && data.element && S.isArray(data.element.names)){
                elements = [];
                elem = data.element;
                S.each(elem.names, function(name,idx){
                    elements.push({
                        name   : name,
                        data   : self._getLabel(elem.datas, idx),
                        label  : self._getLabel(elem.labels, idx) || elem.label
                    });
                });
            }

            return elements;
        },

        /**
         * 如果是数组，返回label[n]
         * 否则返回labels
         * @private
         * @param {Any} labels of chart
         * @param {Number} offset of label
         */
        _getLabel : function(labels, offset){
            if(S.isArray(labels)){
                return (offset < labels.length) ? labels[offset]:null;
            }else{
                return false;
            }
        }
    });

    P.Data = Data;

    return Data;
},{requires : ["chart/color"]});
KISSY.add("chart/element",function(S){
    var P = S.namespace("Chart"),
        Dom = S.DOM,
        Event = S.Event;


    function Element (data,chart,drawcfg){
    }

    S.mix(Element,{
        getElement : function(data,chart,cfg){
            var E;
            switch(data.type){
                case "line":
                    E = P.LineElement;
                    break;
                case "pie":
                    E = P.PieElement;
                    break;
                case "bar":
                    E = P.BarElement;
                    break;
            }
            return new E(data,chart,cfg);
        },

        getMax : function(data){
            var max = data[0].data[0],
                elementidx, elementl = data.length,
                dataidx, datal;

            for(elementidx = 0; elementidx < elementl; elementidx ++){
                element = data[elementidx];
                for(dataidx = 0, datal = element.data.length; dataidx < datal; dataidx++){
                    max = Math.max(max, element.data[dataidx] || 0);
                }
            }
            return max;
        }
    });

    S.augment(Element,
        S.EventTarget,
        {
        drawNames : function(ctx){
            var self = this,
                cfg = self.drawcfg,
                data = self.data.elements(),
                l = data.length,
                i = l - 1,
                br = cfg.width - cfg.paddingRight,
                by = cfg.paddingTop - 12,
                d,c;
            for(; i>=0; i--){
                d = data[i];
                if(d.notdraw){
                    continue;
                }
                c = self.data.getColor(i);
                //draw text
                ctx.save();
                ctx.textAlign = "end";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "#808080";
                ctx.font = "12px Arial";
                ctx.fillText(d.name, br, by);
                br -= ctx.measureText(d.name).width + 10;
                ctx.restore();
                //draw color dot
                ctx.save();
                ctx.beginPath();
                ctx.fillStyle = c;
                ctx.arc(br,by,5,0,Math.PI*2,true);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
                br -= 10;
            }
        },
        init : function(){},
        initdata : function(){},
        destory : function(){},
        draw : function(ctx,cfg){},
        drawBar : function(ctx,cfg){},
        getTooltip : function(index){}
    });




    P.Element = Element;
    return Element;
});
KISSY.add("chart/element-bar",function(S,Element){
    S.log('element-bar');
    var P = S.namespace("Chart"),
        Dom = S.DOM,
        Event = S.Event,
        darker = function(c){
            var hsl = c.hslData(),
                l = hsl[2],
                s = hsl[1],
                b  = (l + s/2) * 0.6,
            l = b - s/2;
            return new P.Color.hsl(hsl[0],s,l);
        };
    /**
     * class BarElement for Bar Chart
     */
    function BarElement(data,chart,drawcfg){
        var self = this;
        self.data = data;
        self.chart = chart;
        self.drawcfg = drawcfg;
        self.config = data.config;

        self.initData(drawcfg);
        self.initEvent();

        self.current = [-1,-1];
        self.anim = new P.Anim(self.config.animationDuration,self.config.animationEasing)//,1,"bounceOut");
        self.anim.init();
    }

    S.extend(BarElement, P.Element,{
        initData : function(cfg){
            var self      = this,
                data      = self.data,
                elemLength= data.elements().length,
                maxlength = data.maxElementLength(),
                right = cfg.width - cfg.paddingRight,
                left = cfg.paddingLeft,
                bottom = cfg.height - cfg.paddingBottom,
                itemwidth = (right - left)/maxlength,
                gap = itemwidth/5/elemLength,//gap between bars
                padding = itemwidth/3/elemLength,
                barwidth = (itemwidth - (elemLength - 1) * gap - 2*padding)/elemLength,
                barheight,barleft,bartop,color,
                items = [];
            self.maxLength = maxlength;

            self.items = items;
            self.data.eachElement(function(elem,idx,idx2){
                if(idx2 === -1) idx2 = 0;

                if(!items[idx]){
                    items[idx] = {
                        _x : [],
                        _top  :  [],
                        _left  :  [],
                        _path  :  [],
                        _width  :  [],
                        _height  :  [],
                        _colors : [],
                        _dcolors : [],
                        _labels : []
                    }
                }

                var element = items[idx];

                barheight = (bottom - cfg.top) * elem.data / cfg.max;
                barleft = left + idx2 * itemwidth + padding + idx * (barwidth + gap);
                bartop = bottom - barheight;

                color = P.Color(self.data.getColor(idx,"bar"));
                colord = darker(color);

                element._left[idx2] = barleft;
                element._top[idx2] = bartop;
                element._width[idx2] = barwidth;
                element._height[idx2] = barheight;
                element._path[idx2] = new P.RectPath(barleft,bartop,barwidth,barheight);
                element._x[idx2] = barleft+barwidth/2;
                element._colors[idx2] = color;
                element._dcolors[idx2] = colord;
                element._labels[idx2] = elem.label;
            });

        },

        /**
         * draw the barElement
         * @param {Object} Canvas Object
         */
        draw : function(ctx){
            var self = this,
                data = self.items,
                ml = self.maxLength,
                color,gradiet,colord,chsl,
                barheight,cheight,barleft,bartop,
                //for anim
                k = self.anim.get(),
                i;

            if(self.data.config.showLabels){
                self.drawNames(ctx);
            }

            S.each(data, function(bar, idx){
                for(i = 0; i< ml; i++){
                    barleft = bar._left[i];
                    barheight = bar._height[i];
                    cheight = barheight * k;
                    bartop = bar._top[i] + barheight - cheight;
                    barwidth = bar._width[i];
                    color =    bar._colors[i];
                    dcolor =    bar._dcolors[i];

                    //draw backgraound
                    gradiet = ctx.createLinearGradient(barleft,bartop,barleft,bartop + cheight);
                    gradiet.addColorStop(0,color.css());
                    gradiet.addColorStop(1,dcolor.css());

                    ctx.fillStyle = gradiet;
                    //ctx.fillStyle = color;
                    ctx.fillRect(barleft,bartop,barwidth,cheight);
                    //draw label on the bar
                    if(ml === 1 && barheight > 25){
                        ctx.save();
                        ctx.fillStyle = "#fff";
                        ctx.font = "20px bold Arial";
                        ctx.textBaseline = "top";
                        ctx.textAlign = "center";
                        data = self.data.elements()[idx];
                        ctx.fillText(P.format(data.data, data.format), bar._x[i], bartop + 2);
                        ctx.restore();
                    }
                }

            });

            if(k < 1) {
                self.fire("redraw");
            }
        },

        initEvent : function(){
            Event.on(this.chart,P.Chart.MOUSE_MOVE,this.chartMouseMove,this);
            Event.on(this.chart,P.Chart.MOUSE_LEAVE,this.chartMouseLeave,this);
        },

        destory : function(){
            Event.remove(this.chart,P.Chart.MOUSE_MOVE,this.chartMouseMove);
            Event.remove(this.chart,P.Chart.MOUSE_LEAVE,this.chartMouseLeave);
        },

        chartMouseMove : function(ev){
            var current = [-1,-1],
                items = this.items;

            S.each(this.items, function(bar,idx){
                S.each(bar._path, function(path,index){
                    if(path.inpath(ev.x,ev.y)){
                        current = [idx,index];
                    }
                });
            });

            if( current[0] === this.current[0] &&
                current[1] === this.current[1])
            {
                return;
            }
            this.current = current;
            if(current[0] + current[1] >= 0){
                this.fire("barhover",{index:current});
                this.fire("showtooltip",{
                    top : items[current[0]]._top[current[1]],
                    left : items[current[0]]._x[current[1]],
                    message : this.getTooltip(current)
                });
            }else{
                this.fire("hidetooltip");
            }
        },
        chartMouseLeave : function(){
            this.current = [-1,-1];
        },
        /**
         * get tip HTML by id
         * @return {String}
         **/
        getTooltip : function(index){
            var self = this,
                eidx = index[0],
                didx = index[1],
                item = self.items[eidx],
                msg = "<div class='bartip'>"+
                    "<span style='color:"+item._colors[didx].css()+";'>"+
                    item._labels[didx]+"</span></div>";
            return msg;
        }
    });

    P.BarElement = BarElement;
    return BarElement;
},{
    requires : ["chart/element"]
});
KISSY.add("chart/element-line",function(S){
    var P = S.namespace("Chart"),
        Dom = S.DOM,
        Event = S.Event;
    /**
     * class Element for Line chart
     */
    function LineElement(data,chart,drawcfg){
        var self = this;
        self.chart = chart;
        self.data = data;
        self.elements = data.elements();
        self._current = -1;
        self.config = data.config;
        self.drawcfg = drawcfg;
        self.initdata(drawcfg);
        self._ready_idx = -1;
        self.init();

        self.anim = new P.Anim(self.config.animationDuration,self.config.animationEasing);
        self.anim.init();
    }

    S.extend(LineElement, P.Element, {
        /**
         * 根据数据源，生成图形数据
         */
        initdata : function(cfg){
            var self = this,
                data = self.data,
                elements = self.elements,
                ml = data.maxElementLength(),
                left = cfg.paddingLeft,
                bottom = cfg.height - cfg.paddingBottom,
                height = bottom - cfg.paddingTop,
                width = cfg.width - cfg.paddingRight - left,
                gap = width/(ml-1),
                maxtop, i,j;
            var items = [];
            self.items = items;

            data.eachElement(function(elem,idx,idx2){
                if(!items[idx]){
                    items[idx] = {
                        _points : [],
                        _labels : [],
                        _color : data.getColor(idx),
                        _maxtop : bottom,
                        _drawbg : idx === data.config.drawbg
                    };
                }
                var element = items[idx];
                ptop = Math.max(bottom - elem.data/ cfg.max * height , cfg.paddingTop - 5);
                element._maxtop = Math.min(element._maxtop, ptop);
                element._labels[idx2] = elem.label;
                element._points[idx2] = {
                    x : left + gap*idx2,
                    y : ptop,
                    bottom : bottom
                };

            });

        },

        draw : function(ctx,cfg){
            var self = this,
                data = self.data,
                left = cfg.paddingLeft,
                right = cfg.width - cfg.paddingRight,
                top = cfg.paddingTop,
                bottom = cfg.height - cfg.paddingBottom,
                height = bottom - top,
                max = cfg.max,
                color,
                ptop,
                points,i,l,t,
                k = self.anim.get(), gradiet;


            if(data.config.showLabels){
                self.drawNames(ctx,cfg);
            }

            // the animation
            if(k >= 1 && this._ready_idx < self.items.length -1){
                self._ready_idx ++;
                self.anim.init();
                k = self.anim.get();
            }

            if(this._ready_idx !== data.elements().length-1 || k!==1){
                this.fire("redraw");
            }

            S.each(self.items,function(linecfg,idx){
                var p;
                if (idx !== self._ready_idx) {
                    t = (idx > self._ready_idx)?0:1;
                }else{
                    t = k;
                }

                color = linecfg._color;
                points = linecfg._points;

                //draw bg
                if(linecfg._drawbg){
                    ctx.save();
                    ctx.globalAlpha = 0.4;
                    maxtop = bottom - (bottom - linecfg._maxtop) * t;

                    gradiet = ctx.createLinearGradient( left, maxtop, left, bottom);
                    gradiet.addColorStop(0,color);
                    gradiet.addColorStop(1,"rgb(255,255,255)");

                    ctx.fillStyle = gradiet;
                    ctx.beginPath();
                    ctx.moveTo(left,bottom);

                    for(i = 0; i < points.length; i++){
                        p = points[i];
                        ptop = bottom - (bottom - p.y)*t;
                        ctx.lineTo(p.x,ptop);
                    }

                    ctx.lineTo(right,bottom);
                    ctx.stroke();
                    ctx.fill();
                    ctx.restore();
                }

                //draw line
                ctx.save();
                l = points.length;
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                for(i = 0; i < l; i++){
                    p = points[i];
                    ptop = bottom - (bottom - p.y)*t;
                    if(i===0){
                        ctx.moveTo(p.x,ptop);
                    } else {
                        ctx.lineTo(p.x,ptop);
                    }
                }
                ctx.stroke();
                ctx.restore();

                //draw point
                ctx.save();
                for(i = 0; i < l; i++){
                    p = points[i];
                    ptop = bottom - (bottom - p.y)*t;
                    //circle outter
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(p.x,ptop,5,0,Math.PI*2,true);
                    ctx.closePath();
                    ctx.fill();
                    //circle innner
                    if(i !== self._current){
                        ctx.fillStyle = "#fff";
                        ctx.beginPath();
                        ctx.arc(p.x,ptop,3,0,Math.PI*2,true);
                        ctx.closePath();
                        ctx.fill();
                    }
                }
                ctx.restore();
            });
        },

        init : function(){
            this._ready_idx = 0;
            Event.on(this.chart,"axishover",this._axis_hover,this);
            Event.on(this.chart,"axisleave",this._axis_leave,this);
        },

        destory : function(){
            Event.remove(this.chart,"axishover",this._axis_hover);
            Event.remove(this.chart,"axisleave",this._axis_leave);
        },

        _axis_hover : function(e){
            var idx = e.index;
            if(this._current !== idx){
                this._current = idx;
                this.fire("redraw");
                this.fire("showtooltip",{
                    message : this.getTooltip(idx)
                });
            }
        },

        _axis_leave : function(e){
            this._current = -1;
            this.fire("redraw");
        },
        /**
         * get tip HTML by id
         * @return {String}
         **/
        getTooltip : function(index){
            var self = this, ul, li;
            ul= "<ul>";
            S.each(self.items, function(item,idx){
                li = "<li><p style='color:" + item._color + "'>" +
                        item._labels[index] +
                    "</p></li>";
                ul += li
            });
            ul += "</ul>";
            return ul;
        }

    });

    P.LineElement = LineElement;
    return LineElement;
},
{
    requires : ["chart/element"]
});
KISSY.add("chart/element-pie",function(S){
    var P = S.namespace("Chart"),
        Event = S.Event,
        lighter = function(c){
            if(S.isString(c)){
                c = P.Color(c)
            };
            var hsl = c.hslData(),
                s = hsl[1],
                l = hsl[2],
                b = l + s * 0.5;
            l = b*1.05 - s*.5;
            return new P.Color.hsl(hsl[0], s, l);
        };

    function PieElement(data,chart,drawcfg){
        var self = this;
        self.data = data;
        self.chart = chart;
        self.type = 0;
        self.config = data.config;
        self.drawcfg = drawcfg;
        self.initdata(drawcfg);
        self.init();
        self.anim = new P.Anim(self.config.animationDuration,self.config.animationEasing)//,1,"bounceOut");
        self.anim.init();
    }

    S.extend(PieElement,P.Element,{
        initdata : function(cfg){
            var self = this,
                data = self.data,
                total = 0,
                end,
                color,
                pecent,pecentStart;

            self._x = data.config.showLabels ? cfg.width * 0.618 /2 : cfg.width/2;
            self._y = cfg.height/2;
            self._r = Math.min(cfg.height - cfg.paddingTop - cfg.paddingBottom, cfg.width - cfg.paddingLeft - cfg.paddingRight)/2;
            self._r = Math.min(self._r, self._x - cfg.paddingLeft);
            self._lx = cfg.width*0.618;
            self.angleStart = -Math.PI/4;//Math.PI * 7/4;
            self.antiClock = true;
            self.items = [];
            self._currentIndex = -1;
            total = data.sum();

            pecentStart = 0;
            S.each(data.elements(),function(item,idx){
                pecent   = item.data/total;
                end = pecentStart + pecent;
                color = data.getColor(idx);
                self.items.push({
                    start : pecentStart,
                    end : end,
                    color : color,
                    color2 : lighter(color).css(),
                    textColor : "#999",
                    labelRight : cfg.width - 50,
                    labelY : 50 + 20 * idx
                });
                pecentStart = end;
                if(idx === 0 ){
                    self.angleStart += pecent * Math.PI;
                }
            });

        },

        /**
         * Draw the Labels for all Element
         * @private
         */
        drawLabels: function(ctx){
            var self = this,
                data = self.data,
                items = self.items,
                item,
                sum = data.sum(),
                labelText,
                labelX , labelY;
            ctx.save();
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'right';
            data.eachElement(function(elem,idx){
                item = items[idx];
                labelY = item.labelY;
                labelX = item.labelRight;
                ctx.fillStyle = items[idx].color;
                ctx.beginPath();
                ctx.moveTo(labelX,labelY)
                ctx.font = "15px sans-serif"
                ctx.fillRect(labelX - 10,labelY-5,10,10);
                ctx.closePath();
                ctx.fillStyle = items[idx].textColor;
                labelText = S.substitute(self.data.config.labelTemplete,{data:P.format(elem.data,elem.format),name:elem.name, pecent : P.format(elem.data/sum * 100,"0.00")});
                ctx.fillText(labelText, labelX - 15, labelY);
            });
            ctx.restore();
        },

        draw : function(ctx){
            var self = this,
                px = self._x,
                py = self._y,
                pr = self._r,
                start, end,
                bgStart,bgEnd,
                k = self.anim.get(),
                config = self.data.config,
                gra;
            if(k < 1){
                self.fire("redraw");
            }
            if(config.showLabels){
                self.drawLabels(ctx);
            }

            //draw bg shadow
            if(config.shadow){
                ctx.save();
                ctx.fillStyle = "#fff";
                ctx.shadowBlur = 10;
                ctx.shadowColor = "black";
                ctx.beginPath();
                ctx.moveTo(px,py);
                bgStart = self.angleStart;
                bgEnd = self.antiClock?bgStart - Math.PI * 2 * k : bgStart + Math.PI * 2 * k;
                ctx.arc(px, py, pr-1, bgStart, bgEnd, self.antiClock);
                ctx.fill();
                ctx.restore();
            }

            ctx.save();
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = "#fff";

            S.each(self.items, function(p, idx){
                start = p.start * k * 2 * Math.PI;
                end = p.end* k * 2 * Math.PI;
                ctx.save();
                ctx.fillStyle = idx === self._currentIndex? p.color2: p.color;
                ctx.beginPath();
                p._currentStart = self.antiClock?self.angleStart-start:self.angleStart+start;
                p._currentEnd = self.antiClock?self.angleStart-end-0.005 :self.angleStart+end+0.005;
                if(idx === 0 && k >= 1 && config.firstPieOut) {
                    ctx.moveTo(px + 2,py - 2);
                    ctx.arc(px + 2, py - 2, pr, p._currentStart, p._currentEnd, self.antiClock);
                }else{
                    ctx.moveTo(px,py);
                    ctx.arc(px, py, pr, p._currentStart, p._currentEnd, self.antiClock);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            });
            ctx.restore();
        },

        init : function(){
            Event.on(this.chart,P.Chart.MOUSE_MOVE,this.chartMouseMove,this);
            Event.on(this.chart,P.Chart.MOUSE_LEAVE,this.chartMouseLeave,this);
        },
        destory : function(){
            Event.remove(this.chart,P.Chart.MOUSE_MOVE,this.chartMouseMove);
            Event.remove(this.chart,P.Chart.MOUSE_LEAVE,this.chartMouseLeave);
        },

        chartMouseMove : function(ev){
            var self = this,
                pr = self._r,
                dx = ev.x - self._x,
                dy = ev.y - self._y,
                anglestart,
                angleend, angle,t,
                item, items = self.items;

            // if mouse out of pie
            if(dx*dx + dy*dy > pr*pr){
                self.fire("hidetooltip");
                self._currentIndex = -1;
                self.fire("redraw");
                return;
            };

            //get the current mouse angle from 
            //the center of the pie
            if(dx != 0 ){
                angle = Math.atan(dy/dx);
                if(dy < 0 && dx > 0){
                    angle += 2*Math.PI;
                }
                if(dx < 0){
                    angle += Math.PI;
                }
            }else{
                angle = dy >= 0 ? Math.PI/2 : 3 * Math.PI/2;
            }

            //find the pieace under mouse
            for(i = items.length - 1; i >= 0 ; i--){
                item = items[i];
                t = Math.PI * 2

                anglestart = item._currentStart;
                angleend = item._currentEnd;

                if(anglestart > angleend){
                    t = anglestart;
                    anglestart = angleend;
                    angleend = t;
                }

                t = angleend-anglestart;

                anglestart = anglestart % (Math.PI * 2)

                if(anglestart < 0 ){
                    if(anglestart + t < 0 || angle > Math.PI){
                        anglestart = anglestart + Math.PI * 2;
                    }
                }

                if(angle > anglestart && angle < anglestart + t && i !== self._currentIndex){
                    self._currentIndex = i;
                    self.fire("redraw");
                    self.fire("showtooltip",{
                        message : self.data.elements()[i].label
                    });
                }
            }

        },

        chartMouseLeave : function(ev){
            this._currentIndex = -1;
            this.fire("hidetooltip");
            this.fire("redraw");
        }
    });

    P.PieElement = PieElement;
    return PieElement;

},{
    requires : ["chart/element"]
});
/**
 * Formats the number according to the ‘format’ string;
 * adherses to the american number standard where a comma
 * is inserted after every 3 digits.
 *  note: there should be only 1 contiguous number in the format,
 * where a number consists of digits, period, and commas
 *        any other characters can be wrapped around this number, including ‘$’, ‘%’, or text
 *        examples (123456.789):
 *          ‘0 - (123456) show only digits, no precision
 *          ‘0.00 - (123456.78) show only digits, 2 precision
 *          ‘0.0000 - (123456.7890) show only digits, 4 precision
 *          ‘0,000 - (123,456) show comma and digits, no precision
 *          ‘0,000.00 - (123,456.78) show comma and digits, 2 precision
 *          ‘0,0.00 - (123,456.78) shortcut method, show comma and digits, 2 precision
 *
 * @method format
 * @param format {string} the way you would like to format this text
 * @return {string} the formatted number
 * @public
 */
KISSY.add("chart/format", function(S) {
    var format = function(that,format) {
        if (typeof format !== "string") {
            return;
        } // sanity check

        var hasComma = -1 < format.indexOf(","),
            psplit = format.split('.');

        // compute precision
        if (1 < psplit.length) {
            // fix number precision
            that = that.toFixed(psplit[1].length);
        }
        // error: too many periods
        else if (2 < psplit.length) {
            throw('NumberFormatException: invalid format, formats should have no more than 1 period:' + format);
        }
        // remove precision
        else {
            that = that.toFixed(0);
        }

        // get the string now that precision is correct
        var fnum = that.toString();

        // format has comma, then compute commas
        if (hasComma) {
            // remove precision for computation
            psplit = fnum.split('.');

            var cnum = psplit[0],
                parr = [],
                j = cnum.length,
                m = Math.floor(j / 3),
                n = cnum.length % 3 || 3; // n cannot be ZERO or causes infinite loop

            // break the number into chunks of 3 digits; first chunk may be less than 3
            for (var i = 0; i < j; i += n) {
                if (i != 0) {
                    n = 3;
                }
                parr[parr.length] = cnum.substr(i, n);
                m -= 1;
            }

            // put chunks back together, separated by comma
            fnum = parr.join(',');

            // add the precision back in
            if (psplit[1]) {
                fnum += '.' + psplit[1];
            }
        }

        // replace the number portion of the format with fnum
        return format.replace(/[\d,?\.?]+/, fnum);
    };

    var chart=S.namespace("Chart");
    chart.format=format;

    return format;

});
KISSY.add("chart/frame",function(S){
    var P = S.namespace("Chart");

    /**
     * The Border Layer
     */
    function Frame(data,cfg){
        this.data = data;
        this.path = new P.RectPath(
                        cfg.paddingLeft,
                        cfg.paddingTop,
                        cfg.width - cfg.paddingRight - cfg.paddingLeft,
                        cfg.height - cfg.paddingBottom - cfg.paddingTop
                    );
    }
    S.augment(Frame,{
        draw : function(ctx,cfg){
            ctx.save();
            ctx.strokeStyle = this.data.config.frameColor;
            ctx.lineWidth = 2.0;
            this.path.draw(ctx);
            ctx.stroke();
            ctx.restore();
        }
    });
    P.Frame = Frame;
    return Frame;
});
KISSY.add("chart/path",function(S){
    var ie = S.UA.ie,
        P = S.namespace("Chart");

    function Path(x,y,w,h){ }
    S.augment(Path,{
        /**
         * get the path draw
         */
        draw : function(ctx){ },
        /**
         * get the path draw
         */
        inpath : function(ox,oy,ctx){ }
    });

    function RectPath(x,y,w,h){
        this.rect = {x:x,y:y,w:w,h:h};
    }

    S.extend(RectPath, Path, {
        draw : function(ctx){
            var r = this.rect;
            ctx.beginPath();
            ctx.rect(r.x,r.y,r.w,r.h);
        },
        inpath : function(ox,oy,ctx){
            var r = this.rect,
                left = r.x,
                top = r.y,
                right = left + r.w,
                bottom = top + r.h,
                detect = ox > left && ox < right && oy > top && oy < bottom;
            return detect;
        }
    });

    function ArcPath(x,y,r,b,e,a){
        this._arc= {x:x,y:y,r:r,b:b,e:e,a:a};
    }
    S.extend(ArcPath, Path, {
        draw : function(ctx){
            var r = this._arc;
            ctx.beginPath();
            ctx.moveTo(r,x,r.y);
            ctx.arc(r.x,r.y,r.r,r.b,r.e,r.a);
            ctx.closePath();
        },
        /**
         * detect if point(ox,oy) in path
         */
        inpath : function(ox,oy,ctx){
            if(ctx){
                this.draw(ctx);
                return ctx.isPointInPath(ox,oy);
            }
            var r = this._arc,
                dx = ox - r.x,
                dy = ox - r.y,
                incircle = (Math.pow(dx, 2) + Math.pow(dy, 2))<= Math.pow(r.r, 2),
                detect;
            if(!incircle) {
                return false;
            }
            if(dx === 0){
                if(dy === 0){
                    return false;
                }else{
                    da = dy>0?Math.PI/2:Math.PI*1.5;
                }
            }else{
                //TODO
            }

            return detect;
        }
    });

    P.Path = Path;
    P.RectPath = RectPath;
    P.ArcPath = ArcPath;
    return {
        Path:Path,
        RectPath:RectPath,
        ArcPath:ArcPath
    };
});
KISSY.add("chart/simpletooltip",function(S){
    var P     = S.namespace("Chart"),
        Dom   = S.DOM,
        Event = S.Event;

    /**
     * 工具提示，总是跟随鼠标
     */
    function SimpleTooltip(){
        var self = this;
        this.el_c = Dom.create("<div class='ks-chart-tooltip'>");
        this.n_c = S.one(this.el_c);
        this._offset = {left:0,top:0}
        this.hide();

        S.ready(function(){
            document.body.appendChild(self.el_c);
        });

        Event.on(document.body,"mousedown",this._mousemove, this);
        Event.on(document.body,"mousemove",this._mousemove, this);
    }

    S.augment(SimpleTooltip,{
        _mousemove : function(ev){
            var ttx = ev.pageX;
            var tty = ev.pageY;
            if(this._show){
                this._updateOffset(ttx, tty);
            }else{
                //save the position
                this._offset.left = ttx;
                this._offset.top = tty;
            }
        },
        _updateOffset : function(x,y){
            if(x > Dom.scrollLeft() + Dom.viewportWidth() - 100){
                x -= this.n_c.width() + 6;
            }
            if(y > Dom.scrollTop() + Dom.viewportHeight() - 100){
                y -= this.n_c.height() + 20;
            }
            this.n_c.offset({left:x, top:y+12});
        },
        /**
         * show the tooltip
         * @param {String} the message to show
         */
        show : function(msg){
            var self = this;
            this._show = true;
            this.n_c
                .html(msg)
                .css("display","block")
                //.offset(this._offset)

        },
        /**
         * hide the tooltip
         */
        hide : function(){
            this._show = false;
            this.n_c.css("display","none");
        },

        _init : function(){}
    });

    P.SimpleTooltip = SimpleTooltip;
    return SimpleTooltip;
});
