/**
 * Combobox derived from autocomplete
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete/BasicComboBoxRender", function (S, UIBase, AutoCompleteRender, Node) {

    var $ = Node.all, Render;

    return Render = UIBase.create(AutoCompleteRender, {
        createDom:function () {
            var self = this,
                container = $("<span class='" + self.get("prefixCls") + "combobox'></span>"),
                button = $("<a " +
                    // do need keyboard
                    "tabindex='-1' " +
                    "href='javascript:void(\"open\")'  " +
                    // non-ie do not lose focus
                    "onmousedown='return false;' " +
                    "class='" + self.get("prefixCls") +
                    "combobox-button'>&#x25BC;</a>")
                    // ie do not lose focus
                    .unselectable();
            self.__set("container", container);
            self.__set("button", button);
        },
        renderUI:function () {
            var self = this,
                container = self.get('container'),
                button = self.get("button"),
                parent = self.get("el").parent();
            container
                .appendTo(parent)
                .append(self.get("el"))
                .append(button);
        },
        _setFocused:function (v) {
            var self = this;
            Render.superclass._setFocused.apply(self, arguments);
            self.get("container")[v ? "addClass" : "removeClass"](self.get("prefixCls")
                + "combobox-focused");
        },

        destructor:function () {
            this.get("container").remove();
        }
    }, {
        ATTRS:{
            container:{},
            button:{}
        }
    });
}, {
    requires:['uibase', './inputRender', 'node']
});