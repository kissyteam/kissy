/**
 * render aria properties to input element
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete/inputRender", function (S, UIBase, Component) {
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

        _uiSetAriaExpanded:function (v) {
            this.get("el").attr("aria-expanded", v);
        }
    }, {
        ATTRS:{
            ariaOwns:{
            },
            ariaExpanded:{
            },
            elTagName:{
                value:'input'
            }
        }
    });
}, {
    requires:['uibase', 'component']
});