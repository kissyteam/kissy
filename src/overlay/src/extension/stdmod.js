/**
 * @ignore
 *  support standard mod for component
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/extension/stdmod", function () {


    /**
     * @class KISSY.Overlay.Extension.StdMod
     * StdMod extension class. Generate head, body, foot for component.
     */
    function StdMod() {
    }

    StdMod.ATTRS = {
        /**
         * Header element of dialog.
         * @type {KISSY.NodeList}
         * @property header
         * @readonly
         */
        /**
         * @ignore
         */
        header:{
            view:1
        },
        /**
         * Body element of dialog.
         * @type {KISSY.NodeList}
         * @property body
         * @readonly
         */
        /**
         * @ignore
         */
        body:{
            view:1
        },
        /**
         * Footer element of dialog.
         * @type {KISSY.NodeList}
         * @property footer
         * @readonly
         */
        /**
         * @ignore
         */
        footer:{
            view:1
        },
        /**
         * Key-value map of body element's style.
         * @cfg {Object} bodyStyle
         */
        /**
         * @ignore
         */
        bodyStyle:{
            view:1
        },
        /**
         * Key-value map of footer element's style.
         * @cfg {Object} footerStyle
         */
        /**
         * @ignore
         */
        footerStyle:{
            view:1
        },
        /**
         * Key-value map of header element's style.
         * @cfg {Object} headerStyle
         */
        /**
         * @ignore
         */
        headerStyle:{
            view:1
        },
        /**
         * html content of header element.
         * @cfg {KISSY.NodeList|String} headerContent
         */
        /**
         * @ignore
         */
        headerContent:{
            view:1
        },
        /**
         * html content of body element.
         * @cfg {KISSY.NodeList|String} bodyContent
         */
        /**
         * @ignore
         */
        bodyContent:{
            view:1
        },
        /**
         * html content of footer element.
         * @cfg {KISSY.NodeList|String} footerContent
         */
        /**
         * @ignore
         */
        footerContent:{
            view:1
        }
    };

    return StdMod;

});