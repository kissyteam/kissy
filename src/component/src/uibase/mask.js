/**
 * @fileOverview mask extension for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/mask", function () {

    /**
     * Mask extension class.
     * Make component to be able to show with mask.
     * @class
     * @memberOf Component.UIBase
     */
    function Mask() {
    }

    Mask.ATTRS =
    /**
     * @lends Component.UIBase.Mask#
     */
    {
        /**
         * Whether show mask layer when component shows
         * @type Boolean
         */
        mask:{
            value:false
        },
        /**
         * Mask node for current overlay 's mask.
         * @type {NodeList}
         */
        maskNode:{
            view:true
        },
        /**
         * Whether to share mask with other overlays.
         * Default: true.
         * @type {Boolean}
         */
        maskShared:{
            value:true,
            view:true
        }
    };

    Mask.prototype = {

        __bindUI:function () {
            var self = this,
                view = self.get("view"),
                _maskExtShow = view._maskExtShow,
                _maskExtHide = view._maskExtHide;
            if (self.get("mask")) {
                self.on("show", _maskExtShow, view);
                self.on("hide", _maskExtHide, view);
            }
        }
    };


    return Mask;
}, {requires:["ua"]});