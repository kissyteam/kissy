/**
 * @fileOverview mask extension for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/mask", function () {

    /**
     * make component can show with mask
     * @class
     * @memberOf UIBase
     */
    function Mask() {
    }

    Mask.ATTRS =
    /**
     * @lends UIBase.Mask.prototype
     */
    {
        /**
         * whether show mask layer when component shows
         * @type boolean
         */
        mask:{
            value:false
        }
    };

    Mask.prototype = {
        _uiSetMask:function (v) {
            var self = this;
            if (v) {
                self.on("show", self.get("view")._maskExtShow, self.get("view"));
                self.on("hide", self.get("view")._maskExtHide, self.get("view"));
            } else {
                self.detach("show", self.get("view")._maskExtShow, self.get("view"));
                self.detach("hide", self.get("view")._maskExtHide, self.get("view"));
            }
        }
    };


    return Mask;
}, {requires:["ua"]});