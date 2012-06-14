/**
 * @fileOverview support standard mod for component
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/stdmod", function () {


    /**
     * StdMod extension class.
     * Generate head, body, foot for component.
     * @class
     * @memberOf Component.UIBase
     */
    function StdMod() {
    }

    StdMod.ATTRS =
    /**
     * @lends Component.UIBase.StdMod#
     */
    {
        /**
         * Header element of dialog. Readonly
         * @type Node
         */
        header:{
            view:1
        },
        /**
         * Body element of dialog. Readonly
         * @type Node
         */
        body:{
            view:1
        },
        /**
         * Footer element of dialog. Readonly
         * @type Node
         */
        footer:{
            view:1
        },
        /**
         * Key-value map of body element's style.
         * @type Object
         */
        bodyStyle:{
            view:1
        },
        /**
         * Key-value map of footer element's style.
         * @type Object
         */
        footerStyle:{
            view:1
        },
        /**
         * Key-value map of header element's style.
         * @type Object
         */
        headerStyle:{
            view:1
        },
        /**
         * Html content of header element.
         * @type NodeList|String
         */
        headerContent:{
            view:1
        },
        /**
         * Html content of body element.
         * @type NodeList|String
         */
        bodyContent:{
            view:1
        },
        /**
         * Html content of footer element.
         * @type NodeList|String
         */
        footerContent:{
            view:1
        }
    };

    return StdMod;

});