/**
 * @fileOverview Combobox derived from Autocomplete.
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete/BasicComboBoxRender", function (S, AutoCompleteRender, Node) {

    var $ = Node.all, Render;

    return Render = AutoCompleteRender.extend({
        createDom:function () {
            var self = this,
                container = $("<span class='" + self.get("prefixCls") + "combobox'></span>"),
                button = $("<span class='ks-combobox-button'>" +
                    "<span class='ks-combo-button-inner'>&#x25BC;</span>" +
                    "</span>")
                    // ie do not lose focus
                    .unselectable();
            button.on("mousedown", function (e) {
                e.preventDefault();
            });
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
        _uiSetFocused:function (v) {
            var self = this;
            Render.superclass._uiSetFocused.apply(self, arguments);
            self.get("container")[v ? "addClass" : "removeClass"]("ks-combobox-focused");
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
    requires:['./inputRender', 'node']
});