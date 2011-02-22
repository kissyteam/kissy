/**
 * view : render button using div
 * @author:yiminghe@gmail.com
 */
KISSY.add("button/css3render", function(S, UIBase, ButtonRender) {

    return UIBase.create(ButtonRender, [], {

        renderUI:function() {
            this.get("el").unselectable();
        },

        _handleFocus:function() {
            if (this.get("disabled")) return false;
            this.get("el").addClass(this.get("focusCls"));
        },

        _handleBlur:function() {
            if (this.get("disabled")) return false;
            this.get("el").removeClass(this.get("focusCls"));
        },

        _handleMouseEnter:function() {
            if (this.get("disabled")) return false;
            this.get("el").addClass(this.get("hoverCls"));
        },

        _handleMouseLeave:function() {
            if (this.get("disabled")) return false;
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
            if (this.get("disabled")) return false;
            this.get("el").addClass(this.get("activeCls"));
            this.get("el").attr("aria-pressed", true);
        },

        _handleMouseUp:function() {
            if (this.get("disabled")) return false;
            this.get("el").removeClass(this.get("activeCls"));
            this.get("el").attr("aria-pressed", false);
        },

        _handleKeydown:function() {
            if (this.get("disabled")) return false;
        }

    }, {
        ATTRS:{
            prefixCls:{
                value:"goog-css3-button"
            },
            elCls:{
                valueFn:function() {
                    return "goog-inline-block " + this.get("prefixCls");
                }
            },
            hoverCls:{
                valueFn:function() {
                    return this.get("prefixCls") + "-hover";
                }
            },
            focusCls:{
                valueFn:function() {
                    return this.get("prefixCls") + "-focused";
                }
            },
            activeCls:{
                valueFn:function() {
                    return this.get("prefixCls") + "-active";
                }
            },
            disabledCls:{
                valueFn:function() {
                    return this.get("prefixCls") + "-disabled";
                }
            }
        }
    });

}, {
    requires:['uibase','./buttonrender']
});