
KISSY.Editor.add("basic", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, //Lang = YAHOO.lang,
        //isIE = YAHOO.env.ua.ie,
        TYPE = E.PLUGIN_TYPE;


    /* 普通按钮 */
    var buttons  = "bold,italic,underline,";
    buttons += "insertOrderedList,insertUnorderedList,";
    buttons += "outdent,indent,";
    buttons += "justifyLeft,justifyCenter,justifyRight";

    E.plugins[buttons] = {
        /**
         * 种类：普通按钮
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * 响应函数
         * @param {KISSY.Editor} editor
         */
        fn: function(editor) {
            editor.execCommand(this.name);
        }
    };


    /* 颜色按钮 */
    var PALETTE_TABLE_TMPL = '<table class="kissy-palette-table"><tbody>{TR}</tbody></table>',
        PALETTE_CELL_TMPL = '<td class="kissy-palette-cell"><div class="kissy-palette-colorswatch" title="{COLOR}" style="background-color:{COLOR}"></div></td>',

        COLOR_GRAY = ["000", "444", "666", "999", "CCC", "EEE", "F3F3F3", "FFF"],
        COLOR_NORMAL = ["F00", "F90", "FF0", "0F0", "0FF", "00F", "90F", "F0F"],
        COLOR_DETAIL = [
                "F4CCCC", "FCE5CD", "FFF2CC", "D9EAD3", "D0E0E3", "CFE2F3", "D9D2E9", "EAD1DC",
                "EA9999", "F9CB9C", "FFE599", "B6D7A8", "A2C4C9", "9FC5E8", "B4A7D6", "D5A6BD",
                "E06666", "F6B26B", "FFD966", "93C47D", "76A5AF", "6FA8DC", "8E7CC3", "C27BAD",
                "CC0000", "E69138", "F1C232", "6AA84F", "45818E", "3D85C6", "674EA7", "A64D79",
                "990000", "B45F06", "BF9000", "38761D", "134F5C", "0B5394", "351C75", "741B47",
                "660000", "783F04", "7F6000", "274E13", "0C343D", "073763", "20124D", "4C1130"
        ],

        PALETTE_CELL_SELECTED = "kissy-palette-cell-selected";

    E.plugins["foreColor,backColor"] = {
        /**
         * 种类：普通按钮 + 菜单按钮
         */
        type: TYPE.TOOLBAR_BUTTON | TYPE.TOOLBAR_MENU_BUTTON,

        /**
         * 当前选取色
         * 在 init 里初始化
         */
        color: "",

        /**
         * 当前颜色指示条
         */
        _indicator: null,

        /**
         * 关联的下拉菜单框
         */
        dropMenu: null,

        /**
         * 插件自己的初始化函数
         */
        init: function(editor) {
            this.color = (this.name == "foreColor") ? "#000" : "#FFF";

            var el = this.domEl,
                caption = el.getElementsByTagName("span")[0].parentNode;
                //dropdown = caption.nextSibling,
                //self = this;

            Dom.addClass(el, "kissy-toolbar-color-button");
            caption.innerHTML = '<div class="kissy-toolbar-color-button-indicator" style="border-bottom-color:' + this.color + '">'
                               + caption.innerHTML
                               + '</div>';

            this._indicator = caption.firstChild;

            /*
            // 点击 caption 区域
            Event.on(caption, "click", function() {
                editor.execCommand(self.name, self._getColor());
            });

            // 下拉框
            this._initDropDown(dropdown);
            */
            // 注：上面的方案，是仿照 MS Office 2007，仅当点击下拉箭头时，才弹出下拉框。点击 caption 时，直接设置颜色
            // 从逻辑上讲，上面的方案不错。
            // 但是，考虑 web 页面上，按钮比较小，不区分 caption 和 dropdown，让每次点击都弹出下拉框，这样反而能增加
            // 易用性。这也是 Google Docs 采取的方式。下面采用这种方式。
            this._initDropDown(el);
        },

        /**
         * 初始化下拉框
         */
        _initDropDown: function(dropdown) {
            this.dropMenu = E.Menu.generateDropMenu(dropdown, [1, 0]);

            // 生成下拉框内的内容
            this._generatePalettes();

            // 注册点击事件
            this._bindPickEvent();
        },

        /**
         * 生成取色板
         */
        _generatePalettes: function() {
            var htmlCode = "";

            // 黑白色板
            htmlCode += this._getPaletteTable(COLOR_GRAY);

            // 常用色板
            htmlCode += this._getPaletteTable(COLOR_NORMAL);

            // 详细色板
            htmlCode += this._getPaletteTable(COLOR_DETAIL);

            // 添加到 DOM 中
            this.dropMenu.innerHTML = htmlCode;

            // 选中当前色
            this.setColor(this.color);
                
        },

        _getPaletteTable: function(colors) {
            var i, len = colors.length, color,
                trs = "<tr>";

            for(i = 0, len = colors.length; i < len; ++i) {
                if(i != 0 && i % 8 == 0) {
                    trs += "</tr><tr>";
                }

                color = E.Color.toRGB("#" + colors[i]).toUpperCase();
                trs += PALETTE_CELL_TMPL.replace(/{COLOR}/g, color);
            }
            trs += "</tr>";

            return PALETTE_TABLE_TMPL.replace("{TR}", trs);
        },

        /**
         * 绑定取色事件
         */
        _bindPickEvent: function() {
            var self = this;

            Event.on(this.dropMenu, "click", function(ev) {
                var target = Event.getTarget(ev),
                    attr = target.getAttribute("title");

                if(attr && attr.indexOf("RGB") === 0) {
                    // 更新当前值
                    self.setColor(E.Color.toHex(attr));
                }

            });
        },

        /**
         * 设置颜色
         * @param val 格式 #RRGGBB
         */
        setColor: function(val) {
            this.color = val;

            // 更新 indicator
            this._indicator.style.borderBottomColor = val;

            // 更新 dropMenu 里对应的选中项
            var i, len, swatches = this.dropMenu.getElementsByTagName("div"),
                swatch;
            for(i = 0, len = swatches.length; i < len; ++i) {
                swatch = swatches[i];

                //console.log(swatch.style.backgroundColor);
                if(E.Color.toHex(swatch.style.backgroundColor) == val) {
                    Dom.addClass(swatch.parentNode, PALETTE_CELL_SELECTED);
                } else {
                    Dom.removeClass(swatch.parentNode, PALETTE_CELL_SELECTED);
                }
            }
        }
    };

});
