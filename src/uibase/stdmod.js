/**
 * support standard mod for component
 * @author: 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase/stdmod", function(S) {


    function StdMod() {
    }

    StdMod.ATTRS = {
        header:{
            getter:function() {
                return this.get("view").get("header");
            }
        },
        body:{
            getter:function() {
                return this.get("view").get("body");
            }
        },
        footer:{
            getter:function() {
                return this.get("view").get("footer");
            }
        },
        bodyStyle:{
        },
        footerStyle:{
        },
        headerStyle:{
        },
        headerContent:{},
        bodyContent:{},
        footerContent:{}
    };


    StdMod.prototype = {

        _uiSetBodyStyle:function(v) {
            this._forwordStateToView("bodyStyle", v);
        },
        _uiSetHeaderStyle:function(v) {
            this._forwordStateToView("headerStyle", v);
        },
        _uiSetFooterStyle:function(v) {
            this._forwordStateToView("footerStyle", v);
        },
        _uiSetBodyContent:function(v) {
            this._forwordStateToView("bodyContent", v);
        },
        _uiSetHeaderContent:function(v) {
            this._forwordStateToView("headerContent", v);
        },
        _uiSetFooterContent:function(v) {
            this._forwordStateToView("footerContent", v);
        }
    };

    return StdMod;

});