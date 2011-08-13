/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Aug 13 21:42
*/
/**
 * Model and Control for button
 * @author yiminghe@gmail.com
 */
KISSY.add("button/base", function(S, Event, UIBase, Component, CustomRender) {

    var KeyCodes = Event.KeyCodes;

    var Button = UIBase.create(Component.ModelControl, [UIBase.Contentbox], {

        bindUI:function() {
            this.get("el").on("keyup", this._handleKeyEventInternal, this);
        },

        _handleKeyEventInternal:function(e) {
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


    Component.UIStore.setUIByClass("button", {
        priority:Component.UIStore.PRIORITY.LEVEL1,
        ui:Button
    });

    return Button;

}, {
    requires:['event','uibase','component','./customrender']
});/**
 * abstract view for button
 * @author yiminghe@gmail.com
 */
KISSY.add("button/buttonrender", function(S, UIBase, Component) {
    // http://www.w3.org/TR/wai-aria-practices/
    return UIBase.create(Component.Render, [UIBase.Contentbox.Render], {
        renderUI:function() {
            //set wai-aria role
            this.get("el").addClass(this.getCls("inline-block")).attr("role", "button");
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
}, {
    requires:['uibase','component']
});/**
 * view for button , double div for pseudo-round corner
 * @author yiminghe@gmail.com
 */
KISSY.add("button/customrender", function(S, Node, UIBase, ButtonRender) {

    //双层 div 模拟圆角
    var CLS = "custom-button",
        CONTENT_CLS = "inline-block " + CLS + "-outer-box",
        INNER_CLS = "inline-block " + CLS + "-inner-box";


    var CustomRender = UIBase.create(ButtonRender, {

            renderUI:function() {
                this.get("el").addClass(this.getCls(CLS));
            },

            /**
             *  modelcontrol 会在 create 后进行 unselectable，需要所有的节点创建工作放在 createDom 中
             */
            createDom:function() {
                var self = this,
                    el = self.get("el"),
                    contentEl = self.get("contentEl"),
                    id = S.guid('ks-button-labelby');
                //按钮的描述节点在最内层，其余都是装饰
                contentEl.addClass(self.getCls(CONTENT_CLS));
                var elChildren = S.makeArray(contentEl[0].childNodes);
                var innerEl = new Node("<div id='" + id + "' " +
                    "class='" + self.getCls(INNER_CLS) + "'/>").appendTo(contentEl);
                // content 由 contentboxrender 处理
                for (var i = 0; i < elChildren.length; i++) {
                    innerEl.append(elChildren[i]);
                }
                el.attr("aria-labelledby", id);
                self.set("innerEl", innerEl);
            },

            /**
             * 内容移到内层
             * @override
             * @param v
             */
            _uiSetContent:function(v) {
                var innerEl = this.get("innerEl");
                innerEl.html("");
                v && innerEl.append(v);
            },

            _setHighlighted:function(v) {
                var self = this;
                CustomRender.superclass._setHighlighted.apply(self, arguments);
                self.get("el")[v ? 'addClass' : 'removeClass'](self.getCls(CLS + "-hover"));
            },

            _setDisabled:function(v) {
                var self = this;
                CustomRender.superclass._setDisabled.apply(self, arguments);
                self.get("el")[v ? 'addClass' : 'removeClass'](self.getCls(CLS + "-disabled"));
            },

            _setActive:function(v) {
                var self = this;
                CustomRender.superclass._setActive.apply(self, arguments);
                self.get("el")[v ? 'addClass' : 'removeClass'](self.getCls(CLS + "-active"));
            },

            _setFocused:function(v) {
                var self = this;
                CustomRender.superclass._setFocused.apply(self, arguments);
                self.get("el")[v ? 'addClass' : 'removeClass'](self.getCls(CLS + "-focused"));
            }
        }, {
            /**
             * @inheritedDoc
             * content:{}
             */
            innerEL:{}
        }
    );

    return CustomRender;
}, {
    requires:['node','uibase','./buttonrender']
});/**
 * simulated button for kissy , inspired by goog button
 * @author yiminghe@gmail.com
 */
KISSY.add("button", function(S, Button, Render) {
    Button.Render = Render;
    return Button;
}, {
    requires:['button/base','button/customrender']
});
