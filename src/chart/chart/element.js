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
