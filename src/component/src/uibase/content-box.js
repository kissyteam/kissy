/**
 * @ignore
 * @fileOverview 里层包裹层定义， 适合mask以及shim
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/content-box", function () {

    /**
     * @class KISSY.Component.UIBase.ContentBox
     * ContentBox extension class. Represent inner element of component's root element.
     */
    function ContentBox() {
    }

    ContentBox.ATTRS = {

        /**
         * content box's element of component.
         * @type {KISSY.NodeList}
         * @readonly
         * @property contentEl
         */
        /**
         * @ignore
         */
        contentEl: {
            view: 1
        }
    };

    return ContentBox;
});