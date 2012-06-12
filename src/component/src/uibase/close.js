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
         * Close button.
         */
        closeBtn:{
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
        _uiSetClosable:function (v) {
            var self = this;
            if (v && !self.__bindCloseEvent) {
                self.__bindCloseEvent = 1;
                self.get("closeBtn").on("click", function (ev) {
                    self[actions[self.get("closeAction")] || HIDE]();
                    ev.preventDefault();
                });
            }
        },
        __destructor:function () {
            var btn = this.get("closeBtn");
            btn && btn.detach();
        }
    };
    return Close;

});