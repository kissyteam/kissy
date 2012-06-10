/**
 * @fileOverview AutoComplete menu constroller.
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete/menu", function (S, Event, Menu, AutoCompleteMenuRender) {


    var AutoCompleteMenu,
        window = S.Env.host;

    /**
     * DropDown menu for autoComplete input.
     * @name Menu
     * @memberOf AutoComplete
     * @extends Menu.PopupMenu
     * @class
     */
    AutoCompleteMenu = Menu.PopupMenu.extend(
        /**
         * @lends AutoComplete.Menu#
         */
        {
            /**
             * Bind event once after menu initialize and before menu shows.
             * Bind only one time!
             * @protected
             */
            bindUI:function () {
                var self = this;

                self.on("show", function () {
                    var input = self.get("parent");
                    input.set("ariaOwns", self.get("el").attr("id"));
                    input.set("collapsed", false);
                });

                self.on("hide", function () {
                    var input = self.get("parent");
                    input.set("collapsed", true);
                });

                self.on("click", function (e) {
                    var item = e.target;
                    var input = self.get("parent");
                    // stop valuechange event
                    input._stopNotify = 1;
                    input.set("selectedItem", item);
                    self.hide();
                    setTimeout(
                        function () {
                            input._stopNotify = 0;
                        },
                        // valuechange interval
                        50
                    );
                });

                var reAlign = S.buffer(function () {
                    var self = this;
                    if (self.get("visible")) {
                        self.get("parent")._onWindowResize();
                    }
                }, 50);

                self.__reAlign = reAlign;

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
                    var input = self.get("parent");
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

            _hideForAutoComplete:function () {
                var self = this;
                self._dismissTimer = setTimeout(function () {
                    self._immediateHideForAutoComplete();
                }, 30);
            },

            _immediateHideForAutoComplete:function () {
                var self = this;
                self.hide();
            },

            destructor:function () {
                var self = this;
                Event.remove(window, "resize", self.__reAlign, self);
            }
        }, {
            ATTRS:{
                head:{
                    view:true
                },
                foot:{
                    view:true
                },
                xrender:{
                    value:AutoCompleteMenuRender
                }
            }
        }, {
            xclass:'autocomplete-menu',
            priority:40
        });

    return AutoCompleteMenu;
}, {
    requires:['event', 'menu', './menuRender']
});
/**
 * 2012-03-26 yiminghe@gmail.com
 *  - refer http://www.w3.org/TR/wai-aria-practices/#autocomplete
 **/