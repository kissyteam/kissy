/**
 * input for autocomplete
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete/input", function (S, UIBase, Component, AutoCompleteInputRender) {
    var AutoCompleteInput;
    AutoCompleteInput = UIBase.create(Component.Controller, [], {
        autoComplete:null,
        bindUI:function () {
            var self = this, el = self.get("el");
            el.on("valuechange", self._onValueChange, self);
        },
        _onValueChange:function () {
            var autoComplete = this.autoComplete;
            if (autoComplete) {
                autoComplete._onInputChange(this.get("el").val());
            }
        },
        _handleFocus:function () {
            AutoCompleteInput.superclass._handleFocus.apply(this, arguments);
            var autoComplete = this.autoComplete;
            if (autoComplete) {
                autoComplete._onInputFocus(this);
            }
        },

        _handleBlur:function () {
            var autoComplete = this.autoComplete;
            if (autoComplete) {
                autoComplete._onPrepareCollapse();
            }
        },

        _handleKeyEventInternal:function (e) {
            var autoComplete = this.autoComplete;
            if (autoComplete) {
                return autoComplete._handleKeyEventInternal(e);
            }
        }
    }, {
        ATTRS:{
            focusable:{
                value:true
            },
            value:{
              view:true
            },
            handleMouseEvents:{
                value:false
            },
            elTagName:{
                value:'input'
            },
            allowTextSelection_:{
                value:true
            },
            ariaOwns:{
                view:true
            },
            ariaActiveDescendant:{
                view:true
            },
            ariaExpanded:{
                view:true
            }
        },

        DefaultRender:AutoCompleteInputRender
    });

    Component.UIStore.setUIByClass("autocomplete-input", {
        priority:Component.UIStore.PRIORITY.LEVEL1,
        ui:AutoCompleteInput
    });

    return AutoCompleteInput;
}, {
    requires:['uibase', 'component', './inputrender']
});