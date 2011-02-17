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
            if (this.get("disabled")) return;
            this.get("el").addClass(this.get("focusCls"));
        },

        _handleBlur:function() {
            if (this.get("disabled")) return;
            this.get("el").removeClass(this.get("focusCls"));
        },

        _handleMouseEnter:function() {
            if (this.get("disabled")) return;
            this.get("el").addClass(this.get("hoverCls"));
        },

        _handleMouseLeave:function() {
            if (this.get("disabled")) return;
            this.get("el").removeClass(this.get("hoverCls"));
            this._handleMouseUp();
        },

        //模拟原生 disabled 机制
        _uiSetDisabled:function(v) {
            if (v) {
                this.get("el").addClass(this.get("disabledCls"));
                //不能被 tab focus 到
                this.get("el").removeAttr("tabindex");
            } else {
                this.get("el").removeClass(this.get("disabledCls"));
                this.get("el").attr("tabindex", 0);
            }
        },

        _handleMouseDown:function() {
            if (this.get("disabled")) return;
            this.get("el").addClass(this.get("activeCls"));
        },

        _handleMouseUp:function() {
            if (this.get("disabled")) return;
            this.get("el").removeClass(this.get("activeCls"));
        },

        _handleKeydown:function() {
            if (this.get("disabled")) return;
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
    requires:['uibase','button/buttonrender']
});