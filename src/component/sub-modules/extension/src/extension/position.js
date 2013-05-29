/**
 * @ignore
 * position and visible extension，可定位的隐藏层
 * @author yiminghe@gmail.com
 */
KISSY.add("component/extension/position", function (S) {

    /**
     * @class KISSY.Component.Extension.Position
     * Position extension class. Make component positionable.
     */
    function Position() {
    }

    Position.ATTRS = {
        /**
         * Horizontal axis
         * @type {Number}
         * @property x
         */
        /**
         * Horizontal axis
         * @cfg {Number} x
         */
        /**
         * @ignore
         */
        x: {
            view: 1
        },

        /**
         * Vertical axis
         * @type {Number}
         * @property y
         */
        /**
         * Vertical axis
         * @cfg {Number} y
         */
        /**
         * @ignore
         */
        y: {
            view: 1
        },
        /**
         * Horizontal and vertical axis.
         * @ignore
         * @type {Number[]}
         */
        xy: {
            // 相对 page 定位, 有效值为 [n, m], 为 null 时, 选 align 设置
            setter: function (v) {
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

            // xy 纯中转作用
            getter: function () {
                return [this.get("x"), this.get("y")];
            }
        },

        /**
         * z-index value.
         * @type {Number}
         * @property zIndex
         */
        /**
         * z-index value.
         * @cfg {Number} zIndex
         */
        /**
         * @ignore
         */
        zIndex: {
            view: 1
        },
        /**
         * Positionable element is by default visible false.
         * For compatibility in overlay and PopupMenu.
         *
         * Defaults to: false
         *
         * @ignore
         */
        visible: {
            value: false
        }
    };

    // for augment, no need constructor
    Position.prototype = {
        /**
         * Move to absolute position.
         * @ignore
         * @chainable
         */
        move: function (x, y) {
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