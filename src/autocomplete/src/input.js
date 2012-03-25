/**
 * input for autocomplete
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete/input", function (S, UIBase, Component) {
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
                autoComplete._onPrepareCollapse(this);
            }
        },

        _handleKeyEventInternal:function (ev) {
            var autoComplete = this.autoComplete;
            if (autoComplete) {
                return autoComplete._handleKeyEventInternal(this);
            }
        }
    }, {
        ATTRS:{
            focusable:{
                value:true
            },
            handleMouseEvents:{
                value:false
            },
            elTagName:{
                value:'input'
            },
            allowTextSelection_:{
                value:true
            }
        }
    });
    return AutoCompleteInput;
}, {
    requires:['uibase', 'component']
});