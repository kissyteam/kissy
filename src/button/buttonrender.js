/**
 * abstract view for button
 * @author:yiminghe@gmail.com
 */
KISSY.add("button/buttonrender", function(S, UIBase) {
    //!TODO tooltip , aria
    return UIBase.create([UIBase.Box], {
        _uiSetContent:function(v) {
            this.get("el").html(v);
        }
    }, {
        ATTRS:{
            //按钮内容
            content:{},
            //是否禁用
            disabled:{}
        },
        HTML_PARSER:{
            //默认单标签包含 content
            //多标签需要 override
            content:function(el) {
                return el.html();
            }
        }
    });
}, {
    requires:['uibase']
});