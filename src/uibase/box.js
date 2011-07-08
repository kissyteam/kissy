/**
 * UIBase.Box
 * @author: 承玉<yiminghe@gmail.com>
 */
KISSY.add('uibase/box', function() {


    function Box() {
    }

    Box.ATTRS = {
        html: {
            view:true
        },
        width:{
            view:true
        },
        height:{
            view:true
        },
        elCls:{
            view:true
        },
        elStyle:{
            view:true
        },
        elAttrs:{
            //其他属性
            view:true
        },
        elBefore:{
            view:true
        },
        el:{
            getter:function() {
                return this.get("view") && this.get("view").get("el");
            }
        }
    };

    Box.prototype = {};

    return Box;
});
