/**
 * autoComplete menu.
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete/menu", function (S, Event, UIBase, Component, Menu, AutoCompleteMenuRender) {
    var ALIGN = {
        points:["bl", "tl"],
        overflow:{
            failX:1,
            failY:1,
            adjustX:1,
            adjustY:1
        }
    };

    function reAlign2() {
        var self = this,
            _input = self._input;
        if (_input && self.get("visible")) {
            var menuCfg = _input.get("menuCfg") || {};
            self.set("align", S.merge({
                node:_input.get("el")
            }, ALIGN, menuCfg.align));
        }
    }

    var reAlign = S.buffer(reAlign2, 50), AutoCompleteMenu;

    /**
     * DropDown menu for autoComplete input.
     * @name Menu
     * @memberOf AutoComplete
     * @extends Menu.PopupMenu
     * @class
     */
    AutoCompleteMenu = UIBase.create(Menu.PopupMenu,
        /**
         * @lends AutoComplete.Menu#
         */
        {
            __CLASS:"AutoComplete.Menu",

            // current input which causes this menu to show
            _input:null,

            // 所以注册过的 input，为 0 时可能会删除整个 menu
            _inputs:null,

            /**
             * attach one input or textarea to this autoComplete logic
             * @param {AutoComplete} input input or textarea wrapper instance
             */
            attachInput:function (input) {
                var self = this;
                self._inputs = self._inputs || [];
                if (!S.inArray(input, self._inputs)) {
                    self._inputs.push(input);
                }
            },

            /**
             * detach existing input or textarea from this autoComplete logic
             * @param {AutoComplete} input previous attached input or textarea instance
             */
            detachInput:function (input, destroy) {
                var self = this,
                    _inputs = self._inputs,
                    index = S.indexOf(input, _inputs || []);
                if (index != -1) {
                    _inputs.splice(index, 1);
                }
                if (destroy && (!_inputs || _inputs.length == 0)) {
                    self.destroy();
                }
            },

            bindUI:function () {

                var self = this;

                self.on("show", function () {
                    var input = self._input;
                    input.set("ariaOwns", self.get("el").attr("id"));
                    input.set("ariaExpanded", true);
                });

                self.on("hide", function () {
                    var input = self._input;
                    input.set("ariaOwns", self.get("el").attr("id"));
                    input.set("ariaExpanded", false);
                });

                self.on("click", function (e) {
                    var item = e.target;
                    var input = self._input;
                    // stop valuechange event
                    input._stopNotify = 1;
                    input.set("selectedItem", item);
                    self.hide();
                    setTimeout(function () {
                            input._stopNotify = 0;
                        },
                        // valuechange interval
                        50);
                });

                Event.on(window, "resize", reAlign, self);

                var el = self.get("el");
                var contentEl = self.get("contentEl");

                el.on("focusin", function () {
                    self._clearDismissTimer();
                });

                el.on("focusout", function () {
                    self._hideForAutoComplete();
                });

                contentEl.on("mouseover", function () {
                    var input = self._input;
                    // trigger el focusous
                    input.get("el")[0].focus();
                    // prevent menu from hiding
                    self._clearDismissTimer();
                });
            },

            _clearDismissTimer:function () {
                var self = this;
                if (self._dismissTimer) {
                    clearTimeout(self._dismissTimer);
                    self._dismissTimer = null;
                }
            },

            _onInputBlur:function () {
                this._hideForAutoComplete();
            },

            _showForAutoComplete:function (_input) {
                var self = this;
                self._input = _input;
                self._clearDismissTimer();
                var menuCfg = _input.get("menuCfg") || {};
                self.set("align", S.merge({
                    node:_input.get("el")
                }, ALIGN, menuCfg.align));
                self.show();
                // make menu item (which textContent is same as input) active
                var children = self.get("children"),
                    val = _input.get("el").val();
                for (var i = 0; i < children.length; i++) {
                    if (children[i].get("textContent") == val) {
                        self.set("highlightedItem", children[i]);
                        return;
                    }
                }
            },

            _hideForAutoComplete:function () {
                var self = this;
                self._dismissTimer = setTimeout(function () {
                    self._immediateHideForAutoComplete();
                }, 30);
            },

            _immediateHideForAutoComplete:function () {
                var self = this;
                self.removeChildren(true);
                self.hide();
            },

            destructor:function () {
                var self = this;
                Event.remove(window, "resize", reAlign, self);
                S.each(self._inputs, function (inp) {
                    inp.__set("menu", null);
                });
                self._inputs = null;
            }
        }, {
            DefaultRender:AutoCompleteMenuRender,
            ATTRS:{
                head:{
                    view:true
                },
                foot:{
                    view:true
                }
            }
        });

    Component.UIStore.setUIByClass("autocomplete-menu", {
        priority:Component.UIStore.PRIORITY.LEVEL1,
        ui:AutoCompleteMenu
    });

    return AutoCompleteMenu;
}, {
    requires:['event', 'uibase', 'component', 'menu', './menuRender']
});
/**
 * 2012-03-26 yiminghe@gmail.com
 *  - refer http://www.w3.org/TR/wai-aria-practices/#autocomplete
 **/