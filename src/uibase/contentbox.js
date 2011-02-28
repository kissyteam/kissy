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
                this._forwordStateToView("content", c);
        }
    };

    return ContentBox;
});