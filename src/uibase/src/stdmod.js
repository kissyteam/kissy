/**
 * @fileOverview support standard mod for component
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/stdmod", function () {


    /**
     * generate head,body,foot for component
     * @class
     * @memberOf UIBase
     */
    function StdMod() {
    }

    StdMod.ATTRS =

    /**
     * @lends UIBase.StdMod.prototype
     */
    {
        /**
         * Header element of dialog. Readonly
         * @type Node
         */
        header:{
            view:true
        },
        /**
         * Body element of dialog. Readonly
         * @type Node
         */
        body:{
            view:true
        },
        /**
         * Footer element of dialog. Readonly
         * @type Node
         */
        footer:{
            view:true
        },
        /**
         * Key-value map of body element's style.
         * @type Object
         */
        bodyStyle:{
            view:true
        },
        /**
         * Key-value map of footer element's style.
         * @type Object
         */
        footerStyle:{
            view:true
        },
        /**
         * Key-value map of header element's style.
         * @type Object
         */
        headerStyle:{
            view:true
        },
        /**
         * Html content of header element.
         * @type Node|String
         */
        headerContent:{
            view:true
        },
        /**
         * Html content of body element.
         * @type Node|String
         */
        bodyContent:{
            view:true
        },
        /**
         * Html content of footer element.
         * @type Node|String
         */
        footerContent:{
            view:true
        }
    };

    return StdMod;

});