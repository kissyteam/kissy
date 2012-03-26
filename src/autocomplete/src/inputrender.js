KISSY.add("autocomplete/inputrender", function (S, UIBase, Component) {
    return UIBase.create(Component.Render, [], {
        renderUI:function () {
            var el = this.get("el");
            el.attr({
                "aria-haspopup":true,
                "aria-autocomplete":"list",
                "autocomplete":"off",
                role:"combobox"
            });
        },

        _uiSetAriaOwns:function (v) {
            this.get("el").attr("aria-owns", v);
        },

        _uiSetAriaActiveDescendant:function (v) {
            this.get("el").attr("aria-activedescendant", v);
        },

        _uiSetAriaExpanded:function (v) {
            this.get("el").attr("aria-expanded", v);
        },

        _uiSetValue:function (v) {
            this.get("el").val(v);
        }
    }, {
        ATTRS:{
            ariaOwns:{
            },
            ariaActiveDescendant:{
            },
            ariaExpanded:{
            },
            value:{
                valueFn:function () {
                    return this.get("el").val();
                }
            }
        }
    });
}, {
    requires:['uibase', 'component']
});