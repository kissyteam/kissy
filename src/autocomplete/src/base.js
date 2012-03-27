/**
 * autoComplete logic . control many inputs and only use one menu for performance
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete/base", function (S, Event, UIBase, Menu) {
    var ALIGN = {
        points:["bl", "tl"],
        overflow:{
            failX:1,
            failY:1,
            adjustX:1,
            adjustY:1
        }
    },
        KeyCodes = Event.KeyCodes;

    function reAlign2() {
        var self = this,
            menu = self._menu,
            _input = self._input;
        if (_input && menu && menu.get("visible")) {
            var menuCfg = self.get("menuCfg") || {};
            menu.set("align", S.merge({
                node:_input.get("el")
            }, ALIGN, menuCfg.align));
        }
    }

    var reAlign = S.buffer(reAlign2, 50);

    /**
     * AutoComplete provides autocomplete logic
     * for many text input fields or textareas and one menu
     * @name AutoComplete
     * @extends UIBase
     * @class
     */
    return UIBase.create([],
        /**
         * @lends AutoComplete#
         */
        {
            __CLASS:"AutoComplete",
            // drop down menu
            _menu:null,

            // current input
            _input:null,

            _inputs:null,

            // user's input text
            _savedInputValue:null,

            /**
             * attach one input or textarea to this autoComplete logic
             * @param {AutoComplete.Input} input input or textarea wrapper instance
             */
            attachInput:function (input) {
                this._inputs = this._inputs || [];
                input.autoComplete = this;
                this._inputs.push(input);
            },

            /**
             * detach existing input or textarea from this autoComplete logic
             * @param {AutoComplete.Input} input previous attached input or textarea instance
             */
            detachInput:function (input) {
                var index = S.indexOf(input, this._inputs);
                if (index != -1) {
                    this._inputs.splice(index, 1);
                }
                input.autoComplete = null;
                input.destroy();
            },

            /**
             * fetch autoComplete list by value and show autoComplete list
             * @param {String} value value for fetching autoComplete list
             */
            sendRequest:function (value) {
                if (!this._input) {
                    return;
                }
                var dataSource = this.get("dataSource");
                this._savedInputValue = value;
                dataSource.fetchData(value, this._renderData, this);
            },

            _renderData:function (data) {
                var self = this;
                if (data && data.length) {
                    var _input = self._input;
                    var menu = self._getMenu();
                    menu.removeChildren(true);
                    if (_input) {
                        var menuCfg = self.get("menuCfg") || {};
                        if (!menuCfg.width) {
                            // 需要放在这里
                            // note width :
                            // show 之前，addChild 之后，元素已经建立，改了不能同步到 render
                            menu.set("width", _input.get("width"));
                        }
                    }
                    S.each(data, function (d) {
                        menu.addChild(new Menu.Item({
                            prefixCls:self.get("prefixCls") + "autocomplete-",
                            content:self._renderRow(d)
                        }))
                    });
                    self.set("open", true);
                } else {
                    self.set("open", false);
                }
            },

            _renderRow:function (d) {
                if (this.get("rowRender")) {
                    return this.get("rowRender").call(this, d);
                }
                return d;
            },

            _bindMenu:function () {
                var self = this, menu = self._menu;
                menu.on("show", function () {
                    var input = self._input;
                    input.set("ariaOwns", menu.get("el").attr("id"));
                    input.set("ariaExpanded", true);
                });
                menu.on("hide", function () {
                    var input = self._input;
                    input.set("ariaOwns", menu.get("el").attr("id"));
                    input.set("ariaExpanded", false);
                });
                menu.on("click", function (e) {
                    var content = e.target.get("content");
                    var input = self._input;
                    // stop valuechange event
                    input._stopNotify = 1;
                    input.get("el").val(content);
                    self.set("open", false);
                    setTimeout(function () {
                            input._stopNotify = 0;

                            /**
                             * @name AutoComplete#select
                             * @description fired when user select from suggestion list
                             * @event
                             * @param e
                             * @param e.value selected value
                             * @param e.input current active input
                             */

                            self.fire("select", {
                                value:content,
                                input:input
                            })
                        },
                        // valuechange interval
                        50);
                });
                Event.on(window, "resize", reAlign, self);
            },

            _getMenu:function () {
                var self = this;
                if (!self._menu) {
                    var menuCfg = self.get("menuCfg") || {};
                    self._menu = new Menu.PopupMenu({
                        prefixCls:self.get("prefixCls") + "autocomplete-",
                        width:menuCfg.width
                    });
                    self._bindMenu();
                }
                return self._menu;
            },

            _onInputFocus:function (input) {
                this._input = input;
            },

            _onPrepareCollapse:function () {
                var self = this;
                self.dismissTimer = setTimeout(function () {
                    self.set("open", false);
                }, 100);
            },

            _handleKeyEventInternal:function (e) {
                var menu = this._menu,
                    input = this._input.get("el");
                // 转发给 menu 处理
                if (menu && menu.get("visible")) {
                    var handledByMenu = menu._handleKeydown(e);
                    if (S.inArray(e.keyCode, [KeyCodes.DOWN, KeyCodes.UP])) {
                        // update menu's active value to input just for show
                        input.val(menu.get("activeItem").get("content"))
                    }
                    // esc
                    if (e.keyCode == KeyCodes.ESC) {
                        this.set("open", false);
                        // restore original user's input text
                        input.val(this._savedInputValue);
                        return true;
                    }
                    return handledByMenu;
                } else if (menu) {
                    if (e.keyCode == KeyCodes.DOWN || e.keyCode == KeyCodes.UP) {
                        this.set("open", true);
                        return true;
                    }
                }
            },

            _uiSetOpen:function (d) {
                var self = this,
                    menu = self._menu,
                    _input = self._input;
                if (menu) {
                    if (d && _input) {
                        var menuCfg = self.get("menuCfg") || {};
                        menu.set("align", S.merge({
                            node:_input.get("el")
                        }, ALIGN, menuCfg.align));
                        menu.show();
                    } else {
                        menu.hide();
                    }
                }
            },

            destructor:function () {
                var self = this;
                Event.remove(window, "resize", reAlign, self);
                if (self._menu) {
                    self._menu.destroy();
                    self._menu = null;
                }
                S.each(self._inputs, function (inp) {
                    inp.destroy();
                });
                self._inputs = null;
            }
        }, {
            ATTRS:/**
             * @lends AutoComplete#
             */
            {
                /**
                 * AutoComplete Component's prefix class.For Configuration when new.
                 * @type String
                 */
                prefixCls:{
                    value:'ks-'
                },
                /**
                 * dataSource for autoComplete.For Configuration when new.
                 * @type AutoComplete.LocalDataSource|AutoComplete.RemoteDataSource
                 */
                dataSource:{},
                /**
                 * Indicate whether autoComplete list is shown.
                 * @type Boolean
                 */
                open:{
                },
                /**
                 * Config autoComplete menu list.For Configuration when new.
                 * @type Object
                 */
                menuCfg:{
                    value:{
                        // width
                        // align
                    }
                },
                /**
                 * Config autoComplete menu list's alignment.
                 * Same with {@link UIBase.Align#align} .
                 * Default : align current input's bottom left edge
                 * with autoComplete list's top left edge.
                 * @name AutoComplete#menuCfg.align
                 * @field             *
                 * @type Object
                 */


                /**
                 * Config autoComplete menu list's alignment.
                 * Default to current active input's width.
                 * @name AutoComplete#menuCfg.width
                 * @type Number
                 */

                /**
                 *
                 */
                rowRender:{}
            }
        });
}, {
    requires:['event', 'uibase', 'menu']
});
/**
 * 2012-03-26 yiminghe@gmail.com
 *  - refer http://www.w3.org/TR/wai-aria-practices/#autocomplete
 **/