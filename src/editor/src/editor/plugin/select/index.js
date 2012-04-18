/**
 * select component for kissy editor,need refactor to KISSY MenuButton
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/select/index", function (S, KE, Overlay, undefined) {

    var Node = S.Node,
        $ = Node.all,
        Event = S.Event,
        DOM = S.DOM,
        SELECT_ACTIVE_CLASS = "ke-select-active",
        MENU_SELECTED_CLASS = "ke-menu-selected",
        SELECT_MARKUP = "<span class='ke-select-wrap'>" +
            // 设置 tabindex=0 ，否则 click 会导致 blur->focus 事件触发
            "<a class='ke-select' " +
            " hide" +
            "focus='hidefocus' tabindex='0'>" +
            "<span class='ke-select-text'>" +
            "<span class='ke-select-text-inner'></span>" +
            "</span>" +
            "<span class='ke-select-drop-wrap'>" +
            "<span class='ke-select-drop'></span>" +
            "</span>" +
            "</a>" +
            "</span>",
        MENU_ITEM_TPL = "<a " +
            "class='ke-select-menu-item' " +
            "tabindex='-1' " +
            "href='javascript:void(\"{tip}\")' " +
            "data-value='{value}'>" +
            "{name}" +
            "</a>",
        SELECT_MENU_MARKUP = "<div>",
        SELECT_DISABLED_CLASS = "ke-select-disabled",
        ENABLED = 1,
        dtd = KE.XHTML_DTD,
        DISABLED = 0;

    Select.DISABLED = DISABLED;
    Select.ENABLED = ENABLED;

    function Select(cfg) {
        var self = this;
        Select['superclass'].constructor.call(self, cfg);
        self._init();
    }

    Select.ATTRS = {
        //title标题栏显示值value还是name
        //默认false，显示name
        showValue:{},
        el:{},
        cls:{},
        container:{},
        doc:{},
        value:{},
        width:{},
        popUpWidth:{},
        title:{},
        items:{},
        emptyText:{},
        //下拉框优先和select左左对齐，上下对齐
        //可以改作右右对齐，下上对齐
        align:{
            value:["l", "b"]
        },
        menuContainer:{
            valueFn:function () {
                //chrome 需要添加在能够真正包含div的地方
                var c = this.el.parent();
                while (c) {
                    var n = c._4e_name();
                    if (dtd[n] && dtd[n]["div"])
                        return c;
                    c = c.parent();
                }
                return $(document.body);
            }
        },
        state:{
            value:ENABLED
        }
    };

    Select.decorate = function (el) {
        var width = el.width() ,
            items = [];
        el.all("option").each(function (opt) {
            items.push({
                name:opt.html(),
                value:opt.val()
            });
        });
        return new Select({
            width:width + "px",
            title:el.attr("title"),
            el:el,
            items:items,
            cls:"ke-combox",
            value:el.val()
        });
    };

    var addRes = KE.Utils.addRes,
        destroyRes = KE.Utils.destroyRes;

    function getTipText(str) {
        if (str && str.indexOf("<") == -1) {
            return str;
        }
        return 0;
    }

    S.extend(Select, S.Base, {
        _init:function () {
            var self = this,
                container = self.get("container"),
                fakeEl = self.get("el"),
                el = $(SELECT_MARKUP),
                titleA = el.one("a"),
                title = self.get("title") || "",
                cls = self.get("cls"),
                text = el.one(".ke-select-text"),
                innerText = el.one(".ke-select-text-inner"),
                drop = el.one(".ke-select-drop");

            if (self.get("value") !== undefined) {
                innerText.html(self._findNameByV(self.get("value")));
            } else {
                innerText.html(title);
            }

            el.unselectable(undefined);

            text.css("width", self.get("width"));

            if (title) {
                el.attr("title", title);
            }
            titleA.attr("href", "javascript:void('" + getTipText(title) + "')");
            if (cls) {
                el.addClass(cls, undefined);
            }
            if (fakeEl) {
                fakeEl[0].parentNode.replaceChild(el[0], fakeEl[0]);
            } else if (container) {
                el.appendTo(container, undefined);
            }
            el.on("click", self._click, self);
            el.on("keydown", self._keydown, self);
            self.el = el;
            self.title = innerText;
            self._focusA = el.one("a.ke-select");
            self._focusA.on("blur", function () {
                if (self.menu) {
                    self.menu.hide();
                }
            });
            KE.Utils.lazyRun(this, "_prepare", "_real");
            self.on("afterValueChange", self._valueChange, self);
            self.on("afterStateChange", self._stateChange, self);
        },

        _keydown:function (e) {

            var keyCode = e.keyCode,
                current,
                next,
                self = this;

            switch (keyCode) {
                case Event.KeyCodes.DOWN:
                    e.halt();
                    if (!self._isShown()) {
                        self._click();
                        if (!self._findCurrent()) {
                            $(self.as[0]).addClass(MENU_SELECTED_CLASS, undefined);
                        }
                        return;
                    }
                    current = $(self._findCurrent());
                    current.removeClass(MENU_SELECTED_CLASS, undefined);
                    if (next = current.next()) {
                        next.addClass(MENU_SELECTED_CLASS, undefined);
                    } else {
                        $(self.as[0]).addClass(MENU_SELECTED_CLASS, undefined);
                    }
                    break;


                case Event.KeyCodes.UP:
                    e.halt();
                    if (!self._isShown()) {
                        return;
                    }
                    current = $(self._findCurrent());
                    current.removeClass(MENU_SELECTED_CLASS, undefined);
                    if (next = current.prev(undefined, undefined)) {
                        next.addClass(MENU_SELECTED_CLASS, undefined);
                    } else {
                        $(self.as[self.as.length - 1]).addClass(MENU_SELECTED_CLASS, undefined);
                    }
                    break;


                case Event.KeyCodes.ENTER:
                    e.halt();
                    if (!self._isShown()) {
                        self._click();
                        if (!self._findCurrent()) {
                            $(self.as[0]).addClass(MENU_SELECTED_CLASS, undefined);
                        }
                        return;
                    }
                    current = $(self._findCurrent());
                    if (!current) {
                        return;
                    }
                    self._select({
                        target:current
                    });
                    break;

                case Event.KeyCodes.ESC:
                    e.halt();
                    if (!self._isShown()) {
                        return;
                    }
                    self.menu.hide();
                    break;
            }
        },

        _findCurrent:function () {
            var as = this.as, ret = undefined;
            as.each(function (a) {
                if (a.hasClass(MENU_SELECTED_CLASS, undefined)) {
                    ret = a;
                    return false;
                }
            });
            return ret;
        },

        _isShown:function () {
            return this.menu && this.menu.get("visible");
        },

        _findNameByV:function (v) {
            var self = this,
                name = self.get("title") || "",
                items = self.get("items");
            //显示值，防止下拉描述过多
            if (self.get("showValue")) {
                return v || name;
            }
            S.each(items, function (item) {
                if (item.value == v) {
                    name = item.name;
                    return false;
                }
            });
            return name;
        },

        /**
         * 当逻辑值变化时，更新select的显示值
         * @param ev
         */
        _valueChange:function (ev) {
            var v = ev.newVal,
                self = this,
                name = self._findNameByV(v);
            self.title.html(name);
        },

        _itemsChange:function (ev) {
            var self = this,
                empty,
                items = ev.newVal,
                _selectList = self._selectList;
            _selectList.html("");
            if (items && items.length) {
                for (var i = 0; i < items.length; i++) {
                    var item = items[i], a = new Node(
                        S.substitute(MENU_ITEM_TPL, {
                            tip:getTipText(item.name),
                            value:item.value,
                            name:item.name
                        }), item.attrs)
                        // make menu do not get focus in ie
                        .unselectable(undefined)
                        .appendTo(_selectList, undefined);
                }
            } else if (empty = self.get("emptyText")) {
                $(
                    S.substitute(MENU_ITEM_TPL, {
                        tip:getTipText(empty),
                        value:"",
                        name:empty
                    }))
                    .appendTo(_selectList, undefined);
            }
            self.as = _selectList.all("a");
        },
        val:function (v) {
            var self = this;
            if (v !== undefined) {
                self.set("value", v);
                return self;
            } else {
                return self.get("value");
            }
        },
        _resize:function () {
            var self = this,
                menu = self.menu;
            if (menu.get("visible")) {
                self._real();
            }
        },
        _prepare:function () {
            var self = this,
                el = self.el,
                focusA = self._focusA,
                popUpWidth = self.get("popUpWidth"),
                menuNode;
            //要在适当位置插入 !!!
            var menu = new Overlay({
                autoRender:true,
                render:self.get("menuContainer"),
                content:SELECT_MENU_MARKUP,
                elCls:"ke-menu",
                width:popUpWidth ? popUpWidth : el.width(),
                zIndex:KE.baseZIndex(KE.zIndexManager.SELECT)
            }), items = self.get("items");

            menu.on("hide", function () {
                focusA.removeClass(SELECT_ACTIVE_CLASS, undefined);
            });

            menu.on("show", function () {
                focusA.addClass(SELECT_ACTIVE_CLASS, undefined);
            });

            addRes.call(self, menu);
            menuNode = menu.get("contentEl").one("div");
            self.menu = menu;

            // make menu do not get focus in non-ie
            menu.get("el").on("mousedown", function (e) {
                e.halt();
            });


            //缩放，下拉框跟随
            Event.on(window, "resize", self._resize, self);

            addRes.call(self, function () {
                Event.remove(window, "resize", self._resize, self);
            });

            if (self.get("title")) {
                $("<div " +
                    "class='ke-menu-title ke-select-menu-item' " +
                    "style='margin-top:-6px;' " +
                    ">" + self.get("title") + "</div>").appendTo(menuNode, undefined);
            }
            self._selectList = $("<div>").appendTo(menuNode, undefined);

            self._itemsChange({
                newVal:items
            });

            menuNode.on("click", self._select, self);

            self.as = self._selectList.all("a");

            menuNode.on('mouseenter', function () {
                self.as.removeClass(MENU_SELECTED_CLASS, undefined);
            });

            addRes.call(self, menuNode);

            self.on("afterItemsChange", self._itemsChange, self);

            self.menuNode = menuNode;
        },
        _stateChange:function (ev) {
            var v = ev.newVal,
                el = this.el;
            if (v == ENABLED) {
                el.removeClass(SELECT_DISABLED_CLASS, undefined);
            } else {
                el.addClass(SELECT_DISABLED_CLASS, undefined);
            }
        },
        enable:function () {
            this.set("state", ENABLED);
        },
        disable:function () {
            this.set("state", DISABLED);
        },
        _select:function (ev) {
            if (ev && ev.halt) {
                ev.halt();
            }
            var self = this,
                menu = self.menu,
                menuNode = self.menuNode,
                t = $(ev.target),
                a = t._4e_ascendant(function (n) {
                    return menuNode.contains(n) && n._4e_name() == "a";
                }, true);

            if (!a || !a.attr("data-value")) {
                return;
            }

            var preVal = self.get("value"),
                newVal = a.attr("data-value");

            //更新逻辑值
            self.set("value", newVal);

            //触发 click 事件，必要时可监听 afterValueChange
            self.fire("click", {
                newVal:newVal,
                prevVal:preVal,
                name:a.html()
            });

            menu.hide();
        },
        _real:function () {
            var self = this,
                el = self.el,
                xy = el.offset(),
                orixy = S.clone(xy),
                menuHeight = self.menu.get("el").height(),
                menuWidth = self.menu.get("el").width(),
                wt = DOM.scrollTop(),
                wl = DOM.scrollLeft(),
                wh = DOM.viewportHeight() ,
                ww = DOM.viewportWidth(),
                //右边界坐标,60 is buffer
                wr = wl + ww - 60,
                //下边界坐标
                wb = wt + wh,
                //下拉框向下弹出的y坐标
                sb = xy.top + (el.height() - 2),
                //下拉框右对齐的最右边x坐标
                sr = xy.left + el.width() - 2,
                align = self.get("align"),
                xAlign = align[0],
                yAlign = align[1];

            if (yAlign == "b") {
                //向下弹出优先
                xy.top = sb;
                if (
                //不能显示完全
                    (xy.top + menuHeight) > wb
                        &&
                        //向上弹能显示更多
                        (orixy.top - wt) > (wb - sb)
                    ) {
                    xy.top = orixy.top - menuHeight;
                }
            } else {
                //向上弹出优先
                xy.top = orixy.top - menuHeight;

                if (
                //不能显示完全
                    xy.top < wt
                        &&
                        //向下弹能显示更多
                        (orixy.top - wt) < (wb - sb)
                    ) {
                    xy.top = sb;
                }
            }

            if (xAlign == "l") {
                //左对其优先
                if (
                //左对齐不行
                    (xy.left + menuWidth) > wr
                        &&
                        //右对齐可以弹出更多

                        (sr - wl) > (wr - orixy.left)
                    ) {
                    xy.left = sr - menuWidth;
                }
            } else {
                //右对齐优先
                xy.left = sr - menuWidth;
                if (
                //右对齐不行
                    xy.left < wl
                        &&
                        //左对齐可以弹出更多
                        (sr - wl) < (wr - orixy.left)
                    ) {
                    xy.left = orixy.left;
                }
            }
            self.menu.set("xy", [xy.left, xy.top]);
            self.menu.show();
        },
        _click:function (e) {
            if (e) {
                e.halt();
            }
            var self = this,
                el = self.el,
                menu = self.menu,
                v = self.get("value");

            if (menu && menu.get("visible")) {
                menu.hide();
                return;
            }

            // chrome will make body focus !!
            self._focusA[0].focus();

            if (el.hasClass(SELECT_DISABLED_CLASS, undefined)) {
                return false;
            }

            self.fire("select");

            self._prepare();

            //可能的话当显示层时，高亮当前值对应option
            if (v && menu) {
                var as = self.as;
                as.each(function (a) {
                    if (a.attr("data-value") == v) {
                        a.addClass(MENU_SELECTED_CLASS, undefined);
                    } else {
                        a.removeClass(MENU_SELECTED_CLASS, undefined);
                    }
                });
            }
        },
        destroy:function () {
            destroyRes.call(this);
            this.el.remove();
        }
    });

    /**
     * 将button ui 和点击功能分离
     * 按钮必须立刻显示出来，功能可以慢慢加载
     */
    KE.prototype.addSelect = function (cfg, methods, SelectType) {

        SelectType = SelectType || Select;

        var self = this;

        cfg.editor = self;

        var s = new SelectType(S.mix({
            container:self.get("toolBarEl"),
            doc:self.get("document")[0]
        }, cfg));

        S.mix(s, methods);

        self.on("selectionChange", function () {
            if (self.get("mode") == KE.SOURCE_MODE) {
                return;
            }
            s.selectionChange && s.selectionChange.apply(s, arguments);
        });

        self.on("destroy", function () {
            s.destroy();
        });

        s.on("click", function (ev) {
            var t = ev.type;
            if (s[t]) {
                s[t].apply(s, arguments);
            }
            ev.halt();
        });

        if (cfg.mode == KE.WYSIWYG_MODE) {
            self.on("wysiwygMode", s.enable, s);
            self.on("sourceMode", s.disable, s);
        }

        s.init && s.init();
        return s;

    };

    return Select;
}, {
    requires:['editor', 'overlay']
});