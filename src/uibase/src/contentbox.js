/**
 * @fileOverview 里层包裹层定义，适合mask以及shim
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/contentbox", function () {

    /**
     * @class
     * @memberOf UIBase
     */
    function ContentBox() {
    }

    ContentBox.ATTRS = {
        //层内容
        content:{
            view:true,
            sync:false
        },
        contentEl:{
            view:true
        },

        contentElAttrs:{
            view:true
        },
        contentElStyle:{
            view:true
        },
        contentTagName:{
            view:true
        }
    };

    ContentBox.prototype = {    };

    return ContentBox;
});