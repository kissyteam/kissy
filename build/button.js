/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: ${build.time}
*/
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
             * @inherited
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
});/**
 * abstract view for button
 * @author yiminghe@gmail.com
 */
KISSY.add("button/buttonrender", function(S, UIBase, Component) {
    // http://www.w3.org/TR/wai-aria-practices/
    return UIBase.create(Component.Render, {
        renderUI:function() {
            //set wai-aria role
            this.get("el").attr("role", "button");
        },
        _uiSetContent:function(content) {
            this.get("el").html(content);
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
             * @inherited
             * disabled:{}
             */

            /**
             * @inherited
             * prefixCls:{}
             */

                //按钮内容
            content:{},
            //aria-describledby support
            describedby:{},
            tooltip:{}
        },
        HTML_PARSER:{
            //默认单标签包含 content
            //多标签需要 override
            content:function(el) {
                return el.html();
            }
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
            prefixCls:self.get("prefixCls"),
            tag:self.__css_tag
        });
    }

    var CLS = "{prefixCls}inline-block " + " {prefixCls}{tag}-button",
        FOCUS_CLS = "{prefixCls}{tag}-button-focused",
        HOVER_CLS = "{prefixCls}{tag}-button-hover",
        ACTIVE_CLS = "{prefixCls}{tag}-button-active",
        DISABLED_CLS = "{prefixCls}{tag}-button-disabled";

    return UIBase.create(ButtonRender, {

        __css_tag:"css3",

        renderUI:function() {
            var self = this,
                el = self.get("el");
            el.unselectable().addClass(getCls(self, CLS));
        },

        /**
         * @override
         */
        _handleFocus:function() {
            var self = this;
            self.get("el").addClass(getCls(self, FOCUS_CLS));
        },

        /**
         * @override
         */
        _handleBlur:function() {
            var self = this;
            self.get("el").removeClass(getCls(self, FOCUS_CLS));
        },

        /**
         * @override
         */
        _handleMouseEnter:function() {
            var self = this;
            self.get("el").addClass(getCls(self, HOVER_CLS));
        },

        /**
         * @override
         */
        _handleMouseLeave:function() {
            var self = this;
            self.get("el").removeClass(getCls(self, HOVER_CLS));
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
                el.addClass(getCls(self, DISABLED_CLS))
                    //不能被 tab focus 到
                    //support aria
                    .attr({
                        "tabindex": -1,
                        "aria-disabled": true
                    });
            } else {
                el.removeClass(getCls(self, DISABLED_CLS))
                    .attr({"tabindex": 0,"aria-disabled": false});
            }
        },

        /**
         * @override
         */
        _handleMouseDown:function() {
            var self = this;
            self.get("el").addClass(getCls(self, ACTIVE_CLS))
                .attr("aria-pressed", true);
        },

        /**
         * @override
         */
        _handleMouseUp:function() {
            var self = this;
            self.get("el").removeClass(getCls(self, ACTIVE_CLS))
                .attr("aria-pressed", false);
        }

    });

}, {
    requires:['uibase','./buttonrender']
});/**
 * view for button , double div for pseudo-round corner
 * @author yiminghe@gmail.com
 */
KISSY.add("button/customrender", function(S, UIBase, Css3Render) {
    //双层 div 模拟圆角
    var CUSTOM_RENDER_HTML = "<div class='{prefixCls}inline-block {prefixCls}custom-button-outer-box'>" +
        "<div id='{{id}}' class='{prefixCls}inline-block {prefixCls}custom-button-inner-box'></div></div>";

    return UIBase.create(Css3Render, {

            __css_tag:"custom",

            renderUI:function() {
                var self = this,id = S.guid('ks-button-labelby');
                //按钮的描述节点在最内层，其余都是装饰
                self.get("el")
                    .html(S.substitute(CUSTOM_RENDER_HTML, {
                    prefixCls:this.get("prefixCls"),
                    id:id
                }))
                    .attr("aria-labelledby", id);
            },

            /**
             * 内容移到内层
             * @override
             * @param v
             */
            _uiSetContent:function(v) {
                this.get("el").one('div').one('div').html(v || "");
            }
        }
        /**
         * @inherited
         * content:{}
         */
    );
}, {
    requires:['uibase','./css3render']
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
