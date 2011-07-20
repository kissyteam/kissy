/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Jul 20 21:14
*/
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
});/**
 * abstract view for button
 * @author yiminghe@gmail.com
 */
KISSY.add("button/buttonrender", function(S, UIBase, Component) {
    // http://www.w3.org/TR/wai-aria-practices/
    return UIBase.create(Component.Render,[UIBase.Contentbox.Render], {
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
        _handleFocus:function() {
            var self = this;
            self.get("el").addClass(getCls(self,
                self.getCls(FOCUS_CLS)));
        },

        /**
         * @override
         */
        _handleBlur:function() {
            var self = this;
            self.get("el").removeClass(getCls(self,
                self.getCls(FOCUS_CLS)));
        },

        /**
         * @override
         */
        _handleMouseEnter:function() {
            var self = this;
            self.get("el").addClass(getCls(self,
                self.getCls(HOVER_CLS)));
        },

        /**
         * @override
         */
        _handleMouseLeave:function() {
            var self = this;
            self.get("el").removeClass(getCls(self,
                self.getCls(HOVER_CLS)));
            // 鼠标离开时，默认设为鼠标松开状态
            self._handleMouseUp();
        },


        /**
         * 模拟原生 disabled 机制
         * @param v
         */
        _uiSetDisabled:function(v) {
            var self = this,el = self.get("el");
            if (v) {
                el.addClass(getCls(self, self.getCls(DISABLED_CLS)))
                    //不能被 tab focus 到
                    //support aria
                    .attr({
                        "tabindex": -1,
                        "aria-disabled": true
                    });
            } else {
                el.removeClass(getCls(self,
                    self.getCls(DISABLED_CLS)))
                    .attr({
                        "tabindex": 0,
                        "aria-disabled": false
                    });
            }
        },

        /**
         * @override
         */
        _handleMouseDown:function() {
            var self = this;
            self.get("el")
                .addClass(getCls(self,
                self.getCls(ACTIVE_CLS)))
                .attr("aria-pressed", true);
        },

        /**
         * @override
         */
        _handleMouseUp:function() {
            var self = this;
            self.get("el").removeClass(getCls(self,
                self.getCls(ACTIVE_CLS)))
                .attr("aria-pressed", false);
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


    return UIBase.create(Css3Render, {

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
            }
            ,

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
 * @author:yiminghe@gmail.com
 */
KISSY.add("button", function(S, Button, Render) {
    Button.Render = Render;
    return Button;
}, {
    requires:['button/base','button/customrender']
});
