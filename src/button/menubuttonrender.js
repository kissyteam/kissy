KISSY.add("button/menubuttonrender", function(S, UIBase, CustomRender) {

    var MENU_BUTTON_TMPL = '<div class="goog-inline-block {prefixCls}-caption"></div>' +
        '<div class="goog-inline-block {prefixCls}-dropdown">&nbsp;</div>';

    var MenuButtonRender = UIBase.create(CustomRender, [], {
        renderUI:function() {
            var el = this.get("el");
            el.one("div").one("div").html(S.substitute(MENU_BUTTON_TMPL, {
                prefixCls:this.get("prefixCls")
            }));
            //带有 menu
            el.attr("aria-haspopup", true);
        },

        _uiSetContent:function(v) {
            if (v == undefined) return;
            this.get("el").one("." + this.get("prefixCls") + "-caption").html(v);
        },

        _uiSetCollapsed:function(v) {
            var el = this.get("el"),prefixCls = this.get("prefixCls");
            if (!v) {
                el.addClass(prefixCls + "-open");
                el.attr("aria-expanded", true);
            } else {
                el.removeClass(prefixCls + "-open");
                el.attr("aria-expanded", false);
            }
        }
    }, {
        ATTRS:{
            prefixCls:{
                value:"goog-menu-button"
            },
            collapsed:{
                value:true
            }
        }
    });

    return MenuButtonRender;
}, {
    requires:['uibase','./customrender']
});