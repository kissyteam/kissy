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
