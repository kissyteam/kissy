/**
 * @fileOverview mask extension for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/mask", function () {

    /**
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
         * 是否显示时出现遮罩层
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