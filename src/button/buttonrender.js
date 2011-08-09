/**
 * abstract view for button
 * @author yiminghe@gmail.com
 */
KISSY.add("button/buttonrender", function(S, UIBase, Component) {
    // http://www.w3.org/TR/wai-aria-practices/
    var ButtonRender = UIBase.create(Component.Render, [UIBase.Contentbox.Render], {
        renderUI:function() {
            //set wai-aria role
            this.get("el").attr("role", "button");
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
             * @inheritedDoc
             * disabled:{}
             */

            /**
             * @inheritedDoc
             * prefixCls:{}
             */

                // aria-describledby support
            describedby:{},
            tooltip:{}
        }
    });

    if (1 > 2) {
        ButtonRender._uiSetDescribedby();
    }

    return ButtonRender;
}, {
    requires:['uibase','component']
});