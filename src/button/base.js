/**
 * Model and Control for button
 * @author yiminghe@gmail.com
 */
KISSY.add("button/base", function(S, UIBase, Component, CustomRender) {

    var Button = UIBase.create(Component.ModelControl,[UIBase.Contentbox],{
        _handleClick:function(ev) {
            var self = this;
            // 如果父亲允许自己处理
            if (!Button.superclass._handleClick.call(self, ev)) {
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