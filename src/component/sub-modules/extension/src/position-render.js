/**
 * @ignore
 * position and visible extension，可定位的隐藏层
 * @author yiminghe@gmail.com
 */
KISSY.add("component/extension/position-render", function () {

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
         * see {@link KISSY.Component.Extension.Box#cfg-visibleMode}.
         * Defaults to: "visibility"
         */
        visibleMode: {
            value: "visibility"
        }
    };


    Position.prototype = {

        __createDom: function () {
            this.get("el").addClass(this.get('prefixCls') + "ext-position");
        },

        '_onSetZIndex': function (x) {
            this.get("el").css("z-index", x);
        },

        '_onSetX': function (x) {
            if (x != null) {
                this.get("el").offset({
                    left: x
                });
            }
        },

        '_onSetY': function (y) {
            if (y != null) {
                this.get("el").offset({
                    top: y
                });
            }
        }
    };

    return Position;
});