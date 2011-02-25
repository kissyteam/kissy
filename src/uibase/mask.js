/**
 * mask extension for kissy
 * @author: 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase/mask", function(S) {


    function Mask() {
    }

    Mask.ATTRS = {
        mask:{
            value:false
        }
    };

    Mask.prototype = {

        _uiSetMask:function(v) {
            var self = this;
            if (v) {
                self.on("show", self.get("view")._maskExtShow);
                self.on("hide", self.get("view")._maskExtHide);
            } else {
                self.detach("show", self.get("view")._maskExtShow);
                self.detach("hide", self.get("view")._maskExtHide);
            }
        }
    };

    return Mask;
}, {requires:["ua"]});