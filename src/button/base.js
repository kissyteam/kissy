/**
 * Model and Control for button
 * @author yiminghe@gmail.com
 */
KISSY.add("button/base", function(S, UIBase, Component, CustomRender) {

    var Button = UIBase.create(Component.ModelControl, {
        _handleClick:function(ev) {
            var self = this,ret = Button.superclass._handleClick.call(self, ev);
            if (ret !== false) {
                self.fire("click");
            }
        }
    }, {
        ATTRS:{
            /**
             * @inheritedDoc
             * disabled:{}
             */
            value:{},
            content:{
                // model 中数据属性变化后要更新到 view 层
                view:true,
                // 如果没有用户值默认值，则要委托给 view 层
                // 比如 view 层使用 html_parser 来利用既有元素
                valueFn:function() {
                    return this.get("view") && this.get("view").get("content");
                }
            },
            describedby:{
                view:true
            },
            tooltip:{
                view:true
            }
        }
    });

    Button.DefaultRender = CustomRender;

    return Button;

}, {
    requires:['uibase','component','./customrender']
});