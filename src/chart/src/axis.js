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
