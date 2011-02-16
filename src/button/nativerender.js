/**
 * view: render button using tag button
 * @author:yiminghe@gmail.com
 */
KISSY.add("button/nativerender", function(S, UIBase) {
    return UIBase.create([UIBase.Box], {

        _uiSetContent:function(v) {
            this.get("el").html(v);
        },

        _uiSetDisabled:function(v) {
            this.get("el")[0].disabled = v;
        }
    }, {
        ATTRS:{
            elTagName:{
                value:"button"
            },
            content:{},
            disabled:{}
        }
    });
}, {
    requires:['uibase']
});