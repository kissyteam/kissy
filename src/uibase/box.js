/**
 * UIBase.Box
 * @author: 承玉<yiminghe@gmail.com>
 */
KISSY.add('uibase/box', function(S) {


    function Box() {
    }


    Box.ATTRS = {
        html: {}
    };


    Box.prototype = {
        _uiSetHtml:function(c) {
            if (c !== undefined) {
                this.get("view").set("html", c);
            }
        }
    };

    return Box;
});
