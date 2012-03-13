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
