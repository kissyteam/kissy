/**
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
});