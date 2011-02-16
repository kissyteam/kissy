/**
 * view : render button using div
 * @author:yiminghe@gmail.com
 */
KISSY.add("button/css3render", function(S, UIBase) {

    return UIBase.create([UIBase.Box], {

        renderUI:function(){
            this.get("el").unselectable();
        },

        _uiSetContent:function(v) {
            this.get("el").html(v);
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
            content:{},
            disabled:{},
            elCls:{
                value:"goog-inline-block goog-css3-button"
            },
            hoverCls:{
                value:"goog-css3-button-hover"
            },
            focusCls:{
                value:"goog-css3-button-focused"
            },
            activeCls:{
                value:"goog-css3-button-active"
            },
            disabledCls:{
                value:"goog-css3-button-disabled"
            }
        }
    });

}, {
    requires:['uibase']
});