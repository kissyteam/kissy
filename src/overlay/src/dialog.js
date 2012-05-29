/**
 * @fileOverview KISSY.Dialog
 * @author  yiminghe@gmail.com, 乔花<qiaohua@taobao.com>
 */
KISSY.add('overlay/dialog', function (S, Component, Overlay, DialogRender, Aria) {

    function require(s) {
        return S.require("component/uibase/" + s);
    }

    /**
     * KISSY Dialog Component
     * @class
     * @name Dialog
     * @memberOf Overlay
     * @extends Overlay
     * @extends Component.UIBase.StdMod
     * @extends Component.UIBase.Drag
     * @extends Component.UIBase.Constrain
     */
    var Dialog = Component.define(Overlay, [
        require("stdmod"),
        require("drag"),
        require("constrain"),
        Aria
    ],
        /**
         * @lends Overlay.Dialog#
         */
        {
            /**
             * see {@link Component.UIBase.Box#show}
             * @name Overlay.Dialog#show
             * @function
             */
        },

        {
            ATTRS:/**
             * @lends Overlay.Dialog#
             */
            {

                /**
                 * whether this component can be closed. Default:true
                 * @type Boolean
                 */
                closable:{
                    value:true
                },

                /**
                 * Default: Dialog's header element
                 * see {@link DD.Draggable#handlers}
                 */
                handlers:{
                    valueFn:function () {
                        var self = this;
                        return [
                            // 运行时取得拖放头
                            function () {
                                return self.get("view").get("header");
                            }
                        ];
                    }
                }
            }
        });

    Dialog.DefaultRender = DialogRender;

    Component.UIStore.setUIConstructorByCssClass("dialog", {
        priority:Component.UIStore.PRIORITY.LEVEL2,
        ui:Dialog
    });

    return Dialog;

}, {
    requires:[ "component", "overlay/base",  'overlay/dialogrender', './aria']
});

/**
 * 2010-11-10 yiminghe@gmail.com重构，使用扩展类
 */



