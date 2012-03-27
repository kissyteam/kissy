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


    return UIBase.create([], {
        // drop down menu
        _menu:null,

        // current input
        _input:null,

        _inputs:null,

        // user's input text
        _savedInputValue:null,

        attachInput:function (input) {
            this._inputs = this._inputs || [];
            input.autoComplete = this;
            this._inputs.push(input);
        },

        detachInput:function (input) {
            var index = S.indexOf(input, this._inputs);
            if (index != -1) {
                this._inputs.splice(index, 1);
            }
            input.autoComplete = null;
            input.destroy();
        },

        _onInputChange:function (value) {
            var dataSource = this.get("dataSource");
            this._savedInputValue = value;
            dataSource.fetchData(value, this._renderData, this);
        },

        _renderData:function (data) {
            var self = this;
            if (data && data.length) {
                var _input = self._input,
                    menu = self._getMenu();
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
                input.get("el")[0].blur();
                input.get("el").val(content);
                input.get("el")[0].focus();
            });
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
        }
    }, {
        ATTRS:{
            prefixCls:{
                value:'ks-'
            },
            dataSource:{},
            open:{

            },
            menuCfg:{
                value:{
                    // width
                    // align
                }
            },
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