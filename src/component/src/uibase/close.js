/**
 * @fileOverview close extension for kissy dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/close", function () {

    /**
     * Close extension class.
     * Represent a close button.
     * @class
     * @memberOf Component.UIBase
     */
    function Close() {
    }

    var HIDE = "hide";
    Close.ATTRS =
    /**
     * @lends Component.UIBase.Close.prototype
     */
    {
        /**
         * Whether close button is visible.
         * Default: true.
         * @type Boolean
         */
        closable:{
            value:true,
            view:true
        },

        /**
         * Whether to destroy or hide current element when click close button.
         * Default: "hide". Can set "destroy" to destroy it when click close button.
         * @type String
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