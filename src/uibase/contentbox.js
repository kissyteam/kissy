/**
 * 里层包裹层定义，适合mask以及shim
 * @author:yiminghe@gmail.com
 */
KISSY.add("uibase/contentbox", function(S) {

    function ContentBox() {
    }

    ContentBox.ATTRS = {
        //层内容
        content:{}
    };


    ContentBox.prototype = {
        _uiSetContent:function(c) {
            if (c !== undefined) {
                this.get("view").set("content", c);
            }
        }
    };

    return ContentBox;
});