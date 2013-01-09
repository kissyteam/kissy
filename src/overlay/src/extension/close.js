/**
 * @ignore
 *  close extension for kissy dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/extension/close", function () {

    /**
     * @class KISSY.Overlay.Extension.Close
     * Close extension class. Represent a close button.
     */
    function Close() {
    }

    var HIDE = "hide";

    Close.ATTRS =    {
        /**
         * Whether close button is visible.
         *
         * Defaults to: true.
         *
         * @cfg {Boolean} closable
         */
        /**
         * Whether close button is visible.
         * @type {Boolean}
         * @property closable
         */
        /**
         * @ignore
         */
        closable:{
            view:1
        },

        /**
         * close button element.
         * @type {KISSY.NodeList}
         * @property closeBtn
         * @readonly
         */
        /**
         * @ignore
         */
        closeBtn:{
            view:1
        },

        /**
         * Whether to destroy or hide current element when click close button.
         * Can set "destroy" to destroy it when click close button.
         *
         * Defaults to: "hide".
         *
         * @cfg {String} closeAction
         */
        /**
         * @ignore
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
        _onSetClosable:function (v) {
            var self = this;
            if (v && !self.__bindCloseEvent) {
                self.__bindCloseEvent = 1;
                self.get("closeBtn").on("click", function (ev) {
                    self.close();
                    ev.preventDefault();
                });
            }
        },
        /**
         * hide or destroy according to {@link KISSY.Overlay.Extension.Close#closeAction}
         * @chainable
         */
        close:function(){
            var self=this;
            self[actions[self.get("closeAction")] || HIDE]();
            return self;
        },
        __destructor:function () {
            var btn = this.get("closeBtn");
            btn && btn.detach();
        }
    };
    return Close;

});