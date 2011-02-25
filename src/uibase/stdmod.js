/**
 * support standard mod for component
 * @author: 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase/stdmod", function(S) {


    function StdMod() {

    }

    StdMod.ATTRS = {
        header:{
        },
        body:{
        },
        footer:{
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
            if (v !== undefined) {
                this.get("view").set("bodyStyle", v);
            }
        },
        _uiSetHeaderStyle:function(v) {
            if (v !== undefined) {
                this.get("view").set("headerStyle", v);
            }
        },
        _uiSetFooterStyle:function(v) {
            if (v !== undefined) {
                this.get("view").set("footerStyle", v);
            }
        },
        _uiSetBodyContent:function(v) {
            if (v !== undefined) {
                this.get("view").set("bodyContent", v);
            }
        },
        _uiSetHeaderContent:function(v) {
            if (v !== undefined) {
                this.get("view").set("headerContent", v);
            }
        },
        _uiSetFooterContent:function(v) {
            if (v !== undefined) {
                this.get("view").set("footerContent", v);
            }
        }
    };

    return StdMod;

});