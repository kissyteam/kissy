/**
 * @fileOverview ComboBox menu constroller.
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/menu", function (S, Event, Menu, ComboBoxMenuRender) {

    var ComboBoxMenu,

        window = S.Env.host;

    /**
     * @name Menu
     * @memberOf ComboBox
     * @extends Menu.PopupMenu
     * @class
     * DropDown menu for comboBox input.
     * xclass: 'combobox-menu'.
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
                    var combobox = self.get("parent");
                    // stop valuechange event
                    combobox._stopNotify = 1;
                    combobox._selectItem(item);
                    combobox.set("collapsed", true);
                    setTimeout(
                        function () {
                            combobox._stopNotify = 0;
                        },
                        // valuechange interval
                        50
                    );
                });

                Event.on(window, "resize", reAlign, self);

                var el = self.get("el");
                var contentEl = self.get("contentEl");

                el.on("focusin", clearDismissTimer, self);

                el.on("focusout", delayHide, self);

                contentEl.on("mouseover", function () {
                    var combobox = self.get("parent");
                    // trigger el focus
                    combobox.get("input")[0].focus();
                    // prevent menu from hiding
                    clearDismissTimer.call(self);
                });
            },

            _clearDismissTimer:clearDismissTimer,

            _delayHide:delayHide,

            destructor:function () {
                var self = this;
                Event.remove(window, "resize", reAlign, self);
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


    // # ---------------------- private start

    function clearDismissTimer() {
        var self = this;
        if (self._dismissTimer) {
            clearTimeout(self._dismissTimer);
            self._dismissTimer = null;
        }
    }

    function delayHide() {
        var self = this;
        self._dismissTimer = setTimeout(function () {
            self.get("parent").set("collapsed", true);
        }, 30);
    }

    var reAlign = S.buffer(function () {
        var self = this;
        if (self.get("visible")) {
            self.get("parent")._onWindowResize();
        }
    }, 50);

    // # ---------------------- private end

    return ComboBoxMenu;
}, {
    requires:['event', 'menu', './menuRender']
});
/**
 * 2012-03-26 yiminghe@gmail.com
 *  - refer http://www.w3.org/TR/wai-aria-practices/#combobox
 **/