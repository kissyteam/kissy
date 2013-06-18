/**
 * @ignore
 * position and visible extension，可定位的隐藏层
 * @author yiminghe@gmail.com
 */
KISSY.add("component/extension/position-render", function () {

    function Position() {
        var renderData = this.renderData;
        this.controller.get('elStyle')['z-index'] = renderData.zIndex;
    }

    // for augment, no need constructor
    Position.prototype = {
        '_onSetZIndex': function (x) {
            this.el.css("z-index", x);
        },

        '_onSetX': function (x) {
            this.el.offset({
                left: x
            });
        },

        '_onSetY': function (y) {
            this.el.offset({
                top: y
            });
        }
    };

    return Position;
});