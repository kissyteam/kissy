/**
 * @fileOverview Model and Control for button
 * @author yiminghe@gmail.com
 */
KISSY.add("button/base", function (S, Event, UIBase, Component, CustomRender) {

    var KeyCodes = Event.KeyCodes;
    /**
     * @name Button
     * @constructor
     * @extends Component.Controller
     */
    var Button = UIBase.create(Component.Controller, [UIBase.ContentBox],
        /**@lends Button.prototype */
        {

            bindUI:function () {
                this.get("el").on("keyup", this._handleKeyEventInternal, this);
            },

            _handleKeyEventInternal:function (e) {
                if (e.keyCode == KeyCodes.ENTER &&
                    e.type == "keydown" ||
                    e.keyCode == KeyCodes.SPACE &&
                        e.type == "keyup") {
                    return this._performInternal(e);
                }
                // Return true for space keypress (even though the event is handled on keyup)
                // as preventDefault needs to be called up keypress to take effect in IE and
                // WebKit.
                return e.keyCode == KeyCodes.SPACE;
            },

            /* button 的默认行为就是触发 click*/
            _performInternal:function () {
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
                },
                collapseSide:{
                    view:true
                }
            }
        });

    Button.DefaultRender = CustomRender;


    Component.UIStore.setUIByClass("button", {
        priority:Component.UIStore.PRIORITY.LEVEL1,
        ui:Button
    });

    return Button;

}, {
    requires:['event', 'uibase', 'component', './customrender']
});