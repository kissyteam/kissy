/**
 * Model and Control for button
 * @author yiminghe@gmail.com
 */
KISSY.add("button/base", function(S, UIBase, Component, CustomRender) {

    var Button = UIBase.create(Component.ModelControl, [UIBase.Contentbox], {

        bindUI:function() {
            this.get("el").on("keyup", this._handleKeyEventInternal, this);
        },

        _handleKeyEventInternal:function(e) {
            if (e.keyCode == 13 &&
                e.type == "keydown" ||
                e.keyCode == 32 &&
                    e.type == "keyup") {
                return this._performInternal(e);
            }
            // Return true for space keypress (even though the event is handled on keyup)
            // as preventDefault needs to be called up keypress to take effect in IE and
            // WebKit.
            return e.keyCode == 32;
        },

        /* button 的默认行为就是触发 click*/
        _performInternal:function() {
            var self = this;
            self.fire("click");
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