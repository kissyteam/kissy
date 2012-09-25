/**
 * @ignore
 * @fileOverview position and visible extension，可定位的隐藏层
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/position-render", function () {

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
        },
        /**
         * @ignore
         * see {@link Component.UIBase.Box#visibleMode}.
         * @default "visibility"
         */
        visibleMode: {
            value: "visibility"
        }
    };


    Position.prototype = {

        __createDom: function () {
            this.get("el").addClass(this.get('prefixCls') + "ext-position");
        },

        _uiSetZIndex: function (x) {
            this.get("el").css("z-index", x);
        },

        _uiSetX: function (x) {
            if (x != null) {
                this.get("el").offset({
                    left: x
                });
            }
        },

        _uiSetY: function (y) {
            if (y != null) {
                this.get("el").offset({
                    top: y
                });
            }
        }
    };

    return Position;
});