/**
 * Combobox derived from autocomplete
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete/BasicComboBox", function (S, UIBase, BasicAutoComplete, BasicComboBoxRender) {

    function onBtn(e) {
        S.log("mousedown");
        var self = this,
            menu = self.get("menu"),
            domEl = self.get("el")[0];
        if (menu.get("visible")) {
            menu.hide();
        } else {
            if (document.activeElement == domEl) {
                self.sendRequest('');
            } else {
                domEl.focus();
            }
        }
        e.halt();
    }

    var BasicComboBox = UIBase.create(BasicAutoComplete, {
        bindUI:function () {
            var self = this,
                el = self.get("el"),
                container = self.get("container"),
                button = self.get("button");
            button.on('click', onBtn, self);
            var menuCfg = this.get("menuCfg");
            if (!menuCfg.width) {
                // drop down menu width should add button width!
                menuCfg.width = container.width();
            }
        },
        _handleFocus:function () {
            var self = this;
            BasicComboBox.superclass._handleFocus.apply(self, arguments);
            self.sendRequest('');
        }
    }, {
        ATTRS:{
            container:{
                view:true
            },
            button:{
                view:true
            }
        },

        DefaultRender:BasicComboBoxRender
    });

    return BasicComboBox;
}, {
    requires:['uibase', './basic', './BasicComboBoxRender']
});