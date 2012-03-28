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
