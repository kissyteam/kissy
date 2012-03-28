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
