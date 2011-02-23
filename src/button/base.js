/**
 * Model and Control for button
 * @author:yiminghe@gmail.com
 */
KISSY.add("button/base", function(S, UIBase, Component) {

    return UIBase.create(Component.ModelControl, [], {

        //model 中数据属性变化后要更新到 view 层
        _uiSetContent:function(v) {
            var view = this.get("view");
            view.set("content", v);
        },

        _uiSetTooltip:function(t) {
            var view = this.get("view");
            view.set("tooltip", t);
        },

        _uiSetDescribedby:function(d) {
            if (d === undefined) return;
            var view = this.get("view");
            view.set("describedby", d);
        }

    }, {
        ATTRS:{
            value:{},
            content:{
                //如果没有用户值默认值，则要委托给 view 层
                //比如 view 层使用 html_parser 来利用既有元素
                valueFn:function() {
                    return this.get("view").get("content");
                }
            },
            describedby:{},
            tooltip:{}
        }
    });

}, {
    requires:['uibase','component']
});