/**
 * abstract view for button
 * @author:yiminghe@gmail.com
 */
KISSY.add("button/buttonrender", function(S, UIBase) {
    // http://www.w3.org/TR/wai-aria-practices/
    return UIBase.create([UIBase.Box], {
        renderUI:function() {
            //set wai-aria role
            this.get("el").attr("role", "button");
        },
        _uiSetContent:function(v) {
            this.get("el").html(v);
        },
        _uiSetTooltip:function(t) {
            this.get("el").attr("title", t);
        },
        _uiSetDescribedby:function(d) {
            this.get("el").attr("aria-describedby", d);
        }
    }, {
        ATTRS:{
            //按钮内容
            content:{},
            //是否禁用
            disabled:{},

            //aria-describledby support
            describedby:{},

            tooltip:{}
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