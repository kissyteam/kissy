/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: ${build.time}
*/
/**
 * Model and Control for button
 * @author:yiminghe@gmail.com
 */
KISSY.add("button/base", function(S, UIBase, Component, CustomRender) {

    var Button = UIBase.create(Component.ModelControl, {
    }, {
        ATTRS:{
            value:{},
            content:{
                //model 中数据属性变化后要更新到 view 层
                view:true,
                //如果没有用户值默认值，则要委托给 view 层
                //比如 view 层使用 html_parser 来利用既有元素
                valueFn:function() {
                    return this.get("view").get("content");
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
 * @author:yiminghe@gmail.com
 */
KISSY.add("button/buttonrender", function(S, UIBase,Component) {
    // http://www.w3.org/TR/wai-aria-practices/
    return UIBase.create(Component.Render,{
        renderUI:function() {
            //set wai-aria role
            this.get("el").attr("role", "button");
        },
        _uiSetContent:function(v) {
            this.get("el").html(v);
        },
        _uiSetTooltip:function(t) {
            this.get("el").attr("title", t);
        },
        _uiSetDescribedby:function(d) {
            this.get("el").attr("aria-describedby", d);
        }
    }, {
        ATTRS:{
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
 * @author:yiminghe@gmail.com
 */
KISSY.add("button/css3render", function(S, UIBase, ButtonRender) {

    return UIBase.create(ButtonRender, {

        renderUI:function() {
            this.get("el").unselectable();
        },

        _handleFocus:function() {
            if (this.get("disabled")) return false;
            this.get("el").addClass(this.get("focusCls"));
        },

        _handleBlur:function() {
            this.get("el").removeClass(this.get("focusCls"));
        },

        _handleMouseEnter:function() {
            this.get("el").addClass(this.get("hoverCls"));
        },

        _handleMouseLeave:function() {
            this.get("el").removeClass(this.get("hoverCls"));
            this._handleMouseUp();
        },

        //模拟原生 disabled 机制
        _uiSetDisabled:function(v) {
            var el = this.get("el");
            if (v) {
                el.addClass(this.get("disabledCls"));
                //不能被 tab focus 到
                el.removeAttr("tabindex");
                //support aria
                el.attr("aria-disabled", true);
            } else {
                el.removeClass(this.get("disabledCls"));
                el.attr("tabindex", 0);
                el.attr("aria-disabled", false);
            }
        },

        _handleMouseDown:function() {
            this.get("el").addClass(this.get("activeCls"));
            this.get("el").attr("aria-pressed", true);
        },

        _handleMouseUp:function() {
            this.get("el").removeClass(this.get("activeCls"));
            this.get("el").attr("aria-pressed", false);
        },

        _handleKeydown:function() {
        }

    }, {
        ATTRS:{
            prefixCls:{
                value:"goog-"
            },
            elCls:{
                valueFn:function() {
                    return this.get("prefixCls") + "inline-block " + this.get("prefixCls") + "css3-button";
                }
            },
            hoverCls:{
                valueFn:function() {
                    return this.get("prefixCls") + "css3-button-hover";
                }
            },
            focusCls:{
                valueFn:function() {
                    return this.get("prefixCls") + "css3-button-focused";
                }
            },
            activeCls:{
                valueFn:function() {
                    return this.get("prefixCls") + "css3-button-active";
                }
            },
            disabledCls:{
                valueFn:function() {
                    return this.get("prefixCls") + "css3-button-disabled";
                }
            }
        }
    });

}, {
    requires:['uibase','./buttonrender']
});/**
 * view for button , double div for pseudo-round corner
 * @author:yiminghe@gmail.com
 */
KISSY.add("button/customrender", function(S, UIBase, Css3Render) {
    //双层 div 模拟圆角
    var CUSTOM_RENDER_HTML = "<div class='{prefixCls}inline-block {prefixCls}custom-button-outer-box'>" +
        "<div class='{prefixCls}inline-block {prefixCls}custom-button-inner-box'></div></div>";

    return UIBase.create(Css3Render, {
            renderUI:function() {
                this.get("el").html(S.substitute(CUSTOM_RENDER_HTML, {
                        prefixCls:this.get("prefixCls")
                    }));
                var id = S.guid('ks-button-labelby');
                this.get("el").one('div').one('div').attr("id", id);

                //按钮的描述节点在最内层，其余都是装饰
                this.get("el").attr("aria-labelledby", id);
            },
            _uiSetContent:function(v) {
                if (v == undefined) return;
                this.get("el").one('div').one('div').html(v);
            }
        }, {
            ATTRS:{
                elCls:{
                    valueFn:function() {
                        return this.get("prefixCls") + "inline-block " + this.get("prefixCls") + "custom-button";
                    }
                },
                hoverCls:{
                    valueFn:function() {
                        return this.get("prefixCls") + "custom-button-hover";
                    }
                },
                focusCls:{
                    valueFn:function() {
                        return this.get("prefixCls") + "custom-button-focused";
                    }
                },
                activeCls:{
                    valueFn:function() {
                        return this.get("prefixCls") + "custom-button-active";
                    }
                },
                disabledCls:{
                    valueFn:function() {
                        return this.get("prefixCls") + "custom-button-disabled";
                    }
                }
            }
        });
}, {
        requires:['uibase','./css3render']
    });/**
 * view: render button using native button
 * @author:yiminghe@gmail.com
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
