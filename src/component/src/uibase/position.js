/**
 * @fileOverview position and visible extension，可定位的隐藏层
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/position", function (S) {

    /**
     * Position extensiong class.
     * Make component positionable
     * @class
     * @memberOf Component.UIBase
     */
    function Position() {
    }

    Position.ATTRS =
    /**
     * @lends Component.UIBase.Position#
     */
    {
        /**
         * Horizontal axis
         * @type Number
         */
        x:{
            view:1
        },
        /**
         * Vertical axis
         * @type Number
         */
        y:{
            view:1
        },
        /**
         * Horizontal and vertical axis.
         * @type Number[]
         */
        xy:{
            // 相对 page 定位, 有效值为 [n, m], 为 null 时, 选 align 设置
            setter:function (v) {
                var self = this,
                    xy = S.makeArray(v);
                /*
                 属性内分发特别注意：
                 xy -> x,y
                 */
                if (xy.length) {
                    xy[0] && self.set("x", xy[0]);
                    xy[1] && self.set("y", xy[1]);
                }
                return v;
            },
            /**
             * xy 纯中转作用
             */
            getter:function () {
                return [this.get("x"), this.get("y")];
            }
        },
        /**
         * z-index value.
         * @type Number
         */
        zIndex:{
            view:1
        }
    };


    Position.prototype =
    /**
     * @lends Component.UIBase.Position.prototype
     */
    {
        /**
         * Move to absolute position.
         * @param {Number|Number[]} x
         * @param {Number} [y]
         * @example
         * <code>
         * move(x, y);
         * move(x);
         * move([x,y])
         * </code>
         */
        move:function (x, y) {
            var self = this;
            if (S.isArray(x)) {
                y = x[1];
                x = x[0];
            }
            self.set("xy", [x, y]);
            return self;
        }
    };

    return Position;
});