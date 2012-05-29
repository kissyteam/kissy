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
