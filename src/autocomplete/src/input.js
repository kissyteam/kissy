/**
 * input wrapper for autoComplete component
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete/input", function (S, Event, UIBase, Component, AutoCompleteInputRender) {
    var AutoCompleteInput,
        KeyCodes = Event.KeyCodes;

    /**
     * Input/Textarea Wrapper for autoComplete
     * @name Input
     * @memberOf AutoComplete
     * @extends Component.Controller
     * @class
     */
    AutoCompleteInput = UIBase.create(Component.Controller, [],
        /**
         * @lends AutoComplete.Input
         */
        {

            _stopNotify:0,

            autoComplete:null,
            /**
             * Override Component.Controller's bindUI for binding events.
             */
            bindUI:function () {
                var self = this, el = self.get("el");
                el.on("valuechange", self._onValueChange, self);
            },
            _onValueChange:function () {
                if (this._stopNotify) {
                    return;
                }
                var autoComplete = this.autoComplete;
                if (autoComplete) {
                    autoComplete.sendRequest(this.get("el").val());
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
                // autocomplete will change input value
                // but it does not need to reload data
                if (S.inArray(e.keyCode, [
                    KeyCodes.UP,
                    KeyCodes.DOWN,
                    KeyCodes.ESC
                ])) {
                    this._stopNotify = 1;
                } else {
                    this._stopNotify = 0;
                }
                var autoComplete = this.autoComplete;
                if (autoComplete) {
                    return autoComplete._handleKeyEventInternal(e);
                }
            }
        }, {
            ATTRS:/**
             * @lends AutoComplete.Input
             */
            {
                focusable:{
                    value:true
                },
                handleMouseEvents:{
                    value:false
                },
                allowTextSelection_:{
                    value:true
                },
                /**
                 * aria-owns.ReadOnly.
                 * @type String
                 */
                ariaOwns:{
                    view:true
                },
                /**
                 * aria-expanded.ReadOnly.
                 * @type String
                 */
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
    requires:[
        'event',
        'uibase', 'component', './inputRender']
});