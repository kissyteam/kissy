/**
 * render base class for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("component/render", function(S, UIBase) {
    return UIBase.create([UIBase.Box.Render], {

        getCls:function(cls) {
            var cs = cls.split(/\s+/);
            for (var i = 0; i < cs.length; i++) {
                cs[i] = this.get("prefixCls") + cs[i];
            }
            return cs.join(" ");
        },

        getKeyEventTarget:function() {
            return this.get("el");
        },

        getContentElement:function() {
            return this.get("contentEl") || this.get("el");
        },

        _uiSetFocusable:function(v) {
            var el = this.getKeyEventTarget(),
                tabindex = el.attr("tabindex");
            if (tabindex >= 0 && !v) {
                el.attr("tabindex", -1);
            } else if (!(tabindex >= 0) && v) {
                el.attr("tabindex", 0);
            }
        }
    }, {
        ATTRS:{
            //从 maskup 中渲染
            srcNode:{},
            prefixCls:{
                value:"ks-"
            },
            focusable:{
                value:true
            },
            //是否禁用
            disabled:{
                value:false
            }
        }
    });
}, {
    requires:['uibase']
});