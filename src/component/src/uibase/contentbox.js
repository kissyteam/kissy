/**
 * @fileOverview 里层包裹层定义， 适合mask以及shim
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/contentbox", function () {

    /**
     * ContentBox extension class.
     * Represent inner element of component's root element.
     * @class
     * @memberOf Component.UIBase
     */
    function ContentBox() {
    }

    ContentBox.ATTRS =
    /**
     * @lends Component.UIBase.ContentBox#
     */
    {

        /**
         * readonly! content box's element of component
         * @type NodeList
         */
        contentEl:{
            view:true
        },

        /**
         * name-value pair attribute of component's content box element
         * @type Object
         */
        contentElAttrs:{
            view:true
        },

        /**
         * name-value pair css style of component's content box element
         * @type Object
         */
        contentElStyle:{
            view:true
        },

        /**
         * tag name of contentbox 's root element.
         * Default: "div"
         * @type String
         */
        contentTagName:{
            view:true
        }
    };

    return ContentBox;
});