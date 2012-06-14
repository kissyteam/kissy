/**
 * @fileOverview ComboBox menu constroller.
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/menu", function (S, Event, Menu, ComboBoxMenuRender) {


    var ComboBoxMenu,
        window = S.Env.host;

    /**
     * DropDown menu for comboBox input.
     * xclass: 'combobox-menu'.
     * @name Menu
     * @memberOf ComboBox
     * @extends Menu.PopupMenu
     * @class
     */
    ComboBoxMenu = Menu.PopupMenu.extend(
        /**
         * @lends ComboBox.Menu#
         */
        {
            /**
             * Bind event once after menu initialize and before menu shows.
             * Bind only one time!
             * @protected
             */
            bindUI:function () {
                var self = this;

                self.on("click", function (e) {
                    var item = e.target;
                    var input = self.get("parent");
                    // stop valuechange event
                    input._stopNotify = 1;
                    input.set("selectedItem", item);
                    input.set("collapsed", true);
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
                    self._hideForComboBox();
                });

                contentEl.on("mouseover", function () {
                    var input = self.get("parent");
                    // trigger el focusous
                    input.get("input")[0].focus();
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

            _hideForComboBox:function () {
                var self = this;
                self._dismissTimer = setTimeout(function () {
                    self.get("parent").set("collapsed", true);
                }, 30);
            },

            destructor:function () {
                var self = this;
                Event.remove(window, "resize", self.__reAlign, self);
            }
        }, {
            ATTRS:{
                head:{
                    view:1
                },
                foot:{
                    view:1
                },
                xrender:{
                    value:ComboBoxMenuRender
                }
            }
        }, {
            xclass:'combobox-menu',
            priority:40
        });

    return ComboBoxMenu;
}, {
    requires:['event', 'menu', './menuRender']
});
/**
 * 2012-03-26 yiminghe@gmail.com
 *  - refer http://www.w3.org/TR/wai-aria-practices/#combobox
 **/