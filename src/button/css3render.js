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
});