/**
 * @fileOverview model and control for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/base", function (S,  Component, OverlayRender, Effect) {

    function require(s) {
        return S.require("component/uibase/" + s);
    }

    /**
     * KISSY Overlay Component
     * @class
     * @namespace
     * @name Overlay
     * @extends Component.Controller
     * @extends Component.UIBase.ContentBox
     * @extends Component.UIBase.Position
     * @extends Component.UIBase.Loading
     * @extends Component.UIBase.Align
     * @extends Component.UIBase.Close
     * @extends Component.UIBase.Resize
     * @extends Component.UIBase.Mask
     */
    var Overlay = Component.define(Component.Controller, [
        require("contentbox"),
        require("position"),
        require("loading"),
        require("align"),
        require("close"),
        require("resize"),
        require("mask"),
        Effect
    ],
        /**
         * @lends Overlay#
         */
        {
            /**
             * see {@link Component.UIBase.Box#show}
             * @function
             * @name Overlay#show
             */
        }, {
            ATTRS:/**
             * @lends Overlay#
             */
            {
                /**
                 * whether this component can be focused. Default:false
                 * @type Boolean
                 */
                focusable:{
                    value:false
                },

                /**
                 * whether this component can be closed. Default:false
                 * @type Boolean
                 */
                closable:{
                    value:false
                },

                /**
                 * whether this component can be responsive to mouse. Default:false
                 * @type Boolean
                 */
                handleMouseEvents:{
                    value:false
                },

                /**
                 * see {@link Component.UIBase.Box#visibleMode}. Default:"visibility"
                 */
                visibleMode:{
                    value:"visibility"
                }
            }
        });

    Overlay.DefaultRender = OverlayRender;

    Component.UIStore.setUIConstructorByCssClass("overlay", {
        priority:Component.UIStore.PRIORITY.LEVEL1,
        ui:Overlay
    });

    return Overlay;
}, {
    requires:['component', './overlayrender', './effect']
});