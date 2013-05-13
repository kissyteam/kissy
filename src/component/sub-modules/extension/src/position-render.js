/**
 * @ignore
 * position and visible extension，可定位的隐藏层
 * @author yiminghe@gmail.com
 */
KISSY.add("component/extension/position-render", function () {

    function Position() {
        var renderData = this.get('renderData');
        this.get('elStyle')['z-index'] = renderData.zIndex;
        this.get('elCls').push(renderData.prefixCls + 'ext-position ');
    }

    Position.ATTRS = {
        x: {},
        y: {},
        zIndex: {
            sync: 0
        }
    };

    // for augment, no need constructor
    Position.prototype = {
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