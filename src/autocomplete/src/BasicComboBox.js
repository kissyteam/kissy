/**
 * Combobox derived from autocomplete
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete/BasicComboBox", function (S, UIBase, BasicAutoComplete, BasicComboBoxRender) {

    // toggle menu show and hide
    function onBtn(e) {
        S.log("mousedown");
        var self = this,
            menu = self.get("menu"),
            domEl = self.get("el")[0];
        if (menu.get("visible")) {
            menu.hide();
        } else {
            domEl.focus();
            self.sendRequest('');
        }
        e && e.halt();
    }

    return  UIBase.create(BasicAutoComplete, {
        bindUI:function () {
            var self = this,
                el = self.get("el"),
                container = self.get("container"),
                button = self.get("button");
            container.on('click', onBtn, self);
            var menuCfg = this.get("menuCfg");
            if (!menuCfg.width) {
                // drop down menu width should add button width!
                menuCfg.width = container.width();
            }
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
}, {
    requires:['uibase', './basic', './BasicComboBoxRender']
});