/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Aug 9 18:38
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

    return Button;

}, {
    requires:['event','uibase','component','./customrender']
});/**
 * abstract view for button
 * @author yiminghe@gmail.com
 */
KISSY.add("button/buttonrender", function(S, UIBase, Component) {
    // http://www.w3.org/TR/wai-aria-practices/
    var ButtonRender = UIBase.create(Component.Render, [UIBase.Contentbox.Render], {
        renderUI:function() {
            //set wai-aria role
            this.get("el").attr("role", "button");
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

    if (1 > 2) {
        ButtonRender._uiSetDescribedby();
    }

    return ButtonRender;
}, {
    requires:['uibase','component']
});/**
 * view : render button using div
 * @author yiminghe@gmail.com
 */
KISSY.add("button/css3render", function(S, UIBase, ButtonRender) {

    function getCls(self, str) {
        return S.substitute(str, {
            tag:self.__css_tag
        });
    }

    var CLS = "inline-block " + " {tag}-button",
        FOCUS_CLS = "{tag}-button-focused",
        HOVER_CLS = "{tag}-button-hover",
        ACTIVE_CLS = "{tag}-button-active",
        DISABLED_CLS = "{tag}-button-disabled";

    return UIBase.create(ButtonRender, {

        __css_tag:"css3",

        renderUI:function() {
            var self = this,
                el = self.get("el");
            el.addClass(getCls(self,
                self.getCls(CLS)));
        },

        /**
         * @override
         */
        _uiSetFocused:function(v) {
            var self = this,el = self.get("el");
            el[v ? 'addClass' : 'removeClass'](getCls(self,
                self.getCls(FOCUS_CLS)));
        },

        /**
         * @override
         */
        _uiSetHighlighted:function(v) {
            var self = this,el = self.get("el");
            el[v ? 'addClass' : 'removeClass'](getCls(self,
                self.getCls(HOVER_CLS)));
        },

        /**
         * 模拟原生 disabled 机制
         * @param v
         */
        _uiSetDisabled:function(v) {
            var self = this,el = self.get("el");
            el[v ? 'addClass' : 'removeClass'](getCls(self, self.getCls(DISABLED_CLS)))
                //不能被 tab focus 到
                //support aria
                .attr({
                    "tabindex": v ? -1 : 0,
                    "aria-disabled": v
                });

        },

        /**
         * @override
         */
        _uiSetActive:function(v) {
            var self = this;
            self.get("el")[v ? 'addClass' : 'removeClass'](getCls(self,
                self.getCls(ACTIVE_CLS)))
                .attr("aria-pressed", !!v);
        }

    });

}, {
    requires:['uibase','./buttonrender']
});/**
 * view for button , double div for pseudo-round corner
 * @author yiminghe@gmail.com
 */
KISSY.add("button/customrender", function(S, Node, UIBase, Css3Render) {
    //双层 div 模拟圆角

    var CONTENT_CLS = "inline-block custom-button-outer-box",
        INNER_CLS = "inline-block custom-button-inner-box";


    var CustomRender = UIBase.create(Css3Render, {

            __css_tag:"custom",

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
            }
        }, {
            /**
             * @inheritedDoc
             * content:{}
             */
            innerEL:{}
        }
    );

    if (1 > 2) {
        CustomRender.innerEL()
    }

    return CustomRender;
}, {
    requires:['node','uibase','./css3render']
});/**
 * view: render button using native button
 * @author yiminghe@gmail.com
 */
KISSY.add("button/nativerender", function(S, UIBase, ButtonRender) {
    return UIBase.create(ButtonRender, {
        //使用原生 disabled 机制
        _uiSetDisabled:function(v) {
            this.get("el")[0].disabled = v;
        }
    }, {
        ATTRS:{
            //使用原生 button tag
            elTagName:{
                value:"button"
            }
        }
    });
}, {
    requires:['uibase','./buttonrender']
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
