/**
 * support standard mod for component
 * @author 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase/stdmod", function(S) {


    function StdMod() {
    }

    StdMod.ATTRS = {
        header:{
            view:true
        },
        body:{
            view:true
        },
        footer:{
            view:true
        },
        bodyStyle:{
            view:true
        },
        footerStyle:{
            view:true
        },
        headerStyle:{
            view:true
        },
        headerContent:{
            view:true
        },
        bodyContent:{
            view:true
        },
        footerContent:{
            view:true
        }
    };


    StdMod.prototype = {};

    return StdMod;

});