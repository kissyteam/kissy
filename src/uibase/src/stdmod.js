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
         * 头元素，只读
         * @type Node
         */
        header:{
            view:true
        },
        /**
         * 体元素，只读
         * @type Node
         */
        body:{
            view:true
        },
        /**
         * 尾元素，只读
         * @type Node
         */
        footer:{
            view:true
        },
        /**
         * 体元素样式键值对
         * @type Object
         */
        bodyStyle:{
            view:true
        },
        /**
         * 尾元素样式键值对
         * @type Object
         */
        footerStyle:{
            view:true
        },
        /**
         * 头元素样式键值对
         * @type Object
         */
        headerStyle:{
            view:true
        },
        /**
         * 头元素内容值
         * @type Node|String
         */
        headerContent:{
            view:true
        },
        /**
         * 体元素内容值
         * @type Node|String
         */
        bodyContent:{
            view:true
        },
        /**
         * 尾元素内容值
         * @type Node|String
         */
        footerContent:{
            view:true
        }
    };


    StdMod.prototype = {};

    return StdMod;

});