/**
 * @fileOverview Combobox derived from Autocomplete.
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete/BasicComboBox", function (S, BasicAutoComplete, BasicComboBoxRender) {

    // toggle menu show and hide
    function onBtn(e) {
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

    return  BasicAutoComplete.extend({
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
            },
            xrender:{
                value:BasicComboBoxRender
            }
        }
    },{
        xclass:"autocomplete-combobox",
        priority:30
    });
}, {
    requires:['./basic', './BasicComboBoxRender']
});

/**
 * TODO
 *  - 考虑是否 ComboBox 要继承于 AutoComplete，srcNode 有点怪
 *  - 是否应该用组合实现？
 **/