/**
 * render base class for kissy
 * @author yiminghe@gmail.com
 * @refer http://martinfowler.com/eaaDev/uiArchs.html
 */
KISSY.add("component/render", function(S, UIBase, UIStore) {
    return UIBase.create([UIBase.Box.Render], {

        getCls:UIStore.getCls,

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
            /**
             *  screen state
             */

                //从 maskup 中渲染
            srcNode:{},
            prefixCls:{
                value:"ks-"
            },
            focusable:{
                value:true
            },
            highlighted:{},
            focused:{},
            active:{},
            render:{},
            //是否禁用
            disabled:{}
        }
    });
}, {
    requires:['uibase','./uistore']
});