/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Sep 8 19:25
*/
/**
 * Model and Control for button
 * @author yiminghe@gmail.com
 */
KISSY.add("button/base", function(S, Event, UIBase, Component, CustomRender) {

    var KeyCodes = Event.KeyCodes,
        Button = UIBase.create(Component.ModelControl, [UIBase.Contentbox], {

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
    return UIBase.create(Component.Render, {
        createDom:function() {
            //set wai-aria role
            this.get("el").attr("role", "button")
                .addClass(this.getCls("inline-block button"));
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
    var CONTENT_CLS = "button-outer-box",
        INNER_CLS = "button-inner-box";


    return UIBase.create(ButtonRender, [UIBase.Contentbox.Render], {

            /**
             *  modelcontrol 会在 create 后进行 unselectable，
             *  需要所有的节点创建工作放在 createDom 中
             */
            createDom:function() {
                var self = this,
                    el = self.get("el"),
                    contentEl = self.get("contentEl"),
                    id = S.guid('ks-button-labelby');
                el.attr("aria-labelledby", id);
                //按钮的描述节点在最内层，其余都是装饰
                contentEl.addClass(self.getCls(CONTENT_CLS));
                var elChildren = S.makeArray(contentEl[0].childNodes),
                    innerEl = new Node("<div id='" + id + "' " +
                        "class='" + self.getCls(INNER_CLS) + "'/>")
                        .appendTo(contentEl);
                // content 由 contentboxrender 处理
                for (var i = 0; i < elChildren.length; i++) {
                    innerEl.append(elChildren[i]);
                }
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
            }
        }, {
            /**
             * @inheritedDoc
             * content:{}
             */
            innerEL:{}
        }
    );
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
