/**
 * @fileOverview model and control for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/base", function (S, UIBase, Component, OverlayRender, Effect) {

    function require(s) {
        return S.require("uibase/" + s);
    }

    /**
     * KISSY Overlay Component
     * @class
     * @namespace
     * @name Overlay
     * @extends Component.Controller
     * @extends UIBase.ContentBox
     * @extends UIBase.Position
     * @extends UIBase.Loading
     * @extends UIBase.Align
     * @extends UIBase.Close
     * @extends UIBase.Resize
     * @extends UIBase.Mask
     * @param {Object} config config object to set properties of its parent class
     */
    var Overlay = UIBase.create(Component.Controller, [
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
             * see {@link UIBase.Box#show}
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
                 * whether this component's text content can be selected. Default:true
                 * @type Boolean
                 */
                allowTextSelection_:{
                    value:true
                },

                /**
                 * see {@linl UIBase.Box#visibleMode}. Default:"visibility"
                 */
                visibleMode:{
                    value:"visibility"
                }
            }
        });

    Overlay.DefaultRender = OverlayRender;

    Component.UIStore.setUIByClass("overlay", {
        priority:Component.UIStore.PRIORITY.LEVEL1,
        ui:Overlay
    });

    return Overlay;
}, {
    requires:['uibase', 'component', './overlayrender', './effect']
});