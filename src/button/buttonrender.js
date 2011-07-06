/**
 * abstract view for button
 * @author yiminghe@gmail.com
 */
KISSY.add("button/buttonrender", function(S, UIBase, Component) {
    // http://www.w3.org/TR/wai-aria-practices/
    return UIBase.create(Component.Render, {
        renderUI:function() {
            //set wai-aria role
            this.get("el").attr("role", "button");
        },
        _uiSetContent:function(content) {
            this.get("el").html(content);
        },
        _uiSetTooltip:function(title) {
            this.get("el").attr("title", title);
        },
        _uiSetDescribedby:function(describedby) {
            this.get("el").attr("aria-describedby", describedby);
        }
    }, {
        ATTRS:{
            /**
             * @inherited
             * disabled:{}
             */

            /**
             * @inherited
             * prefixCls:{}
             */

                //按钮内容
            content:{},
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
    requires:['uibase','component']
});