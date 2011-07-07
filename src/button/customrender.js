/**
 * view for button , double div for pseudo-round corner
 * @author yiminghe@gmail.com
 */
KISSY.add("button/customrender", function(S, UIBase, Css3Render) {
    //双层 div 模拟圆角
    var CUSTOM_RENDER_HTML = "<div class='{prefixCls}inline-block {prefixCls}custom-button-outer-box'>" +
        "<div id='{{id}}' class='{prefixCls}inline-block {prefixCls}custom-button-inner-box'></div></div>";

    return UIBase.create(Css3Render, {

            __css_tag:"custom",

            renderUI:function() {
                var self = this,id = S.guid('ks-button-labelby');
                //按钮的描述节点在最内层，其余都是装饰
                self.get("el")
                    .html(S.substitute(CUSTOM_RENDER_HTML, {
                    prefixCls:this.get("prefixCls"),
                    id:id
                }))
                    .attr("aria-labelledby", id);
            },

            /**
             * 内容移到内层
             * @override
             * @param v
             */
            _uiSetContent:function(v) {
                this.get("el").one('div').one('div').html(v || "");
            }
        }
        /**
         * @inheritedDoc
         * content:{}
         */
    );
}, {
    requires:['uibase','./css3render']
});