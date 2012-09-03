/**
 * @fileOverview mask extension for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/mask", function () {

    /**
     * @name Mask
     * @class
     * Mask extension class.
     * Make component to be able to show with mask.
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
         * @type {Boolean}
         */
        mask:{
            value:false
        },
        /**
         * Mask node for current overlay 's mask.
         * @type {KISSY.NodeList}
         */
        maskNode:{
            view:1
        },
        /**
         * Whether to share mask with other overlays.
         * @default true.
         * @type {Boolean}
         */
        maskShared:{
            view:1
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