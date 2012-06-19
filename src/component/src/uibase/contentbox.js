/**
 * @fileOverview 里层包裹层定义， 适合mask以及shim
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/contentbox", function () {

    /**
     * @name ContentBox
     * @class
     * ContentBox extension class.
     * Represent inner element of component's root element.
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
            view:1
        }
    };

    return ContentBox;
});