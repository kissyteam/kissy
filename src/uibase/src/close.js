/**
 * @fileOverview close extension for kissy dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/close", function () {

    /**
     * config detail of close action
     * @class
     * @memberOf UIBase
     */
    function Close() {
    }

    var HIDE = "hide";
    Close.ATTRS =
    /**
     * @lends UIBase.Close.prototype
     */
    {
        /**
         * 是否自带关闭按钮
         * @type boolean
         */
        closable:{
            view:true
        },

        /**
         * 点击关闭按钮的动作，销毁("destroy")或隐藏("hide")
         * @type string
         */
        closeAction:{
            value:HIDE
        }
    };

    var actions = {
        hide:HIDE,
        destroy:"destroy"
    };

    Close.prototype = {

        __bindUI:function () {

            var self = this,
                closeBtn = self.get("view").get("closeBtn");
            closeBtn && closeBtn.on("click", function (ev) {
                self[actions[self.get("closeAction")] || HIDE]();
                ev.preventDefault();
            });
        }
    };
    return Close;

});