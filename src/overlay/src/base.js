/**
 * @fileOverview model and control for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/base", function (S, Component, OverlayRender, Effect) {

    function require(s) {
        return S.require("component/uibase/" + s);
    }

    /**
     * KISSY Overlay Component.
     * xclass: 'overlay'.
     * @class Overlay
     * @extends Component.Controller
     * @extends Component.UIBase.ContentBox
     * @extends Component.UIBase.Position
     * @extends Component.UIBase.Loading
     * @extends Component.UIBase.Align
     * @extends Component.UIBase.Close
     * @extends Component.UIBase.Resize
     * @extends Component.UIBase.Mask
     */
    var Overlay = Component.Controller.extend([
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
             * @method
             * @name Overlay#show
             */
        }, {
            ATTRS:/**
             * @lends Overlay#
             */
            {

                // do not has focus
                focusable:{
                    value:false
                },

                // allowTextSelection
                allowTextSelection:{
                    value:true
                },

                /**
                 * whether this component can be closed.
                 * @default false
                 * @type {Boolean}
                 */
                closable:{
                    value:false
                },

                /**
                 * whether this component can be responsive to mouse.
                 * @default false
                 * @type {Boolean}
                 */
                handleMouseEvents:{
                    value:false
                },
                xrender:{
                    value:OverlayRender
                }
            }
        }, {
            xclass:'overlay',
            priority:10
        });

    return Overlay;
}, {
    requires:['component', './overlayRender', './effect']
});