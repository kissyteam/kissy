/**
 * position and visible extension，可定位的隐藏层
 * @author: 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase/positionrender", function(S) {

    function Position() {
    }

    Position.ATTRS = {
        x: {
            // 水平方向绝对位置
        },
        y: {
            // 垂直方向绝对位置
        },
        zIndex: {
            value: 9999
        },
        visible:{}
    };


    Position.prototype = {

        __renderUI:function() {
            var el = this.get("el");
            el.addClass("ks-ext-position");
            el.css("display", "");
        },

        _uiSetZIndex:function(x) {
            this.get("el").css("z-index", x);
        },
        _uiSetX:function(x) {
            this.get("el").offset({
                left:x
            });
        },
        _uiSetY:function(y) {
            this.get("el").offset({
                top:y
            });
        },
        _uiSetVisible:function(isVisible) {
            this.get("el").css("visibility", isVisible ? "visible" : "hidden");
        },

        show:function() {
            this.render();
            this.set("visible", true);
        },
        hide:function() {
            this.set("visible", false);
        }
    };

    return Position;
});