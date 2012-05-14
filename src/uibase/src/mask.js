/**
 * @fileOverview mask extension for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/mask", function () {

    /**
     * Mask extension class.
     * Make component to be able to show with mask.
     * @class
     * @memberOf UIBase
     */
    function Mask() {
    }

    Mask.ATTRS =
    /**
     * @lends UIBase.Mask#
     */
    {
        /**
         * whether show mask layer when component shows
         * @type Boolean
         */
        mask:{
            value:false
        }
    };

    Mask.prototype = {
        _uiSetMask:function (v) {
            var self = this,
                view = self.get("view"),
                _maskExtShow = view._maskExtShow,
                _maskExtHide = view._maskExtHide;
            if (v) {
                self.on("show", _maskExtShow, view);
                self.on("hide", _maskExtHide, view);
            } else {
                self.detach("show", _maskExtShow, view);
                self.detach("hide", _maskExtHide, view);
            }
        }
    };


    return Mask;
}, {requires:["ua"]});